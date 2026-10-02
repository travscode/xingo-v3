import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CtaBand, MarketingIntro } from "@/components/marketing/cta-band";
import { howItWorksSteps } from "@/components/marketing/catalogue";
import { Button } from "@/components/ui/button";
import { assessmentDimensions } from "@/lib/scoring";
import { MAX_ATTEMPT_MINUTES } from "@/lib/plans";

export const metadata: Metadata = {
  title: "How it works",
  description: "Pick a scenario, interpret between two AI speakers out loud, and get a score with feedback.",
};

const details = [
  {
    title: "Choose your language pair",
    description: "One side speaks English. The other speaks your language. You interpret both ways.",
  },
  {
    title: "Start with an introduction",
    description: "Introduce yourself as the interpreter, as you would at a real appointment. Then the conversation begins.",
  },
  {
    title: "Talk when you're ready",
    description: "Hold Space (or the mic button) to speak. Tap Space to switch which person you're talking to.",
  },
  {
    title: "Finish when you're done",
    description: `End the session whenever you like. A single session is capped at ${MAX_ATTEMPT_MINUTES} minutes.`,
  },
];

export default function HowItWorksPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 sm:px-6">
      <MarketingIntro
        eyebrow="How it works"
        title="A live interpreting session, whenever you want one."
        description="No partner to book, no scripts to read. Two AI speakers hold a conversation, and you carry it between them."
      >
        <Button asChild size="lg">
          <Link href="/sign-up">Start free</Link>
        </Button>
      </MarketingIntro>

      <section>
        <ol className="grid gap-4 md:grid-cols-3">
          {howItWorksSteps.map((step, index) => (
            <li key={step.title} className="rounded-xl border border-gray-200 p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-sm font-bold text-paper">
                {index + 1}
              </span>
              <h2 className="mt-5 text-lg font-bold tracking-[-0.02em]">{step.title}</h2>
              <p className="mt-2 text-[15px] leading-6 text-gray-500">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-gray-100">
          <Image
            src="/images/doctor2.webp"
            alt="A doctor in a consultation scenario"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="eyebrow">In the session</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em]">What a session looks like</h2>
          <dl className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
            {details.map((item) => (
              <div key={item.title} className="py-4">
                <dt className="font-semibold">{item.title}</dt>
                <dd className="mt-1 text-[15px] leading-6 text-gray-500">{item.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="rounded-xl bg-gray-50 p-6 sm:p-10">
        <p className="eyebrow">Your result</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.03em]">Scored on five things</h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-6 text-gray-500">
          After each session you get an overall score, a breakdown, written feedback and your transcript. Results are
          saved so you can track progress over time. NAATI CCL practice is scored out of 90.
        </p>
        <ul className="mt-8 flex flex-wrap gap-2">
          {assessmentDimensions.map((dimension) => (
            <li key={dimension.key} className="rounded-lg bg-paper px-4 py-2 text-sm font-semibold">
              {dimension.label}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-gray-500">
          Scores are AI-generated practice feedback. They are not an official assessment or credential.
        </p>
      </section>

      <CtaBand title="Try your first session free." description="Free modules are open to everyone, with practice minutes every month." />
    </main>
  );
}
