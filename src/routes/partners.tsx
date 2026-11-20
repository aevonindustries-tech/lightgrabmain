import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicFooter, PublicHeader } from "@/components/public-chrome";

export const Route = createFileRoute("/partners")({
  head: () => ({ meta: [
    { title: "Join the LightGrab local team — Oron" },
    { name: "description", content: "Learn about independent Market Runner and Courier opportunities with LightGrab in Oron." },
    { property: "og:title", content: "Join the LightGrab local team — Oron" },
    { property: "og:description", content: "Explore separate Market Runner and Courier application paths." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Partners,
});

function Partners() {
  return (
    <div>
      <PublicHeader />
      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <p className="eyebrow">Local opportunities</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold">Join the LightGrab local team</h1>
        <div className="rule-top mt-10 grid gap-10 pt-8 md:grid-cols-2">
          <section>
            <h2 className="text-xl font-semibold">Market Runners</h2>
            <p className="mt-2 text-sm text-muted-foreground">Help source and prepare requested goods from local markets. Runner applications are handled separately from customer shopping.</p>
            <Link to="/runners" className="mt-5 inline-flex h-10 items-center border border-rule px-4 text-sm font-medium hover:bg-foreground hover:text-background">Explore runner opportunities</Link>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Couriers</h2>
            <p className="mt-2 text-sm text-muted-foreground">Help deliver prepared requests across Oron. Courier applicants have their own application and sign-in pages.</p>
            <Link to="/courier" className="mt-5 inline-flex h-10 items-center border border-rule px-4 text-sm font-medium hover:bg-foreground hover:text-background">Explore courier opportunities</Link>
          </section>
        </div>
        <p className="rule-top mt-10 pt-5 text-sm text-muted-foreground">Seller and business registration is not available on the customer site.</p>
      </main>
      <PublicFooter />
    </div>
  );
}