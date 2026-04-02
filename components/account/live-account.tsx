"use client";

import { useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getPerformanceBadges, getTopIndustry } from "@/lib/performance";
import { StatCard } from "@/components/ui/stat-card";

export function LiveAccount() {
  const { user } = useUser();
  const currentUser = useQuery(api.users.current, {});
  const metrics = useQuery(api.sessions.metricsForCurrentUser, {});
  const sessions = useQuery(api.sessions.listForCurrentUser, {});
  const modules = useQuery(api.modules.list, {});
  const scenarios = useQuery(api.scenarios.list, {});

  const completedSessions = useMemo(
    () => (sessions ?? []).filter((session) => session.completionStatus !== "in_progress"),
    [sessions],
  );

  const latestSessions = useMemo(() => completedSessions.slice(0, 4), [completedSessions]);
  const badges = useMemo(
    () =>
      modules && sessions
        ? getPerformanceBadges(
            modules.map((module) => ({
              id: module.id,
              title: module.title,
              industryCategory: module.industryCategory,
            })),
            sessions.map((session) => ({
              ...session,
              userId: session.clerkId,
              startedAt: session.startedAt ?? session.timestamp,
              durationSeconds: session.durationSeconds ?? session.durationMinutes * 60,
              transcriptEntries: session.transcriptEntries ?? [],
            })),
          )
        : [],
    [modules, sessions],
  );

  const topIndustry = useMemo(
    () =>
      modules && sessions
        ? getTopIndustry(
            modules.map((module) => ({
              id: module.id,
              title: module.title,
              industryCategory: module.industryCategory,
            })),
            sessions.map((session) => ({
              ...session,
              userId: session.clerkId,
              startedAt: session.startedAt ?? session.timestamp,
              durationSeconds: session.durationSeconds ?? session.durationMinutes * 60,
              transcriptEntries: session.transcriptEntries ?? [],
            })),
          )
        : null,
    [modules, sessions],
  );

  const scenarioTitleById = useMemo(
    () => new Map((scenarios ?? []).map((scenario) => [scenario.id, scenario.title])),
    [scenarios],
  );

  if (!metrics || !sessions || !modules || !scenarios) {
    return <div className="surface-card h-80 rounded-[1.75rem] animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="section-frame rounded-[1.75rem] p-6">
          <p className="eyebrow">Profile</p>
          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.05em]">
                {currentUser?.name ?? user?.fullName ?? "Interpreter"}
              </h2>
              <div className="mt-3 space-y-1.5 text-sm text-muted">
                <p>{currentUser?.email ?? user?.primaryEmailAddress?.emailAddress ?? "No email"}</p>
                <p className="capitalize">
                  {currentUser?.role ?? "interpreter"} • {currentUser?.subscriptionStatus ?? "free"}
                </p>
              </div>
            </div>
            <div className="grid gap-2 text-sm text-muted">
              <div className="score-pill rounded-full px-4 py-2">
                {completedSessions.length} completed attempts
              </div>
              <div className="score-pill rounded-full px-4 py-2">
                {topIndustry ? `${topIndustry} focus` : "No specialization yet"}
              </div>
            </div>
          </div>
        </div>

        <div className="surface-card rounded-[1.75rem] p-6">
          <p className="eyebrow">Badges</p>
          <div className="mt-5 grid gap-3">
            {badges.length > 0 ? (
              badges.map((badge) => (
                <div key={badge.id} className="rounded-[1.25rem] border border-line bg-white/70 p-4">
                  <div className="text-sm font-semibold">{badge.label}</div>
                  <p className="mt-1 text-sm leading-6 text-muted">{badge.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">
                Complete assessed practice sessions to unlock profile badges.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Average score" value={`${metrics.averageScore}%`} />
        <StatCard label="Modules passed" value={`${metrics.modulesCompleted}`} />
        <StatCard label="Practice time" value={`${metrics.practiceHours}h`} />
        <StatCard label="Credentials" value={`${metrics.credentialsEarned}`} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-card rounded-[1.75rem] p-6">
          <p className="eyebrow">Score overview</p>
          <div className="mt-5 space-y-4">
            <div className="flex items-end justify-between border-b border-line pb-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                  Highest assessment
                </div>
                <div className="mt-2 text-4xl font-semibold tracking-[-0.05em]">
                  {Math.max(0, ...completedSessions.map((session) => session.score))}%
                </div>
              </div>
              <div className="text-right text-sm text-muted">
                {topIndustry ? `${topIndustry} strongest sector` : "Build a score history"}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {modules
                .filter((module) =>
                  completedSessions.some((session) => session.moduleId === module.id && session.score >= 75),
                )
                .slice(0, 4)
                .map((module) => (
                  <div key={module.id} className="rounded-[1.25rem] border border-line bg-white/70 p-4">
                    <div className="text-sm font-semibold">{module.title}</div>
                    <div className="mt-1 text-sm text-muted capitalize">{module.industryCategory}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="surface-card rounded-[1.75rem] p-6">
          <p className="eyebrow">Recent assessments</p>
          <div className="mt-5 space-y-3">
            {latestSessions.map((session) => (
              <div key={session._id} className="rounded-[1.25rem] border border-line bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">
                    {scenarioTitleById.get(session.scenarioId) ?? session.scenarioId}
                  </div>
                  <div className="score-pill rounded-full px-3 py-1.5 text-sm font-semibold">
                    {session.score}%
                  </div>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">{session.transcriptSummary}</p>
              </div>
            ))}
            {latestSessions.length === 0 ? (
              <p className="text-sm text-muted">No assessed sessions yet.</p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
