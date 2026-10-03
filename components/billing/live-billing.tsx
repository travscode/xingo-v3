"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { Check, Clock, Crown, Package } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { track } from "@/lib/analytics";
import { friendlyError } from "@/lib/errors";
import { CURRENCY_LABEL, packList, plans, type PackId, formatMinuteCount } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { Badge, Card, PageHeader, ProgressBar, SectionTitle, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

export function LiveBilling() {
  const summary = useQuery(api.usage.summaryForCurrentUser, {});
  const createCheckout = useAction(api.billing.createCheckout);
  const createPortal = useAction(api.billing.createPortal);
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const go = async (key: string, run: () => Promise<{ url: string }>) => {
    setPending(key);
    setError(null);

    try {
      const { url } = await run();
      window.location.assign(url);
    } catch (checkoutError) {
      setError(friendlyError(checkoutError));
      setPending(null);
    }
  };

  const buyPack = (packId: PackId) => {
    track("checkout_start", { kind: "pack", pack_id: packId });
    void go(packId, () => createCheckout({ kind: "pack", packId }));
  };

  const subscribe = () => {
    track("checkout_start", { kind: "subscription" });
    void go("pro", () => createCheckout({ kind: "subscription" }));
  };

  const openPortal = () => void go("portal", () => createPortal({}));

  if (!summary) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-44" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const isPro = summary.plan !== "free";
  const allowanceRatio = summary.monthlyMinutes ? summary.allowanceRemaining / summary.monthlyMinutes : 0;
  const resetDate = new Date(summary.periodEnd);
  resetDate.setUTCDate(resetDate.getUTCDate() + 1);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Plan & minutes"
        description="Minutes count only while a practice session is live. Scoring and feedback are included."
        actions={
          summary.hasStripeCustomer ? (
            <Button variant="outline" disabled={pending === "portal"} onClick={openPortal}>
              {pending === "portal" ? "Opening…" : "Invoices & payment"}
            </Button>
          ) : null
        }
      />

      {status === "success" ? (
        <div className="rounded-xl bg-accent px-5 py-4 font-semibold text-accent-ink">
          Payment received — thank you. Your minutes appear below within a few seconds.
        </div>
      ) : null}
      {status === "cancelled" ? (
        <div className="rounded-xl bg-gray-100 px-5 py-4 text-sm">Checkout cancelled. You haven&apos;t been charged.</div>
      ) : null}
      {error ? <div className="rounded-xl bg-record/10 px-5 py-4 text-sm text-record">{error}</div> : null}

      <Card tone="inverse" className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-paper/60">
              <Clock className="h-3.5 w-3.5" aria-hidden /> Minutes left
            </p>
            <p className="mt-1 text-6xl font-bold tracking-[-0.05em] tabular-nums">
              {formatMinuteCount(summary.remainingMinutes)}
            </p>
          </div>
          <Badge tone="accent">{summary.planLabel} plan</Badge>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Monthly allowance</span>
              <span className="text-paper/60">
                {formatMinuteCount(summary.allowanceRemaining)} / {formatMinuteCount(summary.monthlyMinutes)} min
              </span>
            </div>
            <ProgressBar value={allowanceRatio} tone="accent" className="mt-2 bg-paper/20" />
            <p className="mt-2 text-xs text-paper/60">
              Resets {resetDate.toLocaleDateString(undefined, { day: "numeric", month: "long" })}
            </p>
          </div>
          <div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Pack minutes</span>
              <span className="text-paper/60">{formatMinuteCount(summary.packMinutesRemaining)} min</span>
            </div>
            <ProgressBar
              value={summary.packMinutesPurchased ? summary.packMinutesRemaining / summary.packMinutesPurchased : 0}
              tone="accent"
              className="mt-2 bg-paper/20"
            />
            <p className="mt-2 text-xs text-paper/60">Never expire. Used after your monthly allowance.</p>
          </div>
        </div>
      </Card>

      <section>
        <SectionTitle>Plans</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          {[plans.free, plans.professional].map((plan) => {
            const current = summary.plan === plan.id;
            return (
              <Card key={plan.id} className={cn("flex flex-col p-6", current && "border-2 border-ink")}>
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-lg font-bold">
                    {plan.premiumAccess ? <Crown className="h-4 w-4" aria-hidden /> : null}
                    {plan.label}
                  </p>
                  {current ? <Badge tone="dark">Current</Badge> : null}
                </div>
                <p className="mt-2 text-3xl font-bold tracking-[-0.03em]">{plan.priceLabel}</p>
                <ul className="mt-4 flex-1 space-y-2 text-sm">
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 shrink-0" /> {plan.monthlyMinutes} practice minutes every month
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 shrink-0" />
                    {plan.premiumAccess
                      ? "Every course, including NAATI CCL & CPI"
                      : "Free courses + a preview dialogue in each premium course"}
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 shrink-0" /> Instant scoring and feedback
                  </li>
                </ul>
                {plan.id === "professional" && !isPro ? (
                  <Button className="mt-6" size="lg" disabled={pending === "pro"} onClick={subscribe}>
                    {pending === "pro" ? "Opening checkout…" : "Upgrade to Pro"}
                  </Button>
                ) : null}
                {plan.id === "professional" && isPro && summary.hasStripeCustomer ? (
                  <Button className="mt-6" variant="outline" onClick={openPortal}>
                    Manage subscription
                  </Button>
                ) : null}
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <SectionTitle>Minute packs</SectionTitle>
        <p className="-mt-1 mb-4 text-sm text-gray-500">
          One-off top-ups. Any pack also unlocks every module. Prices in {CURRENCY_LABEL}.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {packList.map((pack) => (
            <Card key={pack.id} className="flex flex-col p-6">
              <p className="flex items-center gap-1.5 font-bold">
                <Package className="h-4 w-4" aria-hidden />
                {pack.label}
              </p>
              <p className="mt-2 text-3xl font-bold tracking-[-0.03em]">{pack.priceLabel}</p>
              <p className="mt-1 flex items-center gap-1 text-sm font-semibold">
                <Clock className="h-3.5 w-3.5" aria-hidden /> {pack.minutes} minutes
              </p>
              <p className="mt-2 flex-1 text-sm text-gray-500">{pack.description}</p>
              <Button className="mt-5" variant="secondary" disabled={pending === pack.id} onClick={() => buyPack(pack.id)}>
                {pending === pack.id ? "Opening checkout…" : "Buy"}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {summary.recentCharges.length > 0 ? (
        <section>
          <SectionTitle>Recent sessions</SectionTitle>
          <Card className="divide-y divide-gray-200">
            {summary.recentCharges.map((charge) => (
              <div key={charge.attemptId} className="flex justify-between px-5 py-3 text-sm">
                <span className="text-gray-500">
                  {new Date(charge.createdAt).toLocaleString(undefined, {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                <span className="flex items-center gap-1 font-semibold tabular-nums">
                  <Clock className="h-3.5 w-3.5 text-gray-500" aria-hidden /> {charge.minutes} min
                </span>
              </div>
            ))}
          </Card>
        </section>
      ) : null}
    </div>
  );
}
