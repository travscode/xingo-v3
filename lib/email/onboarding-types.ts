/**
 * Types for the 14-day onboarding email series (D-037). Content lives in
 * lib/email/onboarding-content.ts; sending in convex/onboarding.ts.
 */
import type { BuiltEmail } from "./transactional";

/** Every other day for the first two weeks (day 0 is the transactional welcome). */
export const ONBOARDING_DAYS = [1, 3, 5, 7, 9, 11, 13] as const;
export type OnboardingDay = (typeof ONBOARDING_DAYS)[number];

/** Content pathway, chosen from what the learner said they're preparing for. */
export type OnboardingTrack = "ielts" | "oet" | "clinical" | "ccl" | "interpreter" | "us_interpreter" | "general";

export function trackForGoal(goal: string | undefined | null): OnboardingTrack {
  switch (goal) {
    case "ielts":
      return "ielts";
    case "oet":
      return "oet";
    case "amc":
    case "nmba_osce":
      return "clinical";
    case "naati_ccl":
      return "ccl";
    case "naati_cpi":
    case "medical":
    case "ndis":
    case "legal":
      return "interpreter";
    case "us_medical_oral":
      return "us_interpreter";
    default:
      return "general";
  }
}

/** What we know about the learner when the email is sent (computed server-side). */
export type OnboardingContext = {
  siteUrl: string;
  /** e.g. "IELTS Speaking", "NAATI CCL"; null when no goal chosen. */
  goalLabel: string | null;
  /** Raw goal id from lib/goals.ts (e.g. "amc" vs "nmba_osce" within the clinical track). */
  goalId: string | null;
  /** Their other language, e.g. "Spanish"; null for English only / not set. */
  language: string | null;
  /** Graded sessions completed so far. */
  sessions: number;
  /** Best score shown on the course's own scale, e.g. "68/90", "Band 6.5", "74/100"; null if none yet. */
  bestScore: string | null;
  /** Practice minutes left right now. */
  minutesLeft: number;
  /** Free-plan monthly minutes (for copy). */
  freeMonthlyMinutes: number;
  isPro: boolean;
};

export type OnboardingEmailBuilder = (ctx: OnboardingContext) => BuiltEmail;
