
-- ===== Enums =====
create type public.app_role as enum ('customer','seller','runner','courier','operations','admin','super_admin');
create type public.admin_permission as enum ('manage_users','manage_partners','manage_orders','manage_settings','view_audit');
create type public.account_status as enum ('active','suspended');
create type public.business_category as enum ('market','restaurant','bakery','factory','other');
create type public.seller_status as enum ('pending','approved','suspended');
create type public.order_status as enum ('submitted','quoted','confirmed','sourcing','ready','out_for_delivery','delivered','cancelled','issue');
create type public.assignment_response as enum ('pending','accepted','declined');
create type public.item_status as enum ('pending','available','unavailable','substituted');

-- ===== Profiles =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  phone text check (phone is null or char_length(phone) <= 30),
  default_area text check (default_area is null or char_length(default_area) <= 120),
  default_address text check (default_address is null or char_length(default_address) <= 500),
  status public.account_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create table public.admin_permissions (
  user_id uuid not null references public.profiles(id) on delete cascade,
  permission public.admin_permission not null,
  primary key (user_id, permission)
);
grant select on public.admin_permissions to authenticated;
grant all on public.admin_permissions to service_role;
alter table public.admin_permissions enable row level security;

-- ===== Helper functions =====
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_active(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = _user_id and status = 'active')
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_active(_user_id) and exists (
    select 1 from public.user_roles where user_id = _user_id and role in ('operations','admin','super_admin'))
$$;

create or replace function public.has_permission(_user_id uuid, _perm public.admin_permission)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_active(_user_id) and (
    public.has_role(_user_id, 'super_admin')
    or (public.has_role(_user_id, 'admin') and exists (
      select 1 from public.admin_permissions where user_id = _user_id and permission = _perm)))
$$;

-- profiles policies: users read/update own; staff read all. No one edits another's profile.
create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_staff(auth.uid()));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "own roles read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_staff(auth.uid()));
create policy "own perms read" on public.admin_permissions for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'super_admin'));

-- prevent users changing their own status
create or replace function public.profiles_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status and current_setting('lightgrab.allow_status', true) is distinct from 'on' then
    raise exception 'Account status can only be changed by an authorised administrator';
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger profiles_guard before update on public.profiles for each row execute function public.profiles_guard();

-- new user -> profile + customer role
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, coalesce(left(new.raw_user_meta_data->>'full_name', 120), ''));
  insert into public.user_roles (user_id, role) values (new.id, 'customer');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ===== Audit log =====
create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  target_type text,
  target_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select on public.audit_log to authenticated;
grant all on public.audit_log to service_role;
alter table public.audit_log enable row level security;
create policy "audit read" on public.audit_log for select to authenticated using (public.has_permission(auth.uid(), 'view_audit'));

create or replace function public.write_audit(_action text, _target_type text, _target_id text, _details jsonb)
returns void language sql security definer set search_path = public as $$
  insert into public.audit_log(actor_id, action, target_type, target_id, details) values (auth.uid(), _action, _target_type, _target_id, coalesce(_details,'{}'::jsonb));
$$;
revoke execute on function public.write_audit(text,text,text,jsonb) from public, anon, authenticated;

-- ===== Platform settings =====
create table public.platform_settings (
  id boolean primary key default true check (id),
  launch_live boolean not null default false,
  launch_at timestamptz,
  prelaunch_message text not null default 'LightGrab is preparing to open in Oron.' check (char_length(prelaunch_message) <= 280),
  accepting_requests boolean not null default false,
  service_area text not null default 'Oron, Akwa Ibom' check (char_length(service_area) <= 120),
  payments_mode text not null default 'disabled' check (payments_mode in ('disabled','test')),
  wallet_enabled boolean not null default false check (wallet_enabled = false),
  updated_at timestamptz not null default now(),
  updated_by uuid
);
grant select on public.platform_settings to anon, authenticated;
grant all on public.platform_settings to service_role;
alter table public.platform_settings enable row level security;
create policy "settings public read" on public.platform_settings for select to anon, authenticated using (true);
insert into public.platform_settings (id) values (true);

-- ===== Sellers =====
create table public.sellers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  business_name text not null check (char_length(business_name) between 2 and 120),
  category public.business_category not null,
  description text check (description is null or char_length(description) <= 600),
  market_location text check (market_location is null or char_length(market_location) <= 200),
  service_area text not null default 'Oron' check (char_length(service_area) <= 200),
  operating_hours text check (operating_hours is null or char_length(operating_hours) <= 200),
  accepting_requests boolean not null default true,
  status public.seller_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id)
);
grant select, insert, update on public.sellers to authenticated;
grant all on public.sellers to service_role;
alter table public.sellers enable row level security;
create policy "seller own read" on public.sellers for select to authenticated using (owner_id = auth.uid() or public.is_staff(auth.uid()));
create policy "seller apply" on public.sellers for insert to authenticated with check (owner_id = auth.uid() and status = 'pending' and public.is_active(auth.uid()));
create policy "seller own update" on public.sellers for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create or replace function public.sellers_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status and current_setting('lightgrab.allow_status', true) is distinct from 'on' then
    raise exception 'Seller status can only be changed by an authorised administrator';
  end if;
  if new.owner_id is distinct from old.owner_id then raise exception 'Owner cannot change'; end if;
  new.updated_at := now();
  return new;
end $$;
create trigger sellers_guard before update on public.sellers for each row execute function public.sellers_guard();

-- ===== Orders =====
create sequence public.order_code_seq start 1001;
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('LG-' || nextval('public.order_code_seq')::text),
  customer_id uuid not null references public.profiles(id),
  category public.business_category not null default 'market',
  status public.order_status not null default 'submitted',
  status_before_issue public.order_status,
  customer_note text check (customer_note is null or char_length(customer_note) <= 1000),
  preferred_window text check (preferred_window is null or char_length(preferred_window) <= 120),
  seller_id uuid references public.sellers(id),
  seller_response public.assignment_response,
  seller_decline_reason text,
  runner_id uuid references public.profiles(id),
  courier_id uuid references public.profiles(id),
  items_subtotal numeric(12,2) check (items_subtotal is null or items_subtotal >= 0),
  service_fee numeric(12,2) check (service_fee is null or service_fee >= 0),
  delivery_fee numeric(12,2) check (delivery_fee is null or delivery_fee >= 0),
  quote_note text,
  quoted_at timestamptz,
  payment_status text not null default 'not_collected' check (payment_status in ('not_collected','pay_on_delivery')),
  issue_note text,
  cancel_reason text,
  delivered_at timestamptz,
  proof_recipient text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create index on public.orders (customer_id);
create index on public.orders (status);

create table public.order_delivery (
  order_id uuid primary key references public.orders(id) on delete cascade,
  recipient_name text not null check (char_length(recipient_name) between 2 and 120),
  recipient_phone text not null check (char_length(recipient_phone) between 7 and 30),
  area text not null check (char_length(area) between 2 and 120),
  address text not null check (char_length(address) between 5 and 500),
  landmark text check (landmark is null or char_length(landmark) <= 200),
  instructions text check (instructions is null or char_length(instructions) <= 500),
  is_alternate boolean not null default false,
  delivery_code text not null default lpad((floor(random()*10000))::int::text, 4, '0')
);
grant select on public.order_delivery to authenticated;
grant all on public.order_delivery to service_role;
alter table public.order_delivery enable row level security;

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  position int not null default 0,
  name text not null check (char_length(name) between 1 and 160),
  quantity numeric(10,2) not null check (quantity > 0),
  unit text check (unit is null or char_length(unit) <= 40),
  target_price numeric(12,2) check (target_price is null or target_price >= 0),
  notes text check (notes is null or char_length(notes) <= 300),
  status public.item_status not null default 'pending',
  substitute_name text check (substitute_name is null or char_length(substitute_name) <= 160),
  substitute_approved boolean,
  actual_price numeric(12,2) check (actual_price is null or actual_price >= 0),
  runner_note text check (runner_note is null or char_length(runner_note) <= 300)
);
grant select on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create index on public.order_items (order_id);

create table public.order_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  actor_id uuid,
  actor_role text,
  kind text not null default 'status',
  from_status public.order_status,
  to_status public.order_status,
  note text,
  created_at timestamptz not null default now()
);
grant select on public.order_events to authenticated;
grant all on public.order_events to service_role;
alter table public.order_events enable row level security;
create index on public.order_events (order_id);

create table public.order_communications (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  author_id uuid not null,
  channel text not null check (channel in ('phone','sms','whatsapp','in_person','other')),
  summary text not null check (char_length(summary) between 2 and 1000),
  created_at timestamptz not null default now()
);
grant select, insert on public.order_communications to authenticated;
grant all on public.order_communications to service_role;
alter table public.order_communications enable row level security;

-- access helpers
create or replace function public.is_order_seller(_order_id uuid, _uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.orders o join public.sellers s on s.id = o.seller_id
    where o.id = _order_id and s.owner_id = _uid and s.status = 'approved')
$$;

create or replace function public.can_view_order(_order_id uuid, _uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_active(_uid) and exists (select 1 from public.orders o where o.id = _order_id and (
    o.customer_id = _uid or o.runner_id = _uid or o.courier_id = _uid or public.is_staff(_uid)
    or public.is_order_seller(o.id, _uid)))
$$;

create policy "orders read" on public.orders for select to authenticated using (public.can_view_order(id, auth.uid()));
create policy "items read" on public.order_items for select to authenticated using (public.can_view_order(order_id, auth.uid()));
create policy "events read" on public.order_events for select to authenticated using (public.can_view_order(order_id, auth.uid()));
-- delivery details: customer, courier, staff only (not seller, not runner)
create policy "delivery read" on public.order_delivery for select to authenticated using (
  public.is_active(auth.uid()) and exists (select 1 from public.orders o where o.id = order_id and
   (o.customer_id = auth.uid() or o.courier_id = auth.uid() or public.is_staff(auth.uid()))));
create policy "comms read" on public.order_communications for select to authenticated using (public.is_staff(auth.uid()));
create policy "comms insert" on public.order_communications for insert to authenticated with check (public.is_staff(auth.uid()) and author_id = auth.uid());

-- ===== Transition rules =====
create or replace function public.order_transition_allowed(_from public.order_status, _to public.order_status)
returns boolean language sql immutable as $$
  select (_from, _to) in (
    ('submitted','quoted'), ('submitted','cancelled'), ('submitted','issue'),
    ('quoted','confirmed'), ('quoted','cancelled'), ('quoted','submitted'), ('quoted','issue'),
    ('confirmed','sourcing'), ('confirmed','cancelled'), ('confirmed','issue'),
    ('sourcing','ready'), ('sourcing','issue'), ('sourcing','cancelled'),
    ('ready','out_for_delivery'), ('ready','issue'),
    ('out_for_delivery','delivered'), ('out_for_delivery','issue'),
    ('issue','submitted'), ('issue','confirmed'), ('issue','sourcing'), ('issue','ready'), ('issue','out_for_delivery'), ('issue','cancelled')
  )
$$;

create or replace function public._log_event(_order uuid, _role text, _kind text, _from public.order_status, _to public.order_status, _note text)
returns void language sql security definer set search_path = public as $$
  insert into public.order_events(order_id, actor_id, actor_role, kind, from_status, to_status, note)
  values (_order, auth.uid(), _role, _kind, _from, _to, _note);
$$;
revoke execute on function public._log_event(uuid,text,text,public.order_status,public.order_status,text) from public, anon, authenticated;

-- ===== Customer RPCs =====
create or replace function public.create_order(_category public.business_category, _note text, _window text, _delivery jsonb, _items jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); oid uuid; it jsonb; i int := 0; s record;
begin
  if uid is null or not public.is_active(uid) then raise exception 'Not signed in or account suspended'; end if;
  select * into s from public.platform_settings where id;
  if not s.accepting_requests then raise exception 'LightGrab is not accepting requests yet'; end if;
  if jsonb_typeof(_items) <> 'array' or jsonb_array_length(_items) = 0 then raise exception 'Add at least one item'; end if;
  if jsonb_array_length(_items) > 60 then raise exception 'Too many items (max 60)'; end if;
  insert into public.orders(customer_id, category, customer_note, preferred_window)
    values (uid, _category, nullif(trim(_note),''), nullif(trim(_window),'')) returning id into oid;
  insert into public.order_delivery(order_id, recipient_name, recipient_phone, area, address, landmark, instructions, is_alternate)
    values (oid, trim(_delivery->>'recipient_name'), trim(_delivery->>'recipient_phone'), trim(_delivery->>'area'), trim(_delivery->>'address'),
      nullif(trim(_delivery->>'landmark'),''), nullif(trim(_delivery->>'instructions'),''), coalesce((_delivery->>'is_alternate')::boolean,false));
  for it in select * from jsonb_array_elements(_items) loop
    insert into public.order_items(order_id, position, name, quantity, unit, target_price, notes)
    values (oid, i, trim(it->>'name'), (it->>'quantity')::numeric, nullif(trim(it->>'unit'),''),
      nullif(it->>'target_price','')::numeric, nullif(trim(it->>'notes'),''));
    i := i + 1;
  end loop;
  perform public._log_event(oid, 'customer', 'status', null, 'submitted', 'Request submitted');
  return oid;
end $$;

create or replace function public.customer_respond_quote(_order uuid, _accept boolean, _reason text)
returns void language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  select * into o from public.orders where id = _order for update;
  if o.id is null or o.customer_id <> auth.uid() or not public.is_active(auth.uid()) then raise exception 'Not allowed'; end if;
  if o.status <> 'quoted' then raise exception 'This request has no open quote'; end if;
  if _accept then
    update public.orders set status = 'confirmed', payment_status = 'pay_on_delivery', updated_at = now() where id = _order;
    perform public._log_event(_order, 'customer', 'status', 'quoted', 'confirmed', 'Customer accepted quote');
  else
    update public.orders set status = 'cancelled', cancel_reason = coalesce(nullif(trim(_reason),''),'Quote declined by customer'), updated_at = now() where id = _order;
    perform public._log_event(_order, 'customer', 'status', 'quoted', 'cancelled', coalesce(nullif(trim(_reason),''),'Quote declined'));
  end if;
end $$;

create or replace function public.customer_cancel(_order uuid, _reason text)
returns void language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  select * into o from public.orders where id = _order for update;
  if o.id is null or o.customer_id <> auth.uid() then raise exception 'Not allowed'; end if;
  if o.status not in ('submitted','quoted') then raise exception 'This request can no longer be cancelled from the app. Contact operations.'; end if;
  update public.orders set status = 'cancelled', cancel_reason = coalesce(nullif(trim(_reason),''),'Cancelled by customer'), updated_at = now() where id = _order;
  perform public._log_event(_order, 'customer', 'status', o.status, 'cancelled', coalesce(nullif(trim(_reason),''),'Cancelled by customer'));
end $$;

create or replace function public.customer_decide_substitution(_item uuid, _approve boolean)
returns void language plpgsql security definer set search_path = public as $$
declare it public.order_items; o public.orders;
begin
  select * into it from public.order_items where id = _item;
  select * into o from public.orders where id = it.order_id;
  if o.id is null or o.customer_id <> auth.uid() then raise exception 'Not allowed'; end if;
  if it.status <> 'substituted' or it.substitute_approved is not null then raise exception 'No pending substitution'; end if;
  update public.order_items set substitute_approved = _approve where id = _item;
  perform public._log_event(o.id, 'customer', 'item', null, null, (case when _approve then 'Approved' else 'Rejected' end) || ' substitute for ' || it.name || ': ' || it.substitute_name);
end $$;

-- ===== Staff (operations) RPCs =====
create or replace function public.ops_quote(_order uuid, _subtotal numeric, _service numeric, _delivery numeric, _note text)
returns void language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  if not public.is_staff(auth.uid()) then raise exception 'Not allowed'; end if;
  select * into o from public.orders where id = _order for update;
  if o.status not in ('submitted','quoted') then raise exception 'Quotes can only be set before confirmation'; end if;
  if _subtotal < 0 or _service < 0 or _delivery < 0 then raise exception 'Amounts must be positive'; end if;
  update public.orders set items_subtotal=_subtotal, service_fee=_service, delivery_fee=_delivery, quote_note=nullif(trim(_note),''), quoted_at=now(), status='quoted', updated_at=now() where id=_order;
  perform public._log_event(_order, 'operations', 'status', o.status, 'quoted', 'Quote: ₦' || (_subtotal+_service+_delivery)::text);
end $$;

create or replace function public.ops_assign(_order uuid, _seller uuid, _runner uuid, _courier uuid)
returns void language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  if not public.is_staff(auth.uid()) then raise exception 'Not allowed'; end if;
  select * into o from public.orders where id = _order for update;
  if o.status in ('delivered','cancelled') then raise exception 'Order is closed'; end if;
  if _seller is not null and not exists (select 1 from public.sellers where id=_seller and status='approved') then raise exception 'Seller not approved'; end if;
  if _runner is not null and not (public.has_role(_runner,'runner') and public.is_active(_runner)) then raise exception 'Not an active runner'; end if;
  if _courier is not null and not (public.has_role(_courier,'courier') and public.is_active(_courier)) then raise exception 'Not an active courier'; end if;
  update public.orders set
    seller_id = _seller,
    seller_response = case when _seller is null then null when _seller is distinct from o.seller_id then 'pending' else o.seller_response end,
    seller_decline_reason = case when _seller is distinct from o.seller_id then null else o.seller_decline_reason end,
    runner_id = _runner, courier_id = _courier, updated_at = now()
  where id = _order;
  perform public._log_event(_order, 'operations', 'assignment', null, null, 'Assignment updated');
end $$;

create or replace function public.ops_transition(_order uuid, _to public.order_status, _note text)
returns void language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  if not public.is_staff(auth.uid()) then raise exception 'Not allowed'; end if;
  select * into o from public.orders where id = _order for update;
  if not public.order_transition_allowed(o.status, _to) then raise exception 'Invalid status change: % to %', o.status, _to; end if;
  if _to = 'quoted' then raise exception 'Use the quote form'; end if;
  if _to = 'confirmed' and o.status <> 'issue' then raise exception 'Only the customer can accept a quote'; end if;
  if _to = 'delivered' then raise exception 'Delivery must be confirmed by the courier with the delivery code'; end if;
  if _to in ('cancelled','issue') and coalesce(trim(_note),'') = '' then raise exception 'A reason is required'; end if;
  if o.status = 'issue' and _to <> 'cancelled' and _to <> o.status_before_issue and not (_to='submitted' and o.status_before_issue='quoted') then
    raise exception 'Resolve the issue back to %', o.status_before_issue; end if;
  update public.orders set status=_to,
    status_before_issue = case when _to='issue' then o.status else null end,
    issue_note = case when _to='issue' then _note else o.issue_note end,
    cancel_reason = case when _to='cancelled' then _note else o.cancel_reason end,
    updated_at=now() where id=_order;
  perform public._log_event(_order, 'operations', 'status', o.status, _to, nullif(trim(_note),''));
end $$;

-- ===== Seller RPCs =====
create or replace function public.seller_respond(_order uuid, _accept boolean, _reason text)
returns void language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  if not public.is_order_seller(_order, auth.uid()) or not public.is_active(auth.uid()) then raise exception 'Not allowed'; end if;
  select * into o from public.orders where id=_order for update;
  if o.seller_response is distinct from 'pending' then raise exception 'Already responded'; end if;
  if not _accept and coalesce(trim(_reason),'') = '' then raise exception 'A reason is required to decline'; end if;
  update public.orders set seller_response = case when _accept then 'accepted'::public.assignment_response else 'declined'::public.assignment_response end,
    seller_decline_reason = case when _accept then null else trim(_reason) end, updated_at=now() where id=_order;
  perform public._log_event(_order, 'seller', 'assignment', null, null, case when _accept then 'Seller accepted' else 'Seller declined: ' || trim(_reason) end);
end $$;

-- ===== Item updates (seller or runner) =====
create or replace function public.update_item(_item uuid, _status public.item_status, _substitute text, _price numeric, _note text)
returns void language plpgsql security definer set search_path = public as $$
declare it public.order_items; o public.orders; r text;
begin
  select * into it from public.order_items where id=_item;
  select * into o from public.orders where id=it.order_id;
  if o.id is null or not public.is_active(auth.uid()) then raise exception 'Not allowed'; end if;
  if o.runner_id = auth.uid() then r := 'runner';
  elsif public.is_order_seller(o.id, auth.uid()) and o.seller_response='accepted' then r := 'seller';
  elsif public.is_staff(auth.uid()) then r := 'operations';
  else raise exception 'Not allowed'; end if;
  if o.status not in ('confirmed','sourcing') then raise exception 'Items can only be updated while the order is confirmed or being sourced'; end if;
  if _status = 'substituted' and coalesce(trim(_substitute),'') = '' then raise exception 'Name the substitute'; end if;
  if _price is not null and _price < 0 then raise exception 'Price must be positive'; end if;
  update public.order_items set status=_status,
    substitute_name = case when _status='substituted' then trim(_substitute) else null end,
    substitute_approved = case when _status='substituted' and trim(_substitute) is distinct from it.substitute_name then null when _status='substituted' then it.substitute_approved else null end,
    actual_price=_price, runner_note=nullif(trim(_note),'') where id=_item;
  perform public._log_event(o.id, r, 'item', null, null, it.name || ' marked ' || _status::text);
end $$;

-- runner moves to sourcing/ready
create or replace function public.runner_transition(_order uuid, _to public.order_status, _note text)
returns void language plpgsql security definer set search_path = public as $$
declare o public.orders; r text;
begin
  select * into o from public.orders where id=_order for update;
  if o.runner_id = auth.uid() then r:='runner';
  elsif public.is_order_seller(_order, auth.uid()) and o.seller_response='accepted' then r:='seller';
  else raise exception 'Not allowed'; end if;
  if not public.is_active(auth.uid()) then raise exception 'Not allowed'; end if;
  if not ((o.status='confirmed' and _to='sourcing') or (o.status='sourcing' and _to='ready') or (o.status in ('confirmed','sourcing') and _to='issue')) then
    raise exception 'Invalid status change: % to %', o.status, _to; end if;
  if _to='ready' and exists (select 1 from public.order_items where order_id=_order and status='pending') then raise exception 'Mark every item before handoff'; end if;
  if _to='ready' and exists (select 1 from public.order_items where order_id=_order and status='substituted' and substitute_approved is null) then raise exception 'Waiting for customer to approve substitutions'; end if;
  if _to='issue' and coalesce(trim(_note),'')='' then raise exception 'Describe the issue'; end if;
  update public.orders set status=_to, status_before_issue = case when _to='issue' then o.status else null end,
    issue_note = case when _to='issue' then _note else o.issue_note end, updated_at=now() where id=_order;
  perform public._log_event(_order, r, 'status', o.status, _to, nullif(trim(_note),''));
end $$;

-- courier
create or replace function public.courier_transition(_order uuid, _to public.order_status, _code text, _recipient text, _note text)
returns void language plpgsql security definer set search_path = public as $$
declare o public.orders; d public.order_delivery;
begin
  select * into o from public.orders where id=_order for update;
  if o.courier_id is distinct from auth.uid() or not public.is_active(auth.uid()) then raise exception 'Not allowed'; end if;
  select * into d from public.order_delivery where order_id=_order;
  if o.status='ready' and _to='out_for_delivery' then null;
  elsif o.status='out_for_delivery' and _to='delivered' then
    if coalesce(trim(_code),'') <> d.delivery_code then raise exception 'Delivery code does not match'; end if;
    if coalesce(trim(_recipient),'') = '' then raise exception 'Enter who received the order'; end if;
  elsif o.status in ('ready','out_for_delivery') and _to='issue' then
    if coalesce(trim(_note),'')='' then raise exception 'Describe the issue'; end if;
  else raise exception 'Invalid status change: % to %', o.status, _to; end if;
  update public.orders set status=_to,
    status_before_issue = case when _to='issue' then o.status else null end,
    issue_note = case when _to='issue' then _note else o.issue_note end,
    delivered_at = case when _to='delivered' then now() else delivered_at end,
    proof_recipient = case when _to='delivered' then trim(_recipient) else proof_recipient end,
    updated_at=now() where id=_order;
  perform public._log_event(_order, 'courier', 'status', o.status, _to, coalesce(nullif(trim(_note),''), case when _to='delivered' then 'Received by ' || trim(_recipient) end));
end $$;

-- courier sees delivery code? No: hide via view-less approach — revoke column
revoke select on public.order_delivery from authenticated;
grant select (order_id, recipient_name, recipient_phone, area, address, landmark, instructions, is_alternate) on public.order_delivery to authenticated;
create or replace function public.my_delivery_code(_order uuid)
returns text language sql stable security definer set search_path = public as $$
  select d.delivery_code from public.order_delivery d join public.orders o on o.id=d.order_id where d.order_id=_order and o.customer_id=auth.uid()
$$;

-- ===== Admin RPCs =====
create or replace function public.admin_set_role(_user uuid, _role public.app_role, _grant boolean)
returns void language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if _role in ('admin','super_admin') then
    if not (public.has_role(me,'super_admin') and public.is_active(me)) then raise exception 'Only a Super Admin can change administrator roles'; end if;
    if _role='super_admin' and not _grant and _user = me then raise exception 'You cannot remove your own Super Admin role'; end if;
  else
    if not public.has_permission(me,'manage_users') then raise exception 'Not allowed'; end if;
    if (public.has_role(_user,'admin') or public.has_role(_user,'super_admin')) and not public.has_role(me,'super_admin') then raise exception 'Only a Super Admin can change roles on administrators'; end if;
  end if;
  if _role='customer' and not _grant then raise exception 'Customer role cannot be removed'; end if;
  if _grant then insert into public.user_roles(user_id, role) values (_user,_role) on conflict do nothing;
  else delete from public.user_roles where user_id=_user and role=_role;
    if _role='admin' then delete from public.admin_permissions where user_id=_user; end if;
  end if;
  perform public.write_audit(case when _grant then 'role.grant' else 'role.revoke' end, 'user', _user::text, jsonb_build_object('role', _role));
end $$;

create or replace function public.admin_set_permission(_user uuid, _perm public.admin_permission, _grant boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not (public.has_role(auth.uid(),'super_admin') and public.is_active(auth.uid())) then raise exception 'Only a Super Admin can change permissions'; end if;
  if not public.has_role(_user,'admin') then raise exception 'User is not an administrator'; end if;
  if _grant then insert into public.admin_permissions values (_user,_perm) on conflict do nothing;
  else delete from public.admin_permissions where user_id=_user and permission=_perm; end if;
  perform public.write_audit(case when _grant then 'permission.grant' else 'permission.revoke' end, 'user', _user::text, jsonb_build_object('permission', _perm));
end $$;

create or replace function public.admin_set_account_status(_user uuid, _status public.account_status, _reason text)
returns void language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if _user = me then raise exception 'You cannot change your own account status'; end if;
  if public.has_role(_user,'admin') or public.has_role(_user,'super_admin') then
    if not (public.has_role(me,'super_admin') and public.is_active(me)) then raise exception 'Only a Super Admin can suspend administrators'; end if;
  elsif not public.has_permission(me,'manage_users') then raise exception 'Not allowed'; end if;
  if coalesce(trim(_reason),'')='' then raise exception 'A reason is required'; end if;
  perform set_config('lightgrab.allow_status','on', true);
  update public.profiles set status=_status where id=_user;
  perform public.write_audit('account.' || _status::text, 'user', _user::text, jsonb_build_object('reason', trim(_reason)));
end $$;

create or replace function public.admin_set_seller_status(_seller uuid, _status public.seller_status, _reason text)
returns void language plpgsql security definer set search_path = public as $$
declare s public.sellers;
begin
  if not public.has_permission(auth.uid(),'manage_partners') then raise exception 'Not allowed'; end if;
  select * into s from public.sellers where id=_seller;
  if s.id is null then raise exception 'Seller not found'; end if;
  perform set_config('lightgrab.allow_status','on', true);
  update public.sellers set status=_status where id=_seller;
  if _status='approved' then insert into public.user_roles(user_id, role) values (s.owner_id,'seller') on conflict do nothing; end if;
  if _status='suspended' then delete from public.user_roles where user_id=s.owner_id and role='seller'; end if;
  perform public.write_audit('seller.' || _status::text, 'seller', _seller::text, jsonb_build_object('reason', nullif(trim(_reason),''), 'business', s.business_name));
end $$;

create or replace function public.admin_update_settings(_launch_live boolean, _launch_at timestamptz, _message text, _accepting boolean, _area text, _payments text)
returns void language plpgsql security definer set search_path = public as $$
declare old public.platform_settings;
begin
  if not public.has_permission(auth.uid(),'manage_settings') then raise exception 'Not allowed'; end if;
  select * into old from public.platform_settings where id;
  if _payments not in ('disabled','test') then raise exception 'Invalid payments mode'; end if;
  update public.platform_settings set launch_live=_launch_live, launch_at=_launch_at, prelaunch_message=trim(_message), accepting_requests=_accepting,
    service_area=trim(_area), payments_mode=_payments, updated_at=now(), updated_by=auth.uid() where id;
  perform public.write_audit('settings.update', 'platform', 'settings', jsonb_build_object('before', to_jsonb(old) - 'updated_by', 'after',
    jsonb_build_object('launch_live',_launch_live,'launch_at',_launch_at,'accepting_requests',_accepting,'service_area',_area,'payments_mode',_payments,'prelaunch_message',_message)));
end $$;

-- Staff directory: list people with a given role (names only), for assignment
create or replace function public.staff_list_people(_role public.app_role)
returns table(id uuid, full_name text, phone text, status public.account_status)
language sql stable security definer set search_path = public as $$
  select p.id, p.full_name, p.phone, p.status from public.profiles p join public.user_roles r on r.user_id=p.id
  where r.role=_role and public.is_staff(auth.uid()) order by p.full_name
$$;

-- Admin user directory with emails
create or replace function public.admin_list_users(_search text)
returns table(id uuid, email text, full_name text, status public.account_status, roles public.app_role[], created_at timestamptz)
language sql stable security definer set search_path = public, auth as $$
  select p.id, u.email::text, p.full_name, p.status,
    coalesce(array_agg(r.role order by r.role) filter (where r.role is not null), '{}'), p.created_at
  from public.profiles p join auth.users u on u.id=p.id left join public.user_roles r on r.user_id=p.id
  where (public.has_permission(auth.uid(),'manage_users') or public.has_role(auth.uid(),'super_admin'))
    and (coalesce(_search,'')='' or u.email ilike '%'||_search||'%' or p.full_name ilike '%'||_search||'%')
  group by p.id, u.email order by p.created_at desc limit 200
$$;

-- lock down RPC execution to authenticated
do $$ declare f text; begin
  foreach f in array array['create_order(public.business_category,text,text,jsonb,jsonb)','customer_respond_quote(uuid,boolean,text)','customer_cancel(uuid,text)',
    'customer_decide_substitution(uuid,boolean)','ops_quote(uuid,numeric,numeric,numeric,text)','ops_assign(uuid,uuid,uuid,uuid)','ops_transition(uuid,public.order_status,text)',
    'seller_respond(uuid,boolean,text)','update_item(uuid,public.item_status,text,numeric,text)','runner_transition(uuid,public.order_status,text)',
    'courier_transition(uuid,public.order_status,text,text,text)','my_delivery_code(uuid)','admin_set_role(uuid,public.app_role,boolean)',
    'admin_set_permission(uuid,public.admin_permission,boolean)','admin_set_account_status(uuid,public.account_status,text)',
    'admin_set_seller_status(uuid,public.seller_status,text)','admin_update_settings(boolean,timestamptz,text,boolean,text,text)',
    'staff_list_people(public.app_role)','admin_list_users(text)'] loop
    execute format('revoke execute on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;
