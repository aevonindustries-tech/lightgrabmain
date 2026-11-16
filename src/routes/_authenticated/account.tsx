import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, Loading, PageTitle } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { errMsg, useMe } from "@/lib/session";
import { ROLE_LABEL } from "@/lib/order-status";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Account — LightGrab" }] }),
  component: Account,
});

function Account() {
  const { data: me, isLoading } = useMe();
  const qc = useQueryClient();
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!me) return;
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "").trim() || null;
    const { error } = await supabase.from("profiles").update({ full_name: v("full_name") ?? "", phone: v("phone"), default_area: v("default_area"), default_address: v("default_address") }).eq("id", me.user.id);
    if (error) return toast.error(errMsg(error));
    toast.success("Account saved");
    qc.invalidateQueries({ queryKey: ["me"] });
  }
  return (
    <AppShell portal="Account" nav={[{ to: "/requests", label: "My requests" }, { to: "/account", label: "Account" }]}>
      <PageTitle eyebrow={me?.user.email ?? ""} title="Your account" />
      {isLoading || !me ? <Loading /> : (
        <form onSubmit={save} className="max-w-lg space-y-4">
          <p className="text-sm text-muted-foreground">Roles: {me.roles.map((r) => ROLE_LABEL[r]).join(", ")}</p>
          <div><Label htmlFor="full_name">Full name</Label><Input id="full_name" name="full_name" defaultValue={me.profile?.full_name ?? ""} maxLength={120} /></div>
          <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" defaultValue={me.profile?.phone ?? ""} maxLength={30} /></div>
          <div><Label htmlFor="default_area">Area in Oron</Label><Input id="default_area" name="default_area" defaultValue={me.profile?.default_area ?? ""} maxLength={120} /></div>
          <div><Label htmlFor="default_address">Default address</Label><Input id="default_address" name="default_address" defaultValue={me.profile?.default_address ?? ""} maxLength={500} /></div>
          <Button type="submit">Save</Button>
        </form>
      )}
    </AppShell>
  );
}
