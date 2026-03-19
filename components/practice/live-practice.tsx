"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RealtimePracticeRunner } from "@/components/practice/realtime-practice-runner";

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

  return <RealtimePracticeRunner scenario={scenario} />;
}
