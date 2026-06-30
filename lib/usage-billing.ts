import type { SubscriptionStatus } from "@/types/user";

export type AiUsageSource = "realtime" | "assessment" | "translation" | "other";

type PlanUsageConfig = {
  includedCreditsMonthly: number;
  overageCentsPerCredit: number;
  label: string;
};

const TOKENS_PER_CREDIT = 1000;

const usagePlanConfig: Record<SubscriptionStatus, PlanUsageConfig> = {
  free: {
    label: "Free",
    includedCreditsMonthly: 25,
    overageCentsPerCredit: 2.5,
  },
  professional: {
    label: "Professional",
    includedCreditsMonthly: 400,
    overageCentsPerCredit: 1.2,
  },
  organization: {
    label: "Organization",
    includedCreditsMonthly: 2500,
    overageCentsPerCredit: 0.8,
  },
};

/**
 * Returns the monthly usage allowance and overage rate for the selected plan.
 */
export function getUsagePlanConfig(plan: SubscriptionStatus) {
  return usagePlanConfig[plan];
}

/**
 * Converts OpenAI tokens into billable platform credits.
 */
export function tokensToCredits(totalTokens: number) {
  return Math.max(0, totalTokens) / TOKENS_PER_CREDIT;
}

/**
 * Formats a date into the billing month key used for usage aggregation.
 */
export function getBillingMonthKey(date: Date) {
  return `${date.getUTCFullYear()}-${`${date.getUTCMonth() + 1}`.padStart(2, "0")}`;
}

/**
 * Returns the inclusive start and end timestamps for a billing month key.
 */
export function getBillingMonthRange(monthKey: string) {
  const [yearPart, monthPart] = monthKey.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  return { start, end };
}

/**
 * Formats a credit value for compact UI display.
 */
export function formatCredits(value: number) {
  return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)} credits`;
}

/**
 * Formats a cents amount into a USD string for billing UI.
 */
export function formatUsdFromCents(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value / 100);
}
