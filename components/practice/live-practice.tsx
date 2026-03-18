"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ScenarioPanel } from "@/components/practice/scenario-panel";

export function LivePractice({ scenarioId }: { scenarioId: string }) {
  const scenario = useQuery(api.scenarios.getById, { id: scenarioId });

  if (scenario === undefined) {
    return <div className="surface-card h-96 rounded-[2rem] animate-pulse" />;
  }

  if (!scenario) {
    return (
      <section className="surface-card rounded-[2rem] p-6">
        <p className="text-sm text-muted">Scenario not found.</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <ScenarioPanel scenario={scenario} />
      <section className="surface-card rounded-[2rem] p-6">
        <p className="eyebrow">Session transcript preview</p>
        <div className="mt-5 grid gap-4">
          {[
            ["Doctor", "When did the chest pain begin, and have you taken any medication today?"],
            ["Interpreter", "The doctor asks when the chest pain started and whether you took any medicine today."],
            ["Patient", "About an hour ago, and I took aspirin but it did not help."],
          ].map(([speaker, line]) => (
            <div key={line} className="rounded-[1.5rem] border border-line bg-white/70 p-4">
              <div className="text-sm font-semibold">{speaker}</div>
              <p className="mt-2 text-sm leading-6 text-muted">{line}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
