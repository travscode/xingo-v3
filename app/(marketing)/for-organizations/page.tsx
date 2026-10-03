import type { Metadata } from "next";
import { MarketingIntro } from "@/components/marketing/cta-band";
import { SALES_EMAIL } from "@/components/marketing/catalogue";
import { Portrait, ScenePhoto, type PersonKey } from "@/components/marketing/people";
import { Button } from "@/components/ui/button";
import { CCL_MAX_SCORE } from "@/lib/scoring";
import { pageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = pageMetadata({
  title: "For Training Providers and Interpreting Teams",
  description:
    "Cohort access to XINGO for interpreter training providers, NAATI test prep courses and language service providers. Spoken practice with scored feedback.",
  path: "/for-organizations",
});

const useCases: Array<{ title: string; description: string; person: PersonKey }> = [
  {
    title: "Training providers",
    description: "Give students more speaking practice between classes, in the settings they're training for.",
    person: "linh",
  },
  {
    title: "NAATI test prep courses",
    description: `Add CCL-style dialogue practice, scored out of ${CCL_MAX_SCORE}, alongside your own teaching.`,
    person: "candidate",
  },
  {
    title: "Language service providers",
    description: "Offer interpreters a way to keep their skills current in medical, legal and community settings.",
    person: "sofia",
  },
];

const mailto = `mailto:${SALES_EMAIL}?subject=${encodeURIComponent("XINGO cohort access")}`;

export default function ForOrganizationsPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 sm:px-6">
      <MarketingIntro
        eyebrow="For teams"
        title="More speaking practice for your whole cohort."
        description="We work directly with training providers and interpreting teams to set up access. Tell us about your group and we'll work out what fits."
        media={
          <ScenePhoto
            scene="team"
            priority
            sizes="(min-width: 1024px) 480px, calc(100vw - 32px)"
            className="aspect-[4/3] w-full"
          />
        }
      >
        <Button asChild size="lg">
          <a href={mailto}>Talk to us</a>
        </Button>
      </MarketingIntro>

      <section className="grid gap-4 md:grid-cols-3">
        {useCases.map((item) => (
          <article key={item.title} className="mk-lift rounded-xl border border-gray-200 p-6 hover:border-ink">
            <Portrait person={item.person} size={48} />
            <h2 className="mt-4 text-lg font-bold tracking-[-0.02em]">{item.title}</h2>
            <p className="mt-2 text-[15px] leading-6 text-gray-500">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="rounded-xl bg-ink px-6 py-10 text-paper sm:px-10 sm:py-12">
        <h2 className="max-w-2xl text-3xl font-bold tracking-[-0.03em] sm:text-4xl">Talk to us about cohort access</h2>
        <p className="mt-3 max-w-xl text-[15px] leading-6 text-gray-300">
          Send us a short note with your organisation, roughly how many learners, which languages, and what
          they&apos;re preparing for. We&apos;ll reply by email.
        </p>
        <Button asChild variant="accent" size="lg" className="mt-8">
          <a href={mailto}>Email {SALES_EMAIL}</a>
        </Button>
      </section>
    </main>
  );
}
