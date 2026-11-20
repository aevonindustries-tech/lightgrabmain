import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import hero from "@/assets/oron-market.jpg";
import { PublicFooter, PublicHeader } from "@/components/public-chrome";
import { Countdown } from "@/components/countdown";
import { IntakeForm } from "@/components/intake-form";
import { settingsQuery } from "@/lib/settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LightGrab — Your Oron market list, bought and delivered" },
      { name: "description", content: "Write what you need from the market. LightGrab prices it, buys it through trusted Oron sellers and runners, and delivers it to your door." },
      { property: "og:title", content: "LightGrab — Your Oron market list, bought and delivered" },
      { property: "og:description", content: "Write what you need from the market. We price it, buy it and deliver it in Oron." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const sample = [
  ["Fresh tomatoes", "1 paint bucket", "₦—"],
  ["Scotch bonnet (ata rodo)", "2 cups", "₦—"],
  ["Plantain, ripe", "1 bunch", "₦—"],
  ["Crayfish, ground", "1 derica", "₦—"],
  ["Garden egg", "10 pieces", "₦—"],
];

function Index() {
  const { data: s } = useQuery(settingsQuery);
  const live = s?.launch_live ?? false;

  return (
    <div>
      <PublicHeader />
      {!live && s && (
        <div className="bg-primary text-primary-foreground">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-75">Pre-launch · {s.service_area}</p>
              <p className="mt-1 text-sm">{s.prelaunch_message}</p>
            </div>
            {s.countdown_enabled && s.launch_at && new Date(s.launch_at).getTime() > Date.now() && <Countdown to={s.launch_at} />}
          </div>
        </div>
      )}

      <section className="mx-auto grid max-w-6xl gap-10 px-4 pt-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pt-16">
        <div className="flex flex-col justify-center">
          <p className="eyebrow">Oron · Akwa Ibom</p>
          <h1 className="mt-4 text-[2.6rem] font-semibold leading-[1.02] sm:text-6xl">
            Write your market list.<br />
            <span className="text-primary">We'll do the market.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Tell us what you need and how much. We price it with trusted local sellers, send a runner to buy it, and a courier brings it to your door.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="inline-flex min-h-11 items-center border border-border px-4 py-2 text-sm text-muted-foreground" aria-label="Android app download coming soon">Android app download coming soon</span>
            <Link to="/how-it-works" className="inline-flex h-11 items-center rounded-sm border-[1.5px] border-rule px-6 font-medium hover:bg-foreground hover:text-background">
              How it works
            </Link>
          </div>
          {s && !s.accepting_requests && (
            <p className="mt-4 text-sm text-muted-foreground">We're not taking requests yet — you can create an account now and be ready on launch.</p>
          )}
        </div>

        <div className="relative">
          <img src={hero} alt="A market stall in Oron with tomatoes, peppers, plantain and crayfish" width={1600} height={1104} className="aspect-[4/3] w-full rounded-sm object-cover" />
          <div className="absolute -bottom-8 left-4 right-4 rounded-sm border border-border bg-card p-4 shadow-[0_18px_40px_-20px_oklch(0.22_0.03_160/0.45)] sm:left-auto sm:right-[-1rem] sm:w-80">
            <div className="flex items-baseline justify-between">
              <p className="eyebrow">Example list</p>
              <p className="font-mono text-[11px] text-muted-foreground">awaiting quote</p>
            </div>
            <ul className="mt-2 text-sm">
              {sample.map(([n, q, p]) => (
                <li key={n} className="ledger-row flex justify-between gap-3 py-1.5">
                  <span>{n}</span>
                  <span className="tabular text-xs text-muted-foreground">{q} · {p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-28 max-w-6xl px-4 sm:px-6">
        <div className="rule-top grid gap-10 pt-8 md:grid-cols-4">
          <h2 className="text-2xl font-semibold md:col-span-1">From list to doorstep</h2>
          {[
            ["01", "You write the list", "Item names and quantities in your own words — “1 mudu garri”, “half basin of periwinkle”. Add a price you'd like to stay under."],
            ["02", "We send a quote", "Operations checks prices with partner sellers and sends you an itemised total with delivery fee. Nothing is bought until you accept."],
            ["03", "A runner buys it", "A market runner buys and packs your items. If something isn't available, you approve or reject the substitute."],
          ].map(([n, t, d]) => (
            <div key={n}>
              <p className="tabular text-sm text-signal">{n}</p>
              <h3 className="mt-2 text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-10 md:grid-cols-4">
          <div className="md:col-start-2">
            <p className="tabular text-sm text-signal">04</p>
            <h3 className="mt-2 text-lg font-semibold">A courier delivers</h3>
            <p className="mt-2 text-sm text-muted-foreground">You receive a 4-digit delivery code. Give it to the courier only when your goods are in your hands.</p>
          </div>
          <div className="md:col-span-2">
            <p className="tabular text-sm text-signal">₦</p>
            <h3 className="mt-2 text-lg font-semibold">Pay on delivery, for now</h3>
            <p className="mt-2 text-sm text-muted-foreground">Online card payment is not switched on yet. There is no wallet and we hold no money for you. You pay the accepted quote when you receive your order.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
        <div className="grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Market goods", "Foodstuff, provisions, fish, pepper, palm oil — whatever is sold in Oron's markets."],
            ["Restaurants", "Ask for a meal from a participating kitchen. We'll confirm availability and price."],
            ["Bakeries", "Bread, cakes and snacks from local bakeries, as orders by request."],
            ["Factories & others", "Bulk or wholesale goods from participating local producers."],
          ].map(([t, d]) => (
            <div key={t} className="bg-card p-6">
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">There is no fixed catalogue — you write what you need and we tell you what's possible.</p>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
        <div className="rule-top grid gap-8 pt-8 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="eyebrow">Built for everyday Oron</p>
            <h2 className="mt-3 text-3xl font-semibold">A market trip, without the trip.</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="font-semibold">Skip the back-and-forth</h3>
              <p className="mt-2 text-sm text-muted-foreground">Share one clear list with quantities and details. We check what is available and send you the cost before anyone shops.</p>
            </div>
            <div>
              <h3 className="font-semibold">Know what happens next</h3>
              <p className="mt-2 text-sm text-muted-foreground">Your request moves from quote to shopping to delivery, with updates along the way. You approve the quote before the team buys anything.</p>
            </div>
            <div>
              <h3 className="font-semibold">Local shops, one request</h3>
              <p className="mt-2 text-sm text-muted-foreground">Ask for market goods, meals, baked goods, wholesale items and other local products without searching a fixed catalogue.</p>
            </div>
            <div>
              <h3 className="font-semibold">Pay when it arrives</h3>
              <p className="mt-2 text-sm text-muted-foreground">Online payments are not available yet. For now, pay the quote you accepted when your order reaches you.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="waitlist" className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
        <div className="rule-top grid gap-8 pt-8 md:grid-cols-[1fr_1.25fr]">
          <div>
            <p className="eyebrow">Join the early list</p>
            <h2 className="mt-3 text-3xl font-semibold">Why join LightGrab?</h2>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">Be among the first to hear when local shopping and doorstep delivery are ready in Oron.</p>
          </div>
          <IntakeForm type="waitlist" />
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
