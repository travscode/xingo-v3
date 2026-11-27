/**
 * Time buckets for the admin Analytics tab (convex/adminAnalytics.ts).
 * Framework-free so Convex, the Stripe action and the UI agree on the buckets.
 *
 * Days are counted in Australian Eastern Standard Time (UTC+10, no daylight
 * saving shift), because that's where most learners are. Weeks start on Monday.
 */

export type AnalyticsRange = "30d" | "90d" | "12m" | "all";
export type Granularity = "day" | "week" | "month";

export const ANALYTICS_RANGES: { id: AnalyticsRange; label: string; granularity: Granularity }[] = [
  { id: "30d", label: "30 days", granularity: "day" },
  { id: "90d", label: "90 days", granularity: "week" },
  { id: "12m", label: "12 months", granularity: "month" },
  { id: "all", label: "All time", granularity: "month" },
];

const DAY_MS = 86_400_000;
/** AEST offset. */
const OFFSET_MS = 10 * 60 * 60 * 1000;

export function granularityFor(range: AnalyticsRange): Granularity {
  return ANALYTICS_RANGES.find((r) => r.id === range)?.granularity ?? "day";
}

/** The local (AEST) calendar date as a UTC-midnight Date, so getUTC* reads local fields. */
function local(ms: number) {
  return new Date(ms + OFFSET_MS);
}

/** Start of the bucket containing `ms`, as a local-date key ("2026-11-24" or "2026-11"). */
export function bucketKey(at: string | number, granularity: Granularity): string {
  const ms = typeof at === "number" ? at : Date.parse(at);
  const d = local(ms);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  if (granularity === "month") return `${y}-${String(m + 1).padStart(2, "0")}`;
  let day = Date.UTC(y, m, d.getUTCDate());
  if (granularity === "week") {
    const weekday = (new Date(day).getUTCDay() + 6) % 7; // Monday = 0
    day -= weekday * DAY_MS;
  }
  return new Date(day).toISOString().slice(0, 10);
}

/** UTC ms at which the bucket with this key starts. */
function bucketStartMs(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d ?? 1) - OFFSET_MS;
}

function nextKey(key: string, granularity: Granularity): string {
  const [y, m, d] = key.split("-").map(Number);
  if (granularity === "month") return bucketKey(Date.UTC(y, m, 1) - OFFSET_MS, "month");
  const step = granularity === "week" ? 7 : 1;
  return new Date(Date.UTC(y, m - 1, d + step)).toISOString().slice(0, 10);
}

export type Window = {
  granularity: Granularity;
  /** Bucket keys, oldest first. The last one contains `now`. */
  keys: string[];
  /** ISO start of the range (start of the first bucket). */
  start: string;
  /** ISO start of the equally long period before it, for comparisons (null for all time). */
  previousStart: string | null;
};

/**
 * The buckets a range covers. "all" starts at `firstAt` (the earliest record),
 * so the chart begins when XINGO did.
 */
export function analyticsWindow(range: AnalyticsRange, now: number, firstAt?: string | null): Window {
  const granularity = granularityFor(range);
  const count = range === "30d" ? 30 : range === "90d" ? 13 : range === "12m" ? 12 : 0;
  const lastKey = bucketKey(now, granularity);

  let firstKey: string;
  if (range === "all") {
    firstKey = bucketKey(firstAt ?? now, granularity);
    if (firstKey > lastKey) firstKey = lastKey;
  } else {
    // Walk back (count - 1) buckets from the current one.
    const [y, m, d] = lastKey.split("-").map(Number);
    firstKey =
      granularity === "month"
        ? bucketKey(Date.UTC(y, m - count, 1) - OFFSET_MS + DAY_MS, "month")
        : new Date(Date.UTC(y, m - 1, d - (count - 1) * (granularity === "week" ? 7 : 1))).toISOString().slice(0, 10);
  }

  const keys: string[] = [];
  for (let key = firstKey; key <= lastKey && keys.length < 400; key = nextKey(key, granularity)) keys.push(key);

  const startMs = bucketStartMs(keys[0]);
  const lengthMs = now - startMs;
  return {
    granularity,
    keys,
    start: new Date(startMs).toISOString(),
    previousStart: range === "all" ? null : new Date(startMs - lengthMs).toISOString(),
  };
}

/** Short axis label for a bucket key. */
export function bucketLabel(key: string, granularity: Granularity): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d ?? 1));
  if (granularity === "month") {
    return date.toLocaleDateString("en-AU", { month: "short", year: "2-digit", timeZone: "UTC" });
  }
  return date.toLocaleDateString("en-AU", { day: "numeric", month: "short", timeZone: "UTC" });
}

/** Hour of day (0–23) in AEST. */
export function localHour(at: string): number {
  return local(Date.parse(at)).getUTCHours();
}

/** Day of week in AEST, Monday = 0. */
export function localWeekday(at: string): number {
  return (local(Date.parse(at)).getUTCDay() + 6) % 7;
}

/** Percentage change, or null when there's nothing to compare with. */
export function percentChange(current: number, previous: number | null | undefined): number | null {
  if (previous === null || previous === undefined || previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}
