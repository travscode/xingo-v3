"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { ArrowRight, Check, RotateCcw, TrendingDown, TrendingUp } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { track } from "@/lib/analytics";
import { isPassingScore } from "@/lib/scoring";
import { rubricForModule } from "@/lib/rubrics";
import { Badge, Card, ProgressBar, SectionTitle, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LiveResults({ attemptId }: { attemptId: string }) {
  const result = useQuery(api.sessions.resultForCurrentUser, { attemptId });
  const searchParams = useSearchParams();
  const endedByTime = searchParams.get("ended") === "time";
  const retryGrading = useAction(api.practiceActions.retryGrading);
  const [retrying, setRetrying] = useState(false);
  const trackedRef = useRef(false);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    if (result?.session.assessment && !trackedRef.current) {
      trackedRef.current = true;
      track("results_view", { score: result.session.score, module_id: result.session.moduleId });
    }
  }, [result]);

  if (result === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (result === null) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-2xl font-bold">Result not found</h1>
        <Button asChild className="mt-6">
          <Link href="/progress">See your progress</Link>
        </Button>
      </div>
    );
  }

  const { session, scenarioTitle, moduleTitle, previousScore } = result;
  const practiceAgainHref = `/practice/${session.scenarioId}`;
  const reason = session.ungradedReason;
  const transcript = session.transcriptEntries ?? [];

  const header = (
    <div>
      <p className="eyebrow">{moduleTitle}</p>
      <h1 className="mt-1 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">{scenarioTitle}</h1>
      {endedByTime ? (
        <p className="mt-2 text-sm text-gray-500">The session ended because your practice time ran out.</p>
      ) : null}
    </div>
  );

  if (session.completionStatus === "in_progress" || reason === "grading") {
    return (
      <div className="space-y-8">
        {header}
        <Card tone="inverse" className="p-8 sm:p-10">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 animate-pulse rounded-full bg-accent" />
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-paper/70">Scoring</p>
          </div>
          <p className="mt-4 text-2xl font-bold sm:text-3xl">Reviewing your interpretation…</p>
          <p className="mt-2 max-w-lg text-paper/70">
            We&apos;re checking accuracy, terminology, fluency, turn-taking and professionalism. This usually takes
            10–20 seconds.
          </p>
        </Card>
      </div>
    );
  }

  if (!session.assessment) {
    const copy =
      reason === "practice_mode"
        ? {
            title: "Practice session saved",
            body: "Practice sessions aren't scored. When you're ready, run the same dialogue as an assessed session.",
          }
        : reason === "too_short"
          ? {
              title: "Not enough to score",
              body: "We need at least a few interpreted turns to give useful feedback. Try again and keep going until the conversation wraps up.",
            }
          : reason === "grading_failed"
            ? { title: "Scoring didn't finish", body: "Something went wrong while scoring. You can try again — you won't be charged twice." }
            : { title: "Session ended early", body: "This session ended before it could be scored." };

    return (
      <div className="space-y-8">
        {header}
        <Card className="p-8">
          <p className="text-2xl font-bold">{copy.title}</p>
          <p className="mt-2 max-w-xl text-gray-500">{copy.body}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {reason === "grading_failed" ? (
              <Button
                disabled={retrying}
                onClick={() => {
                  setRetrying(true);
                  void retryGrading({ attemptId }).finally(() => setRetrying(false));
                }}
              >
                {retrying ? "Scoring…" : "Try scoring again"}
              </Button>
            ) : (
              <Button asChild>
                <Link href={practiceAgainHref}>
                  <RotateCcw className="h-4 w-4" /> Practise again
                </Link>
              </Button>
            )}
            <Button asChild variant="secondary">
              <Link href={`/modules/${session.moduleId}`}>Back to module</Link>
            </Button>
          </div>
        </Card>
        {transcript.length > 0 ? <Transcript entries={transcript} /> : null}
      </div>
    );
  }

  const assessment = session.assessment;
  const rubric = rubricForModule(session.moduleId);
  const passed = isPassingScore(session.moduleId, session.score);
  const display = rubric.display(session.score);
  const delta = previousScore !== null ? session.score - previousScore : null;

  return (
    <div className="space-y-8">
      {header}

      <Card tone="inverse" className="overflow-hidden">
        <div className="grid gap-8 p-8 sm:grid-cols-[auto_1fr] sm:items-center sm:p-10">
          <div>
            <p className="text-sm font-semibold text-paper/60">{display.note ?? "Your score"}</p>
            <p className="mt-1 text-7xl font-bold tracking-[-0.05em] tabular-nums">
              {display.value}
              {display.max ? <span className="text-3xl text-paper/50">/{display.max}</span> : null}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone={passed ? "accent" : "neutral"}>
                {passed ? <Check className="h-3 w-3" /> : null}
                {passed ? "At target" : rubric.passLabel}
              </Badge>
              {delta !== null && delta !== 0 ? (
                <span className="inline-flex items-center gap-1 text-sm text-paper/70">
                  {delta > 0 ? <TrendingUp className="h-4 w-4 text-accent" /> : <TrendingDown className="h-4 w-4" />}
                  {delta > 0 ? "+" : ""}
                  {Math.abs(delta)} points since last attempt
                </span>
              ) : null}
            </div>
          </div>
          <div>
            <p className="text-lg leading-7 text-paper/85">{assessment.summary}</p>
            {rubric.caveat ? <p className="mt-3 text-xs text-paper/50">{rubric.caveat}</p> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-paper/10 px-8 py-5 sm:px-10">
          <Button asChild variant="accent">
            <Link href={practiceAgainHref}>
              <RotateCcw className="h-4 w-4" /> Practise again
            </Link>
          </Button>
          <Button asChild variant="inverse">
            <Link href={`/modules/${session.moduleId}`}>
              Next dialogue <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <SectionTitle>Breakdown</SectionTitle>
          <div className="space-y-4">
            {rubric.dimensions.map((dimension) => {
              const value = Math.round(assessment.breakdown[dimension.key]);
              return (
                <div key={dimension.key}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-semibold">{dimension.label}</span>
                    <span className="tabular-nums text-gray-500">{value}</span>
                  </div>
                  <ProgressBar value={value / 100} tone={value >= 75 ? "accent" : "ink"} />
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle>Feedback</SectionTitle>
          <FeedbackList title="What went well" items={assessment.strengths} positive />
          <FeedbackList title="Work on next" items={assessment.improvementAreas} />
          <div className="mt-5 rounded-xl bg-gray-50 p-4">
            <p className="text-sm font-bold">Your next step</p>
            <p className="mt-1 text-sm leading-6 text-gray-700">{assessment.recommendedNextStep}</p>
          </div>
        </Card>
      </div>

      <div>
        <Button variant="outline" onClick={() => setShowTranscript((value) => !value)}>
          {showTranscript ? "Hide transcript" : "Show full transcript"}
        </Button>
        {showTranscript ? <Transcript entries={transcript} /> : null}
      </div>
    </div>
  );
}

function FeedbackList({ title, items, positive }: { title: string; items: string[]; positive?: boolean }) {
  if (items.length === 0) return null;

  return (
    <div className="mb-5">
      <p className="text-sm font-bold">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-gray-700">
            <span className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", positive ? "bg-success" : "bg-ink")} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Transcript({
  entries,
}: {
  entries: Array<{ id: string; role: string; speaker: string; text: string }>;
}) {
  return (
    <Card className="mt-4 p-6">
      <SectionTitle>Transcript</SectionTitle>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className={cn("flex", entry.role === "user" && "justify-end")}>
            <div
              className={cn(
                "max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-6",
                entry.role === "user" ? "bg-ink text-paper" : "bg-gray-100",
              )}
            >
              <p className="text-[11px] font-semibold opacity-60">{entry.speaker}</p>
              {entry.text}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
