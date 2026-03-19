"use client";

import { useQuery } from "convex/react";
import { ModuleCard } from "@/components/modules/module-card";
import { StatCard } from "@/components/ui/stat-card";
import { api } from "@/convex/_generated/api";

export function LiveDashboard() {
  const metrics = useQuery(api.sessions.metricsForCurrentUser, {});
  const modules = useQuery(api.modules.list, {});
  const sessions = useQuery(api.sessions.listForCurrentUser, {});
  const jobs = useQuery(api.jobs.listVisible, {});
  const completedSessions = sessions?.filter((session) => session.completionStatus !== "in_progress") ?? [];

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
          <p className="eyebrow">Continue training</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {(modules ?? []).slice(0, 2).map((module) => (
              <ModuleCard key={module._id} module={module} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="surface-card rounded-[2rem] p-6">
            <p className="eyebrow">Recent sessions</p>
            <div className="mt-5 space-y-4">
              {completedSessions.map((session) => (
                <div key={session._id} className="rounded-[1.5rem] border border-line bg-white/70 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-semibold">{session.scenarioId}</div>
                    <div className="text-sm text-muted">{session.score}%</div>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">{session.transcriptSummary}</p>
                </div>
              ))}
              {sessions && completedSessions.length === 0 ? (
                <p className="text-sm text-muted">No completed practice sessions yet.</p>
              ) : null}
            </div>
          </section>

          <section className="surface-card rounded-[2rem] p-6">
            <p className="eyebrow">Assignments</p>
            <div className="mt-5 space-y-4">
              {(jobs ?? []).map((job) => (
                <div key={job._id} className="flex items-start justify-between gap-4 text-sm">
                  <div>
                    <div className="font-semibold">{job.title}</div>
                    <div className="mt-1 text-muted">{job.location}</div>
                  </div>
                  <div className="text-right capitalize text-muted">{job.status}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
