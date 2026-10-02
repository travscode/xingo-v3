"use client";

import { Award } from "lucide-react";
import { getPerformanceBadges } from "@/lib/performance";
import type { CompletionStatus } from "@/types/session";

/** Earned achievements, computed from graded sessions. */
export function AchievementBadges({
  sessions,
  modules,
}: {
  sessions: Array<{ moduleId: string; score: number; completionStatus: CompletionStatus }>;
  modules: Array<{ id: string; title: string; industryCategory: string }>;
}) {
  const badges = getPerformanceBadges(modules, sessions);

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <div key={badge.id} title={badge.description} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
          <Award className="h-4 w-4" />
          <span className="text-sm font-semibold">{badge.label}</span>
        </div>
      ))}
    </div>
  );
}
