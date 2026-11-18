import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, Empty, ErrorNote, Loading, PageTitle } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { CATEGORY_LABEL, STATUS_HELP } from "@/lib/order-status";

export const Route = createFileRoute("/_authenticated/requests/")({
  head: () => ({ meta: [
    { title: "My requests — LightGrab" },
    { name: "description", content: "Review the status and updates for your LightGrab shopping requests in Oron." },
    { property: "og:title", content: "My requests — LightGrab" },
    { property: "og:description", content: "Review your LightGrab shopping requests in Oron." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Requests,
});

function Requests() {
  const q = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to view your requests.");
      const { data, error } = await supabase.from("orders").select("id, code, status, category, created_at").eq("customer_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  return (
    <AppShell portal="My requests" nav={[{ to: "/requests", label: "My requests" }, { to: "/requests/new", label: "New request" }]}>
      <PageTitle eyebrow="Customer" title="Your shopping requests">
        <Link to="/requests/new" className="inline-flex h-10 items-center rounded-sm bg-signal px-5 font-semibold text-signal-foreground hover:bg-signal/85">New list</Link>
      </PageTitle>
      {q.isLoading ? <Loading /> : q.error ? <ErrorNote error={q.error} /> : !q.data?.length ? (
        <Empty title="No requests yet">Write your first shopping list and we'll send you a quote.</Empty>
      ) : (
        <ul className="rule-top">
          {q.data.map((o) => (
            <li key={o.id} className="ledger-row flex flex-wrap items-center gap-4 py-4">
              <span className="tabular w-20">{o.code}</span>
              <span className="text-sm">{CATEGORY_LABEL[o.category]}</span>
              <span className="hidden flex-1 text-sm text-muted-foreground md:block">{STATUS_HELP[o.status]}</span>
              <span className="tabular text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-NG")}</span>
              <StatusBadge status={o.status} />
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
