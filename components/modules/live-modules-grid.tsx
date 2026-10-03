"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowRight } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Card, PageHeader, ProgressBar, Skeleton } from "@/components/ui/primitives";
import { ScenarioRow } from "@/components/modules/scenario-row";
import { FreeBadge, IndustryIcon, PremiumBadge } from "@/components/ui/badges";

/**
 * The practice library: modules in the order that matches the learner's goal,
 * each showing its first few dialogues so one click starts practice.
 */
export function LiveModulesGrid() {
  const catalog = useQuery(api.catalog.forCurrentUser, {});
  const me = useQuery(api.users.me, {});

  if (!catalog) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const premiumAccess = me?.entitlement.premiumAccess ?? false;

  return (
    <div className="space-y-10">
      <PageHeader
        title="Practice"
        description="Pick a dialogue. Each one starts with a short briefing and a mic check."
      />

      {catalog.modules.map((learningModule) => {
        const total = learningModule.scenarios.length;
        const preview = learningModule.scenarios.slice(0, 3);
        const locked = !learningModule.isFree && !premiumAccess;

        return (
          <section key={learningModule.id}>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100">
                    <IndustryIcon category={learningModule.industryCategory} />
                  </span>
                  <h2 className="text-xl font-bold tracking-[-0.02em]">{learningModule.title}</h2>
                  {learningModule.isFree ? <FreeBadge /> : locked ? <PremiumBadge /> : null}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {total} dialogue{total === 1 ? "" : "s"} · {learningModule.passedCount} passed ·{" "}
                  <span className="capitalize">{learningModule.difficultyLevel}</span>
                </p>
              </div>
              <Link
                href={`/modules/${learningModule.id}`}
                className="inline-flex items-center gap-1 text-sm font-semibold hover:underline"
              >
                View module <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {total > 0 ? (
              <ProgressBar value={learningModule.passedCount / total} tone="accent" className="mb-3" />
            ) : null}
            <Card className="divide-y divide-gray-200 overflow-hidden">
              {preview.map((scenario) => (
                <ScenarioRow
                  key={scenario.id}
                  scenario={scenario}
                  moduleId={learningModule.id}
                  showFreeBadge={locked}
                />
              ))}
              {total > preview.length ? (
                <Link
                  href={`/modules/${learningModule.id}`}
                  className="block px-5 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-ink"
                >
                  {total - preview.length} more dialogue{total - preview.length === 1 ? "" : "s"}
                </Link>
              ) : null}
              {total === 0 ? <p className="px-5 py-4 text-sm text-gray-500">Dialogues coming soon.</p> : null}
            </Card>
          </section>
        );
      })}
    </div>
  );
}
