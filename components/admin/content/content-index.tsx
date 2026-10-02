"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { AlertCircle, ChevronRight, Plus, Search } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Scenario } from "@/types/scenario";
import { Badge, EmptyState, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { industryOptions, scenarioWarnings } from "@/components/admin/content/model";

/** Content home: every module, its status and anything that needs attention. */
export function ContentIndex() {
  const modules = useQuery(api.modules.list, {});
  const scenarios = useQuery(api.scenarios.list, {});
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    if (!modules || !scenarios) return [];
    const term = search.trim().toLowerCase();

    return modules
      .map((learningModule) => {
        const moduleScenarios = (scenarios as unknown as Scenario[]).filter((s) => s.moduleId === learningModule.id);
        const needsAttention = moduleScenarios.filter((s) => scenarioWarnings(s).length > 0).length;
        const matches =
          !term ||
          learningModule.title.toLowerCase().includes(term) ||
          moduleScenarios.some((s) => s.title.toLowerCase().includes(term));

        return { learningModule, count: moduleScenarios.length, needsAttention, matches };
      })
      .filter((row) => row.matches);
  }, [modules, scenarios, search]);

  if (!modules || !scenarios) {
    return <Skeleton className="h-80" />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search modules and dialogues"
            className="h-10 w-full rounded-lg bg-gray-100 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-live"
          />
        </div>
        <Button asChild>
          <Link href="/admin/content/new">
            <Plus className="h-4 w-4" /> New module
          </Link>
        </Button>
      </div>

      <p className="text-sm text-gray-500">
        {modules.length} modules · {scenarios.length} dialogues. Open a module to edit its details or its dialogues.
      </p>

      {rows.length === 0 ? (
        <EmptyState title="Nothing matches that search" />
      ) : (
        <div className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200">
          {rows.map(({ learningModule, count, needsAttention }) => (
            <Link
              key={learningModule.id}
              href={`/admin/content/${learningModule.id}`}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold">{learningModule.title}</p>
                  {learningModule.isFree ? <Badge tone="accent">Free</Badge> : <Badge>Premium</Badge>}
                </div>
                <p className="mt-0.5 text-sm text-gray-500">
                  {industryOptions.find((option) => option.value === learningModule.industryCategory)?.label} ·{" "}
                  <span className="capitalize">{learningModule.difficultyLevel}</span> · {count} dialogue
                  {count === 1 ? "" : "s"}
                </p>
              </div>
              {needsAttention > 0 ? (
                <span className="hidden items-center gap-1 text-xs font-semibold text-gray-700 sm:inline-flex">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  {needsAttention} need{needsAttention === 1 ? "s" : ""} attention
                </span>
              ) : null}
              <ChevronRight className="h-4 w-4 shrink-0 text-gray-500" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
