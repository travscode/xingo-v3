"use client";

import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Normalizes a language pair to a lowercase comparison key.
 */
function getLanguagePairKey(sourceLanguage: string, targetLanguage: string) {
  return `${sourceLanguage.trim().toLowerCase()}::${targetLanguage.trim().toLowerCase()}`;
}

export function LiveModuleDetail({ moduleId }: { moduleId: string }) {
  const learningModule = useQuery(api.modules.getById, { id: moduleId });
  const scenarios = useQuery(api.scenarios.listByModule, { moduleId });
  const sessions = useQuery(api.sessions.listByModuleForCurrentUser, {
    moduleId,
  });
  const currentUser = useQuery(api.users.current, {});

  if (
    learningModule === undefined ||
    scenarios === undefined ||
    sessions === undefined ||
    currentUser === undefined
  ) {
    return <div className="surface-card h-96 rounded-[2rem] animate-pulse" />;
  }

  const completedSessions = sessions.filter(
    (session) => session.completionStatus !== "in_progress",
  );
  const preferredPairs = new Set(
    (currentUser?.languagePreferences ?? []).map((pair) =>
      getLanguagePairKey(pair.sourceLanguage, pair.targetLanguage),
    ),
  );
  const scenarioMatchesPreference = (scenario: (typeof scenarios)[number]) =>
    preferredPairs.has(
      getLanguagePairKey(
        scenario.practiceRuntime.sourceLanguage,
        scenario.practiceRuntime.targetLanguage,
      ),
    );
  const prioritizedScenarios =
    preferredPairs.size > 0
      ? [...scenarios].sort((left, right) => {
          const leftMatched = scenarioMatchesPreference(left) ? 1 : 0;
          const rightMatched = scenarioMatchesPreference(right) ? 1 : 0;
          return rightMatched - leftMatched;
        })
      : scenarios;
  const isNaatiCclModule = moduleId === "naati-certification-practice-ccl";
  const scenarioPassThreshold = isNaatiCclModule ? 63 : 75;
  const scenarioStatus = new Map(
    prioritizedScenarios.map((scenario) => {
      const related = completedSessions.filter(
        (session) => session.scenarioId === scenario.id,
      );
      const highest =
        related.length > 0
          ? related.reduce((best, current) =>
              current.score > best.score ? current : best,
            )
          : null;
      return [scenario.id, highest];
    }),
  );
  const bestScore = Math.max(
    0,
    ...completedSessions.map((session) => session.score),
  );

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
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          {learningModule.title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          {learningModule.description}
        </p>
        <div className="mt-6 flex flex-wrap gap-2 text-sm text-muted">
          <span className="mono-chip rounded-full px-3 py-2">
            {learningModule.durationMinutes} min
          </span>
          <span className="mono-chip rounded-full px-3 py-2">
            {learningModule.difficultyLevel}
          </span>
          <span className="mono-chip rounded-full px-3 py-2">
            {learningModule.badgeIcon}
          </span>
        </div>
        {prioritizedScenarios[0] ? (
          <Link
            href={`/practice/${prioritizedScenarios[0].id}/room`}
            className="action-primary mt-8"
          >
            Start practice
          </Link>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="surface-card rounded-[2rem] p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            Overall score
          </div>
          <div className="mt-3 text-4xl font-semibold">{bestScore}%</div>
        </div>
        <div className="surface-card rounded-[2rem] p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            Completed attempts
          </div>
          <div className="mt-3 text-4xl font-semibold">
            {completedSessions.length}
          </div>
        </div>

        <div className="surface-card rounded-[2rem] p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            Module badge
          </div>
          <div className="mt-3 text-2xl font-semibold">
            {learningModule.badgeIcon}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="surface-card rounded-[2rem] p-6">
          <p className="eyebrow">What to focus on</p>
          <div className="mt-5 space-y-3 text-sm leading-7 text-muted">
            {learningModule.learningObjectives.map((objective) => (
              <div
                key={objective}
                className="rounded-[1.25rem] border border-line bg-white p-4"
              >
                {objective}
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card rounded-[2rem] p-6">
          <p className="eyebrow">Scenarios</p>
          {preferredPairs.size > 0 ? (
            <p className="mt-2 text-sm text-muted">
              Scenarios matching your language preferences are shown first.
            </p>
          ) : null}
          <div className="mt-5 space-y-4">
            {prioritizedScenarios.map((scenario) => (
              <div
                key={scenario._id}
                className="rounded-[1.5rem] border border-line bg-white p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="font-semibold">{scenario.title}</div>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {scenario.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                      <span className="mono-chip rounded-full px-2.5 py-1.5">
                        {scenario.practiceRuntime.sourceLanguage} to{" "}
                        {scenario.practiceRuntime.targetLanguage}
                      </span>
                      {scenarioMatchesPreference(scenario) ? (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-emerald-700">
                          Preference match
                        </span>
                      ) : null}
                    </div>
                    {scenarioStatus.get(scenario.id) ? (
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                        <span className="text-muted">
                          Highest score{" "}
                          {isNaatiCclModule
                            ? `${scenarioStatus.get(scenario.id)?.score}/90`
                            : `${scenarioStatus.get(scenario.id)?.score}%`}
                        </span>
                        {(scenarioStatus.get(scenario.id)?.score ?? 0) >=
                        scenarioPassThreshold ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-emerald-700">
                            <CheckCircle2 size={14} />
                            Pass
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1.5 text-red-700">
                            <XCircle size={14} />
                            Fail
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>
                  <Link
                    href={`/practice/${scenario.id}/room`}
                    className="action-secondary shrink-0 px-4 py-2 text-sm"
                  >
                    Start
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
