"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { Banknote, CheckCircle2, ExternalLink } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { friendlyError } from "@/lib/errors";
import { CREATOR_REVENUE_SHARE, EARNINGS_HOLD_DAYS, formatAud, PAYOUT_THRESHOLD_CENTS } from "@/lib/marketplace";
import { Badge, Card, PageHeader, SectionTitle, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/admin/content/fields";

export function CreatorEarnings() {
  const summary = useQuery(api.marketplace.creatorSummary, {});
  const courses = useQuery(api.marketplace.myCourses, {});
  const startSetup = useAction(api.connect.startPayoutSetup);
  const refresh = useAction(api.connect.refreshPayoutAccount);
  const openDashboard = useAction(api.connect.openPayoutDashboard);
  const searchParams = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshed = useRef(false);

  // Coming back from Stripe onboarding: re-read the account once.
  useEffect(() => {
    if (searchParams.get("setup") && !refreshed.current) {
      refreshed.current = true;
      void refresh({}).catch(() => undefined);
    }
  }, [refresh, searchParams]);

  const go = async (action: () => Promise<{ url: string }>) => {
    setBusy(true);
    setError(null);
    try {
      const { url } = await action();
      window.location.href = url;
    } catch (actionError) {
      setError(friendlyError(actionError));
      setBusy(false);
    }
  };

  if (summary === undefined || courses === undefined) return <Skeleton className="h-96" />;
  if (summary === null) return null;

  const account = summary.payoutAccount;

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: "Created by you", href: "/marketplace?tab=yours" }, { label: "Earnings" }]} />
      <PageHeader
        title="Earnings"
        description={`You earn ${Math.round(CREATOR_REVENUE_SHARE * 100)}% of XINGO's net revenue from paid minutes practised in your courses.`}
      />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Ready to pay", value: summary.availableCents, hint: `Paid monthly from ${formatAud(PAYOUT_THRESHOLD_CENTS)}` },
          { label: "Pending", value: summary.pendingCents, hint: `Held ${EARNINGS_HOLD_DAYS} days for refunds` },
          { label: "Paid out", value: summary.paidCents, hint: "To your bank" },
          { label: "Earned all time", value: summary.totalCents, hint: "Across every course" },
        ].map((item) => (
          <Card key={item.label} className="p-4">
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{formatAud(item.value)}</p>
            <p className="text-xs text-gray-500">{item.hint}</p>
          </Card>
        ))}
      </section>

      <section>
        <SectionTitle>Payout account</SectionTitle>
        <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            {account.payoutsEnabled ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden /> : <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" aria-hidden />}
            <div>
              <p className="font-semibold">
                {account.payoutsEnabled ? "Payouts are on" : account.connected ? "Finish setting up payouts" : "Set up payouts"}
              </p>
              <p className="text-sm text-gray-500">
                {account.payoutsEnabled
                  ? "Earnings are sent to your bank account each month through Stripe."
                  : "Stripe verifies your identity and bank details. Your earnings are kept safe until it's done."}
              </p>
            </div>
          </div>
          {account.payoutsEnabled ? (
            <Button variant="outline" disabled={busy} onClick={() => void go(() => openDashboard({}))}>
              Stripe dashboard <ExternalLink className="h-4 w-4" aria-hidden />
            </Button>
          ) : (
            <Button disabled={busy} onClick={() => void go(() => startSetup({}))}>
              {busy ? "Opening Stripe…" : account.connected ? "Continue setup" : "Set up payouts"}
            </Button>
          )}
        </Card>
        {error ? <p className="mt-2 text-sm text-record">{error}</p> : null}
      </section>

      <section>
        <SectionTitle>By course</SectionTitle>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-gray-200 text-xs text-gray-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Course</th>
                <th className="px-5 py-3 font-semibold">Learners</th>
                <th className="px-5 py-3 font-semibold">Minutes</th>
                <th className="px-5 py-3 font-semibold">Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course.moduleId}>
                  <td className="px-5 py-3 font-semibold">{course.title}</td>
                  <td className="px-5 py-3 tabular-nums">{course.stats.learners}</td>
                  <td className="px-5 py-3 tabular-nums">{course.stats.minutes}</td>
                  <td className="px-5 py-3 tabular-nums">{formatAud(course.stats.earnedCents)}</td>
                </tr>
              ))}
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-gray-500">
                    No courses yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {summary.payouts.length > 0 ? (
        <section>
          <SectionTitle>Payouts</SectionTitle>
          <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
            {summary.payouts.map((payout) => (
              <li key={payout.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span>{new Date(payout.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}</span>
                <span className="flex items-center gap-3">
                  <Badge tone={payout.status === "paid" ? "success" : payout.status === "failed" ? "warning" : "neutral"} className="capitalize">
                    {payout.status}
                  </Badge>
                  <span className="font-semibold tabular-nums">{formatAud(payout.amountCents)}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
