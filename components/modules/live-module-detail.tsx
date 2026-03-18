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

  if (!learningModule) {
    return (
      <section className="surface-card rounded-[2rem] p-6">
        <p className="text-sm text-muted">Module not found.</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="section-frame rounded-[2rem] p-6">
        <p className="eyebrow">{learningModule.industryCategory}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">{learningModule.title}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">{learningModule.description}</p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted">
          <span>{learningModule.durationMinutes} min</span>
          <span>•</span>
          <span>{learningModule.difficultyLevel}</span>
          <span>•</span>
          <span>{learningModule.badgeIcon}</span>
        </div>
        {scenarios[0] ? (
          <Link
            href={`/practice/${scenarios[0].id}`}
            className="mt-8 inline-flex rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white"
          >
            Start practice
          </Link>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="surface-card rounded-[2rem] p-6">
          <p className="eyebrow">Learning objectives</p>
          <div className="mt-5 space-y-3 text-sm leading-7 text-muted">
            {learningModule.learningObjectives.map((objective) => (
              <p key={objective}>{objective}</p>
            ))}
          </div>
        </div>

        <div className="surface-card rounded-[2rem] p-6">
          <p className="eyebrow">Scenario set</p>
          <div className="mt-5 space-y-4">
            {scenarios.map((scenario) => (
              <div key={scenario._id} className="rounded-[1.5rem] border border-line bg-white/70 p-4">
                <div className="font-semibold">{scenario.title}</div>
                <p className="mt-2 text-sm leading-6 text-muted">{scenario.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-card rounded-[2rem] p-6">
        <p className="eyebrow">Recent performance</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {sessions.map((session) => (
            <div key={session._id} className="rounded-[1.5rem] border border-line bg-white/70 p-4">
              <div className="text-sm text-muted">{session.timestamp.slice(0, 10)}</div>
              <div className="mt-2 text-3xl font-semibold">{session.score}%</div>
              <div className="mt-2 text-sm text-muted">{session.completionStatus}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
