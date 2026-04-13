"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "convex/react";
import { StatCard } from "@/components/ui/stat-card";
import { api } from "@/convex/_generated/api";

export function LiveDashboard() {
  const metrics = useQuery(api.sessions.metricsForCurrentUser, {});
  const modules = useQuery(api.modules.list, {});
  const sessions = useQuery(api.sessions.listForCurrentUser, {});
  const scenarios = useQuery(api.scenarios.list, {});
  const jobs = useQuery(api.jobs.listVisible, {});
  const completedSessions = sessions?.filter((session) => session.completionStatus !== "in_progress") ?? [];
  const nextModule = modules?.[0] ?? null;
  const scenarioTitleById = useMemo(
    () => new Map((scenarios ?? []).map((scenario) => [scenario.id, scenario.title])),
    [scenarios],
  );

  const cards = metrics
    ? [
        { label: "Average score", value: `${metrics.averageScore}%` },
        { label: "Modules passed", value: `${metrics.modulesCompleted}` },
        { label: "Practice time", value: `${metrics.practiceHours}h` },
      ]
    : null;

  return (
    <div className="space-y-8">
      <section className="section-frame rounded-[2.25rem] p-6 lg:p-8">
        <p className="eyebrow">Today</p>
        <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-semibold tracking-[-0.05em]">
              {nextModule ? `Continue with ${nextModule.title}.` : "Start your first module."}
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              {nextModule
                ? "Open one module, run one scenario, and let the assessment update your profile."
                : "Once modules are available, this screen will always point to the next sensible action."}
            </p>
          </div>
          {nextModule ? (
            <Link href={`/modules/${nextModule.id}`} className="action-primary">
              Continue
            </Link>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {(cards ?? Array.from({ length: 3 })).map((metric, index) =>
          metric ? (
            <StatCard key={metric.label} label={metric.label} value={metric.value} />
          ) : (
            <div key={index} className="surface-card h-28 rounded-3xl animate-pulse" />
          ),
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="surface-card rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Recent</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Latest assessments</h2>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {completedSessions.slice(0, 3).map((session) => (
              <div key={session._id} className="rounded-[1.5rem] border border-line bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="font-semibold">{scenarioTitleById.get(session.scenarioId) ?? session.scenarioId}</div>
                  <div className="score-pill rounded-full px-3 py-1.5 text-sm font-semibold">{session.score}%</div>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{session.transcriptSummary}</p>
              </div>
            ))}
            {sessions && completedSessions.length === 0 ? (
              <p className="text-sm text-muted">No completed practice yet.</p>
            ) : null}
          </div>
        </section>

        <div className="space-y-6">
          <section className="surface-card rounded-[2rem] p-6">
            <p className="eyebrow">Available now</p>
            <div className="mt-5 space-y-3">
              {(modules ?? []).slice(0, 2).map((module) => (
                <div key={module._id} className="rounded-[1.5rem] border border-line bg-white p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold">{module.title}</div>
                      <div className="mt-1 text-sm text-muted">{module.durationMinutes} min</div>
                    </div>
                    <Link href={`/modules/${module.id}`} className="action-secondary px-4 py-2 text-sm">
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-card rounded-[2rem] p-6">
            <p className="eyebrow">Assignments</p>
            <div className="mt-5 space-y-3">
              {(jobs ?? []).slice(0, 2).map((job) => (
                <div key={job._id} className="rounded-[1.5rem] border border-line bg-white p-4 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold">{job.title}</div>
                      <div className="mt-1 text-muted">{job.location}</div>
                    </div>
                    <div className="capitalize text-muted">{job.status}</div>
                  </div>
                </div>
              ))}
              {jobs && jobs.length === 0 ? <p className="text-sm text-muted">No jobs yet.</p> : null}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
