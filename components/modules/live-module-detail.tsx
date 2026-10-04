"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowLeft, Check, Clock } from "lucide-react";
import { useProgressPair } from "@/components/providers/language-pair-context";
import { api } from "@/convex/_generated/api";
import { track } from "@/lib/analytics";
import { displayPassMark, displayMaxScore, isCclModule } from "@/lib/scoring";
import { Badge, Card, EmptyState, ProgressBar, SectionTitle, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { ScenarioRow } from "@/components/modules/scenario-row";
import { FreeBadge, IndustryIcon, PremiumBadge } from "@/components/ui/badges";

export function LiveModuleDetail({ moduleId }: { moduleId: string }) {
  const catalog = useQuery(api.catalog.forCurrentUser, { pair: useProgressPair() });
  const me = useQuery(api.users.me, {});
  const viewed = catalog?.modules.find((m) => m.id === moduleId);
  const viewedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!viewed || me === undefined || viewedRef.current === moduleId) return;
    viewedRef.current = moduleId;
    track("course_view", {
      module_id: moduleId,
      course_title: viewed.title,
      free: viewed.isFree,
      locked: !viewed.isFree && !(me?.entitlement.premiumAccess ?? false),
    });
  }, [me, moduleId, viewed]);

  if (!catalog) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  const learningModule = catalog.modules.find((m) => m.id === moduleId);

  if (!learningModule) {
    return (
      <EmptyState
        title="Course not found"
        action={
          <Button asChild>
            <Link href="/courses">Back to practice</Link>
          </Button>
        }
      />
    );
  }

  const locked = !learningModule.isFree && !(me?.entitlement.premiumAccess ?? false);
  const total = learningModule.scenarios.length;
  const firstPlayable = learningModule.scenarios.find((s) => !s.locked && !s.stats.passed) ??
    learningModule.scenarios.find((s) => !s.locked);

  return (
    <div className="space-y-8">
      <Link href="/courses" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Practice
      </Link>

      <header>
        <div className="flex flex-wrap items-center gap-2">
          {learningModule.isFree ? <FreeBadge /> : <PremiumBadge />}
          <Badge className="capitalize">{learningModule.difficultyLevel}</Badge>
          {isCclModule(learningModule.id) ? <Badge tone="dark">Scored out of 90 · pass {displayPassMark(learningModule.id)}</Badge> : null}
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">{learningModule.title}</h1>
        <p className="mt-3 max-w-3xl text-[15px] leading-7 text-gray-500">{learningModule.description}</p>
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <IndustryIcon category={learningModule.industryCategory} className="h-3.5 w-3.5" />
            {total} dialogue{total === 1 ? "" : "s"}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden /> About {learningModule.durationMinutes} min each
          </span>
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {firstPlayable ? (
            <Button asChild size="lg">
              <Link href={`/practice/${firstPlayable.id}`}>
                {firstPlayable.stats.attempts > 0 ? "Continue" : "Start"}: {firstPlayable.title}
              </Link>
            </Button>
          ) : null}
          {locked ? (
            <Button asChild size="lg" variant="secondary">
              <Link href="/billing">Unlock all dialogues</Link>
            </Button>
          ) : null}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <section>
          <SectionTitle>
            Dialogues · {learningModule.passedCount}/{total} passed
          </SectionTitle>
          <ProgressBar value={total ? learningModule.passedCount / total : 0} tone="accent" className="mb-3" />
          <Card className="divide-y divide-gray-200 overflow-hidden">
            {learningModule.scenarios.map((scenario) => (
              <ScenarioRow key={scenario.id} scenario={scenario} moduleId={learningModule.id} showFreeBadge={locked} />
            ))}
          </Card>
        </section>

        <aside className="space-y-4">
          {learningModule.learningObjectives.length > 0 ? (
            <Card tone="muted" className="p-5">
              <p className="font-bold">You&apos;ll practise</p>
              <ul className="mt-3 space-y-2">
                {learningModule.learningObjectives.map((objective) => (
                  <li key={objective} className="flex gap-2 text-sm leading-6 text-gray-700">
                    <Check className="mt-1 h-4 w-4 shrink-0" />
                    {objective}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
          <Card tone="muted" className="p-5 text-sm leading-6 text-gray-700">
            <p className="font-bold text-ink">How scoring works</p>
            <p className="mt-2">
              Each assessed session is scored out of {displayMaxScore(learningModule.id)}. A dialogue counts as passed
              at {displayPassMark(learningModule.id)} or above.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
