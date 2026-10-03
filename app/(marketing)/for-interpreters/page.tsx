import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, MarketingIntro } from "@/components/marketing/cta-band";
import { practiceModules } from "@/components/marketing/catalogue";
import { Button } from "@/components/ui/button";
import { FreeBadge, PremiumBadge } from "@/components/ui/badges";
import { pageMetadata } from "@/lib/seo-metadata";

export const metadata: Metadata = pageMetadata({
  title: "For Interpreters — Stay Sharp Between Assignments",
  description:
    "Keep your interpreting sharp between assignments: practise medical, legal, immigration and community dialogues out loud with AI speakers and track your scores.",
  path: "/for-interpreters",
});

const reasons = [
  {
    title: "Practise on your schedule",
    description: "No need to find a practice partner. Start a session whenever you have ten minutes.",
  },
  {
    title: "Hear your weak spots",
    description: "Feedback points to what you dropped, changed or added, so you know what to work on next.",
  },
  {
    title: "See your progress",
    description: "Every scored attempt is saved. Watch your scores move as you repeat scenarios.",
  },
];

export default function ForInterpretersPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 sm:px-6">
      <MarketingIntro
        eyebrow="For interpreters"
        title="Stay sharp between assignments. Get ready for the next credential."
        description="Whether you're preparing for a test or keeping in practice, XINGO gives you realistic conversations to interpret out loud."
      >
        <Button asChild size="lg">
          <Link href="/sign-up">Start practising free</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/naati/ccl">NAATI CCL practice</Link>
        </Button>
      </MarketingIntro>

      <section className="grid gap-4 md:grid-cols-3">
        {reasons.map((reason) => (
          <article key={reason.title} className="mk-lift rounded-xl border border-gray-200 p-6 hover:border-ink">
            <h2 className="text-lg font-bold tracking-[-0.02em]">{reason.title}</h2>
            <p className="mt-2 text-[15px] leading-6 text-gray-500">{reason.description}</p>
          </article>
        ))}
      </section>

      <section>
        <p className="eyebrow">Courses</p>
        <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em]">What you can practise</h2>
        <ul className="mt-8 divide-y divide-gray-200 border-y border-gray-200">
          {practiceModules.map((course) => (
            <li key={course.title} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-semibold">{course.title}</div>
                <div className="text-sm text-gray-500">{course.description}</div>
              </div>
              {course.access === "free" ? <FreeBadge /> : <PremiumBadge label="Pro or pack" />}
            </li>
          ))}
        </ul>
      </section>

      <CtaBand
        title="Start with a free course."
        description="Free practice minutes every month. Upgrade only if you need more."
        label="Start practising free"
      />
    </main>
  );
}
