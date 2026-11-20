import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { errMsg } from "@/lib/session";

type IntakeType = "waitlist" | "runner" | "courier";

export function IntakeForm({ type }: { type: IntakeType }) {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const title = type === "waitlist" ? "Get launch updates" : type === "runner" ? "Runner application" : "Courier application";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setBusy(true);
    const { error } = await supabase.from("intake_submissions").insert({
      application_type: type,
      full_name: String(values.get("full_name") ?? "").trim(),
      email: String(values.get("email") ?? "").trim(),
      phone: String(values.get("phone") ?? "").trim(),
      state: String(values.get("state") ?? "").trim(),
      lga: String(values.get("lga") ?? "").trim(),
    });
    setBusy(false);
    if (error) {
      toast.error(errMsg(error));
      return;
    }
    form.reset();
    setSent(true);
    toast.success(type === "waitlist" ? "You’re on the early list" : "Your application has been received");
  }

  return sent ? (
    <div role="status" className="border-l-2 border-primary bg-muted/40 px-4 py-4">
      <h3 className="font-semibold">{type === "waitlist" ? "You're on the list." : "Application received."}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{type === "waitlist" ? "Your interest has been recorded." : "The LightGrab team can now review your details."}</p>
    </div>
  ) : (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <h3 className="text-lg font-semibold sm:col-span-2">{title}</h3>
      <div className="space-y-2"><Label htmlFor={`${type}-full-name`}>Full name</Label><Input id={`${type}-full-name`} name="full_name" autoComplete="name" maxLength={120} required /></div>
      <div className="space-y-2"><Label htmlFor={`${type}-email`}>Email address</Label><Input id={`${type}-email`} name="email" type="email" autoComplete="email" maxLength={255} required /></div>
      <div className="space-y-2"><Label htmlFor={`${type}-phone`}>Phone number</Label><Input id={`${type}-phone`} name="phone" type="tel" autoComplete="tel" maxLength={40} required /></div>
      <div className="space-y-2"><Label htmlFor={`${type}-state`}>State</Label><Input id={`${type}-state`} name="state" autoComplete="address-level1" maxLength={120} required /></div>
      <div className="space-y-2 sm:col-span-2"><Label htmlFor={`${type}-lga`}>Local Government Area (LGA)</Label><Input id={`${type}-lga`} name="lga" autoComplete="address-level2" maxLength={120} required /></div>
      <div className="sm:col-span-2"><Button type="submit" variant="signal" disabled={busy}>{busy ? "Submitting…" : type === "waitlist" ? "Join the early list" : "Send application"}</Button></div>
    </form>
  );
}