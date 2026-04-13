"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function LiveModuleDetail({ moduleId }: { moduleId: string }) {
  const learningModule = useQuery(api.modules.getById, { id: moduleId });
  const scenarios = useQuery(api.scenarios.listByModule, { moduleId });
  const sessions = useQuery(api.sessions.listByModuleForCurrentUser, { moduleId });

  if (learningModule === undefined || scenarios === undefined || sessions === undefined) {
    return <div className="surface-card h-96 rounded-[2rem] animate-pulse" />;
  }

  const completedSessions = sessions.filter((session) => session.completionStatus !== "in_progress");
  const scenarioStatus = new Map(
    scenarios.map((scenario) => {
      const related = completedSessions.filter((session) => session.scenarioId === scenario.id);
      const latest = related[0] ?? null;
      return [scenario.id, latest];
    }),
  );
  const bestScore = Math.max(0, ...completedSessions.map((session) => session.score));

  if (!learningModule) {
    return (
      <section className="surface-card rounded-[2rem] p-6">
        <p className="text-sm text-muted">Module not found.</p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="section-frame rounded-[2.25rem] p-6 lg:p-8">
        <p className="eyebrow">{learningModule.industryCategory}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">{learningModule.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">{learningModule.description}</p>
        <div className="mt-6 flex flex-wrap gap-2 text-sm text-muted">
          <span className="mono-chip rounded-full px-3 py-2">{learningModule.durationMinutes} min</span>
          <span className="mono-chip rounded-full px-3 py-2">{learningModule.difficultyLevel}</span>
          <span className="mono-chip rounded-full px-3 py-2">{learningModule.badgeIcon}</span>
        </div>
        {scenarios[0] ? (
          <Link href={`/practice/${scenarios[0].id}`} className="action-primary mt-8">
            Start practice
          </Link>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="surface-card rounded-[2rem] p-6">
          <p className="eyebrow">What to focus on</p>
          <div className="mt-5 space-y-3 text-sm leading-7 text-muted">
            {learningModule.learningObjectives.map((objective) => (
              <div key={objective} className="rounded-[1.25rem] border border-line bg-white p-4">
                {objective}
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card rounded-[2rem] p-6">
          <p className="eyebrow">Scenarios</p>
          <div className="mt-5 space-y-4">
            {scenarios.map((scenario) => (
              <div key={scenario._id} className="rounded-[1.5rem] border border-line bg-white p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="font-semibold">{scenario.title}</div>
                    <p className="mt-2 text-sm leading-6 text-muted">{scenario.description}</p>
                    {scenarioStatus.get(scenario.id) ? (
                      <div className="mt-3 text-sm text-muted">
                        Latest score {scenarioStatus.get(scenario.id)?.score}%
                      </div>
                    ) : null}
                  </div>
                  <Link href={`/practice/${scenario.id}`} className="action-secondary shrink-0 px-4 py-2 text-sm">
                    Start
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="surface-card rounded-[2rem] p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Completed attempts</div>
          <div className="mt-3 text-4xl font-semibold">{completedSessions.length}</div>
        </div>
        <div className="surface-card rounded-[2rem] p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Best score</div>
          <div className="mt-3 text-4xl font-semibold">{bestScore}%</div>
        </div>
        <div className="surface-card rounded-[2rem] p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Module badge</div>
          <div className="mt-3 text-2xl font-semibold">{learningModule.badgeIcon}</div>
        </div>
      </section>
    </div>
  );
}
