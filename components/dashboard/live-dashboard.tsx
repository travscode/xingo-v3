"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowRight, CalendarDays, Check, Clock, Mic, Play, Target, Trophy } from "lucide-react";
import { StatusIcon } from "@/components/ui/status-icon";
import { api } from "@/convex/_generated/api";
import { displayMaxScore, isPassingScore, toDisplayScore } from "@/lib/scoring";
import { useActiveLanguagePair, useProgressPair } from "@/components/providers/language-pair-context";
import { Badge, Card, EmptyState, SectionTitle, Skeleton, Stat } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { formatMinuteCount } from "@/lib/plans";
import { createLanguagePair, isEnglishOnly, pairLabel } from "@/lib/languages";

/**
 * Home. One obvious next action, then light context. Designed for the learner
 * who logs in and asks "what do I do now?"
 */
export function LiveDashboard() {
  const me = useQuery(api.users.me, {});
  const { activePair, setActivePair } = useActiveLanguagePair();
  const pair = useProgressPair();
  const catalog = useQuery(api.catalog.forCurrentUser, { pair });
  const sessions = useQuery(api.sessions.listForCurrentUser, { pair });
  const metrics = useQuery(api.sessions.metricsForCurrentUser, { pair });
  const languages = useQuery(api.sessions.languageSummaryForCurrentUser, {});

  if (!me || !catalog || !sessions || !metrics || !languages) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-56" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  const firstName = me.user.name.split(" ")[0];
  const graded = sessions.filter(
    (session) => session.completionStatus === "completed" || session.completionStatus === "needs_review",
  );
  const isNew = graded.length === 0;
  const otherLanguages = languages.filter((row) => row.key !== activePair.key);
  const nextUp = catalog.nextUp;
  const recent = graded.slice(0, 4);
  const scenarioTitles = new Map(
    catalog.modules.flatMap((m) => m.scenarios.map((s) => [s.id, s.title] as const)),
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
          {isNew ? `Let's get you speaking, ${firstName}.` : `Welcome back, ${firstName}.`}
        </h1>
        <p className="mt-2 text-gray-500">
          {!isEnglishOnly(activePair) ? `Practising English ⇄ ${activePair.targetLanguage} · ` : ""}
          {me.entitlement.planLabel === "Admin"
            ? "Admin access — every course unlocked"
            : `${formatMinuteCount(me.entitlement.remainingMinutes)} minutes left this month`}
        </p>
      </div>

      {nextUp ? (
        <Card tone="inverse" className="overflow-hidden">
          <div className="p-6 sm:p-8">
            <Badge tone="accent">{isNew ? "Start here" : "Up next"}</Badge>
            <p className="mt-4 text-sm font-semibold text-paper/60">{nextUp.moduleTitle}</p>
            <h2 className="mt-1 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">{nextUp.scenarioTitle}</h2>
            <p className="mt-2 max-w-2xl text-paper/70">{nextUp.scenarioDescription}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" variant="accent">
                <Link href={`/practice/${nextUp.scenarioId}`}>
                  <Play className="h-4 w-4 fill-current" />
                  {nextUp.attempts > 0 ? "Try again" : "Start dialogue"}
                </Link>
              </Button>
              <span className="flex items-center gap-1.5 text-sm text-paper/60">
                <Clock className="h-3.5 w-3.5" aria-hidden /> About 5–10 minutes · briefing and mic check first
              </span>
            </div>
          </div>
        </Card>
      ) : (
        <EmptyState
          title="You've passed every dialogue you can open"
          description="Unlock premium courses to keep going."
          action={
            <Button asChild>
              <Link href="/billing">See plans</Link>
            </Button>
          }
        />
      )}

      {isNew ? (
        <section>
          <SectionTitle>How it works</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["1", "Read the briefing", "Meet the two people you'll interpret for, and check your mic."],
              ["2", "Interpret out loud", "Introduce yourself to the client first. Hold Space to talk, tap to switch."],
              ["3", "Get your score", "Feedback on accuracy, terminology and flow, plus what to practise next."],
            ].map(([n, title, body]) => (
              <div key={n} className="rounded-xl bg-gray-50 p-5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-sm font-bold text-paper">
                  {n}
                </span>
                <p className="mt-4 font-bold">{title}</p>
                <p className="mt-1 text-sm leading-6 text-gray-500">{body}</p>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section>
          <SectionTitle
            action={
              <Link href="/progress" className="text-sm font-semibold hover:underline">
                All progress
              </Link>
            }
          >
            Your progress · {pairLabel(activePair)}
          </SectionTitle>
          <Card className="grid gap-6 p-6 sm:grid-cols-4">
            <Stat icon={<Target />} label="Average score" value={metrics.averageScore} hint="out of 100" />
            <Stat icon={<Trophy />} label="Dialogues passed" value={catalog.modules.reduce((sum, m) => sum + m.passedCount, 0)} />
            <Stat icon={<Mic />} label="Sessions scored" value={graded.length} />
            <Stat icon={<Clock />} label="Hours practised" value={metrics.practiceHours} />
          </Card>
        </section>
      )}

      {isNew && otherLanguages.length > 0 ? (
        <p className="rounded-xl bg-gray-50 px-5 py-4 text-sm text-gray-600">
          You haven&apos;t practised {pairLabel(activePair)} yet, so there are no scores for it. Your other languages are below.
        </p>
      ) : null}

      {languages.length > 0 && (languages.length > 1 || otherLanguages.length > 0) ? (
        <section>
          <SectionTitle>Your languages</SectionTitle>
          <Card className="divide-y divide-gray-200">
            {languages.map((row) => {
              const current = row.key === activePair.key;
              return (
                <button
                  key={row.key}
                  type="button"
                  onClick={() => setActivePair(createLanguagePair(row.sourceLanguage, row.targetLanguage))}
                  aria-pressed={current}
                  className="flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-4 text-left transition-colors hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2 font-semibold">
                    {pairLabel(row)}
                    {current ? <Badge tone="dark">Selected</Badge> : null}
                  </span>
                  <span className="flex flex-wrap gap-x-5 text-sm tabular-nums text-gray-500">
                    <span>{row.sessions} {row.sessions === 1 ? "session" : "sessions"}</span>
                    <span>{row.averageScore !== null ? `Average ${row.averageScore}` : "Not scored yet"}</span>
                    <span>{row.passed} passed</span>
                    <span>{formatMinuteCount(row.practiceMinutes)} min</span>
                  </span>
                </button>
              );
            })}
          </Card>
          <p className="mt-2 text-xs text-gray-500">Scores, results and progress are kept separately for each language. Tap one to switch.</p>
        </section>
      ) : null}

      {recent.length > 0 ? (
        <section>
          <SectionTitle>Recent results</SectionTitle>
          <Card className="divide-y divide-gray-200">
            {recent.map((session) => (
              <Link
                key={session._id}
                href={`/results/${session.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <StatusIcon passed={isPassingScore(session.moduleId, session.score)} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{scenarioTitles.get(session.scenarioId) ?? session.scenarioId}</p>
                    <p className="flex items-center gap-1 text-sm text-gray-500">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                      {new Date(session.timestamp).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isPassingScore(session.moduleId, session.score) ? (
                    <Badge tone="success">
                      <Check className="h-3 w-3" /> Pass
                    </Badge>
                  ) : null}
                  <span className="text-lg font-bold tabular-nums">
                    {toDisplayScore(session.moduleId, session.score)}
                    <span className="text-sm text-gray-500">/{displayMaxScore(session.moduleId)}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-500" />
                </div>
              </Link>
            ))}
          </Card>
        </section>
      ) : null}
    </div>
  );
}
