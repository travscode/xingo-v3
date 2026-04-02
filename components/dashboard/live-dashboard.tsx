"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { ModuleCard } from "@/components/modules/module-card";
import { StatCard } from "@/components/ui/stat-card";
import { api } from "@/convex/_generated/api";

export function LiveDashboard() {
  const metrics = useQuery(api.sessions.metricsForCurrentUser, {});
  const modules = useQuery(api.modules.list, {});
  const sessions = useQuery(api.sessions.listForCurrentUser, {});
  const scenarios = useQuery(api.scenarios.list, {});
  const jobs = useQuery(api.jobs.listVisible, {});
  const completedSessions = sessions?.filter((session) => session.completionStatus !== "in_progress") ?? [];
  const scenarioTitleById = useMemo(
    () => new Map((scenarios ?? []).map((scenario) => [scenario.id, scenario.title])),
    [scenarios],
  );

  const cards = metrics
    ? [
        { label: "Average score", value: `${metrics.averageScore}%` },
        { label: "Modules completed", value: `${metrics.modulesCompleted}` },
        { label: "Practice time", value: `${metrics.practiceHours}h` },
        { label: "Credentials earned", value: `${metrics.credentialsEarned}` },
      ]
    : null;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(cards ?? Array.from({ length: 4 })).map((metric, index) =>
          metric ? (
            <StatCard key={metric.label} label={metric.label} value={metric.value} />
          ) : (
            <div key={index} className="surface-card h-28 rounded-3xl animate-pulse" />
          ),
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="section-frame rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Continue</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Active modules</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {(modules ?? []).slice(0, 2).map((module) => (
              <ModuleCard key={module._id} module={module} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="surface-card rounded-[1.75rem] p-6">
            <p className="eyebrow">Recent sessions</p>
            <div className="mt-4 space-y-3">
              {completedSessions.map((session) => (
                <div key={session._id} className="rounded-[1.25rem] border border-line bg-white/70 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-semibold">
                      {scenarioTitleById.get(session.scenarioId) ?? session.scenarioId}
                    </div>
                    <div className="score-pill rounded-full px-3 py-1.5 text-sm font-semibold">
                      {session.score}%
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                    {session.transcriptSummary}
                  </p>
                </div>
              ))}
              {sessions && completedSessions.length === 0 ? (
                <p className="text-sm text-muted">No completed practice sessions yet.</p>
              ) : null}
            </div>
          </section>

          <section className="surface-card rounded-[1.75rem] p-6">
            <p className="eyebrow">Assignments</p>
            <div className="mt-4 space-y-3">
              {(jobs ?? []).map((job) => (
                <div key={job._id} className="rounded-[1.25rem] border border-line bg-white/70 p-4 text-sm">
                  <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold">{job.title}</div>
                    <div className="mt-1 text-muted">{job.location}</div>
                  </div>
                  <div className="text-right capitalize text-muted">{job.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
