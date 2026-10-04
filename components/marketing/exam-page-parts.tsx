import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Mic, Minus } from "lucide-react";
import { examIndex } from "@/components/marketing/exam-index";
import { castFor, type ExamVisual } from "@/components/marketing/exam-visuals";
import { Flag } from "@/components/marketing/flag";
import { Portrait, ScenePhoto } from "@/components/marketing/people";
import { Button } from "@/components/ui/button";
import type { ExamPage } from "@/lib/exam-pages";
import { plans } from "@/lib/plans";
import { rubricForModule } from "@/lib/rubrics";
import { cn } from "@/lib/utils";

/*
 * Building blocks for /exams/[slug]. Photos and portraits are fictional
 * (people.tsx); product overlays are illustrations of the real room and result
 * screens and are labelled as examples. Motion comes from the mk-* classes in
 * globals.css and stops under prefers-reduced-motion.
 */

const exampleValues = [0.84, 0.7, 0.78];

function VoiceBars({ className }: { className?: string }) {
  return (
    <span className={cn("mk-bars flex h-4 items-center gap-[3px]", className)} aria-hidden>
      <span />
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

/** Hero photo with the practice room floating over it: who's speaking, your mic, and feedback by criterion. */
export function ExamHeroVisual({ page, visual }: { page: ExamPage; visual: ExamVisual }) {
  const criteria = rubricForModule(page.moduleId).dimensions.slice(0, 3);
  const { speaker, listener } = visual;

  return (
    <div className="mk-rise mk-delay-2 relative mx-auto w-full max-w-md lg:max-w-none">
      <ScenePhoto
        scene={visual.heroScene}
        sizes="(min-width: 1024px) 480px, (min-width: 640px) 448px, 100vw"
        priority
        className="aspect-[4/5] rounded-[2rem]"
      />
      <p className="sr-only">
        Example practice session: {speaker.name} says “{speaker.line}” You answer out loud and get feedback on{" "}
        {criteria.map((criterion) => criterion.label).join(", ")}.
      </p>

      {/* Who's speaking */}
      <div aria-hidden className="absolute inset-x-3 top-3 rounded-2xl bg-paper p-4 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.45)] sm:inset-x-auto sm:left-5 sm:top-5 sm:w-[19rem]">
        <div className="flex items-center gap-3">
          <span className="relative">
            <span className="avatar-speaking-ring" />
            <Portrait person={speaker.person} size={44} className="relative h-11 w-11" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold">{speaker.name}</span>
            <span className="block truncate text-xs text-gray-500">{speaker.role}</span>
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-live">
            <VoiceBars /> Speaking
          </span>
        </div>
        <p className="mt-3 text-[15px] font-medium leading-6">“{speaker.line}”</p>
      </div>

      {/* Your turn */}
      <div
        aria-hidden
        className="absolute bottom-3 left-3 flex items-center gap-2.5 rounded-full bg-paper py-2 pl-2 pr-4 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.45)] sm:bottom-5 sm:left-5"
      >
        <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-record text-paper">
          <span className="record-ring" />
          <Mic className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold">
          {listener ? `Interpreting for ${listener.name}` : "Your turn"}
        </span>
      </div>

      {/* Feedback by criterion */}
      <div
        aria-hidden
        className="absolute bottom-3 right-3 hidden w-[13.5rem] rounded-2xl bg-ink p-4 text-paper shadow-[0_18px_40px_-16px_rgba(0,0,0,0.6)] sm:bottom-5 sm:right-5 sm:block lg:-right-6"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">Feedback</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-paper/50">Example</span>
        </div>
        <ul className="mt-3 space-y-2.5">
          {criteria.map((criterion, index) => (
            <li key={criterion.key}>
              <span className="block truncate text-[11px] font-semibold text-paper/70">{criterion.label}</span>
              <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-paper/15">
                <span
                  className="mk-fill block h-full rounded-full bg-accent"
                  style={{ width: `${exampleValues[index] * 100}%`, animationDelay: `${700 + index * 140}ms` }}
                />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** "Who you'll talk to" + free-minutes reassurance, under the hero buttons. */
export function ExamHeroFootnote({ visual, partners }: { visual: ExamVisual; partners: string }) {
  const faces = [...new Set(visual.cast.flat())].slice(0, 4);

  return (
    <div className="mk-rise mk-delay-3 mt-8 flex items-center gap-3">
      <span className="flex shrink-0 -space-x-2" aria-hidden>
        {faces.map((person) => (
          <Portrait key={person} person={person} size={36} className="h-9 w-9 ring-2 ring-paper" />
        ))}
      </span>
      <p className="text-sm leading-5 text-gray-500">
        <span className="font-semibold text-ink">{partners}</span>, played by AI.
        <br />
        {plans.free.monthlyMinutes} free minutes every month. No card needed.
      </p>
    </div>
  );
}

/** Dark band with the exam format as numbered facts. */
export function ExamGlance({ page }: { page: ExamPage }) {
  return (
    <section id="format" className="scroll-mt-24 overflow-hidden rounded-[2rem] bg-ink px-6 py-10 text-paper sm:px-10 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-paper/50">The exam</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">The {page.shortName} at a glance</h2>
          <p className="mt-4 text-[15px] leading-6 text-paper/60">
            {page.fullName}, run by {page.body}.
          </p>
          <p className="mt-6 text-xs leading-5 text-paper/40">
            Summary only — exam rules change. Always read the official candidate information before you book.
          </p>
        </div>
        <ol className="divide-y divide-paper/10 border-y border-paper/10">
          {page.format.map((item, index) => (
            <li key={item.title} className="grid grid-cols-[3rem_1fr] gap-4 py-5">
              <span className="text-2xl font-bold tabular-nums tracking-[-0.04em] text-accent">{String(index + 1).padStart(2, "0")}</span>
              <span>
                <span className="block text-lg font-bold tracking-[-0.02em]">{item.title}</span>
                <span className="mt-1 block text-[15px] leading-6 text-paper/60">{item.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Photo with the first scenario's card, beside what's covered and what isn't. */
export function ExamCoverage({ page, visual }: { page: ExamPage; visual: ExamVisual }) {
  const first = page.scenarios[0];

  return (
    <section className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="relative">
        <ScenePhoto scene={visual.practiceScene} sizes="(min-width: 1024px) 540px, 100vw" className="aspect-[4/3] rounded-[2rem]" />
        {first ? (
          <div
            aria-hidden
            className="absolute -bottom-6 left-4 right-4 rounded-2xl border border-gray-200 bg-paper p-5 sm:left-auto sm:right-6 sm:w-72"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">{visual.cardLabel}</p>
            <p className="mt-2 font-bold leading-6">{first.title}</p>
            <p className="mt-1 text-sm leading-6 text-gray-500">{first.description}</p>
          </div>
        ) : null}
      </div>

      <div className={first ? "pt-6 lg:pt-0" : undefined}>
        <h2 className="text-3xl font-bold tracking-[-0.03em] sm:text-4xl">What XINGO helps you practise</h2>
        <ul className="mt-6 space-y-3">
          {page.covered.map((item) => (
            <li key={item} className="flex gap-3 text-[15px] leading-6">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink">
                <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
              </span>
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-8 rounded-xl bg-gray-50 p-5">
          <p className="text-sm font-bold">Not covered (yet)</p>
          <ul className="mt-2 space-y-1.5">
            {page.notCovered.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-6 text-gray-500">
                <Minus className="mt-1 h-4 w-4 shrink-0" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Scenario cards with the people you'll talk to; each one starts the free sign-up. */
export function ExamScenarios({ page, visual, href }: { page: ExamPage; visual: ExamVisual; href: string }) {
  const interpreting = Boolean(visual.listener);

  return (
    <section data-analytics-location="scenarios">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-[-0.03em] sm:text-4xl">Practice scenarios</h2>
          <p className="mt-2 text-gray-500">
            {interpreting ? "Two AI voices, one interpreter: you." : "One AI person, in character. You play yourself."}
          </p>
        </div>
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold hover:underline">
          Try one free <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {page.scenarios.map((scenario, index) => {
          const cast = castFor(visual, index);
          return (
            <li key={scenario.title}>
              <Link
                href={href}
                data-analytics-cta={`Scenario: ${scenario.title}`}
                className="mk-lift group flex h-full flex-col rounded-2xl border border-gray-200 p-5 hover:border-ink"
              >
                <span className="flex items-center justify-between">
                  <span className="flex -space-x-2" aria-hidden>
                    {cast.map((person) => (
                      <Portrait key={person} person={person} size={48} className="h-12 w-12 ring-2 ring-paper" />
                    ))}
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-gray-500">{String(index + 1).padStart(2, "0")}</span>
                </span>
                <span className="mt-5 block font-bold leading-6">{scenario.title}</span>
                <span className="mt-1 block flex-1 text-sm leading-6 text-gray-500">{scenario.description}</span>
                <span className="mt-5 flex items-center gap-1 text-sm font-semibold opacity-60 transition-opacity group-hover:opacity-100">
                  Practise this <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Marking-criteria tips as big numbered cards. */
export function ExamTips({ tips }: { tips: ExamPage["tips"] }) {
  return (
    <section>
      <h2 className="text-3xl font-bold tracking-[-0.03em] sm:text-4xl">Tips from the marking criteria</h2>
      <ol className="mt-8 grid gap-3 md:grid-cols-3">
        {tips.map((tip, index) => (
          <li key={tip.title} className="rounded-2xl bg-gray-50 p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-bold tabular-nums text-paper">
              {index + 1}
            </span>
            <p className="mt-5 text-lg font-bold tracking-[-0.02em]">{tip.title}</p>
            <p className="mt-2 text-[15px] leading-6 text-gray-700">{tip.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Closing call to action with the hero photo. */
export function ExamClosingCta({ page, visual, href }: { page: ExamPage; visual: ExamVisual; href: string }) {
  return (
    <section className="grid overflow-hidden rounded-[2rem] bg-ink text-paper md:grid-cols-2" data-analytics-location="closing_cta">
      <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14">
        <h2 className="text-3xl font-bold tracking-[-0.03em] text-balance sm:text-4xl">Practise for the {page.shortName} today.</h2>
        <p className="mt-3 max-w-md text-[15px] leading-6 text-paper/60">
          {plans.free.monthlyMinutes} free practice minutes every month. No card needed. Prices are in AUD.
        </p>
        <div className="mt-8">
          <Button asChild variant="accent" size="lg">
            <Link href={href}>
              Try one free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      <ScenePhoto
        scene={visual.closingScene}
        sizes="(min-width: 768px) 560px, 100vw"
        decorative
        className="order-first aspect-[16/9] rounded-none md:order-none md:aspect-auto md:min-h-[22rem]"
      />
    </section>
  );
}

/** Other exams as small cards with their flag and kind. */
export function OtherExams({ currentHref }: { currentHref: string }) {
  const others = examIndex.filter((exam) => exam.href !== currentHref);

  return (
    <div>
      <h2 className="text-lg font-bold">Other exams</h2>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {others.map((exam) => (
          <li key={exam.href}>
            <Link href={exam.href} className="group flex h-full flex-col rounded-xl bg-gray-50 p-3 transition-colors hover:bg-gray-100">
              <span className="flex items-center gap-2 text-xs text-gray-500">
                <Flag country={exam.country} className="h-3 w-[18px] rounded-[2px]" />
                {exam.kind}
              </span>
              <span className="mt-1.5 flex items-center justify-between gap-1 text-sm font-bold">
                {exam.shortName}
                <ArrowUpRight className="h-3.5 w-3.5 text-gray-500 transition-colors group-hover:text-ink" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

