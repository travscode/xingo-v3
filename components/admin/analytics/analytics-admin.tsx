"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAction, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import { ANALYTICS_RANGES, bucketLabel, type AnalyticsRange } from "@/lib/admin-analytics";
import { friendlyError } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { Card, SectionTitle, Skeleton } from "@/components/ui/primitives";
import { BarList, ChartCard, TimeChart } from "@/components/admin/analytics/charts";

type Dashboard = FunctionReturnType<typeof api.adminAnalytics.dashboard>;
type Revenue = FunctionReturnType<typeof api.adminActions.revenueSeries>;

const count = (n: number) => Math.round(n).toLocaleString("en-AU");
const usd = (n: number) =>
  `US$${n.toLocaleString("en-AU", { minimumFractionDigits: n > 0 && n < 10 ? 2 : 0, maximumFractionDigits: n < 10 ? 2 : 0 })}`;
const usdFine = (n: number) => `US$${n.toFixed(n < 1 ? 3 : 2)}`;
const money = (cents: number, currency = "aud") =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: currency.toUpperCase(), maximumFractionDigits: 0 }).format(cents / 100);
const pct = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : "—");

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = Array.from({ length: 24 }, (_, h) => (h === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`));

/** "+12% vs previous 30 days", with the arrow and tone saying whether that's good. */
function Change({ value, range, lowerIsBetter = false }: { value: number | null; range: AnalyticsRange; lowerIsBetter?: boolean }) {
  if (range === "all") return <span>All time</span>;
  const period = ANALYTICS_RANGES.find((r) => r.id === range)?.label ?? "";
  if (value === null) return <span>Nothing in the previous {period} to compare</span>;
  const good = value === 0 ? null : lowerIsBetter ? value < 0 : value > 0;
  return (
    <span>
      <span className={cn("font-semibold", good === true && "text-success", good === false && "text-record")}>
        {value > 0 ? "▲" : value < 0 ? "▼" : "■"} {Math.abs(value)}%
      </span>{" "}
      vs previous {period}
    </span>
  );
}

function Tile({ label, value, hint }: { label: string; value: ReactNode; hint: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{hint}</p>
    </div>
  );
}

export function AnalyticsAdmin() {
  const [range, setRange] = useState<AnalyticsRange>("30d");
  const [includeAdmins, setIncludeAdmins] = useState(false);
  const data = useQuery(api.adminAnalytics.dashboard, { range, includeAdmins });

  const loadRevenue = useAction(api.adminActions.revenueSeries);
  const [revenue, setRevenue] = useState<{ range: AnalyticsRange; data: Revenue } | null>(null);
  const [failed, setFailed] = useState<{ range: AnalyticsRange; message: string } | null>(null);
  const revenueError = failed?.range === range ? failed.message : null;
  useEffect(() => {
    let live = true;
    void loadRevenue({ range })
      .then((result) => live && setRevenue({ range, data: result }))
      .catch((error) => live && setFailed({ range, message: friendlyError(error, "Couldn't reach Stripe.") }));
    return () => {
      live = false;
    };
  }, [loadRevenue, range]);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg bg-gray-100 p-1" role="group" aria-label="Period">
          {ANALYTICS_RANGES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={range === item.id}
              onClick={() => setRange(item.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-semibold",
                range === item.id ? "bg-paper text-ink shadow-sm" : "text-gray-500 hover:text-ink",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-500">
          <input type="checkbox" checked={includeAdmins} onChange={(event) => setIncludeAdmins(event.target.checked)} />
          Include admin accounts
        </label>
        <span className="text-xs text-gray-500 sm:ml-auto">
          {range === "30d" ? "By day" : range === "90d" ? "By week (from Monday)" : "By month"} · Australian Eastern time
        </span>
      </div>

      {!data ? <Skeleton className="h-[640px]" /> : <Body data={data} range={range} revenue={revenue?.range === range ? revenue.data : null} revenueError={revenueError} />}
    </div>
  );
}

function Body({
  data,
  range,
  revenue,
  revenueError,
}: {
  data: Dashboard;
  range: AnalyticsRange;
  revenue: Revenue | null;
  revenueError: string | null;
}) {
  const labels = data.keys.map((key) => bucketLabel(key, data.granularity));
  const { current, change, series } = data;
  const signupsInRange = data.funnel[0]?.count ?? 0;
  const paidRevenue = revenue?.configured ? revenue.totalGrossCents - revenue.totalRefundedCents : null;

  return (
    <>
      {/* Headline numbers */}
      <section>
        <Card className="grid grid-cols-2 gap-x-6 gap-y-7 p-6 lg:grid-cols-4">
          <Tile label="New sign-ups" value={count(current.signups)} hint={<Change value={change.signups} range={range} />} />
          <Tile label="Active learners" value={count(current.activeLearners)} hint={<Change value={change.activeLearners} range={range} />} />
          <Tile label="Sessions" value={count(current.sessions)} hint={<Change value={change.sessions} range={range} />} />
          <Tile label="Practice minutes" value={count(current.minutes)} hint={<Change value={change.minutes} range={range} />} />
          <Tile
            label="Revenue (Stripe)"
            value={paidRevenue === null ? (revenueError ? "—" : <Skeleton className="h-8 w-24" />) : money(paidRevenue, revenue?.configured ? revenue.currency : "aud")}
            hint={
              revenue?.configured
                ? `${count(revenue.totalPayments)} payments${revenue.totalRefundedCents ? `, ${money(revenue.totalRefundedCents, revenue.currency)} refunded` : ""}`
                : revenue && !revenue.configured
                  ? "Stripe isn't connected"
                  : revenueError ?? "Loading from Stripe…"
            }
          />
          <Tile label="Est. AI cost" value={usd(current.costUsd)} hint={<Change value={change.costUsd} range={range} lowerIsBetter />} />
          <Tile
            label="AI cost per minute"
            value={current.minutes ? usdFine(current.costPerMinuteUsd) : "—"}
            hint={<Change value={change.costPerMinuteUsd} range={range} lowerIsBetter />}
          />
          <Tile
            label="Sessions scored"
            value={current.sessions ? `${current.gradedRate}%` : "—"}
            hint={current.averageScore ? `Average score ${current.averageScore}` : "No scored sessions yet"}
          />
        </Card>
        <p className="mt-2 text-xs text-gray-500">
          {data.totals.excludedAdmins
            ? `${data.totals.excludedAdmins} admin accounts left out. `
            : "Admin accounts included. "}
          AI cost is an estimate from token counts (lib/costs.ts), in US dollars. Revenue is what Stripe charged, in{" "}
          {revenue?.configured ? revenue.currency.toUpperCase() : "AUD"}, before fees.
        </p>
      </section>

      {/* Growth */}
      <section>
        <SectionTitle>Growth</SectionTitle>
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Accounts" value={count(data.totals.users)} hint={`${count(data.totals.onboarded)} finished onboarding · ${data.totals.pro} on Pro · ${data.totals.packBuyers} bought packs`}>
            <TimeChart kind="line" labels={labels} series={[{ label: "Accounts", values: series.totalUsers }]} />
          </ChartCard>
          <ChartCard title="Sign-ups" value={count(current.signups)}>
            <TimeChart
              labels={labels}
              series={[
                { label: "Finished onboarding", values: series.signups.map((n, i) => Math.min(n, series.onboarded[i])) },
                { label: "Didn't finish yet", values: series.signups.map((n, i) => Math.max(0, n - series.onboarded[i])), tone: "soft" },
              ]}
            />
          </ChartCard>
        </div>
      </section>

      {/* Engagement */}
      <section>
        <SectionTitle>Usage</SectionTitle>
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            title="Active learners"
            value={count(current.activeLearners)}
            hint={range === "all" ? "Learners who started at least one session. “First time” = their first session ever." : "Learners who started at least one session. “First time” = no session in the period before."}
          >
            <TimeChart
              kind="line"
              labels={labels}
              series={[
                { label: "Active", values: series.activeLearners },
                { label: "First time", values: series.newLearners, tone: "soft" },
              ]}
            />
          </ChartCard>
          <ChartCard title="Sessions" value={count(current.sessions)} hint="Scored = graded with a result. Not scored = left early, practice mode or couldn't be graded.">
            <TimeChart
              labels={labels}
              series={[
                { label: "Scored", values: series.graded },
                { label: "Not scored", values: series.notGraded, tone: "soft" },
              ]}
            />
          </ChartCard>
          <ChartCard title="Practice minutes charged" value={count(current.minutes)}>
            <TimeChart labels={labels} series={[{ label: "Minutes", values: series.minutes }]} />
          </ChartCard>
          <ChartCard title="Average score" value={current.averageScore || "—"} hint="Scored sessions only, out of 100.">
            <TimeChart kind="line" labels={labels} series={[{ label: "Average score", values: series.averageScore }]} />
          </ChartCard>
        </div>
      </section>

      {/* Money */}
      <section>
        <SectionTitle>Money</SectionTitle>
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            title="Revenue (Stripe)"
            value={paidRevenue === null ? undefined : money(paidRevenue, revenue?.configured ? revenue.currency : "aud")}
            hint={revenue?.configured && revenue.truncated ? "Only the latest 2,000 payments are counted." : "Subscriptions and packs. “Charged” is after refunds."}
          >
            {revenueError ? <p className="text-sm text-record">{revenueError}</p> : null}
            {!revenue && !revenueError ? <Skeleton className="h-[180px]" /> : null}
            {revenue && !revenue.configured ? <p className="text-sm text-gray-500">Stripe isn&apos;t connected.</p> : null}
            {revenue?.configured ? (
              <TimeChart
                labels={revenue.keys.map((key) => bucketLabel(key, data.granularity))}
                series={[
                  { label: "Charged", values: revenue.grossCents.map((c, i) => (c - revenue.refundedCents[i]) / 100) },
                  { label: "Refunded", values: revenue.refundedCents.map((c) => c / 100), tone: "soft" },
                ]}
                format={(n) => money(n * 100, revenue.currency)}
              />
            ) : null}
          </ChartCard>
          <ChartCard
            title="Est. AI cost"
            value={usd(current.costUsd)}
            hint={`${usdFine(data.cost.perSessionUsd)} per session · ${usd(data.cost.perActiveLearnerUsd)} per active learner`}
          >
            <TimeChart
              labels={labels}
              series={[
                { label: "Voice (realtime)", values: series.voiceCostUsd },
                { label: "Grading & translation", values: series.gradingCostUsd, tone: "soft" },
              ]}
              format={(n) => usd(n)}
            />
          </ChartCard>
          <ChartCard title="Highest AI cost by learner">
            <BarList
              rows={data.cost.topLearners.map((row) => ({ label: row.name, count: row.costUsd }))}
              format={(n) => usdFine(n)}
              note={(_, i) => `${data.cost.topLearners[i].sessions} sessions`}
            />
          </ChartCard>
          <ChartCard title="Packs sold" value={count(current.packSales)} hint="Minute packs bought through Stripe.">
            <TimeChart labels={labels} series={[{ label: "Packs", values: series.packSales }]} />
          </ChartCard>
        </div>
      </section>

      {/* Journey */}
      <section>
        <SectionTitle>Learner journey</SectionTitle>
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            title={range === "all" ? "Everyone who signed up" : "People who signed up in this period"}
            hint="Each step counts the same people, so the drop between steps shows where learners stop."
          >
            <BarList
              rows={data.funnel}
              empty="No sign-ups in this period."
              note={(row, i) => (i === 0 ? null : `${pct(row.count, signupsInRange)}`)}
            />
          </ChartCard>
          <ChartCard title="How many days learners practised" hint="Active learners in this period, by the number of different days they practised.">
            <BarList rows={data.frequency} note={(row) => pct(row.count, current.activeLearners)} />
          </ChartCard>
          <ChartCard title="How sessions ended">
            <BarList rows={data.endReasons} note={(row) => pct(row.count, current.sessions)} />
          </ChartCard>
          <ChartCard title="Assessed or practice">
            <BarList rows={data.modes} note={(row) => pct(row.count, current.sessions)} />
          </ChartCard>
        </div>
      </section>

      {/* What they practise */}
      <section>
        <SectionTitle>What they practise</SectionTitle>
        <div className="space-y-4">
          <UsageTable title="Courses" rows={data.courses} />
          <UsageTable title="Dialogues and scenarios" rows={data.scenarios} />
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Language pairs">
              <BarList rows={data.languagePairs} note={(row) => pct(row.count, current.sessions)} />
            </ChartCard>
            <ChartCard title="When sessions start" hint="Australian Eastern time.">
              <TimeChart labels={hours} series={[{ label: "Sessions", values: data.byHour }]} tickEvery={6} height={140} />
              <div className="mt-4">
                <TimeChart labels={weekdays} series={[{ label: "Sessions", values: data.byWeekday }]} tickEvery={1} height={120} />
              </div>
            </ChartCard>
          </div>
        </div>
      </section>

      {/* Acquisition */}
      <section>
        <SectionTitle>Where sign-ups come from</SectionTitle>
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="How they heard about XINGO" hint="Asked once after onboarding.">
            <BarList rows={data.signupsBy.heardAbout} empty="No sign-ups in this period." note={(row) => pct(row.count, signupsInRange)} />
          </ChartCard>
          <ChartCard title="What they're preparing for">
            <BarList rows={data.signupsBy.goal} empty="No sign-ups in this period." note={(row) => pct(row.count, signupsInRange)} />
          </ChartCard>
        </div>
        <Card tone="muted" className="mt-4 p-5 text-sm">
          <p className="font-semibold">Website traffic</p>
          <p className="mt-1 text-gray-500">
            Visits, landing pages and search terms are in Google Analytics and Search Console, not in XINGO&apos;s database.{" "}
            <a className="font-semibold text-ink underline" href="https://analytics.google.com/" target="_blank" rel="noreferrer">
              Open Google Analytics
            </a>{" "}
            ·{" "}
            <a className="font-semibold text-ink underline" href="https://search.google.com/search-console" target="_blank" rel="noreferrer">
              Search Console
            </a>
          </p>
        </Card>
      </section>
    </>
  );
}

function UsageTable({ title, rows }: { title: string; rows: Dashboard["courses"] }) {
  const max = Math.max(1, ...rows.map((r) => r.minutes));
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-gray-200 text-xs text-gray-500">
          <tr>
            <th className="px-5 py-3 font-semibold">{title}</th>
            <th className="w-[30%] px-3 py-3 font-semibold">Minutes</th>
            <th className="px-3 py-3 text-right font-semibold">Sessions</th>
            <th className="px-3 py-3 text-right font-semibold">Learners</th>
            <th className="px-5 py-3 text-right font-semibold">Avg score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-5 py-4 text-gray-500">
                Nothing practised in this period.
              </td>
            </tr>
          ) : null}
          {rows.map((row) => (
            <tr key={row.title}>
              <td className="max-w-[280px] truncate px-5 py-3 font-semibold">{row.title}</td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-gray-100">
                    <div className="h-1.5 rounded-full bg-ink" style={{ width: `${(row.minutes / max) * 100}%` }} />
                  </div>
                  <span className="w-10 text-right tabular-nums">{count(row.minutes)}</span>
                </div>
              </td>
              <td className="px-3 py-3 text-right tabular-nums">{count(row.sessions)}</td>
              <td className="px-3 py-3 text-right tabular-nums">{count(row.learners)}</td>
              <td className="px-5 py-3 text-right tabular-nums">{row.averageScore ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
