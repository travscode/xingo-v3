"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function LiveProgress() {
  const sessions = useQuery(api.sessions.listForCurrentUser, {});

  if (!sessions) {
    return <div className="surface-card h-64 rounded-[2rem] animate-pulse" />;
  }

  return (
    <section className="section-frame rounded-[2rem] p-6">
      <p className="eyebrow">Progress</p>
      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-line">
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
            {sessions.map((session) => (
              <tr key={session._id}>
                <td className="px-4 py-4">{session.scenarioId}</td>
                <td className="px-4 py-4">{session.durationMinutes} min</td>
                <td className="px-4 py-4">{session.score}%</td>
                <td className="px-4 py-4 capitalize">{session.completionStatus.replace("_", " ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
