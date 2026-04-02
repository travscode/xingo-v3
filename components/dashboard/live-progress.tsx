"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function LiveProgress() {
  const sessions = useQuery(api.sessions.listForCurrentUser, {});
  const scenarios = useQuery(api.scenarios.list, {});
  const scenarioTitleById = useMemo(
    () => new Map((scenarios ?? []).map((scenario) => [scenario.id, scenario.title])),
    [scenarios],
  );

  if (!sessions || !scenarios) {
    return <div className="surface-card h-64 rounded-[2rem] animate-pulse" />;
  }

  const completedSessions = sessions.filter((session) => session.completionStatus !== "in_progress");

  return (
    <section className="section-frame rounded-[1.75rem] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Progress</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Assessment history</h2>
        </div>
      </div>
      <div className="mt-5 overflow-hidden rounded-[1.25rem] border border-line">
        <table className="min-w-full divide-y divide-line text-left text-sm">
          <thead className="bg-white/70 text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Scenario</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-white/40">
            {completedSessions.map((session) => (
              <tr key={session._id}>
                <td className="px-4 py-4">{scenarioTitleById.get(session.scenarioId) ?? session.scenarioId}</td>
                <td className="px-4 py-4">{session.durationMinutes} min</td>
                <td className="px-4 py-4">{session.score}%</td>
                <td className="px-4 py-4 capitalize">{session.completionStatus.replace("_", " ")}</td>
              </tr>
            ))}
            {completedSessions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  No completed practice attempts yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
