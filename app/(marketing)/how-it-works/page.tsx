import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, MarketingIntro } from "@/components/marketing/cta-band";
import { IllustratedSteps } from "@/components/marketing/illustrated-steps";
import { Journey } from "@/components/marketing/journey";
import { ScenePhoto } from "@/components/marketing/people";
import { RoomMock, ScoreMock } from "@/components/marketing/practice-mock";
import { Button } from "@/components/ui/button";
import { CCL_MAX_SCORE, assessmentDimensions } from "@/lib/scoring";
import { MAX_ATTEMPT_MINUTES } from "@/lib/plans";
import { pageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = pageMetadata({
  title: "How It Works — AI Role-Play Practice, Scored",
  description:
    "Choose your test and language, interpret or role-play out loud with AI speakers, then get a score against the test's criteria and specific feedback.",
  path: "/how-it-works",
});

const details = [
  {
    title: "Choose your language pair",
    description:
      "One side speaks English. The other speaks your language. You interpret both ways.",
  },
  {
    title: "Start with an introduction",
    description:
      "Introduce yourself as the interpreter, as you would at a real appointment. Then the conversation begins.",
  },
  {
    title: "Talk when you're ready",
    description:
      "Hold Space (or the mic button) to speak. Tap Space to switch which person you're talking to.",
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
        title="Your practice partner, ready whenever you are."
        description="No partner to book, no scripts to read. Talk one-on-one with an AI character, or interpret between two of them."
        media={
          <ScenePhoto
            scene="interpreterDesk"
            priority
            sizes="(min-width: 1024px) 480px, calc(100vw - 32px)"
            className="aspect-[4/3] w-full"
          />
        }
      >
        <Button asChild size="lg">
          <Link href="/sign-up">Start practising free</Link>
        </Button>
      </MarketingIntro>

      <section>
        <p className="eyebrow">Interpreting</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.03em] text-balance">
          Two AI people, one conversation, and you in the middle.
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-6 text-gray-500">
          For NAATI and medical interpreting practice: each side speaks a different language, and you relay every turn.
        </p>
        <IllustratedSteps className="mt-8" />
      </section>

      <section id="roleplay" className="scroll-mt-24">
        <p className="eyebrow">Speaking exams and role-plays</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.03em] text-balance">
          One-on-one with an AI patient, colleague or examiner.
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-6 text-gray-500">
          For OET, IELTS, AMC and OSCE practice: you play yourself, and a single AI character plays the other part.
        </p>
        <IllustratedSteps variant="roleplay" className="mt-8" />
      </section>

      <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <RoomMock className="mx-auto w-full max-w-md" />
        <div>
          <p className="eyebrow">In the session</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em]">
            What an interpreting session looks like
          </h2>
          <dl className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
            {details.map((item) => (
              <div key={item.title} className="py-4">
                <dt className="font-semibold">{item.title}</dt>
                <dd className="mt-1 text-[15px] leading-6 text-gray-500">
                  {item.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="grid items-center gap-8 rounded-2xl bg-gray-50 p-6 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <div>
          <p className="eyebrow">Your result</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.03em]">
            Scored on five things
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-6 text-gray-500">
            After each session you get an overall score, a breakdown, written
            feedback and your transcript. Results are saved so you can track
            progress over time. NAATI CCL practice is scored out of{" "}
            {CCL_MAX_SCORE}.
          </p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {assessmentDimensions.map((dimension) => (
              <li
                key={dimension.key}
                className="rounded-lg bg-paper px-4 py-2 text-sm font-semibold"
              >
                {dimension.label}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-gray-500">
            Scores are AI-generated practice feedback. They are not an official
            assessment or credential.
          </p>
        </div>
        <ScoreMock className="mx-auto w-full max-w-sm" />
      </section>

      <Journey />

      <CtaBand
        title="Try your first session free."
        description="Free courses are open to everyone, with practice minutes every month."
        label="Start practising free"
      />
    </main>
  );
}
