"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Languages,
  LayoutGrid,
  MessagesSquare,
  Play,
  Scale,
  Search,
  Sparkles,
  Stethoscope,
  X,
  Users,
  type LucideIcon,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import {
  groupForModule,
  isForYou,
  libraryFilters,
  libraryGroups,
  matchesLibraryFilters,
  type LibraryFilterId,
  type LibraryGroupId,
} from "@/lib/catalog-groups";
import { cn } from "@/lib/utils";
import { EmptyState, PageHeader, ProgressBar, Skeleton } from "@/components/ui/primitives";
import { FreeBadge, IndustryIcon, PremiumBadge } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";

type CatalogModule = FunctionReturnType<typeof api.catalog.forCurrentUser>["modules"][number];

const groupIcons: Record<LibraryGroupId, LucideIcon> = {
  "for-you": Sparkles,
  naati: Languages,
  english: MessagesSquare,
  clinical: GraduationCap,
  medical: Stethoscope,
  legal: Scale,
  community: Users,
  us: BookOpen,
  all: LayoutGrid,
};

const PAGE_SIZE = 6;

/**
 * The practice library. A scrollable row of categories filters a compact grid
 * of module cards; "For you" (goal + already practised) is the default.
 */
export function LiveModulesGrid() {
  const catalog = useQuery(api.catalog.forCurrentUser, {});
  const me = useQuery(api.users.me, {});
  const [selected, setSelected] = useState<LibraryGroupId | null>(null);
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filters, setFilters] = useState<LibraryFilterId[]>([]);

  const groups = useMemo(() => {
    if (!catalog) return [];
    const forYou = catalog.modules.filter((m) => isForYou(m.id, m.attemptCount, catalog.practiceGoal));
    const byGroup = libraryGroups
      .map((group) => ({
        id: group.id as LibraryGroupId,
        label: group.label as string,
        modules: catalog.modules.filter((m) => groupForModule(m.id, m.industryCategory) === group.id),
      }))
      .filter((group) => group.modules.length > 0);

    return [
      ...(forYou.length > 0 ? [{ id: "for-you" as LibraryGroupId, label: "For you", modules: forYou }] : []),
      ...byGroup,
      { id: "all" as LibraryGroupId, label: "All modules", modules: catalog.modules },
    ];
  }, [catalog]);

  if (!catalog) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-28" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const activeId = selected ?? groups[0]?.id ?? "all";
  const term = search.trim().toLowerCase();
  const active = groups.find((group) => group.id === activeId) ?? groups[groups.length - 1];
  const modules = (
    term
      ? catalog.modules.filter(
          (m) =>
            m.title.toLowerCase().includes(term) ||
            m.description.toLowerCase().includes(term) ||
            m.scenarios.some((s) => s.title.toLowerCase().includes(term)),
        )
      : active.modules
  ).filter((m) => matchesLibraryFilters(m, filters));
  const toggleFilter = (id: LibraryFilterId) => {
    setFilters((current) => (current.includes(id) ? current.filter((f) => f !== id) : [...current, id]));
    setVisible(PAGE_SIZE);
  };
  const premiumAccess = me?.entitlement.premiumAccess ?? false;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Practice"
        description="Choose a category, then a module. Each dialogue starts with a short briefing and a mic check."
        actions={
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setVisible(PAGE_SIZE);
              }}
              placeholder="Search modules and dialogues"
              aria-label="Search modules and dialogues"
              className="h-11 w-full rounded-lg bg-gray-100 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-live"
            />
          </div>
        }
      />

      {!term ? (
        <CategoryCarousel
          groups={groups}
          activeId={activeId}
          onSelect={(id) => {
            setSelected(id);
            setVisible(PAGE_SIZE);
          }}
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter modules">
        {libraryFilters.map((filter) => {
          const on = filters.includes(filter.id);
          return (
            <button
              key={filter.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggleFilter(filter.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors",
                on ? "border-ink bg-ink text-paper" : "border-gray-200 bg-paper text-gray-700 hover:border-gray-300 hover:bg-gray-50",
              )}
            >
              {filter.label}
            </button>
          );
        })}
        {filters.length > 0 ? (
          <button
            type="button"
            onClick={() => setFilters([])}
            className="inline-flex items-center gap-1 px-2 py-1.5 text-sm font-semibold text-gray-500 hover:text-ink"
          >
            <X className="h-3.5 w-3.5" aria-hidden /> Clear
          </button>
        ) : null}
      </div>

      <section>
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-bold tracking-[-0.02em]">
            {term ? `Results for “${search.trim()}”` : active.label}
          </h2>
          <span className="text-sm text-gray-500">
            {modules.length} module{modules.length === 1 ? "" : "s"}
          </span>
        </div>

        {modules.length === 0 ? (
          <EmptyState
            title={filters.length > 0 ? "No modules match these filters" : "Nothing matches that search"}
            description={filters.length > 0 ? "Remove a filter or choose another category." : "Try a different word, or browse a category."}
            action={
              filters.length > 0 ? (
                <Button variant="secondary" onClick={() => setFilters([])}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {modules.slice(0, visible).map((learningModule) => (
                <ModuleCard key={learningModule.id} learningModule={learningModule} premiumAccess={premiumAccess} />
              ))}
            </div>
            {modules.length > visible ? (
              <div className="mt-6 flex justify-center">
                <Button variant="secondary" onClick={() => setVisible((value) => value + PAGE_SIZE)}>
                  Show {Math.min(PAGE_SIZE, modules.length - visible)} more
                </Button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}

export function CategoryCarousel({
  groups,
  activeId,
  onSelect,
}: {
  groups: Array<{ id: LibraryGroupId; label: string; modules: CatalogModule[] }>;
  activeId: LibraryGroupId;
  onSelect: (id: LibraryGroupId) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: true });
  const scroll = (direction: 1 | -1) =>
    scrollerRef.current?.scrollBy({ left: direction * scrollerRef.current.clientWidth * 0.8, behavior: "smooth" });
  const updateEdges = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  };

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onScroll={updateEdges}
        role="tablist"
        aria-label="Categories"
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {groups.map((group) => {
          const Icon = groupIcons[group.id];
          const isActive = group.id === activeId;
          const practised = group.modules.filter((m) => m.attemptCount > 0).length;

          return (
            <button
              key={group.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(group.id)}
              className={cn(
                "flex w-44 shrink-0 snap-start flex-col rounded-xl border p-4 text-left transition-colors",
                isActive ? "border-ink bg-ink text-paper" : "border-gray-200 bg-paper hover:border-gray-300 hover:bg-gray-50",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  isActive ? "bg-accent text-accent-ink" : "bg-gray-100",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="mt-3 text-sm font-bold">{group.label}</span>
              <span className={cn("mt-0.5 text-xs", isActive ? "text-paper/60" : "text-gray-500")}>
                {group.modules.length} module{group.modules.length === 1 ? "" : "s"}
                {practised > 0 && group.id !== "for-you" ? ` · ${practised} started` : ""}
              </span>
            </button>
          );
        })}
      </div>
      {(
        [
          [-1, ChevronLeft, edges.left],
          [1, ChevronRight, edges.right],
        ] as const
      ).map(([direction, Icon, show]) =>
        show ? (
          <div
            key={direction}
            className={cn(
              "pointer-events-none absolute inset-y-0 hidden w-20 items-center sm:flex",
              direction < 0 ? "left-0 justify-start bg-gradient-to-r from-paper via-paper/80 to-transparent" : "right-0 justify-end bg-gradient-to-l from-paper via-paper/80 to-transparent",
            )}
          >
            <button
              type="button"
              onClick={() => scroll(direction)}
              aria-label={direction > 0 ? "Scroll categories right" : "Scroll categories left"}
              className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-paper shadow-sm hover:bg-gray-50"
            >
              <Icon className="h-4 w-4" />
            </button>
          </div>
        ) : null,
      )}
    </div>
  );
}

export function ModuleCard({ learningModule, premiumAccess }: { learningModule: CatalogModule; premiumAccess: boolean }) {
  const total = learningModule.scenarios.length;
  const next =
    learningModule.scenarios.find((s) => !s.locked && !s.stats.passed) ?? learningModule.scenarios.find((s) => !s.locked);
  const locked = !learningModule.isFree && !premiumAccess;
  const started = learningModule.attemptCount > 0;

  return (
    <article className="flex flex-col rounded-xl border border-gray-200 p-5 transition-colors hover:border-gray-300">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
          <IndustryIcon category={learningModule.industryCategory} />
        </span>
        {learningModule.isFree ? <FreeBadge /> : locked ? <PremiumBadge /> : null}
      </div>
      <Link href={`/modules/${learningModule.id}`} className="mt-3 font-bold hover:underline">
        {learningModule.title}
      </Link>
      <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-500">{learningModule.description}</p>
      <p className="mt-3 text-xs text-gray-500">
        {learningModule.practiceType === "roleplay" ? "Role-play" : "Interpreting"} · {total} dialogue
        {total === 1 ? "" : "s"} · <span className="capitalize">{learningModule.difficultyLevel}</span>
      </p>
      {started && total > 0 ? (
        <div className="mt-3">
          <ProgressBar value={learningModule.passedCount / total} tone="accent" />
          <p className="mt-1 text-xs text-gray-500">
            {learningModule.passedCount} of {total} passed
          </p>
        </div>
      ) : null}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
        {next ? (
          <Button asChild size="sm">
            <Link href={`/practice/${next.id}`}>
              <Play className="h-3.5 w-3.5 fill-current" />
              {started ? "Continue" : locked ? "Try free dialogue" : "Start"}
            </Link>
          </Button>
        ) : null}
        <Button asChild size="sm" variant="ghost">
          <Link href={`/modules/${learningModule.id}`}>
            View module <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
