"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, CalendarDays, Clock, Download, History, Mic, Target, Timer, Trophy } from "lucide-react";
import { StatusIcon } from "@/components/ui/status-icon";
import { useQuery } from "convex/react";
import { Card, PageHeader, Skeleton } from "@/components/ui/primitives";
import { AchievementBadges } from "@/components/dashboard/achievement-badges";
import { ProgressHistoryChart } from "@/components/dashboard/progress-history-chart";
import { Button } from "@/components/ui/button";
import { displayMaxScore, isCclModule, isPassingScore, toDisplayScore } from "@/lib/scoring";
import { useActiveLanguagePair, useProgressPair } from "@/components/providers/language-pair-context";
import { pairLabel } from "@/lib/languages";
import { api } from "@/convex/_generated/api";

type PeriodId = "all" | "7d" | "30d" | "90d" | "year" | "custom";

/** What the chart can show. Each view maps to one or two metrics. */
const viewOptions = [
  { id: "scores", group: "Scores", label: "Average and best score", metrics: ["averageScore", "bestScore"] },
  { id: "averageScore", group: "Scores", label: "Average score", metrics: ["averageScore"] },
  { id: "passRate", group: "Scores", label: "Pass rate", metrics: ["passRate"] },
  { id: "accuracy", group: "Skills", label: "Accuracy", metrics: ["accuracy"] },
  { id: "terminology", group: "Skills", label: "Terminology", metrics: ["terminology"] },
  { id: "fluency", group: "Skills", label: "Fluency", metrics: ["fluency"] },
  { id: "turnManagement", group: "Skills", label: "Turn management", metrics: ["turnManagement"] },
  { id: "professionalism", group: "Skills", label: "Professionalism", metrics: ["professionalism"] },
  { id: "practiceMinutes", group: "Activity", label: "Practice time", metrics: ["practiceMinutes"] },
  { id: "attempts", group: "Activity", label: "Scored sessions", metrics: ["attempts"] },
  { id: "scenariosPracticed", group: "Activity", label: "Different dialogues practised", metrics: ["scenariosPracticed"] },
] as const;

type ViewId = (typeof viewOptions)[number]["id"];

const periodOptions: Array<{ id: PeriodId; label: string }> = [
  { id: "all", label: "All time" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
  { id: "year", label: "This year" },
  { id: "custom", label: "Custom dates…" },
];

const metricMeta = {
  averageScore: {
    label: "Average score",
    subtitle: "Average score out of 100 across scored sessions.",
    formatValue: (value: number) => `${Math.round(value)}`,
  },
  bestScore: {
    label: "Best score",
    subtitle: "Your best score out of 100 in each period.",
    formatValue: (value: number) => `${Math.round(value)}`,
  },
  averageScore90: {
    label: "Average score (/90)",
    subtitle:
      "Average NAATI CCL-style score out of 90.",
    formatValue: (value: number) => `${Math.round(value)}/90`,
  },
  bestScore90: {
    label: "Best score (/90)",
    subtitle: "Your best CCL-style score out of 90.",
    formatValue: (value: number) => `${Math.round(value)}/90`,
  },
  passRate: {
    label: "Pass rate",
    subtitle:
      "Share of scored sessions at or above the pass mark.",
    formatValue: (value: number) => `${Math.round(value)}%`,
  },
  accuracy: {
    label: "Accuracy",
    subtitle: "How completely and faithfully you carried meaning (out of 100).",
    formatValue: (value: number) => `${Math.round(value)}`,
  },
  terminology: {
    label: "Terminology",
    subtitle: "How well you handled specialist terms (out of 100).",
    formatValue: (value: number) => `${Math.round(value)}`,
  },
  fluency: {
    label: "Fluency",
    subtitle: "How natural your delivery sounded (out of 100).",
    formatValue: (value: number) => `${Math.round(value)}`,
  },
  turnManagement: {
    label: "Turn management",
    subtitle: "How promptly and correctly you relayed each turn (out of 100).",
    formatValue: (value: number) => `${Math.round(value)}`,
  },
  professionalism: {
    label: "Professionalism",
    subtitle: "First person, no added commentary, appropriate register (out of 100).",
    formatValue: (value: number) => `${Math.round(value)}`,
  },
  practiceMinutes: {
    label: "Practice time",
    subtitle: "Minutes spent in scored sessions.",
    formatValue: (value: number) =>
      value >= 60
        ? `${(value / 60).toFixed(value % 60 === 0 ? 0 : 1)}h`
        : `${Math.round(value)}m`,
  },
  attempts: {
    label: "Scored sessions",
    subtitle: "How many sessions were scored.",
    formatValue: (value: number) => `${Math.round(value)}`,
  },
  modulesPracticed: {
    label: "Courses practised",
    subtitle: "Different courses you practised.",
    formatValue: (value: number) => `${Math.round(value)}`,
  },
  scenariosPracticed: {
    label: "Dialogues practised",
    subtitle: "Different dialogues you practised.",
    formatValue: (value: number) => `${Math.round(value)}`,
  },
} as const;

type MetricId = keyof typeof metricMeta;

const ATTEMPT_HISTORY_PAGE_SIZE = 10;
const ATTEMPT_HISTORY_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

const metricColors: Record<MetricId, string> = {
  averageScore: "#000000",
  bestScore: "#276ef1",
  averageScore90: "#000000",
  bestScore90: "#276ef1",
  passRate: "#05944f",
  accuracy: "#000000",
  terminology: "#276ef1",
  fluency: "#05944f",
  turnManagement: "#6b6b6b",
  professionalism: "#b58a00",
  practiceMinutes: "#000000",
  attempts: "#276ef1",
  modulesPracticed: "#000000",
  scenariosPracticed: "#276ef1",
};

/**
 * Escapes a value for safe inclusion in CSV output.
 */
function escapeCsvValue(value: string | number) {
  const normalized = String(value ?? "");
  if (
    normalized.includes(",") ||
    normalized.includes('"') ||
    normalized.includes("\n")
  ) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

/**
 * Downloads a CSV file in the browser without leaving the current page.
 */
function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Builds a CSV export from the currently displayed chart series.
 */
function buildChartCsvRows(
  series: Array<{
    label: string;
    points: Array<{
      bucketStart: string;
      bucketLabel: string;
      value: number;
      attemptCount: number;
    }>;
    formatValue: (value: number) => string;
  }>,
) {
  const referencePoints = series[0]?.points ?? [];
  const header = [
    "Bucket start",
    "Bucket label",
    "Attempt count",
    ...series.map((item) => item.label),
  ];
  const rows = referencePoints.map((point, index) => [
    point.bucketStart,
    point.bucketLabel,
    String(point.attemptCount),
    ...series.map((item) => item.formatValue(item.points[index]?.value ?? 0)),
  ]);
  return [header, ...rows];
}

/**
 * Formats a JavaScript date as a native date-input string.
 */
function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Start/end dates (inclusive, yyyy-mm-dd) for a preset period. */
function getPeriodRange(period: Exclude<PeriodId, "custom">) {
  const now = new Date();

  if (period === "all") {
    return { startDate: "", endDate: "" };
  }

  if (period === "year") {
    return { startDate: toDateInputValue(new Date(now.getFullYear(), 0, 1)), endDate: toDateInputValue(now) };
  }

  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const start = new Date(now);
  start.setDate(start.getDate() - (days - 1));
  return { startDate: toDateInputValue(start), endDate: toDateInputValue(now) };
}

/**
 * Checks whether one completed session matches the active filter state.
 */
function matchesProgressFilters(
  session: {
    moduleId: string;
    scenarioId: string;
    timestamp: string;
  },
  filters: {
    startDate: string;
    endDate: string;
    moduleId: string;
    scenarioId: string;
  },
) {
  if (filters.moduleId !== "all" && session.moduleId !== filters.moduleId) {
    return false;
  }

  if (
    filters.scenarioId !== "all" &&
    session.scenarioId !== filters.scenarioId
  ) {
    return false;
  }

  const sessionDate = session.timestamp.slice(0, 10);
  if (filters.startDate && sessionDate < filters.startDate) {
    return false;
  }

  if (filters.endDate && sessionDate > filters.endDate) {
    return false;
  }

  return true;
}

/**
 * Returns a compact page-number model with ellipses for large result sets.
 */
function getVisibleHistoryPages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages] as const;
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ] as const;
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ] as const;
}

/**
 * Renders the paginated attempt-history controls above or below the list.
 */
function AttemptHistoryPaginationControls({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  if (totalItems === 0) {
    return null;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const visiblePages = getVisibleHistoryPages(currentPage, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
        <span>
          Showing {startItem} - {endItem} of {totalItems}
        </span>
        <label className="flex items-center gap-2">
          <span>Per page</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="rounded-lg border border-gray-200 bg-paper px-2 py-1.5 text-ink outline-none"
            aria-label="Attempts per page"
          >
            {ATTEMPT_HISTORY_PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        {visiblePages.map((page, index) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis_${index}`}
              className="px-2 py-1 text-sm text-muted"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                currentPage === page
                  ? "bg-ink text-paper"
                  : "border border-gray-200 bg-paper text-gray-500 hover:text-ink"
              }`}
            >
              {page}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function LiveProgress() {
  const [view, setView] = useState<ViewId>("scores");
  const [period, setPeriod] = useState<PeriodId>("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  /** "all", "module:<id>" or "scenario:<id>" */
  const [scope, setScope] = useState("all");
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(
    ATTEMPT_HISTORY_PAGE_SIZE,
  );
  const pair = useProgressPair();
  const { activePair } = useActiveLanguagePair();
  const sessions = useQuery(api.sessions.listForCurrentUser, { pair });
  const modules = useQuery(api.modules.list, {});
  const scenarios = useQuery(api.scenarios.list, {});

  const { startDate, endDate } =
    period === "custom" ? { startDate: customStart, endDate: customEnd } : getPeriodRange(period);
  const selectedModuleId = scope.startsWith("module:")
    ? scope.slice("module:".length)
    : scope.startsWith("scenario:")
      ? (scenarios ?? []).find((scenario) => scenario.id === scope.slice("scenario:".length))?.moduleId ?? "all"
      : "all";
  const selectedScenarioId = scope.startsWith("scenario:") ? scope.slice("scenario:".length) : "all";
  // NAATI CCL is scored out of 90; switch scales when looking only at CCL.
  const useCclScale = selectedModuleId !== "all" && isCclModule(selectedModuleId);
  const viewOption = viewOptions.find((option) => option.id === view) ?? viewOptions[0];

  const activeMetrics = useMemo<MetricId[]>(
    () =>
      viewOption.metrics.map((metric) =>
        useCclScale && metric === "averageScore"
          ? "averageScore90"
          : useCclScale && metric === "bestScore"
            ? "bestScore90"
            : metric,
      ),
    [useCclScale, viewOption],
  );
  const history = useQuery(api.sessions.progressHistoryForCurrentUser, {
    metrics: activeMetrics,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    moduleId: selectedModuleId !== "all" ? selectedModuleId : undefined,
    scenarioId: selectedScenarioId !== "all" ? selectedScenarioId : undefined,
    pair,
  });
  const scenarioTitleById = useMemo(
    () =>
      new Map(
        (scenarios ?? []).map((scenario) => [scenario.id, scenario.title]),
      ),
    [scenarios],
  );
  const moduleTitleById = useMemo(
    () => new Map((modules ?? []).map((module) => [module.id, module.title])),
    [modules],
  );
  const completedSessions = useMemo(
    () =>
      (sessions ?? []).filter(
        (session) =>
          (session.completionStatus === "completed" ||
            session.completionStatus === "needs_review") &&
          matchesProgressFilters(session, {
            startDate,
            endDate,
            moduleId: selectedModuleId,
            scenarioId: selectedScenarioId,
          }),
      ),
    [endDate, selectedModuleId, selectedScenarioId, sessions, startDate],
  );
  const totalHistoryPages = Math.max(
    1,
    Math.ceil(completedSessions.length / historyPageSize),
  );
  const currentHistoryPage = Math.min(historyPage, totalHistoryPages);
  const paginatedCompletedSessions = useMemo(() => {
    const startIndex = (currentHistoryPage - 1) * historyPageSize;
    return completedSessions.slice(startIndex, startIndex + historyPageSize);
  }, [completedSessions, currentHistoryPage, historyPageSize]);

  if (!sessions || !scenarios || !modules || !history) {
    return <Skeleton className="h-64" />;
  }

  const chartSeries = history.series.map((item) => ({
    id: item.metric,
    label: metricMeta[item.metric].label,
    color: metricColors[item.metric],
    points: item.points,
    formatValue: metricMeta[item.metric].formatValue,
  }));
  const chartTitle = viewOption.label;
  const chartSubtitle =
    viewOption.id === "scores"
      ? `Your average and best result in each ${history.bucket}.`
      : `${metricMeta[activeMetrics[0]].subtitle}`;

  const scopeLabel =
    selectedScenarioId !== "all"
      ? scenarioTitleById.get(selectedScenarioId) ?? "One dialogue"
      : selectedModuleId !== "all"
        ? `${moduleTitleById.get(selectedModuleId) ?? "One course"} (all dialogues)`
        : "all dialogues";
  const periodLabel =
    period === "custom"
      ? customStart || customEnd
        ? `${customStart ? new Date(customStart).toLocaleDateString() : "the start"} to ${customEnd ? new Date(customEnd).toLocaleDateString() : "today"}`
        : "all time"
      : (periodOptions.find((option) => option.id === period)?.label ?? "").toLowerCase();
  const isFiltered = view !== "scores" || period !== "all" || scope !== "all";
  const scoreSuffix = useCclScale ? "/90" : "";
  const formatScore = (value: number) => (useCclScale ? `${value}/90` : `${value}`);

  const resetFilters = () => {
    setView("scores");
    setPeriod("all");
    setCustomStart("");
    setCustomEnd("");
    setScope("all");
    setHistoryPage(1);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Progress"
        description={`Scores from assessed sessions in ${pairLabel(activePair)}. Practice sessions aren't included. Switch language at the top to see another pair.`}
      />
      <AchievementBadges sessions={sessions} modules={modules} />
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Average score"
          value={formatScore(useCclScale ? history.summary.averageScore90 : history.summary.averageScore)}
        />
        <StatCard
          label="Best score"
          value={formatScore(useCclScale ? history.summary.bestScore90 : history.summary.bestScore)}
        />
        {useCclScale ? (
          <StatCard label="Pass rate" value={`${history.summary.passRate}%`} />
        ) : (
          <StatCard
            label="Practice time"
            value={metricMeta.practiceMinutes.formatValue(history.summary.practiceMinutes)}
          />
        )}
        <StatCard label="Scored sessions" value={`${history.summary.attemptCount}`} />
      </section>

      <Card className="p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,1.4fr)_auto] lg:items-end">
          <FilterField label="Show" htmlFor="progress-view">
            <select
              id="progress-view"
              value={view}
              onChange={(event) => {
                setView(event.target.value as ViewId);
                setHistoryPage(1);
              }}
              className={selectClass}
            >
              {(["Scores", "Skills", "Activity"] as const).map((group) => (
                <optgroup key={group} label={group}>
                  {viewOptions
                    .filter((option) => option.group === group)
                    .map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </FilterField>

          <FilterField label="Period" htmlFor="progress-period">
            <select
              id="progress-period"
              value={period}
              onChange={(event) => {
                setPeriod(event.target.value as PeriodId);
                setHistoryPage(1);
              }}
              className={selectClass}
            >
              {periodOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Dialogues" htmlFor="progress-scope">
            <select
              id="progress-scope"
              value={scope}
              onChange={(event) => {
                setScope(event.target.value);
                setHistoryPage(1);
              }}
              className={selectClass}
            >
              <option value="all">Everything I&apos;ve practised</option>
              {modules.map((learningModule) => (
                <optgroup key={learningModule.id} label={learningModule.title}>
                  <option value={`module:${learningModule.id}`}>All of {learningModule.title}</option>
                  {scenarios
                    .filter((scenario) => scenario.moduleId === learningModule.id)
                    .map((scenario) => (
                      <option key={scenario.id} value={`scenario:${scenario.id}`}>
                        {scenario.title}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </FilterField>

          <Button
            variant="outline"
            className="sm:col-span-2 lg:col-span-1"
            onClick={() => {
              downloadCsv(`xingo-progress-${view}.csv`, buildChartCsvRows(chartSeries));
            }}
            disabled={chartSeries.every((series) => series.points.length === 0)}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {period === "custom" ? (
          <div className="mt-3 grid gap-3 rounded-xl bg-gray-50 p-3 sm:grid-cols-2">
            <FilterField label="From" htmlFor="progress-from">
              <input
                id="progress-from"
                type="date"
                value={customStart}
                max={customEnd || undefined}
                onChange={(event) => {
                  setCustomStart(event.target.value);
                  setHistoryPage(1);
                }}
                className={selectClass}
              />
            </FilterField>
            <FilterField label="To" htmlFor="progress-to">
              <input
                id="progress-to"
                type="date"
                value={customEnd}
                min={customStart || undefined}
                onChange={(event) => {
                  setCustomEnd(event.target.value);
                  setHistoryPage(1);
                }}
                className={selectClass}
              />
            </FilterField>
          </div>
        ) : null}

        <p className="mt-4 text-sm text-gray-500">
          Showing <span className="font-semibold text-ink">{viewOption.label.toLowerCase()}</span> for{" "}
          <span className="font-semibold text-ink">{scopeLabel}</span>, {periodLabel}
          {" "}· {history.summary.attemptCount} scored session{history.summary.attemptCount === 1 ? "" : "s"}
          {scoreSuffix ? " · CCL scores out of 90" : ""}.
          {isFiltered ? (
            <>
              {" "}
              <button type="button" onClick={resetFilters} className="font-semibold text-ink underline underline-offset-2">
                Reset
              </button>
            </>
          ) : null}
        </p>

        <div className="mt-6">
          <ProgressHistoryChart
            title={chartTitle}
            subtitle={chartSubtitle}
            series={chartSeries}
          />
        </div>
      </Card>

      <section className="surface-card rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-lg font-bold">
            <History className="h-4 w-4" aria-hidden /> Attempt history
          </p>
          {completedSessions.length > 0 ? (
            <div className="text-sm text-muted">
              Page {currentHistoryPage} of {totalHistoryPages}
            </div>
          ) : null}
        </div>
        {completedSessions.length > 0 ? (
          <div className="mt-5 border-b border-line pb-4">
            <AttemptHistoryPaginationControls
              currentPage={currentHistoryPage}
              totalPages={totalHistoryPages}
              totalItems={completedSessions.length}
              pageSize={historyPageSize}
              onPageChange={setHistoryPage}
              onPageSizeChange={(pageSize) => {
                setHistoryPageSize(pageSize);
                setHistoryPage(1);
              }}
            />
          </div>
        ) : null}
        <div className="mt-5 space-y-3">
          {paginatedCompletedSessions.map((session) => (
            <div
              key={session._id}
              className="rounded-xl border border-line bg-white p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <StatusIcon passed={isPassingScore(session.moduleId, session.score)} />
                  <div className="min-w-0">
                    <div className="font-semibold">
                      {scenarioTitleById.get(session.scenarioId) ?? session.scenarioId}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" aria-hidden />
                        {moduleTitleById.get(session.moduleId) ?? session.moduleId}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                        {new Date(session.timestamp).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" aria-hidden />
                        {session.durationMinutes} min
                      </span>
                    </div>
                  </div>
                </div>
                <div className="score-pill rounded-md px-3 py-1.5 text-sm font-semibold tabular-nums">
                  {toDisplayScore(session.moduleId, session.score)}/{displayMaxScore(session.moduleId)}
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href={`/results/${session.id}`}
                  className="text-sm font-semibold underline-offset-4 hover:underline"
                >
                  View results
                </Link>
              </div>
            </div>
          ))}
          {completedSessions.length === 0 ? (
            <p className="text-sm text-muted">
              No completed practice attempts match the current filters yet.
            </p>
          ) : null}
        </div>
        {completedSessions.length > historyPageSize ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <AttemptHistoryPaginationControls
              currentPage={currentHistoryPage}
              totalPages={totalHistoryPages}
              totalItems={completedSessions.length}
              pageSize={historyPageSize}
              onPageChange={setHistoryPage}
              onPageSizeChange={(pageSize) => {
                setHistoryPageSize(pageSize);
                setHistoryPage(1);
              }}
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}

const statIcons: Record<string, React.ReactNode> = {
  "Average score": <Target className="h-3.5 w-3.5" aria-hidden />,
  "Best score": <Trophy className="h-3.5 w-3.5" aria-hidden />,
  "Pass rate": <Trophy className="h-3.5 w-3.5" aria-hidden />,
  "Practice time": <Timer className="h-3.5 w-3.5" aria-hidden />,
  "Scored sessions": <Mic className="h-3.5 w-3.5" aria-hidden />,
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <p className="flex items-center gap-1.5 text-sm text-gray-500">
        {statIcons[label]}
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold tracking-[-0.03em] tabular-nums">{value}</p>
    </Card>
  );
}

const selectClass =
  "h-11 w-full min-w-0 appearance-none rounded-lg border border-gray-200 bg-paper bg-[length:16px] bg-[right_12px_center] bg-no-repeat pl-3 pr-9 text-sm font-semibold text-ink outline-none focus:border-ink [background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b6b6b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")] [&[type=date]]:bg-none [&[type=date]]:pr-3";

function FilterField({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-semibold text-gray-500">
        {label}
      </label>
      {children}
    </div>
  );
}
