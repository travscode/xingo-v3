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
  /** Minutes granted every calendar month (UTC). Unused minutes do not roll over. */
  monthlyMinutes: number;
  /** Whether premium (non-free) modules are unlocked by the plan itself. */
  premiumAccess: boolean;
  priceLabel: string;
  tagline: string;
};

export type PackConfig = {
  id: PackId;
  label: string;
  minutes: number;
  priceLabel: string;
  description: string;
};

export const CURRENCY_LABEL = "AUD";

export const plans: Record<PlanId, PlanConfig> = {
  free: {
    id: "free",
    label: "Free",
    monthlyMinutes: 10,
    premiumAccess: false,
    priceLabel: "A$0",
    tagline: "Free modules plus one preview dialogue in every premium module.",
  },
  professional: {
    id: "professional",
    label: "Pro",
    monthlyMinutes: 150,
    premiumAccess: true,
    priceLabel: "A$29 / month",
    tagline: "Every module, 150 practice minutes each month.",
  },
  organization: {
    id: "organization",
    label: "Team",
    monthlyMinutes: 600,
    premiumAccess: true,
    priceLabel: "Contact us",
    tagline: "Seats for training providers. Talk to us.",
  },
};

export const packs: Record<PackId, PackConfig> = {
  starter: {
    id: "starter",
    label: "CCL Starter",
    minutes: 30,
    priceLabel: "A$19",
    description: "Try the full CCL module. About 6 timed dialogues.",
  },
  plus: {
    id: "plus",
    label: "Practice Plus",
    minutes: 80,
    priceLabel: "A$39",
    description: "Steady weekly practice across every module.",
  },
  sprint: {
    id: "sprint",
    label: "Exam Sprint",
    minutes: 160,
    priceLabel: "A$69",
    description: "Daily mock dialogues in the weeks before your test.",
  },
};

export const packList = [packs.starter, packs.plus, packs.sprint] as const;

/** Pack minutes never expire (see docs/decisions.md, D-008). */

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

export function formatMinutes(value: number) {
  const rounded = Math.max(0, Math.floor(value));
  return `${rounded} min`;
}
