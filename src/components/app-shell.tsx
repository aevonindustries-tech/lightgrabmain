import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PORTALS, useMe } from "@/lib/session";
import { Wordmark } from "./brand";

export type NavItem = { to: "/requests" | "/requests/new" | "/account"; label: string; exact?: boolean };

export function AppShell({ portal, nav, children }: { portal: string; nav: NavItem[]; children: ReactNode }) {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const portals = PORTALS.filter((p) => me?.roles.some((r) => p.role.includes(r)));

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { redirect: undefined }, replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="rule-bottom bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <Wordmark to={portals[0]?.to ?? "/requests"} />
          <span className="eyebrow hidden sm:inline">{portal}</span>
          <div className="ml-auto flex items-center gap-3">
            {portals.length > 1 && (
              <label className="flex items-center gap-2 text-sm">
                <span className="sr-only">Switch workspace</span>
                <select
                  className="h-8 rounded-sm border border-input bg-card px-2 text-sm"
                  value={portals.find((p) => p.label === portal)?.to ?? ""}
                  onChange={(e) => navigate({ to: e.target.value as "/requests" })}
                >
                  {!portals.some((p) => p.label === portal) && <option value="">Switch workspace</option>}
                  {portals.map((p) => (
                    <option key={p.to} value={p.to}>{p.label}</option>
                  ))}
                </select>
              </label>
            )}
            <Link to="/account" className="text-sm underline-offset-4 hover:underline">Account</Link>
            <button onClick={signOut} className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Sign out</button>
          </div>
        </div>
        {nav.length > 0 && (
          <nav aria-label={`${portal} navigation`} className="mx-auto flex max-w-6xl gap-5 overflow-x-auto px-4 sm:px-6">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.exact ?? true }}
                className="whitespace-nowrap border-b-2 border-transparent py-2 text-sm text-muted-foreground hover:text-foreground"
                activeProps={{ className: "!border-signal !text-foreground font-medium" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      {me?.profile?.status === "suspended" && (
        <div role="alert" className="bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
          This account is suspended. You can view your account but cannot place or handle orders.
        </div>
      )}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}

export function PageTitle({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="border border-dashed border-border px-6 py-12 text-center">
      <p className="font-display text-lg font-medium">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}

export function Loading({ label = "Loading" }: { label?: string }) {
  return <p className="eyebrow animate-pulse py-12 text-center" role="status">{label}…</p>;
}

export function ErrorNote({ error }: { error: unknown }) {
  const msg = error && typeof error === "object" && "message" in error ? String((error as { message: string }).message) : "Could not load data.";
  return <p role="alert" className="border-l-2 border-destructive bg-destructive/5 px-3 py-2 text-sm text-destructive">{msg}</p>;
}
