import type { ReactNode } from "react";
import { howItWorksSteps } from "@/components/marketing/catalogue";
import {
  MicVisual,
  PartnerVisual,
  ScoreVisual,
  SpeakersVisual,
  TaskCardVisual,
} from "@/components/marketing/practice-mock";
import { cn } from "@/lib/utils";

export const roleplaySteps = [
  {
    title: "Read your task card",
    description: "Each scenario starts with a card like the real exam's: the setting, who you are and what you need to do.",
  },
  {
    title: "Speak with a realistic partner",
    description:
      "The AI plays the patient, relative, colleague or examiner. Hold Space (or the mic button) while you talk. The session is timed like the exam.",
  },
  {
    title: "Get exam-style feedback",
    description: "An estimated score against the exam's own criteria, plus specific notes on what to fix next time.",
  },
] as const;

const visuals: Record<"interpreting" | "roleplay", ReactNode[]> = {
  interpreting: [<SpeakersVisual key="a" />, <MicVisual key="b" />, <ScoreVisual key="c" />],
  roleplay: [<TaskCardVisual key="a" />, <PartnerVisual key="b" />, <ScoreVisual key="c" criteria />],
};

/** Three step cards, each showing the actual UI state for that step. */
export function IllustratedSteps({
  variant = "interpreting",
  className,
}: {
  variant?: "interpreting" | "roleplay";
  className?: string;
}) {
  const steps = variant === "roleplay" ? roleplaySteps : howItWorksSteps;

  return (
    <ol className={cn("grid gap-4 md:grid-cols-3", className)}>
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="mk-lift flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-paper hover:border-ink"
        >
          <div className="flex h-44 items-center justify-center bg-gray-50 px-6">{visuals[variant][index]}</div>
          <div className="flex flex-1 flex-col p-6">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Step {index + 1}</span>
            <h3 className="mt-2 text-lg font-bold tracking-[-0.02em]">{step.title}</h3>
            <p className="mt-2 text-[15px] leading-6 text-gray-500">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
