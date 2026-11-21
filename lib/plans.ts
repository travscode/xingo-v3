/**
 * Single source of truth for plans, practice-minute allowances and credit packs.
 *
 * Imported by both Convex (enforcement) and the Next.js UI (display), so it must
 * stay free of framework imports. Stripe price IDs live in Convex env vars, not here.
 *
 * The billing unit is the *practice minute*: wall-clock time of a live practice
 * session, measured on the server (attempt start -> last heartbeat). Grading and
 * transcript translation are included in the minute price.
 *
 * NOTE: the numbers below are launch defaults (see docs/decisions.md, D-007).
 * Re-check them once real realtime cost-per-minute data is in `aiUsageEvents`.
 */

export type PlanId = "free" | "professional" | "organization";

export type PackId = "starter" | "plus" | "sprint";

export type PlanConfig = {
  id: PlanId;
  label: string;
  /**
   * The plan's included minutes. When `allowanceRenews` they come back every calendar
   * month (UTC) and don't roll over; otherwise they're given once per account (D-052).
   */
  monthlyMinutes: number;
  /** False for Free: its minutes are a one-time allowance, not monthly (D-052). */
  allowanceRenews: boolean;
  /** Whether premium (non-free) modules are unlocked by the plan itself. */
  premiumAccess: boolean;
  priceLabel: string;
  /** Monthly price in AUD cents incl. GST (0 when not self-serve). */
  priceCents: number;
  /** Set only during a sale: the usual price, shown struck through next to `priceLabel`. */
  regularPriceLabel?: string;
  tagline: string;
};

export type PackConfig = {
  id: PackId;
  label: string;
  minutes: number;
  priceLabel: string;
  /** AUD cents incl. GST. */
  priceCents: number;
  /** Set only during a sale: the usual price, shown struck through next to `priceLabel`. */
  regularPriceLabel?: string;
  description: string;
};

export const CURRENCY_LABEL = "AUD";

export const plans: Record<PlanId, PlanConfig> = {
  free: {
    id: "free",
    label: "Free",
    monthlyMinutes: 10,
    allowanceRenews: false,
    premiumAccess: false,
    priceLabel: "A$0",
    priceCents: 0,
    tagline: "The free course plus free preview dialogues in NAATI CCL.",
  },
  professional: {
    id: "professional",
    label: "Pro",
    monthlyMinutes: 150,
    allowanceRenews: true,
    premiumAccess: true,
    priceLabel: "A$29 / month",
    priceCents: 2900,
    tagline: "Every NAATI CCL dialogue and every open course, 150 practice minutes each month.",
  },
  organization: {
    id: "organization",
    label: "Team",
    monthlyMinutes: 600,
    allowanceRenews: true,
    premiumAccess: true,
    priceLabel: "Contact us",
    priceCents: 0,
    tagline: "Seats for training providers. Talk to us.",
  },
};

/** Practice minutes given once to each private beta tester (D-049). */
export const BETA_MINUTES = 60;

export const packs: Record<PackId, PackConfig> = {
  starter: {
    id: "starter",
    label: "CCL Starter",
    minutes: 30,
    priceLabel: "A$19",
    priceCents: 1900,
    description: "Try the full CCL course before you book.",
  },
  plus: {
    id: "plus",
    label: "Practice Plus",
    minutes: 80,
    priceLabel: "A$39",
    priceCents: 3900,
    description: "Steady weekly practice across every open course.",
  },
  sprint: {
    id: "sprint",
    label: "Exam Sprint",
    minutes: 160,
    priceLabel: "A$69",
    priceCents: 6900,
    description: "Daily mock dialogues in the weeks before your test.",
  },
};

export const packList = [packs.starter, packs.plus, packs.sprint] as const;

/** Pack minutes never expire (see docs/decisions.md, D-008). */

/**
 * Typical billed minutes for one graded NAATI CCL dialogue, measured on live
 * sessions in Nov 2026 (median 5). Used only to say "about N dialogues" (D-051).
 */
export const TYPICAL_CCL_DIALOGUE_MINUTES = 5;

/** Roughly how many CCL dialogues a minute balance buys, never below 1. */
export function approxCclDialogues(minutes: number) {
  return Math.max(1, Math.floor(minutes / TYPICAL_CCL_DIALOGUE_MINUTES));
}

/**
 * IELTS Speaking (D-053). A full mock test is timed at 14 minutes; the free mock is
 * cut to the Free plan's one-time minutes so a free learner can finish it.
 */
export const IELTS_MOCK_MINUTES = 14;
export const IELTS_FREE_MOCK_MINUTES = plans.free.monthlyMinutes;

/** Roughly how many full IELTS mock tests a minute balance buys, never below 1. */
export function approxIeltsMocks(minutes: number) {
  return Math.max(1, Math.floor(minutes / IELTS_MOCK_MINUTES));
}

/**
 * "about 6 CCL dialogues", or "about 2 IELTS mock tests" on the IELTS course.
 * Courses without their own measure fall back to CCL dialogues, the main course.
 */
export function approxSessionsLabel(minutes: number, moduleId?: string | null) {
  if (moduleId === "ielts-speaking") {
    const count = approxIeltsMocks(minutes);
    return `about ${count} IELTS mock ${count === 1 ? "test" : "tests"}`;
  }
  return `about ${approxCclDialogues(minutes)} CCL dialogues`;
}

/** A user needs at least this many minutes left to start a new attempt. */
export const MIN_MINUTES_TO_START = 1;

/** Hard ceiling on a single attempt, regardless of balance. */
export const MAX_ATTEMPT_MINUTES = 30;

/** An attempt with no heartbeat for this long is treated as abandoned. */
export const HEARTBEAT_TIMEOUT_MS = 2 * 60 * 1000;

/** Client heartbeat cadence. */
export const HEARTBEAT_INTERVAL_MS = 20 * 1000;

/** Realtime client secrets that may be minted per attempt (2 agents + reconnects). */
export const MAX_REALTIME_KEYS_PER_ATTEMPT = 6;

/** Interpreter turns required before an attempt is worth grading. */
export const MIN_INTERPRETER_TURNS_TO_GRADE = 3;

/**
 * Default session time limits (minutes) for scenarios that don't set their own.
 * A typical run takes roughly 60% of the limit: a two-party dialogue is ~6-8
 * minutes of talk (a NAATI CCL dialogue is ~300 words), so 12 minutes leaves room
 * to think without letting a session run forever. See D-028.
 */
export const DEFAULT_TIME_LIMIT_MINUTES = {
  interpreting: 12,
  interpretingSingle: 10,
  roleplay: 10,
} as const;

/** Server-side slack after the time limit before the heartbeat ends the attempt. */
export const TIME_LIMIT_GRACE_MS = 20 * 1000;

/** Nobody has spoken for this long: the room warns the learner. */
export const STALL_WARNING_MS = 45 * 1000;

/** Nobody has spoken for this long: the session ends as "stalled". */
export const STALL_END_MS = 90 * 1000;

/** Time limit for a scenario in minutes; never above the per-attempt ceiling. */
export function scenarioTimeLimitMinutes(scenario: {
  agentCount?: 1 | 2;
  aiAgentB?: unknown;
  practiceRuntime?: { practiceType?: "interpreting" | "roleplay"; timeLimitMinutes?: number } | null;
}) {
  const runtime = scenario.practiceRuntime;
  const fallback =
    runtime?.practiceType === "roleplay"
      ? DEFAULT_TIME_LIMIT_MINUTES.roleplay
      : scenario.agentCount === 1 || !scenario.aiAgentB
        ? DEFAULT_TIME_LIMIT_MINUTES.interpretingSingle
        : DEFAULT_TIME_LIMIT_MINUTES.interpreting;
  const minutes = runtime?.timeLimitMinutes && runtime.timeLimitMinutes > 0 ? runtime.timeLimitMinutes : fallback;

  return Math.min(MAX_ATTEMPT_MINUTES, minutes);
}

export function isPackId(value: string): value is PackId {
  return value === "starter" || value === "plus" || value === "sprint";
}

export function getPlan(plan: PlanId) {
  return plans[plan];
}

/** Calendar-month key (UTC) used for monthly allowances, e.g. "2026-10". */
export function getBillingMonthKey(date: Date) {
  return `${date.getUTCFullYear()}-${`${date.getUTCMonth() + 1}`.padStart(2, "0")}`;
}

export function getBillingMonthRange(monthKey: string) {
  const [yearPart, monthPart] = monthKey.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);

  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)),
  };
}

/** Rounds a duration up to whole billable minutes, capped per attempt. */
export function billableMinutesFromMs(durationMs: number) {
  if (durationMs <= 0) {
    return 0;
  }

  return Math.min(MAX_ATTEMPT_MINUTES, Math.ceil(durationMs / 60_000));
}

/** Whole minutes with thousands separators, e.g. 99,987. */
export function formatMinuteCount(value: number) {
  return Math.max(0, Math.floor(value)).toLocaleString("en-AU");
}

export function formatMinutes(value: number) {
  return `${formatMinuteCount(value)} min`;
}
