"use client";

import Link from "next/link";
import { Check, ChevronRight, Lock } from "lucide-react";
import { displayMaxScore, toDisplayScore } from "@/lib/scoring";
import { Badge } from "@/components/ui/primitives";

export type ScenarioRowData = {
  id: string;
  title: string;
  description: string;
  difficultyLevel: string;
  isFreePreview: boolean;
  locked: boolean;
  participants: Array<{ name: string; role: string; avatarUrl?: string }>;
  stats: { attempts: number; bestScore: number | null; passed: boolean };
};

/** One dialogue in a list. The whole row is the action. */
export function ScenarioRow({
  scenario,
  moduleId,
  showFreeBadge,
}: {
  scenario: ScenarioRowData;
  moduleId: string;
  showFreeBadge?: boolean;
}) {
  return (
    <Link
      href={`/practice/${scenario.id}`}
      className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50"
    >
      <div className="flex -space-x-3">
        {scenario.participants.slice(0, 2).map((person) => (
          <div
            key={person.name}
            className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-paper bg-gray-200 text-sm font-bold"
          >
            {person.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={person.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              person.name.slice(0, 1)
            )}
          </div>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold">{scenario.title}</p>
          {showFreeBadge && scenario.isFreePreview ? <Badge tone="accent">Free</Badge> : null}
        </div>
        <p className="mt-0.5 line-clamp-1 text-sm text-gray-500">
          {scenario.participants.map((p) => p.role).join(" & ")} · <span className="capitalize">{scenario.difficultyLevel}</span>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {scenario.locked ? (
          <Lock className="h-4 w-4 text-gray-500" aria-label="Locked" />
        ) : scenario.stats.bestScore !== null ? (
          <div className="text-right">
            <p className="flex items-center justify-end gap-1 font-bold tabular-nums">
              {scenario.stats.passed ? <Check className="h-4 w-4 text-success" /> : null}
              {toDisplayScore(moduleId, scenario.stats.bestScore)}
              <span className="text-sm font-semibold text-gray-500">/{displayMaxScore(moduleId)}</span>
            </p>
            <p className="text-xs text-gray-500">best of {scenario.stats.attempts}</p>
          </div>
        ) : (
          <span className="text-sm font-semibold text-gray-500 group-hover:text-ink">Start</span>
        )}
        <ChevronRight className="h-4 w-4 text-gray-500" />
      </div>
    </Link>
  );
}
