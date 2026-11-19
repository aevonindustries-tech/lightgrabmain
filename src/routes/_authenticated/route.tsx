import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const PRIVATE_PATHS = ["/requests", "/requests/new", "/account"] as const;

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      const redirectTo = PRIVATE_PATHS.find((path) => path === location.pathname);
      throw redirect({ to: "/auth", search: { redirect: redirectTo } });
    }
  },
  component: () => <Outlet />,
});
