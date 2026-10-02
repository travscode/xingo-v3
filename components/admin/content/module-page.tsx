"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { AlertCircle, ChevronRight, Plus } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Scenario } from "@/types/scenario";
import { cn } from "@/lib/utils";
import { Badge, EmptyState, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/admin/content/fields";
import { ModuleDetailsForm } from "@/components/admin/content/module-form";
import { emptyModuleForm, moduleFormFromRecord, scenarioWarnings } from "@/components/admin/content/model";

const tabs = [
  { id: "dialogues", label: "Dialogues" },
  { id: "details", label: "Details" },
] as const;

export function ModulePage({ moduleId }: { moduleId: string }) {
  const learningModule = useQuery(api.modules.getById, { id: moduleId });
  const scenarios = useQuery(api.scenarios.listByModule, { moduleId });
  const router = useRouter();
  const pathname = usePathname();
  const tab = useSearchParams().get("tab") === "details" ? "details" : "dialogues";

  if (learningModule === undefined || scenarios === undefined) {
    return <Skeleton className="h-80" />;
  }

  if (!learningModule) {
    return (
      <EmptyState
        title="Module not found"
        action={
          <Button asChild>
            <Link href="/admin?tab=content">Back to content</Link>
          </Button>
        }
      />
    );
  }

  const dialogues = scenarios as unknown as Scenario[];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Content", href: "/admin?tab=content" }, { label: learningModule.title }]} />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {learningModule.isFree ? <Badge tone="accent">Free</Badge> : <Badge>Premium</Badge>}
            <Badge className="capitalize">{learningModule.difficultyLevel}</Badge>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em]">{learningModule.title}</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/modules/${moduleId}`} target="_blank">
              View as learner
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/content/${moduleId}/new`}>
              <Plus className="h-4 w-4" /> New dialogue
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex gap-1 border-b border-gray-200" role="tablist">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => router.replace(item.id === "dialogues" ? pathname : `${pathname}?tab=${item.id}`)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold",
              tab === item.id ? "border-ink text-ink" : "border-transparent text-gray-500 hover:text-ink",
            )}
          >
            {item.label}
            {item.id === "dialogues" ? <span className="ml-1.5 text-gray-500">{dialogues.length}</span> : null}
          </button>
        ))}
      </div>

      {tab === "details" ? (
        <ModuleDetailsForm key={learningModule.id} moduleId={moduleId} initial={moduleFormFromRecord(learningModule)} />
      ) : dialogues.length === 0 ? (
        <EmptyState
          title="No dialogues yet"
          description="Add the first dialogue learners will practise in this module."
          action={
            <Button asChild>
              <Link href={`/admin/content/${moduleId}/new`}>
                <Plus className="h-4 w-4" /> New dialogue
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200">
          {dialogues.map((scenario) => {
            const warnings = scenarioWarnings(scenario);
            const people = [scenario.aiAgentA, scenario.aiAgentB].filter((agent) => agent !== undefined);

            return (
              <Link
                key={scenario.id}
                href={`/admin/content/${moduleId}/${scenario.id}`}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex -space-x-3">
                  {people.map((person) => (
                    <div
                      key={person.role}
                      className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-paper bg-gray-200 text-sm font-bold"
                    >
                      {person.avatarImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={person.avatarImageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        (person.name || person.role).slice(0, 1)
                      )}
                    </div>
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold">{scenario.title}</p>
                    {scenario.isFreePreview ? <Badge tone="accent">Free preview</Badge> : null}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-gray-500">
                    {people.map((person) => person.role).join(" & ")} ·{" "}
                    <span className="capitalize">{scenario.difficultyLevel}</span>
                  </p>
                </div>
                {warnings.length > 0 ? (
                  <span className="hidden items-center gap-1 text-xs font-semibold text-gray-700 md:inline-flex">
                    <AlertCircle className="h-4 w-4 text-warning" />
                    {warnings.join(" · ")}
                  </span>
                ) : null}
                <ChevronRight className="h-4 w-4 shrink-0 text-gray-500" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function NewModulePage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Content", href: "/admin?tab=content" }, { label: "New module" }]} />
      <h1 className="text-3xl font-bold tracking-[-0.035em]">New module</h1>
      <ModuleDetailsForm initial={emptyModuleForm} />
    </div>
  );
}
