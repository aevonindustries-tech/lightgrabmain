import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Wordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RETURN_PATHS = ["/requests", "/requests/new", "/account"] as const;

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: RETURN_PATHS.find((path) => path === s.redirect) }),
  head: () => ({ meta: [{ title: "Sign in — LightGrab" }, { name: "description", content: "Sign in or create a LightGrab account." }, { property: "og:title", content: "Sign in — LightGrab" }, { property: "og:description", content: "Sign in or create a LightGrab account." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: AuthPage,
});

const schema = z.object({ email: z.string().trim().email("Enter a valid email").max(255), password: z.string().min(8, "At least 8 characters").max(72) });

function AuthPage() {
  const { redirect: redirectTo } = Route.useSearch();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const parsed = schema.safeParse({ email: f.get("email"), password: f.get("password") });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      setBusy(false);
      if (error) return toast.error(error.message);
      navigate({ to: redirectTo ?? "/requests" });
    } else {
      const name = String(f.get("name") ?? "").trim().slice(0, 120);
      const { error } = await supabase.auth.signUp({ ...parsed.data, options: { emailRedirectTo: window.location.origin, data: { full_name: name } } });
      setBusy(false);
      if (error) return toast.error(error.message);
      setSent(true);
    }
  }
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Wordmark />
        <h1 className="mt-8 text-3xl font-semibold">{mode === "in" ? "Sign in" : "Create your account"}</h1>
        {sent ? (
          <p className="mt-4 text-sm">Check your email and click the confirmation link, then sign in.</p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "up" && (<div><Label htmlFor="name">Full name</Label><Input id="name" name="name" required maxLength={120} /></div>)}
            <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required autoComplete="email" /></div>
            <div><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" required minLength={8} autoComplete={mode === "in" ? "current-password" : "new-password"} /></div>
            <Button type="submit" className="w-full" disabled={busy}>{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}</Button>
          </form>
        )}
        <button className="mt-6 text-sm underline" onClick={() => { setMode(mode === "in" ? "up" : "in"); setSent(false); }}>
          {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
