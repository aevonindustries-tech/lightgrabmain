ALTER TABLE public.platform_settings
  ADD COLUMN countdown_enabled boolean NOT NULL DEFAULT true;

CREATE TABLE public.intake_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_type text NOT NULL CHECK (application_type IN ('waitlist', 'runner', 'courier')),
  full_name text NOT NULL CHECK (char_length(btrim(full_name)) BETWEEN 1 AND 120),
  email text NOT NULL CHECK (char_length(btrim(email)) BETWEEN 3 AND 255),
  phone text NOT NULL CHECK (char_length(btrim(phone)) BETWEEN 3 AND 40),
  state text NOT NULL CHECK (char_length(btrim(state)) BETWEEN 1 AND 120),
  lga text NOT NULL CHECK (char_length(btrim(lga)) BETWEEN 1 AND 120),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'accepted', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.intake_submissions TO anon, authenticated;
GRANT SELECT ON public.intake_submissions TO authenticated;
GRANT ALL ON public.intake_submissions TO service_role;
ALTER TABLE public.intake_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public can submit intake"
  ON public.intake_submissions FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new');

CREATE POLICY "authorized staff can read intake"
  ON public.intake_submissions FOR SELECT TO authenticated
  USING (
    public.has_permission(auth.uid(), 'manage_users'::public.admin_permission)
    OR public.has_permission(auth.uid(), 'manage_partners'::public.admin_permission)
  );

CREATE INDEX intake_submissions_type_created_idx
  ON public.intake_submissions (application_type, created_at DESC);

CREATE OR REPLACE FUNCTION public.admin_update_countdown(_enabled boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  if not public.has_permission(auth.uid(), 'manage_settings'::public.admin_permission) then
    raise exception 'Not allowed';
  end if;
  update public.platform_settings
    set countdown_enabled = _enabled, updated_at = now(), updated_by = auth.uid()
    where id = true;
  perform public.write_audit('settings.countdown', 'platform', 'settings', jsonb_build_object('countdown_enabled', _enabled));
end
$function$;
GRANT EXECUTE ON FUNCTION public.admin_update_countdown(boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_update_intake_status(_submission uuid, _status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
declare
  s public.intake_submissions;
  matched_user uuid;
begin
  if _status not in ('reviewed', 'accepted', 'declined') then
    raise exception 'Invalid application status';
  end if;
  select * into s from public.intake_submissions where id = _submission for update;
  if s.id is null then raise exception 'Application not found'; end if;
  if s.application_type = 'waitlist' then
    if not public.has_permission(auth.uid(), 'manage_users'::public.admin_permission) then raise exception 'Not allowed'; end if;
  elsif not (
    public.has_permission(auth.uid(), 'manage_users'::public.admin_permission)
    or public.has_permission(auth.uid(), 'manage_partners'::public.admin_permission)
  ) then
    raise exception 'Not allowed';
  end if;
  update public.intake_submissions set status = _status where id = _submission;
  if _status = 'accepted' and s.application_type in ('runner', 'courier') then
    select u.id into matched_user from auth.users u where lower(u.email) = lower(s.email) limit 1;
    if matched_user is not null then
      insert into public.user_roles(user_id, role)
      values (matched_user, case when s.application_type = 'runner' then 'runner'::public.app_role else 'courier'::public.app_role end)
      on conflict do nothing;
    end if;
  end if;
  perform public.write_audit('intake.' || _status, s.application_type, s.id::text, jsonb_build_object('email', s.email));
end
$function$;
GRANT EXECUTE ON FUNCTION public.admin_update_intake_status(uuid, text) TO authenticated;