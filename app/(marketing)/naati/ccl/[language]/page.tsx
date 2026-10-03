import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CtaBand, MarketingIntro } from "@/components/marketing/cta-band";
import { FaqSection } from "@/components/marketing/seo/faq-section";
import { HowSteps } from "@/components/marketing/seo/how-steps";
import { ScenarioList } from "@/components/marketing/seo/scenario-list";
import { Button } from "@/components/ui/button";
import { packList, plans } from "@/lib/plans";
import { CCL_MAX_SCORE, CCL_PASS_SCORE } from "@/lib/scoring";
import { cclLanguagePages, flagFor, getCclLanguagePage, signUpHref } from "@/lib/seo-pages";

export function generateStaticParams() {
  return cclLanguagePages.map((page) => ({ language: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ language: string }> }): Promise<Metadata> {
  const { language } = await params;
  const page = getCclLanguagePage(language);

  if (!page) return {};

  return {
    title: `NAATI CCL ${page.name} Practice — Spoken Mock Dialogues`,
    description: `Practise NAATI CCL ${page.name} dialogues out loud with AI speakers. English ⇄ ${page.name}, scored out of ${CCL_MAX_SCORE} with feedback on accuracy, language quality and delivery. Try a dialogue free.`,
    alternates: { canonical: `/naati/ccl/${page.slug}` },
    openGraph: {
      title: `NAATI CCL ${page.name} practice`,
      description: `Spoken English ⇄ ${page.name} CCL-style dialogues, scored out of ${CCL_MAX_SCORE}.`,
      url: `/naati/ccl/${page.slug}`,
    },
  };
}

const cclScenarios = [
  { title: "Medical scan booking", description: "Appointment times, fasting instructions and referrals." },
  { title: "Centrelink appointment change", description: "Rescheduling, documents and payment questions." },
  { title: "Car insurance claim", description: "What happened, when, and the excess." },
  { title: "Workplace injury claim", description: "Dates, hours and a return-to-work plan." },
  { title: "Bank home loan enquiry", description: "Large numbers, percentages and deposits." },
  { title: "School absence follow-up", description: "Attendance, certificates and next steps." },
];

export default async function CclLanguagePage({ params }: { params: Promise<{ language: string }> }) {
  const { language } = await params;
  const page = getCclLanguagePage(language);

  if (!page) notFound();

  const href = signUpHref("naati_ccl", page.name.split(" (")[0]);
  const others = cclLanguagePages.filter((other) => other.slug !== page.slug);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-8 sm:gap-20 sm:px-6">
      <MarketingIntro
        eyebrow={`NAATI CCL · English ⇄ ${page.name}`}
        title={
          <>
            NAATI CCL {page.name} practice, <span className="whitespace-nowrap">out loud.</span>
          </>
        }
        description={`Interpret realistic English ⇄ ${page.name} (${page.nativeName}) dialogues between two AI speakers, then get a score out of ${CCL_MAX_SCORE} and specific feedback — the way you'll be marked on test day.`}
      >
        <Button asChild size="lg">
          <Link href={href}>
            Try a free {page.name} dialogue <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/naati/ccl">How the CCL test works</Link>
        </Button>
      </MarketingIntro>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["Two dialogues", "Each test has two dialogues between an English speaker and a speaker of your language, in community settings."],
          [`Marked out of ${CCL_MAX_SCORE}`, `Each dialogue is marked out of ${CCL_MAX_SCORE / 2}. The overall pass mark is ${CCL_PASS_SCORE}, with a minimum on each dialogue.`],
          ["Short segments", "You interpret each short segment as soon as it ends, in both directions."],
        ].map(([title, body]) => (
          <div key={title} className="rounded-xl border border-gray-200 p-5">
            <p className="font-bold">{title}</p>
            <p className="mt-1 text-sm leading-6 text-gray-500">{body}</p>
          </div>
        ))}
        <p className="text-xs text-gray-500 sm:col-span-3">Test rules can change — always check the NAATI website.</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
          {flagFor(page.flag)} Tips for {page.name} candidates
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {page.tips.map((tip) => (
            <div key={tip.title} className="rounded-xl bg-gray-50 p-5">
              <p className="font-bold">{tip.title}</p>
              <p className="mt-2 text-sm leading-6 text-gray-700">{tip.body}</p>
            </div>
          ))}
        </div>
        {page.voiceNote ? (
          <p className="mt-4 text-sm text-gray-500">
            AI voice quality in {page.name} is improving but can be less natural than in more widely spoken languages. Try the free dialogue first.
          </p>
        ) : null}
      </section>

      <ScenarioList title={`CCL-style ${page.name} dialogues you can practise`} scenarios={cclScenarios} />
      <HowSteps />

      <section>
        <h2 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">Pricing</h2>
        <p className="mt-2 text-gray-500">
          Start with {plans.free.monthlyMinutes} free minutes. Packs never expire and unlock every course.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {packList.map((pack) => (
            <div key={pack.id} className="rounded-xl border border-gray-200 p-5">
              <p className="font-bold">{pack.label}</p>
              <p className="mt-1 text-2xl font-bold">{pack.priceLabel}</p>
              <p className="text-sm text-gray-500">{pack.minutes} practice minutes</p>
            </div>
          ))}
        </div>
      </section>

      <FaqSection
        faqs={[
          {
            q: `Can I practise the CCL in ${page.name} with XINGO?`,
            a: `Yes. Choose ${page.name} as your language and the client in every dialogue speaks ${page.name}, while the professional speaks English. You interpret both ways.`,
          },
          {
            q: "Is this the real NAATI test?",
            a: "No. XINGO is independent and not affiliated with NAATI. The dialogues are modelled on the public CCL format so you can rehearse under similar conditions.",
          },
          {
            q: "How is my practice scored?",
            a: `Each assessed session is scored out of ${CCL_MAX_SCORE} with a pass mark of ${CCL_PASS_SCORE}, plus feedback on accuracy, terminology, fluency, turn management and professionalism.`,
          },
          {
            q: "Do I need a microphone?",
            a: "Yes — any laptop or headset mic works. Headphones are strongly recommended so the AI doesn't hear itself.",
          },
        ]}
      />

      <CtaBand
        title={`Start practising English ⇄ ${page.name} today.`}
        description="Your first dialogue is free. No card needed."
        href={href}
        label="Try a free dialogue"
      />

      <section>
        <h2 className="text-lg font-bold">CCL practice in other languages</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {others.map((other) => (
            <Link
              key={other.slug}
              href={`/naati/ccl/${other.slug}`}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-semibold hover:bg-gray-200"
            >
              {other.name}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
