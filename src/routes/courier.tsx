import { createFileRoute } from "@tanstack/react-router";
import { PublicFooter, PublicHeader } from "@/components/public-chrome";
import { IntakeForm } from "@/components/intake-form";

export const Route = createFileRoute("/courier")({
  head: () => ({
    meta: [
      { title: "Become a LightGrab courier — Oron" },
      { name: "description", content: "Apply to deliver prepared customer shopping requests across Oron for LightGrab." },
      { property: "og:title", content: "Become a LightGrab courier — Oron" },
      { property: "og:description", content: "Apply to deliver prepared customer shopping requests across Oron for LightGrab." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CourierRecruitment,
});

function CourierRecruitment() {
  return (
    <div>
      <PublicHeader />
      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <p className="eyebrow">Local opportunities · Oron</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold">Become a LightGrab courier</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">Deliver prepared customer requests to their doors across Oron. Courier work is separate from market sourcing and shopping.</p>
        <div className="rule-top mt-10 grid gap-10 pt-8 md:grid-cols-[0.8fr_1.2fr]">
          <section>
            <h2 className="text-xl font-semibold">Courier application</h2>
            <p className="mt-3 text-sm text-muted-foreground">Share your contact details and where you are based. The LightGrab team will review your application.</p>
          </section>
          <IntakeForm type="courier" />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}