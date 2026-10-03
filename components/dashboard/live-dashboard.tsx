"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowRight, CalendarDays, Check, Clock, Mic, Play, Target, Trophy } from "lucide-react";
import { StatusIcon } from "@/components/ui/status-icon";
import { api } from "@/convex/_generated/api";
import { displayMaxScore, isPassingScore, toDisplayScore } from "@/lib/scoring";
import { useActiveLanguagePair } from "@/components/providers/language-pair-context";
import { Badge, Card, EmptyState, SectionTitle, Skeleton, Stat } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { formatMinuteCount } from "@/lib/plans";

/**
 * Home. One obvious next action, then light context. Designed for the learner
 * who logs in and asks "what do I do now?"
 */
export function LiveDashboard() {
  const me = useQuery(api.users.me, {});
  const catalog = useQuery(api.catalog.forCurrentUser, {});
  const sessions = useQuery(api.sessions.listForCurrentUser, {});
  const metrics = useQuery(api.sessions.metricsForCurrentUser, {});
  const { activePair } = useActiveLanguagePair();

  if (!me || !catalog || !sessions || !metrics) {
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
          {activePair.targetLanguage.toLowerCase() !== "english" ? `Practising English ⇄ ${activePair.targetLanguage} · ` : ""}
          {me.entitlement.planLabel === "Admin"
            ? "Admin access — every module unlocked"
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
          description="Unlock premium modules to keep going."
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
            Your progress
          </SectionTitle>
          <Card className="grid gap-6 p-6 sm:grid-cols-4">
            <Stat icon={<Target />} label="Average score" value={metrics.averageScore} hint="out of 100" />
            <Stat icon={<Trophy />} label="Dialogues passed" value={catalog.modules.reduce((sum, m) => sum + m.passedCount, 0)} />
            <Stat icon={<Mic />} label="Sessions scored" value={graded.length} />
            <Stat icon={<Clock />} label="Hours practised" value={metrics.practiceHours} />
          </Card>
        </section>
      )}

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
