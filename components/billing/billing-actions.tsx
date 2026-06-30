"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  formatCredits,
  formatUsdFromCents,
  getUsagePlanConfig,
} from "@/lib/usage-billing";

const planInfo = [
  {
    name: "professional",
    label: "Professional",
    description: "Unlimited premium modules",
  },
  {
    name: "organization",
    label: "Organization",
    description: "Cohorts, reporting, and assignments",
  },
] as const;

/**
 * Renders the user's monthly AI usage allowance as a simple progress line.
 */
function UsageProgressLine({
  value,
  isOverQuota,
}: {
  value: number;
  isOverQuota: boolean;
}) {
  return (
    <div className="mt-4">
      <div className="h-3 overflow-hidden rounded-full bg-black/10">
        <div
          className={`h-full rounded-full transition-all ${
            isOverQuota ? "bg-red-500" : "bg-brand"
          }`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

export function BillingActions() {
  const user = useQuery(api.users.current, {});
  const billingSummary = useQuery(api.usage.currentBillingSummaryForCurrentUser, {});
  const currentPlan = user?.subscriptionStatus ?? "free";
  const currentPlanConfig = getUsagePlanConfig(currentPlan);
  const usagePercent = (billingSummary?.usageRatio ?? 0) * 100;
  const overageChargeLabel = formatUsdFromCents(
    billingSummary?.overageChargeCents ?? 0,
  );
  const overageRateLabel = formatUsdFromCents(
    currentPlanConfig.overageCentsPerCredit,
  );
  const includedCreditsLabel = formatCredits(
    billingSummary?.includedCreditsMonthly ??
      currentPlanConfig.includedCreditsMonthly,
  );
  const usedCreditsLabel = formatCredits(billingSummary?.usedCredits ?? 0);
  const remainingCreditsLabel = formatCredits(billingSummary?.remainingCredits ?? 0);
  const isLoading = user === undefined || billingSummary === undefined;
  const isOverQuota = Boolean(billingSummary?.isOverQuota);

  return (
    <section className="space-y-6">
      <div className="section-frame rounded-[2.25rem] p-6 lg:p-8">
        <p className="eyebrow">Current plan</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight capitalize">
          {user?.subscriptionStatus ?? "free"}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          Checkout and customer portal routes are live. If Stripe price IDs are not configured yet,
          the buttons below will fail fast with a clear server response instead of guessing.
        </p>
        <div className="mt-8 rounded-[1.75rem] border border-line bg-white/70 p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                Monthly AI usage
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                {isLoading ? "Loading..." : `${usedCreditsLabel} of ${includedCreditsLabel}`}
              </div>
            </div>
            <div className="text-right text-sm text-muted">
              {isLoading
                ? "Checking current billing period..."
                : `${billingSummary?.requestCount ?? 0} tracked AI requests`}
            </div>
          </div>
          <UsageProgressLine value={usagePercent} isOverQuota={isOverQuota} />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
            <span>
              {isLoading
                ? "Loading allowance..."
                : isOverQuota
                  ? `Over quota by ${formatCredits(billingSummary?.overageCredits ?? 0)}`
                  : `${remainingCreditsLabel} remaining this month`}
            </span>
            <span>
              {isLoading
                ? "Loading token usage..."
                : `${(billingSummary?.usedTokens ?? 0).toLocaleString()} tokens used`}
            </span>
          </div>
          {billingSummary ? (
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-[1.25rem] border border-line bg-white/80 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                  Realtime
                </div>
                <div className="mt-2 text-lg font-semibold">
                  {billingSummary.bySource.realtime.requestCount} requests
                </div>
                <div className="mt-1 text-sm text-muted">
                  {billingSummary.bySource.realtime.totalTokens.toLocaleString()} tokens
                </div>
              </div>
              <div className="rounded-[1.25rem] border border-line bg-white/80 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                  Assessments
                </div>
                <div className="mt-2 text-lg font-semibold">
                  {billingSummary.bySource.assessment.requestCount} requests
                </div>
                <div className="mt-1 text-sm text-muted">
                  {billingSummary.bySource.assessment.totalTokens.toLocaleString()} tokens
                </div>
              </div>
              <div className="rounded-[1.25rem] border border-line bg-white/80 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                  Translation
                </div>
                <div className="mt-2 text-lg font-semibold">
                  {billingSummary.bySource.translation.requestCount} requests
                </div>
                <div className="mt-1 text-sm text-muted">
                  {billingSummary.bySource.translation.totalTokens.toLocaleString()} tokens
                </div>
              </div>
            </div>
          ) : null}
          {isOverQuota ? (
            <div className="mt-5 rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              You are over your included AI credit balance for this billing period.
              Additional usage is being billed to Stripe at {overageRateLabel} per
              credit. Current overage total: {overageChargeLabel}.
            </div>
          ) : billingSummary ? (
            <div className="mt-5 rounded-[1.25rem] border border-line bg-white/80 px-4 py-3 text-sm text-muted">
              Included monthly allowance: {includedCreditsLabel}. Overage rate:{" "}
              {overageRateLabel} per credit after you exceed plan usage.
            </div>
          ) : null}
        </div>
        <form action="/api/stripe/portal" method="post" className="mt-6">
          <button type="submit" className="action-secondary">
            Open billing portal
          </button>
        </form>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {planInfo.map((plan) => {
          const isCurrentPlan = currentPlan === plan.name;

          return (
            <form
              key={plan.name}
              action="/api/stripe/checkout"
              method="post"
              className="surface-card rounded-[2rem] p-6"
            >
              <input type="hidden" name="plan" value={plan.name} />
              <p className="eyebrow">{isCurrentPlan ? "Current" : "Upgrade"}</p>
              <div className="mt-3 text-2xl font-semibold">{plan.label}</div>
              <div className="mt-2 text-sm leading-7 text-muted">{plan.description}</div>
              <button
                type="submit"
                disabled={isCurrentPlan}
                className="action-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCurrentPlan ? "Current plan" : "Start checkout"}
              </button>
            </form>
          );
        })}
      </div>
    </section>
  );
}
