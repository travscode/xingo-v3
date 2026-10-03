"use client";

import { Check, ChevronDown, CircleDashed, Eye, EyeOff, Languages, Loader2, Minus, RotateCcw, X } from "lucide-react";
import type { RefObject } from "react";
import type { TranscriptEntry } from "@/types/session";
import { cn } from "@/lib/utils";
import { bestVerdict, MAX_TRIES, type CoachResult, type GuideStep, type Verdict } from "@/components/practice/session-guide";

type Results = Record<string, CoachResult | "pending" | undefined>;

function VerdictIcon({ verdict, className }: { verdict: Verdict | "done" | "pending" | null; className?: string }) {
  const base = cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full", className);
  if (verdict === "pending") return <span className={cn(base, "bg-gray-100")}><Loader2 className="h-3.5 w-3.5 animate-spin" aria-label="Checking" /></span>;
  if (verdict === "good" || verdict === "done") return <span className={cn(base, "bg-accent text-accent-ink")}><Check className="h-3.5 w-3.5" aria-label="Done" /></span>;
  if (verdict === "partial") return <span className={cn(base, "bg-warning/50")}><Minus className="h-3.5 w-3.5" aria-label="Partly" /></span>;
  if (verdict === "missed") return <span className={cn(base, "bg-record text-paper")}><X className="h-3.5 w-3.5" aria-label="Missed" /></span>;
  return <span className={cn(base, "bg-gray-100 text-gray-500")}><CircleDashed className="h-3.5 w-3.5" aria-hidden /></span>;
}

function stepOutcome(step: GuideStep, results: Results, live: boolean): Verdict | "done" | "pending" | null {
  if (step.attemptIds.some((id) => results[id] === "pending")) return "pending";
  const checked = Object.fromEntries(step.attemptIds.map((id) => [id, results[id] === "pending" ? undefined : results[id]]));
  const best = bestVerdict(step, checked as Record<string, CoachResult | undefined>);
  if (best) return best;
  if (step.attemptIds.length > 0) return live ? "pending" : "done";
  return step.closed ? "missed" : null;
}

/** "Your task" + the one step to do now, with finished steps collapsed above it. */
export function StepGuide({
  task,
  steps,
  results,
  live,
}: {
  task: string;
  steps: GuideStep[];
  results: Results;
  /** Practice mode: attempts are checked and get a verdict and tip. */
  live: boolean;
}) {
  const current = steps.find((step) => !step.closed) ?? steps[steps.length - 1];
  const done = steps.filter((step) => step !== current && step.closed);
  const lastAttempt = current?.attemptIds[current.attemptIds.length - 1];
  const lastResult = lastAttempt ? results[lastAttempt] : undefined;
  const coach = lastResult && lastResult !== "pending" ? lastResult : null;
  const triesLeft = current ? MAX_TRIES - current.attemptIds.length : 0;

  return (
    <div className="space-y-4">
      <div>
        <p className="eyebrow">Your task</p>
        <p className="mt-1 text-sm leading-6">{task}</p>
      </div>

      {done.length > 0 ? (
        <ol className="flex flex-wrap gap-1.5" aria-label="Finished steps">
          {done.map((step) => (
            <li key={step.id} title={step.title} className="step-in">
              <VerdictIcon verdict={stepOutcome(step, results, live)} className="h-5 w-5" />
            </li>
          ))}
        </ol>
      ) : null}

      {current ? (
        <div key={current.id} className="step-in rounded-xl border-2 border-ink p-4">
          <div className="flex items-start gap-3">
            <VerdictIcon verdict={stepOutcome(current, results, live) === "pending" ? "pending" : null} />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-500">
                {current.kind === "intro" ? `Step ${steps.indexOf(current) + 1} of 2` : current.kind === "segment" ? `Turn ${steps.indexOf(current) - 1}` : "Last step"}
              </p>
              <p className="font-bold leading-snug">{current.title}</p>
              <p className="mt-1 text-sm text-gray-500">{current.detail}</p>
            </div>
          </div>
          {live && coach ? (
            <div className={cn("mt-3 flex gap-2 rounded-lg p-3 text-sm", coach.verdict === "good" ? "bg-accent/40" : coach.verdict === "partial" ? "bg-warning/30" : "bg-record/10")}>
              <VerdictIcon verdict={coach.verdict} className="h-5 w-5" />
              <div>
                <p>{coach.tip}</p>
                {coach.verdict !== "good" && current.kind === "segment" && triesLeft > 0 ? (
                  <p className="mt-1 flex items-center gap-1 text-xs font-semibold">
                    <RotateCcw className="h-3 w-3" aria-hidden /> Ask them to repeat, then try again ({triesLeft} {triesLeft === 1 ? "try" : "tries"} left)
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Role-play: the task card as a checklist, ticked as items are covered (practice mode). */
export function TaskChecklist({ task, items, covered, live }: { task: string; items: string[]; covered: Set<number>; live: boolean }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="eyebrow">Your task</p>
        <p className="mt-1 text-sm leading-6">{task}</p>
      </div>
      {items.length > 0 ? (
        <ol className="space-y-2">
          {items.map((item, index) => (
            <li key={item} className="flex gap-2 text-sm">
              <VerdictIcon verdict={live && covered.has(index) ? "good" : null} className="mt-0.5 h-5 w-5" />
              <span className={cn(live && covered.has(index) && "text-gray-500 line-through")}>{item}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

/** The transcript, hidden by default. Revealing it in an assessed session makes it practice. */
export function TranscriptSection({
  open,
  onToggle,
  assessed,
  entries,
  translations,
  translating,
  onTranslate,
  showTranslate,
  scrollRef,
}: {
  open: boolean;
  onToggle: () => void;
  assessed: boolean;
  entries: TranscriptEntry[];
  translations: Record<string, string>;
  translating: Record<string, boolean>;
  onTranslate: (id: string, text: string) => void;
  showTranslate: boolean;
  scrollRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className={cn("flex min-h-0 flex-col", open && "flex-1")}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 border-t border-gray-200 py-3 text-left text-sm font-semibold"
      >
        <span className="flex items-center gap-2">
          {open ? <Eye className="h-4 w-4" aria-hidden /> : <EyeOff className="h-4 w-4 text-gray-500" aria-hidden />}
          Transcript
        </span>
        <span className="flex items-center gap-1 text-xs font-normal text-gray-500">
          {open ? "Hide" : assessed ? "Show (stops scoring)" : "Show"}
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden />
        </span>
      </button>
      {open ? (
        <div ref={scrollRef} className="min-h-[200px] flex-1 space-y-3 overflow-y-auto pb-3">
          {entries.length === 0 ? <p className="text-sm text-gray-500">The conversation will appear here.</p> : null}
          {entries.map((entry) => (
            <div key={entry.id} className={cn("flex", entry.role === "user" && "justify-end")}>
              <div className={cn("max-w-[85%] rounded-xl px-3 py-2 text-sm", entry.role === "user" ? "bg-ink text-paper" : "bg-gray-100")}>
                <div className="mb-0.5 flex items-center justify-between gap-3 text-[11px] font-semibold opacity-60">
                  <span>{entry.speaker}</span>
                  {!showTranslate ? null : translations[entry.id] ? (
                    <span>English</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onTranslate(entry.id, entry.text)}
                      disabled={translating[entry.id]}
                      className="inline-flex items-center gap-1 hover:opacity-100"
                    >
                      <Languages className="h-3 w-3" aria-hidden />
                      {translating[entry.id] ? "…" : "Translate"}
                    </button>
                  )}
                </div>
                {translations[entry.id] ?? entry.text}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
