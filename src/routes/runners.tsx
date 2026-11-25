import { createFileRoute } from "@tanstack/react-router";
import { PublicFooter, PublicHeader } from "@/components/public-chrome";
import { IntakeForm } from "@/components/intake-form";

export const Route = createFileRoute("/runners")({
  head: () => ({
    meta: [
      { title: "Become a LightGrab market runner — Oron" },
      { name: "description", content: "Apply to source and prepare customer shopping requests from local markets in Oron." },
      { property: "og:title", content: "Become a LightGrab market runner — Oron" },
      { property: "og:description", content: "Apply to source and prepare customer shopping requests from local markets in Oron." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RunnerRecruitment,
});

function RunnerRecruitment() {
  return (
    <div>
      <PublicHeader />
      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <p className="eyebrow">Local opportunities · Oron</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold">Become a LightGrab market runner</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">Help customers get the goods they request. Runners source and prepare assigned shopping lists from participating local sellers and markets.</p>
        <div className="rule-top mt-10 grid gap-10 pt-8 md:grid-cols-[0.8fr_1.2fr]">
          <section>
            <h2 className="text-xl font-semibold">Market runner application</h2>
            <p className="mt-3 text-sm text-muted-foreground">Share your contact details and where you are based. The LightGrab team will review your application.</p>
          </section>
          <IntakeForm type="runner" />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}