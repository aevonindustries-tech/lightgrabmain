import { queryOptions, useQuery } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "./order-status";
import type { Database } from "@/integrations/supabase/types";

export type Permission = Database["public"]["Enums"]["admin_permission"];

export const meQuery = queryOptions({
  queryKey: ["me"],
  queryFn: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const [profile, roles, perms] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", user.id),
      supabase.from("admin_permissions").select("permission").eq("user_id", user.id),
    ]);
    return {
      user,
      profile: profile.data,
      roles: (roles.data ?? []).map((r) => r.role) as AppRole[],
      permissions: (perms.data ?? []).map((p) => p.permission) as Permission[],
    };
  },
});

export const useMe = () => useQuery(meQuery);

export function hasPerm(me: { roles: AppRole[]; permissions: Permission[] } | null | undefined, p: Permission) {
  if (!me) return false;
  return me.roles.includes("super_admin") || (me.roles.includes("admin") && me.permissions.includes(p));
}

/** Route guard for role portals. The database (RLS + RPC checks) is the real enforcement. */
export async function requireRole(roles: AppRole[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw redirect({ to: "/auth" });
  const [{ data: rows }, { data: profile }] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", user.id),
    supabase.from("profiles").select("status").eq("id", user.id).maybeSingle(),
  ]);
  if (profile?.status !== "active") throw redirect({ to: "/account" });
  if (!rows?.some((r) => roles.includes(r.role))) throw redirect({ to: "/requests" });
}

export const PORTALS: { role: AppRole[]; to: string; label: string }[] = [
  { role: ["customer"], to: "/requests", label: "My requests" },
  { role: ["seller"], to: "/seller", label: "Seller portal" },
  { role: ["runner"], to: "/runner", label: "Runner tasks" },
  { role: ["courier"], to: "/courier", label: "Courier deliveries" },
  { role: ["operations", "admin", "super_admin"], to: "/ops", label: "Operations" },
  { role: ["admin", "super_admin"], to: "/admin", label: "Administration" },
];

export function errMsg(e: unknown) {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: string }).message);
  return "Something went wrong. Please try again.";
}
