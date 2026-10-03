"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import type { FunctionArgs, FunctionReturnType } from "convex/server";
import { ChevronDown, ChevronUp } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { friendlyError } from "@/lib/errors";
import { formatMinuteCount } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { Badge, Card, Skeleton, Stat } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

type Args = FunctionArgs<typeof api.adminUsage.users>;

const periods: { id: Args["period"]; label: string }[] = [
  { id: "this_month", label: "This month" },
  { id: "last_month", label: "Last month" },
  { id: "all", label: "All time" },
];

const PAGE_SIZE = 25;

function usd(value: number) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "USD", maximumFractionDigits: value < 10 ? 2 : 0 }).format(value);
}

function shortDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "2-digit" }) : "—";
}

function ago(iso: string | null) {
  if (!iso) return "Never";
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return shortDate(iso);
}

const selectClass = "h-10 rounded-lg bg-gray-100 px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-live";

/** Admin → Usage: every account's practice and estimated AI cost, with search, filters and paging. */
export function UsageAdmin() {
  const [period, setPeriod] = useState<Args["period"]>("this_month");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState<Args["plan"]>("all");
  const [status, setStatus] = useState<Args["status"]>("all");
  const [sort, setSort] = useState<Args["sort"]>("cost");
  const [paging, setPaging] = useState({ key: "", page: 1 });
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Any change of filters goes back to page 1.
  const filterKey = [period, search, plan, status, sort].join("|");
  const page = paging.key === filterKey ? paging.page : 1;
  const setPage = (next: number) => setPaging({ key: filterKey, page: next });

  const data = useQuery(api.adminUsage.users, { period, search: search || undefined, plan, status, sort, page, pageSize: PAGE_SIZE });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg bg-gray-100 p-1" role="group" aria-label="Period">
          {periods.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={period === item.id}
              onClick={() => setPeriod(item.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-semibold",
                period === item.id ? "bg-paper text-ink shadow-sm" : "text-gray-500 hover:text-ink",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search name or email"
          aria-label="Search users"
          className="h-10 min-w-[200px] flex-1 rounded-lg bg-gray-100 px-3 text-sm outline-none focus:ring-2 focus:ring-live"
        />
        <select aria-label="Plan" value={plan} onChange={(event) => setPlan(event.target.value as Args["plan"])} className={selectClass}>
          <option value="all">All plans</option>
          <option value="free">Free</option>
          <option value="professional">Pro</option>
          <option value="organization">Organisation</option>
          <option value="admin">Admins</option>
        </select>
        <select aria-label="Status" value={status} onChange={(event) => setStatus(event.target.value as Args["status"])} className={selectClass}>
          <option value="all">Everyone</option>
          <option value="active">Practised in period</option>
          <option value="inactive">No practice in period</option>
          <option value="packs">Bought minute packs</option>
          <option value="paused">Paused</option>
        </select>
        <select aria-label="Sort" value={sort} onChange={(event) => setSort(event.target.value as Args["sort"])} className={selectClass}>
          <option value="cost">Highest AI cost</option>
          <option value="minutes">Most minutes</option>
          <option value="attempts">Most sessions</option>
          <option value="lastActive">Recently active</option>
          <option value="joined">Newest accounts</option>
        </select>
      </div>

      {!data ? (
        <Skeleton className="h-96" />
      ) : (
        <>
          <Card className="grid grid-cols-2 gap-6 p-6 lg:grid-cols-4">
            <Stat label="Accounts" value={data.summary.users.toLocaleString("en-AU")} hint={`${data.summary.activeUsers.toLocaleString("en-AU")} practised`} />
            <Stat label="Sessions started" value={data.summary.attempts.toLocaleString("en-AU")} />
            <Stat label="Minutes charged" value={formatMinuteCount(data.summary.minutes)} />
            <Stat label="Est. AI cost" value={usd(data.summary.costUsd)} hint="Voice + grading, USD" />
          </Card>

          <Card className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="border-b border-gray-200 text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Plan</th>
                  <th className="px-4 py-3 text-right font-semibold">Sessions</th>
                  <th className="px-4 py-3 text-right font-semibold">Minutes</th>
                  <th className="px-4 py-3 text-right font-semibold">Est. AI cost</th>
                  <th className="px-4 py-3 text-right font-semibold">Minutes left</th>
                  <th className="px-4 py-3 font-semibold">Last active</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                      No accounts match.
                    </td>
                  </tr>
                ) : null}
                {data.rows.map((row) => (
                  <UsageRow key={row.clerkId} row={row} open={open === row.clerkId} onToggle={() => setOpen(open === row.clerkId ? null : row.clerkId)} />
                ))}
              </tbody>
            </table>
          </Card>

          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-gray-500">
              {data.total === 0
                ? "0 accounts"
                : `${((data.page - 1) * PAGE_SIZE + 1).toLocaleString("en-AU")}–${Math.min(data.page * PAGE_SIZE, data.total).toLocaleString("en-AU")} of ${data.total.toLocaleString("en-AU")}`}
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={data.page <= 1} onClick={() => setPage(data.page - 1)}>
                Previous
              </Button>
              <span className="tabular-nums text-gray-500">
                Page {data.page} of {data.pageCount}
              </span>
              <Button size="sm" variant="outline" disabled={data.page >= data.pageCount} onClick={() => setPage(data.page + 1)}>
                Next
              </Button>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            AI cost is an estimate from the token counts recorded during sessions and grading (rates in lib/costs.ts). Your OpenAI bill also
            includes image generation and testing done outside practice sessions. Minutes left includes pack minutes.
          </p>
        </>
      )}
    </div>
  );
}

type Row = FunctionReturnType<typeof api.adminUsage.users>["rows"][number];

function UsageRow({ row, open, onToggle }: { row: Row; open: boolean; onToggle: () => void }) {
  return (
    <>
      <tr className={cn(open && "bg-gray-50")}>
        <td className="px-4 py-3">
          <p className="flex items-center gap-2 font-semibold">
            {row.name}
            {row.paused ? <Badge tone="warning">Paused</Badge> : null}
          </p>
          <p className="text-gray-500">{row.email}</p>
        </td>
        <td className="px-4 py-3">
          <Badge tone={row.role === "platform_admin" ? "dark" : row.plan === "free" ? "neutral" : "accent"}>{row.planLabel}</Badge>
          {row.boughtPacks ? <span className="ml-1.5 text-xs text-gray-500">+ packs</span> : null}
        </td>
        <td className="px-4 py-3 text-right tabular-nums">{row.attempts.toLocaleString("en-AU")}</td>
        <td className="px-4 py-3 text-right tabular-nums">{formatMinuteCount(row.minutes)}</td>
        <td className="px-4 py-3 text-right font-semibold tabular-nums">{usd(row.costUsd)}</td>
        <td className="px-4 py-3 text-right tabular-nums">
          {row.role === "platform_admin" ? <span className="text-gray-500">Unlimited</span> : formatMinuteCount(row.remainingMinutes)}
        </td>
        <td className="px-4 py-3 text-gray-500">{ago(row.lastActiveAt)}</td>
        <td className="px-4 py-3 text-right">
          <Button size="sm" variant="ghost" onClick={onToggle} aria-expanded={open}>
            Manage {open ? <ChevronUp className="h-4 w-4" aria-hidden /> : <ChevronDown className="h-4 w-4" aria-hidden />}
          </Button>
        </td>
      </tr>
      {open ? (
        <tr className="bg-gray-50">
          <td colSpan={8} className="px-4 pb-5">
            <UserUsageDetail clerkId={row.clerkId} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

const endReasonLabels: Record<string, string> = {
  objective_met: "Finished task",
  learner_finished: "Ended by learner",
  time_up: "Time limit",
  stalled: "Stalled",
  out_of_minutes: "Out of minutes",
};

function UserUsageDetail({ clerkId }: { clerkId: string }) {
  const detail = useQuery(api.adminUsage.user, { clerkId });
  const me = useQuery(api.users.me, {});
  const grantMinutes = useMutation(api.admin.grantMinutes);
  const setPaused = useMutation(api.adminUsage.setPracticePaused);
  const [message, setMessage] = useState<string | null>(null);

  if (detail === undefined) return <Skeleton className="h-40" />;
  if (detail === null) return <p className="text-sm text-gray-500">User not found.</p>;

  const isSelf = me?.user.clerkId === detail.clerkId;
  const ent = detail.entitlement;

  const grant = async () => {
    const input = window.prompt(`Grant how many minutes to ${detail.email}? They never expire.`, "30");
    const minutes = Number(input);
    if (!input || !Number.isFinite(minutes)) return;
    try {
      await grantMinutes({ clerkId: detail.clerkId, minutes, note: "Admin grant" });
      setMessage(`Granted ${minutes} minutes.`);
    } catch (error) {
      setMessage(friendlyError(error));
    }
  };

  const togglePause = async () => {
    try {
      if (detail.pausedAt) {
        await setPaused({ clerkId: detail.clerkId, paused: false });
        setMessage("Practice resumed.");
      } else {
        const reason = window.prompt(
          `Pause practice for ${detail.email}? They won't be able to start new sessions until you resume. Reason (only admins see this):`,
          "",
        );
        if (reason === null) return;
        await setPaused({ clerkId: detail.clerkId, paused: true, reason });
        setMessage("Practice paused.");
      }
    } catch (error) {
      setMessage(friendlyError(error));
    }
  };

  return (
    <div className="grid gap-4 pt-1 lg:grid-cols-[1fr_1.4fr]">
      <div className="space-y-4">
        <Card className="space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">Account</p>
            <span className="text-xs text-gray-500">Joined {shortDate(detail.createdAt)}</span>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-gray-500">Plan</dt>
            <dd>
              {ent.planLabel}
              {detail.stripeSubscriptionStatus ? <span className="text-gray-500"> · Stripe {detail.stripeSubscriptionStatus}</span> : null}
            </dd>
            <dt className="text-gray-500">This month</dt>
            <dd className="tabular-nums">
              {formatMinuteCount(ent.allowanceUsed)} of {formatMinuteCount(ent.monthlyMinutes)} used
            </dd>
            <dt className="text-gray-500">Pack minutes</dt>
            <dd className="tabular-nums">
              {formatMinuteCount(ent.packMinutesRemaining)} left of {formatMinuteCount(ent.packMinutesPurchased)}
            </dd>
            <dt className="text-gray-500">Minutes left</dt>
            <dd className="font-semibold tabular-nums">{formatMinuteCount(ent.remainingMinutes)}</dd>
          </dl>
          {detail.pausedAt ? (
            <p className="rounded-lg bg-warning/30 px-3 py-2 text-sm">
              Paused {shortDate(detail.pausedAt)}
              {detail.pausedReason ? `: ${detail.pausedReason}` : ""}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" onClick={() => void grant()}>
              Grant minutes
            </Button>
            {!isSelf ? (
              <Button size="sm" variant="outline" onClick={() => void togglePause()}>
                {detail.pausedAt ? "Resume practice" : "Pause practice"}
              </Button>
            ) : null}
            {detail.stripeCustomerId ? (
              <Button size="sm" variant="ghost" asChild>
                <a href={`https://dashboard.stripe.com/customers/${detail.stripeCustomerId}`} target="_blank" rel="noopener noreferrer">
                  Open in Stripe
                </a>
              </Button>
            ) : null}
          </div>
          {message ? <p className="text-sm text-gray-600">{message}</p> : null}
        </Card>

        <Card className="p-4">
          <p className="font-semibold">By month</p>
          {detail.months.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">No practice yet.</p>
          ) : (
            <table className="mt-2 w-full text-sm">
              <thead className="text-xs text-gray-500">
                <tr>
                  <th className="py-1 text-left font-semibold">Month</th>
                  <th className="py-1 text-right font-semibold">Sessions</th>
                  <th className="py-1 text-right font-semibold">Minutes</th>
                  <th className="py-1 text-right font-semibold">Est. cost</th>
                </tr>
              </thead>
              <tbody>
                {detail.months.map((month) => (
                  <tr key={month.month} className="tabular-nums">
                    <td className="py-1">
                      {new Date(`${month.month}-01T00:00:00Z`).toLocaleDateString("en-AU", { month: "short", year: "numeric", timeZone: "UTC" })}
                    </td>
                    <td className="py-1 text-right">{month.attempts}</td>
                    <td className="py-1 text-right">{formatMinuteCount(month.minutes)}</td>
                    <td className="py-1 text-right">{usd(month.costUsd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {detail.grants.length > 0 ? (
            <>
              <p className="mt-4 font-semibold">Minutes added</p>
              <ul className="mt-1 space-y-1 text-sm">
                {detail.grants.map((grant, index) => (
                  <li key={index} className="flex justify-between gap-3">
                    <span>
                      {grant.source === "pack" ? `Pack${grant.packId ? ` (${grant.packId})` : ""}` : grant.source === "admin" ? "Admin grant" : "Promo"}
                    </span>
                    <span className="tabular-nums text-gray-500">
                      +{grant.minutes} · {shortDate(grant.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </Card>
      </div>

      <Card className="overflow-x-auto p-4">
        <p className="font-semibold">Recent sessions</p>
        {detail.recent.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No sessions yet.</p>
        ) : (
          <table className="mt-2 w-full min-w-[480px] text-sm">
            <thead className="text-xs text-gray-500">
              <tr>
                <th className="py-1 text-left font-semibold">Scenario</th>
                <th className="py-1 text-left font-semibold">When</th>
                <th className="py-1 text-right font-semibold">Length</th>
                <th className="py-1 text-right font-semibold">Charged</th>
                <th className="py-1 text-left font-semibold pl-3">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {detail.recent.map((session) => (
                <tr key={session.id}>
                  <td className="max-w-[220px] truncate py-1.5 pr-2" title={session.title}>
                    {session.title}
                    {session.mode === "practice" ? <span className="text-gray-500"> · practice</span> : null}
                  </td>
                  <td className="py-1.5 text-gray-500">{shortDate(session.startedAt)}</td>
                  <td className="py-1.5 text-right tabular-nums">{Math.round(session.durationSeconds / 60)} min</td>
                  <td className="py-1.5 text-right tabular-nums">{session.chargedMinutes}</td>
                  <td className="py-1.5 pl-3 text-gray-500">
                    {session.status === "in_progress"
                      ? "Live now"
                      : session.endReason
                        ? endReasonLabels[session.endReason] ?? session.endReason
                        : session.status.replace("_", " ")}
                    {session.voiceReconnects > 0 ? ` · ${session.voiceReconnects} reconnect${session.voiceReconnects === 1 ? "" : "s"}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
