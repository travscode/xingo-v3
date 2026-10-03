"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { ArrowRight, Banknote, CheckCircle2, Clock, ExternalLink, Landmark, ShieldCheck } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { friendlyError } from "@/lib/errors";
import { CREATOR_REVENUE_SHARE, EARNINGS_HOLD_DAYS, formatAud, PAYOUT_THRESHOLD_CENTS } from "@/lib/marketplace";
import { formatMinuteCount } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { Badge, Card, PageHeader, SectionTitle, Skeleton, Stat } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

const share = Math.round(CREATOR_REVENUE_SHARE * 100);

function longDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "—";
}

function monthLabel(month: string) {
  return new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-AU", { month: "short", timeZone: "UTC" });
}

const bankStatus: Record<string, { label: string; tone: "success" | "warning" | "neutral" }> = {
  paid: { label: "In your bank", tone: "success" },
  in_transit: { label: "On its way", tone: "neutral" },
  pending: { label: "Pending", tone: "neutral" },
  failed: { label: "Failed", tone: "warning" },
  canceled: { label: "Cancelled", tone: "warning" },
};

const transferStatus: Record<string, { label: string; tone: "success" | "warning" | "neutral" }> = {
  paid: { label: "Sent", tone: "success" },
  pending: { label: "Sending", tone: "neutral" },
  failed: { label: "Failed", tone: "warning" },
};

/** Marketplace → Payouts: getting set up with Stripe Express, earnings analytics and payout history. */
export function CreatorEarnings() {
  const data = useQuery(api.payouts.overview, {});
  const courses = useQuery(api.marketplace.myCourses, {});
  const startSetup = useAction(api.connect.startPayoutSetup);
  const refresh = useAction(api.connect.refreshPayoutAccount);
  const sync = useAction(api.connect.syncMyPayouts);
  const openDashboard = useAction(api.connect.openPayoutDashboard);
  const searchParams = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripeBalance, setStripeBalance] = useState<{ availableCents: number; pendingCents: number } | null>(null);
  const refreshed = useRef(false);
  const synced = useRef(false);

  // Coming back from Stripe onboarding: re-read the account once.
  useEffect(() => {
    if (searchParams.get("setup") && !refreshed.current) {
      refreshed.current = true;
      void refresh({}).catch(() => undefined);
    }
  }, [refresh, searchParams]);

  // Once connected: pull bank payouts and the Stripe balance (fills any gap a webhook missed).
  const connected = data?.account.connected ?? false;
  useEffect(() => {
    if (!connected || synced.current) return;
    synced.current = true;
    void sync({})
      .then((balance) => setStripeBalance(balance))
      .catch(() => undefined);
  }, [connected, sync]);

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

  if (data === undefined || courses === undefined) return <Skeleton className="h-96" />;
  if (data === null) return null;

  const { account, totals } = data;
  const maxMonth = Math.max(1, ...data.series.map((month) => month.earnedCents));

  return (
    <div className="space-y-10">
      <PageHeader
        title="Payouts"
        description={`Your course earnings and payments. You earn ${share}% of XINGO's net revenue from paid minutes practised in your courses, paid through Stripe.`}
        actions={
          account.payoutsEnabled ? (
            <Button variant="outline" disabled={busy} onClick={() => void go(() => openDashboard({}))}>
              Stripe dashboard <ExternalLink className="h-4 w-4" aria-hidden />
            </Button>
          ) : null
        }
      />

      {account.payoutsEnabled ? null : (
        <ConnectGuide
          connected={account.connected}
          detailsSubmitted={account.detailsSubmitted}
          busy={busy}
          onConnect={() => void go(() => startSetup({}))}
          error={error}
        />
      )}

      <section>
        <SectionTitle>Balance</SectionTitle>
        <Card className="grid grid-cols-2 gap-6 p-6 lg:grid-cols-4">
          <Stat label="Ready to pay" value={formatAud(totals.availableCents)} hint={`Paid monthly once it reaches ${formatAud(PAYOUT_THRESHOLD_CENTS)}`} />
          <Stat label="On hold" value={formatAud(totals.pendingCents)} hint={`Held ${EARNINGS_HOLD_DAYS} days for refunds`} />
          <Stat label="Sent to Stripe" value={formatAud(totals.transferredCents)} hint="Total XINGO has paid you" />
          <Stat label="Earned all time" value={formatAud(totals.earnedCents)} hint="Across every course" />
        </Card>
        {stripeBalance ? (
          <p className="mt-2 text-sm text-gray-500">
            In your Stripe balance now: {formatAud(stripeBalance.availableCents)} available
            {stripeBalance.pendingCents ? `, ${formatAud(stripeBalance.pendingCents)} pending` : ""}. Stripe pays this to your bank on your payout
            schedule.
          </p>
        ) : null}
        {error && account.payoutsEnabled ? <p className="mt-2 text-sm text-record">{error}</p> : null}
      </section>

      <section>
        <SectionTitle>Last 12 months</SectionTitle>
        <Card className="p-6">
          <div className="grid grid-cols-3 gap-6 sm:grid-cols-3">
            <Stat label="Learners" value={totals.learners.toLocaleString("en-AU")} />
            <Stat label="Paid minutes" value={formatMinuteCount(totals.paidMinutes)} />
            <Stat label="Paid sessions" value={totals.paidSessions.toLocaleString("en-AU")} />
          </div>
          <div className="mt-8 flex h-40 items-end gap-1.5 sm:gap-3" role="img" aria-label="Earnings by month for the last 12 months">
            {data.series.map((month) => (
              <div key={month.month} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className={cn("w-full rounded-t-md", month.earnedCents > 0 ? "bg-ink" : "bg-gray-100")}
                    style={{ height: `${Math.max(3, (month.earnedCents / maxMonth) * 100)}%` }}
                    title={`${monthLabel(month.month)}: ${formatAud(month.earnedCents)} · ${month.sessions} sessions`}
                  />
                </div>
                <span className="text-[11px] text-gray-500">{monthLabel(month.month)}</span>
              </div>
            ))}
          </div>
          {totals.earnedCents === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              No earnings yet. You earn when learners on a paid plan or minute pack practise your published courses.
            </p>
          ) : null}
        </Card>
      </section>

      <section>
        <SectionTitle>By course</SectionTitle>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b border-gray-200 text-xs text-gray-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Course</th>
                <th className="px-5 py-3 text-right font-semibold">Views</th>
                <th className="px-5 py-3 text-right font-semibold">Learners</th>
                <th className="px-5 py-3 text-right font-semibold">Sessions</th>
                <th className="px-5 py-3 text-right font-semibold">Minutes</th>
                <th className="px-5 py-3 text-right font-semibold">Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course.moduleId}>
                  <td className="px-5 py-3 font-semibold">
                    <Link href={`/marketplace/manage/${course.moduleId}`} className="hover:underline">
                      {course.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">{course.stats.views.toLocaleString("en-AU")}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{course.stats.learners.toLocaleString("en-AU")}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{course.stats.sessions.toLocaleString("en-AU")}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{formatMinuteCount(course.stats.minutes)}</td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatAud(course.stats.earnedCents)}</td>
                </tr>
              ))}
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-gray-500">
                    No courses yet.{" "}
                    <Link href="/marketplace/new" className="font-semibold text-ink underline">
                      Create one
                    </Link>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <SectionTitle>Payments from XINGO</SectionTitle>
          <HistoryList
            empty="No payments yet. XINGO pays your available balance to your Stripe account each month."
            rows={data.transfers.map((transfer) => ({
              id: transfer.id,
              date: transfer.paidAt ?? transfer.createdAt,
              amount: formatAud(transfer.amountCents),
              status: transferStatus[transfer.status] ?? { label: transfer.status, tone: "neutral" as const },
              detail: transfer.reference ? `Stripe ref ${transfer.reference}` : null,
            }))}
          />
        </div>
        <div>
          <SectionTitle>Payouts to your bank</SectionTitle>
          <HistoryList
            empty={
              account.connected
                ? "No bank payouts yet. Stripe pays your Stripe balance to your bank automatically."
                : "Connect Stripe Express to see payouts to your bank here."
            }
            rows={data.bankPayouts.map((payout) => ({
              id: payout.id,
              date: payout.createdAt,
              amount: formatAud(payout.amountCents),
              status: bankStatus[payout.status] ?? { label: payout.status, tone: "neutral" as const },
              detail:
                payout.failureMessage ??
                (payout.arrivalDate ? `${payout.status === "paid" ? "Arrived" : "Expected"} ${longDate(payout.arrivalDate)}` : null),
            }))}
          />
        </div>
      </section>

      <p className="text-xs text-gray-500">
        Earnings, holds and payouts are covered in the{" "}
        <Link href="/creator-terms#earnings" className="underline">
          Creator Terms
        </Link>
        . Questions about a payment? Email hello@xingo.ai.
      </p>
    </div>
  );
}

function ConnectGuide({
  connected,
  detailsSubmitted,
  busy,
  onConnect,
  error,
}: {
  connected: boolean;
  detailsSubmitted: boolean;
  busy: boolean;
  onConnect: () => void;
  error: string | null;
}) {
  const underReview = connected && detailsSubmitted;
  const steps = [
    {
      icon: <ArrowRight className="h-4 w-4" aria-hidden />,
      title: "Connect to Stripe Express",
      body: "Press the button below. Stripe opens in this tab and creates a free Express account for your payouts.",
    },
    {
      icon: <ShieldCheck className="h-4 w-4" aria-hidden />,
      title: "Verify your details with Stripe",
      body: "Have photo ID and your bank's BSB and account number ready. It usually takes 5–10 minutes. XINGO never sees your bank details.",
    },
    {
      icon: <CheckCircle2 className="h-4 w-4" aria-hidden />,
      title: "Come back to XINGO",
      body: "Stripe brings you back here. Once Stripe has checked your details, payouts switch on and we'll email you.",
    },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <Badge tone={connected ? "warning" : "neutral"}>{underReview ? "Stripe is checking your details" : connected ? "Setup not finished" : "Not connected yet"}</Badge>
          <h2 className="mt-4 text-2xl font-bold tracking-[-0.03em]">
            {underReview ? "Almost there" : connected ? "Finish connecting Stripe" : "Get paid with Stripe Express"}
          </h2>
          <p className="mt-2 text-gray-600">
            {underReview
              ? "You've sent your details to Stripe. Payouts switch on as soon as they're verified, usually within a day or two. If Stripe needs anything else, you can continue below."
              : "XINGO pays creators through Stripe Connect. Connect a Stripe Express account once and your earnings go straight to your bank. Your earnings are kept safe until you do."}
          </p>
          <ol className="mt-6 space-y-4">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-paper">{index + 1}</span>
                <span>
                  <span className="block font-semibold">{step.title}</span>
                  <span className="block text-sm text-gray-500">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
          <Button size="lg" className="mt-6" disabled={busy} onClick={onConnect}>
            {busy ? "Opening Stripe…" : connected ? "Continue on Stripe" : "Connect to Stripe Express now"}
          </Button>
          {error ? <p className="mt-3 text-sm text-record">{error}</p> : null}
        </div>
        <div className="rounded-xl bg-gray-50 p-5">
          <p className="font-semibold">How payouts work</p>
          <ul className="mt-3 space-y-3 text-sm text-gray-600">
            <li className="flex gap-2.5">
              <Banknote className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              You earn {share}% of XINGO&apos;s net revenue from paid minutes learners spend in your courses.
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              Earnings are held for {EARNINGS_HOLD_DAYS} days to cover refunds, then paid monthly once you have at least{" "}
              {formatAud(PAYOUT_THRESHOLD_CENTS)}. Smaller amounts carry over.
            </li>
            <li className="flex gap-2.5">
              <Landmark className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              XINGO sends the money to your Stripe account in Australian dollars, then Stripe pays it into your bank, usually within a few
              business days.
            </li>
            <li className="flex gap-2.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              Payouts are available to creators who can hold a Stripe account in Australia. You&apos;re responsible for your own tax.
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}

function HistoryList({
  rows,
  empty,
}: {
  rows: Array<{ id: string; date: string; amount: string; status: { label: string; tone: "success" | "warning" | "neutral" }; detail: string | null }>;
  empty: string;
}) {
  if (rows.length === 0) return <p className="rounded-xl border border-dashed border-gray-200 px-5 py-6 text-sm text-gray-500">{empty}</p>;
  return (
    <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
      {rows.map((row) => (
        <li key={row.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
          <span className="min-w-0">
            <span className="block font-semibold">{longDate(row.date)}</span>
            {row.detail ? <span className="block truncate text-xs text-gray-500">{row.detail}</span> : null}
          </span>
          <span className="flex shrink-0 items-center gap-3">
            <Badge tone={row.status.tone}>{row.status.label}</Badge>
            <span className="font-semibold tabular-nums">{row.amount}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
