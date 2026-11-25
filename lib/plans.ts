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

import { CPI_COURSE_ID } from "./course-status";

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
    monthlyMinutes: 5,
    allowanceRenews: false,
    premiumAccess: false,
    priceLabel: "A$0",
    priceCents: 0,
    tagline: "The free course plus a free dialogue or mock test in each open course.",
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
    label: "Starter",
    minutes: 30,
    priceLabel: "A$19",
    priceCents: 1900,
    description: "Try a full course before you book.",
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
 * NAATI CPI (D-056). No live measurement yet, so this uses the default two-speaker
 * time limit (12 min; NAATI describes each CPI role-play as about 10–12 minutes).
 * Used only to say "about N CPI dialogues". Re-check once CPI sessions are graded.
 */
export const TYPICAL_CPI_DIALOGUE_MINUTES = 12;

/**
 * IELTS Speaking (D-053). A full mock test is timed at 14 minutes; the free mock is a
 * shorter 10-minute version. Since D-056 Free has only 5 minutes, so a free learner
 * gets the first half of it and then the upgrade offer (a deliberate taster).
 */
export const IELTS_MOCK_MINUTES = 14;
export const IELTS_FREE_MOCK_MINUTES = 10;

/** Roughly how many full IELTS mock tests a minute balance buys, never below 1. */
export function approxIeltsMocks(minutes: number) {
  return Math.max(1, Math.floor(minutes / IELTS_MOCK_MINUTES));
}

/**
 * "about 6 CCL dialogues", "about 2 IELTS mock tests" on the IELTS course, or "about 2
 * CPI dialogues" on the CPI course. Others fall back to CCL dialogues, the main course.
 */
export function approxSessionsLabel(minutes: number, moduleId?: string | null) {
  if (moduleId === "ielts-speaking") {
    const count = approxIeltsMocks(minutes);
    return `about ${count} full IELTS mock ${count === 1 ? "test" : "tests"}`;
  }
  if (moduleId === CPI_COURSE_ID) {
    const count = Math.max(1, Math.floor(minutes / TYPICAL_CPI_DIALOGUE_MINUTES));
    return `about ${count} CPI ${count === 1 ? "dialogue" : "dialogues"}`;
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

/**
 * Packs are course-agnostic (any pack unlocks every open course), but they're pitched
 * in the terms of the course the learner came from, so they know they're buying the
 * right thing (D-054). IELTS learners see IELTS copy; everyone else sees NAATI CCL,
 * the main course.
 */
export type PackContext = "ccl" | "ielts" | "cpi";

/** From a course id ("ielts-speaking") or a practice goal ("ielts"). */
export function packContextFor(courseOrGoal?: string | null): PackContext {
  if (courseOrGoal === "ielts-speaking" || courseOrGoal === "ielts") return "ielts";
  if (courseOrGoal === CPI_COURSE_ID || courseOrGoal === "naati_cpi") return "cpi";
  return "ccl";
}

const packPitch: Record<PackId, Record<PackContext, string>> = {
  starter: {
    ccl: "Try the full CCL course before you book.",
    ielts: "Sit full mock tests and find your band before test day.",
    cpi: "Work through full CPI-style role-plays before you book.",
  },
  plus: {
    ccl: "Steady weekly practice through every CCL dialogue.",
    ielts: "Steady weekly practice across every IELTS mock test.",
    cpi: "Steady weekly practice through every CPI dialogue.",
  },
  sprint: {
    ccl: "Daily mock dialogues in the weeks before your test.",
    ielts: "A mock test most days in the weeks before your test.",
    cpi: "A CPI role-play most days in the weeks before your test.",
  },
};

export function packCopy(pack: PackConfig, context: PackContext) {
  const moduleId = context === "ielts" ? "ielts-speaking" : context === "cpi" ? CPI_COURSE_ID : null;
  const fit = { ccl: "Great for NAATI CCL", ielts: "Great for IELTS Speaking", cpi: "Great for NAATI CPI" } as const;
  return {
    /** "Great for IELTS Speaking" */
    fit: fit[context],
    /** "about 2 full IELTS mock tests" */
    sessions: approxSessionsLabel(pack.minutes, moduleId),
    description: packPitch[pack.id][context],
  };
}
