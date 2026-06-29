"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { StatCard } from "@/components/ui/stat-card";
import { api } from "@/convex/_generated/api";

export function LiveProgress() {
  const metrics = useQuery(api.sessions.metricsForCurrentUser, {});
  const sessions = useQuery(api.sessions.listForCurrentUser, {});
  const scenarios = useQuery(api.scenarios.list, {});
  const scenarioTitleById = useMemo(
    () => new Map((scenarios ?? []).map((scenario) => [scenario.id, scenario.title])),
    [scenarios],
  );

  if (!metrics || !sessions || !scenarios) {
    return <div className="surface-card h-64 rounded-[2rem] animate-pulse" />;
  }

  const completedSessions = sessions.filter((session) => session.completionStatus !== "in_progress");
  const bestScore = Math.max(0, ...completedSessions.map((session) => session.score));

  return (
    <div className="space-y-8">
      <section className="section-frame rounded-[2.25rem] p-6 lg:p-8">
        <div>
          <p className="eyebrow">Progress</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">See how your scores are moving.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Every finished scenario is saved here so improvement is easy to spot.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Average score" value={`${metrics.averageScore}%`} />
        <StatCard label="Best score" value={`${bestScore}%`} />
        <StatCard label="Completed attempts" value={`${completedSessions.length}`} />
      </section>

      <section className="surface-card rounded-[2rem] p-6">
        <p className="eyebrow">History</p>
        <div className="mt-5 space-y-3">
          {completedSessions.map((session) => (
            <div key={session._id} className="rounded-[1.5rem] border border-line bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold">{scenarioTitleById.get(session.scenarioId) ?? session.scenarioId}</div>
                  <div className="mt-1 text-sm text-muted">
                    {session.durationMinutes} min · {session.completionStatus.replace("_", " ")}
                  </div>
                </div>
                <div className="score-pill rounded-full px-3 py-1.5 text-sm font-semibold">{session.score}%</div>
              </div>
              <div className="mt-4">
                <Link
                  href={`/practice/${session.scenarioId}?attemptId=${session.id}`}
                  className="text-sm font-semibold text-brand underline-offset-4 hover:underline"
                >
                  View practice results
                </Link>
              </div>
            </div>
          ))}
          {completedSessions.length === 0 ? (
            <p className="text-sm text-muted">No completed practice attempts yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
