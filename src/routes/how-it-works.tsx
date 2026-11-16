import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicFooter, PublicHeader } from "@/components/public-chrome";
import { PROGRESS, STATUS_HELP, STATUS_LABEL } from "@/lib/order-status";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How LightGrab works — Oron shopping requests" },
      { name: "description", content: "Every step of a LightGrab request, from your written list to a confirmed doorstep delivery in Oron." },
      { property: "og:title", content: "How LightGrab works" },
      { property: "og:description", content: "Every step of a LightGrab request, from your written list to a confirmed delivery." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HowItWorks,
});

function HowItWorks() {
  return (
    <div>
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <p className="eyebrow">How it works</p>
        <h1 className="mt-3 text-4xl font-semibold">Every request follows the same seven steps</h1>
        <p className="mt-4 text-muted-foreground">You can see exactly where your request is at any time. Nothing is bought until you accept the quote.</p>
        <ol className="rule-top mt-10">
          {PROGRESS.map((s, i) => (
            <li key={s} className="ledger-row grid grid-cols-[3rem_1fr] gap-4 py-5">
              <span className="tabular text-signal">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h2 className="text-lg font-semibold">{STATUS_LABEL[s]}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{STATUS_HELP[s]}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-10 space-y-3 text-sm text-muted-foreground">
          <p><strong className="text-foreground">Cancelling.</strong> You can cancel from the app until you accept a quote. After that, contact operations.</p>
          <p><strong className="text-foreground">Substitutes.</strong> If an item is unavailable, the runner proposes a substitute and you approve or reject it before your order is packed.</p>
          <p><strong className="text-foreground">Payment.</strong> Pay on delivery. Online payment and wallets are not available yet.</p>
        </div>
        <Link to="/requests/new" className="mt-10 inline-flex h-11 items-center rounded-sm bg-signal px-6 font-semibold text-signal-foreground hover:bg-signal/85">Start a shopping list</Link>
      </main>
      <PublicFooter />
    </div>
  );
}
