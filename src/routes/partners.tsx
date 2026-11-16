import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicFooter, PublicHeader } from "@/components/public-chrome";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Partner with LightGrab — sellers, runners and couriers in Oron" },
      { name: "description", content: "Market sellers, restaurants, bakeries, factories, runners and couriers can work with LightGrab in Oron." },
      { property: "og:title", content: "Partner with LightGrab in Oron" },
      { property: "og:description", content: "Sell, run or deliver with LightGrab." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Partners,
});

function Partners() {
  return (
    <div>
      <PublicHeader />
      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <p className="eyebrow">Partners</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold">Work with LightGrab in Oron</h1>
        <div className="rule-top mt-10 grid gap-10 pt-8 md:grid-cols-3">
          <section>
            <h2 className="text-xl font-semibold">Sellers & businesses</h2>
            <p className="mt-2 text-sm text-muted-foreground">Market traders, restaurants, bakeries and factories. Receive requests that match what you sell, confirm availability, and accept or decline each one.</p>
            <p className="mt-3 text-sm">Create an account, then apply from <strong>Account → Become a seller</strong>. Our team reviews every application before it goes live.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Market runners</h2>
            <p className="mt-2 text-sm text-muted-foreground">Buy and prepare items in the market against an itemised list, record what's unavailable and propose substitutes.</p>
            <p className="mt-3 text-sm">Runners are verified in person by our operations team, who activate your runner access on your account.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Couriers</h2>
            <p className="mt-2 text-sm text-muted-foreground">Collect packed orders and deliver them, confirming each delivery with the customer's code.</p>
            <p className="mt-3 text-sm">Couriers are also verified in person before courier access is switched on.</p>
          </section>
        </div>
        <Link to="/auth" className="mt-12 inline-flex h-11 items-center rounded-sm bg-primary px-6 font-medium text-primary-foreground hover:bg-primary/90">Create an account</Link>
      </main>
      <PublicFooter />
    </div>
  );
}
