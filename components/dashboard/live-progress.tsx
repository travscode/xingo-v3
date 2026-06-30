"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressHistoryChart } from "@/components/dashboard/progress-history-chart";
import { api } from "@/convex/_generated/api";

type HistoryTabId = "scores" | "assessment" | "practice" | "coverage";
type QuickRangeId =
  | "overall"
  | "thisWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "custom";

const historyTabs: Array<{ id: HistoryTabId; label: string }> = [
  { id: "scores", label: "Scores" },
  { id: "assessment", label: "Assessment" },
  { id: "practice", label: "Practice" },
  { id: "coverage", label: "Coverage" },
];

const tabMetrics = {
  scores: ["averageScore", "bestScore"],
  assessment: [
    "accuracy",
    "terminology",
    "fluency",
    "turnManagement",
    "professionalism",
  ],
  practice: ["practiceMinutes", "attempts"],
  coverage: ["modulesPracticed", "scenariosPracticed"],
} as const;

const metricMeta = {
  averageScore: {
    label: "Average score",
    subtitle: "Average result across completed attempts in each time bucket.",
    formatValue: (value: number) => `${Math.round(value)}%`,
  },
  bestScore: {
    label: "Best score",
    subtitle: "Strongest score reached in each time bucket.",
    formatValue: (value: number) => `${Math.round(value)}%`,
  },
  accuracy: {
    label: "Accuracy",
    subtitle: "Average accuracy breakdown score over time.",
    formatValue: (value: number) => `${Math.round(value)}%`,
  },
  terminology: {
    label: "Terminology",
    subtitle: "Average terminology handling score over time.",
    formatValue: (value: number) => `${Math.round(value)}%`,
  },
  fluency: {
    label: "Fluency",
    subtitle: "Average fluency score across completed assessments.",
    formatValue: (value: number) => `${Math.round(value)}%`,
  },
  turnManagement: {
    label: "Turn management",
    subtitle: "Average turn management score across finished practice.",
    formatValue: (value: number) => `${Math.round(value)}%`,
  },
  professionalism: {
    label: "Professionalism",
    subtitle: "Average professionalism score across finished assessments.",
    formatValue: (value: number) => `${Math.round(value)}%`,
  },
  practiceMinutes: {
    label: "Practice time",
    subtitle: "Total finished practice minutes per time bucket.",
    formatValue: (value: number) =>
      value >= 60
        ? `${(value / 60).toFixed(value % 60 === 0 ? 0 : 1)}h`
        : `${Math.round(value)}m`,
  },
  attempts: {
    label: "Attempts",
    subtitle: "Completed practice attempts per time bucket.",
    formatValue: (value: number) => `${Math.round(value)}`,
  },
  modulesPracticed: {
    label: "Modules practiced",
    subtitle: "Unique modules completed in each time bucket.",
    formatValue: (value: number) => `${Math.round(value)}`,
  },
  scenariosPracticed: {
    label: "Scenarios practiced",
    subtitle: "Unique scenarios completed in each time bucket.",
    formatValue: (value: number) => `${Math.round(value)}`,
  },
} as const;

/**
 * Formats a JavaScript date as a native date-input string.
 */
function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns the Monday of the current local week.
 */
function getStartOfWeek(date: Date) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

/**
 * Computes preset date filters used by the progress quick-range buttons.
 */
function getQuickRange(range: Exclude<QuickRangeId, "custom">) {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  if (range === "overall") {
    return { startDate: "", endDate: "" };
  }

  if (range === "thisWeek") {
    return {
      startDate: toDateInputValue(getStartOfWeek(today)),
      endDate: toDateInputValue(now),
    };
  }

  if (range === "thisMonth") {
    return {
      startDate: toDateInputValue(
        new Date(now.getFullYear(), now.getMonth(), 1),
      ),
      endDate: toDateInputValue(now),
    };
  }

  if (range === "lastMonth") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return {
      startDate: toDateInputValue(start),
      endDate: toDateInputValue(end),
    };
  }

  return {
    startDate: toDateInputValue(new Date(now.getFullYear(), 0, 1)),
    endDate: toDateInputValue(now),
  };
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

export function LiveProgress() {
  const [selectedTab, setSelectedTab] = useState<HistoryTabId>("scores");
  const [selectedMetric, setSelectedMetric] =
    useState<(typeof tabMetrics)[HistoryTabId][number]>("averageScore");
  const [selectedRange, setSelectedRange] = useState<QuickRangeId>("overall");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("all");
  const [selectedScenarioId, setSelectedScenarioId] = useState("all");
  const sessions = useQuery(api.sessions.listForCurrentUser, {});
  const modules = useQuery(api.modules.list, {});
  const scenarios = useQuery(api.scenarios.list, {});
  const history = useQuery(api.sessions.progressHistoryForCurrentUser, {
    metric: selectedMetric,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    moduleId: selectedModuleId !== "all" ? selectedModuleId : undefined,
    scenarioId: selectedScenarioId !== "all" ? selectedScenarioId : undefined,
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
  const visibleScenarios = useMemo(() => {
    return (scenarios ?? []).filter(
      (scenario) =>
        selectedModuleId === "all" || scenario.moduleId === selectedModuleId,
    );
  }, [scenarios, selectedModuleId]);
  const completedSessions = useMemo(
    () =>
      (sessions ?? []).filter(
        (session) =>
          session.completionStatus !== "in_progress" &&
          matchesProgressFilters(session, {
            startDate,
            endDate,
            moduleId: selectedModuleId,
            scenarioId: selectedScenarioId,
          }),
      ),
    [endDate, selectedModuleId, selectedScenarioId, sessions, startDate],
  );
  const activeMetricMeta = metricMeta[selectedMetric];

  if (!sessions || !scenarios || !modules || !history) {
    return <div className="surface-card h-64 rounded-[2rem] animate-pulse" />;
  }

  return (
    <div className="space-y-8">
      <section className="section-frame rounded-[2.25rem] p-6 lg:p-8">
        <div>
          <p className="eyebrow">Progress</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">
            Track your performance over time.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Explore average score, assessment breakdowns, practice time, and
            coverage trends across all work, a single module, or one scenario.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Average score"
          value={`${history.summary.averageScore}%`}
        />
        <StatCard label="Best score" value={`${history.summary.bestScore}%`} />
        <StatCard
          label="Practice time"
          value={metricMeta.practiceMinutes.formatValue(
            history.summary.practiceMinutes,
          )}
        />
        <StatCard
          label="Completed attempts"
          value={`${history.summary.attemptCount}`}
        />
      </section>

      <section className="surface-card rounded-[2rem] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">History</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
              Trend explorer
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Modules practiced"
              value={`${history.summary.uniqueModules}`}
            />
            <StatCard
              label="Scenarios practiced"
              value={`${history.summary.uniqueScenarios}`}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {historyTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSelectedTab(tab.id);
                setSelectedMetric(tabMetrics[tab.id][0]);
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                selectedTab === tab.id
                  ? "bg-brand text-white"
                  : "border border-line bg-white text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tabMetrics[selectedTab].map((metric) => (
            <button
              key={metric}
              type="button"
              onClick={() => setSelectedMetric(metric)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                selectedMetric === metric
                  ? "bg-brand/10 text-brand"
                  : "border border-line bg-white text-muted hover:text-foreground"
              }`}
            >
              {metricMeta[metric].label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.5rem] border border-line bg-[#fafafa] p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Quick range
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  ["thisWeek", "This week"],
                  ["thisMonth", "This month"],
                  ["lastMonth", "Last month"],
                  ["thisYear", "This year"],
                  ["overall", "Overall"],
                ] as const
              ).map(([rangeId, label]) => (
                <button
                  key={rangeId}
                  type="button"
                  onClick={() => {
                    const range = getQuickRange(rangeId);
                    setSelectedRange(rangeId);
                    setStartDate(range.startDate);
                    setEndDate(range.endDate);
                  }}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    selectedRange === rangeId
                      ? "bg-brand text-white"
                      : "border border-line bg-white text-muted hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-line bg-[#fafafa] p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Filters
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-muted">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em]">
                  Start date
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => {
                    setSelectedRange("custom");
                    setStartDate(event.target.value);
                  }}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-foreground"
                />
              </label>
              <label className="text-sm text-muted">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em]">
                  End date
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => {
                    setSelectedRange("custom");
                    setEndDate(event.target.value);
                  }}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-foreground"
                />
              </label>
              <label className="text-sm text-muted">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em]">
                  Module
                </span>
                <select
                  value={selectedModuleId}
                  onChange={(event) => {
                    const nextModuleId = event.target.value;
                    setSelectedModuleId(nextModuleId);
                    const scenarioStillMatches =
                      selectedScenarioId === "all" ||
                      (scenarios ?? []).some(
                        (scenario) =>
                          scenario.id === selectedScenarioId &&
                          (nextModuleId === "all" ||
                            scenario.moduleId === nextModuleId),
                      );

                    if (!scenarioStillMatches) {
                      setSelectedScenarioId("all");
                    }
                  }}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-foreground"
                >
                  <option value="all">All modules</option>
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-muted">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em]">
                  Scenario
                </span>
                <select
                  value={selectedScenarioId}
                  onChange={(event) => {
                    const nextScenarioId = event.target.value;
                    setSelectedScenarioId(nextScenarioId);
                    if (nextScenarioId === "all") {
                      return;
                    }

                    const matchedScenario = scenarios.find(
                      (scenario) => scenario.id === nextScenarioId,
                    );

                    if (matchedScenario && selectedModuleId === "all") {
                      setSelectedModuleId(matchedScenario.moduleId);
                    }
                  }}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-foreground"
                >
                  <option value="all">All scenarios</option>
                  {visibleScenarios.map((scenario) => (
                    <option key={scenario.id} value={scenario.id}>
                      {scenario.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <ProgressHistoryChart
            title={activeMetricMeta.label}
            subtitle={activeMetricMeta.subtitle}
            points={history.points}
            formatValue={activeMetricMeta.formatValue}
          />
        </div>
      </section>

      <section className="surface-card rounded-[2rem] p-6">
        <p className="eyebrow">Attempt history</p>
        <div className="mt-5 space-y-3">
          {completedSessions.map((session) => (
            <div
              key={session._id}
              className="rounded-[1.5rem] border border-line bg-white p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold">
                    {scenarioTitleById.get(session.scenarioId) ??
                      session.scenarioId}
                  </div>
                  <div className="mt-1 text-sm text-muted">
                    {moduleTitleById.get(session.moduleId) ?? session.moduleId}{" "}
                    · {new Date(session.timestamp).toLocaleDateString("en-AU")}{" "}
                    · {session.durationMinutes} min ·{" "}
                    {session.completionStatus.replace("_", " ")}
                  </div>
                </div>
                <div className="score-pill rounded-full px-3 py-1.5 text-sm font-semibold">
                  {session.score}%
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href={`/practice/${session.scenarioId}?attemptId=${session.id}`}
                  className="text-sm font-semibold text-brand underline-offset-4 hover:underline"
                >
                  View practice results
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
      </section>
    </div>
  );
}
