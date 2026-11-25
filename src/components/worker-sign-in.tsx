import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Wordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/order-status";

export function WorkerSignIn({ kind }: { kind: "runner" | "courier" }) {
  const [busy, setBusy] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const title = kind === "runner" ? "Runner Sign In" : "Courier Sign In";
  const role: AppRole = kind;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      await supabase.auth.signOut();
      toast.error("We could not verify this account.");
      return;
    }
    const { data, error: roleError } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    if (roleError || !data?.some((row) => row.role === role)) {
      await supabase.auth.signOut();
      toast.error(`This account does not have an approved ${kind} role.`);
      return;
    }
    toast.success(`${title} successful`);
    setSignedIn(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Wordmark to={kind === "runner" ? "/runners" : "/courier"} />
        <p className="eyebrow mt-8">{kind === "runner" ? "Market Runners" : "Couriers"}</p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        {signedIn ? (
          <div className="mt-6 space-y-4" role="status">
            <p className="text-sm text-muted-foreground">Your {kind} account is verified. The {kind} task workspace is still being prepared.</p>
            <Button type="button" variant="outline" onClick={async () => { await supabase.auth.signOut(); setSignedIn(false); }}>Sign out</Button>
          </div>
        ) : <form onSubmit={submit} className="mt-6 space-y-4">
          <div><Label htmlFor={`${kind}-signin-email`}>Email</Label><Input id={`${kind}-signin-email`} name="email" type="email" autoComplete="username" required /></div>
          <div><Label htmlFor={`${kind}-signin-password`}>Password</Label><Input id={`${kind}-signin-password`} name="password" type="password" autoComplete="current-password" required /></div>
          <Button type="submit" className="w-full" disabled={busy}>{busy ? "Signing in…" : title}</Button>
        </form>}
        <p className="mt-5 text-sm text-muted-foreground">Need to apply? <Link to={kind === "runner" ? "/runners" : "/courier"} className="underline">{kind === "runner" ? "Runner Registration" : "Courier Registration"}</Link></p>
      </div>
    </main>
  );
}