"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Renders the completed practice assessment and transcript details.
 */
export function LivePracticeResults({ scenarioId }: { scenarioId: string }) {
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");
  const fromRoom = searchParams.get("fromRoom") === "1";
  const scenario = useQuery(api.scenarios.getById, { id: scenarioId });
  const attemptSession = useQuery(
    api.sessions.getByAttemptIdForCurrentUser,
    attemptId ? { attemptId } : "skip",
  );
  const latestCompleted = useQuery(
    api.sessions.getLatestCompletedByScenarioForCurrentUser,
    {
      scenarioId,
    },
  );
  const [isCalculating, setIsCalculating] = useState(fromRoom);

  useEffect(() => {
    if (!fromRoom || !isCalculating) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsCalculating(false);
    }, 1400);

    return () => window.clearTimeout(timeout);
  }, [fromRoom, isCalculating]);

  const session = useMemo(() => {
    if (attemptId) {
      return attemptSession;
    }
    return latestCompleted;
  }, [attemptId, attemptSession, latestCompleted]);

  if (
    scenario === undefined ||
    (attemptId && attemptSession === undefined) ||
    latestCompleted === undefined
  ) {
    return <div className="surface-card h-96 rounded-[2rem] animate-pulse" />;
  }

  if (!scenario) {
    return (
      <section className="surface-card rounded-[2rem] p-6">
        <p className="text-sm text-muted">Scenario not found.</p>
      </section>
    );
  }

  if (
    isCalculating ||
    (session?.completionStatus === "in_progress" && fromRoom)
  ) {
    return (
      <section className="section-frame rounded-[2.25rem] p-10 text-center">
        <p className="eyebrow">Assessment</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">
          Calculating score...
        </h1>
        <p className="mt-3 text-sm text-muted">
          We are reviewing interpreter accuracy, flow, terminology, and turn
          management.
        </p>
      </section>
    );
  }

  if (!session || !session.assessment) {
    return (
      <section className="section-frame rounded-[2.25rem] p-8">
        <p className="eyebrow">Practice results</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
          No completed attempt yet.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Start a dedicated practice room to generate a full scored assessment
          and transcript.
        </p>
        <Link
          href={`/practice/${scenarioId}/room`}
          className="action-primary mt-6"
        >
          Start practice room
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="section-frame rounded-[2.25rem] p-6 lg:p-8">
        <p className="eyebrow">Practice results</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.05em]">
              {scenario.title}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {scenario.practiceRuntime.sourceLanguage} to{" "}
              {scenario.practiceRuntime.targetLanguage}
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-semibold">
              {session.assessment.overallScore}%
            </div>
            <div className="mt-2 text-sm capitalize text-muted">
              {session.assessment.completionDecision.replace("_", " ")}
            </div>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
          {session.assessment.summary}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/practice/${scenarioId}/room`}
            className="action-primary"
          >
            Practice again
          </Link>
          <Link
            href={`/modules/${scenario.moduleId}`}
            className="action-secondary"
          >
            Back to module
          </Link>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-card rounded-[2rem] p-6">
          <p className="eyebrow">Score breakdown</p>
          <div className="mt-5 space-y-3">
            {Object.entries(session.assessment.breakdown).map(
              ([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-[1.25rem] border border-line bg-white p-4"
                >
                  <span className="capitalize">{key}</span>
                  <span className="font-semibold">{Math.round(value)}%</span>
                </div>
              ),
            )}
          </div>
          <div className="mt-5 rounded-[1.5rem] border border-line bg-white p-4 text-sm leading-6 text-muted">
            <div className="font-semibold text-foreground">Strengths</div>
            <p className="mt-2">{session.assessment.strengths.join(" ")}</p>
          </div>
          <div className="mt-4 rounded-[1.5rem] border border-line bg-white p-4 text-sm leading-6 text-muted">
            <div className="font-semibold text-foreground">Needs work</div>
            <p className="mt-2">
              {session.assessment.improvementAreas.join(" ")}
            </p>
          </div>
          <div className="mt-4 rounded-[1.5rem] border border-line bg-white p-4 text-sm leading-6 text-muted">
            <div className="font-semibold text-foreground">
              Recommended next step
            </div>
            <p className="mt-2">{session.assessment.recommendedNextStep}</p>
          </div>
        </div>

        <div className="surface-card rounded-[2rem] p-6">
          <p className="eyebrow">Full transcript</p>
          <div className="mt-5 space-y-3">
            {(session.transcriptEntries ?? []).map((entry) => (
              <div
                key={entry.id}
                className="rounded-[1.25rem] border border-line bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">{entry.speaker}</div>
                  <div className="text-xs uppercase tracking-[0.16em] text-muted">
                    {entry.role}
                  </div>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {entry.text}
                </p>
              </div>
            ))}
            {(session.transcriptEntries ?? []).length === 0 ? (
              <p className="text-sm text-muted">
                Transcript is empty for this attempt.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
