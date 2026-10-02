"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import { friendlyError } from "@/lib/errors";
import { getGoal } from "@/lib/goals";
import { cn } from "@/lib/utils";
import { AdminStudio } from "@/components/admin/admin-studio";
import { Badge, Card, EmptyState, PageHeader, SectionTitle, Skeleton, Stat } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "invites", label: "Invites" },
  { id: "content", label: "Content" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const roleLabels = {
  interpreter: "Learner",
  student: "Student",
  organization_admin: "Org admin",
  platform_admin: "Admin",
} as const;

type Role = keyof typeof roleLabels;

function money(cents: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}

function shortDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "2-digit" }) : "—";
}

export function AdminConsole() {
  const me = useQuery(api.users.me, {});
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = (tabs.find((t) => t.id === searchParams.get("tab"))?.id ?? "overview") as TabId;

  if (me === undefined) {
    return <Skeleton className="h-80" />;
  }

  if (me?.user.role !== "platform_admin") {
    return (
      <EmptyState
        title="Admins only"
        description="Ask an existing admin to invite you from Admin → Invites."
        action={
          <Button asChild>
            <Link href="/dashboard">Home</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Admin" description="Revenue, users and content. Visible to platform admins only." />
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200" role="tablist">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => router.replace(`${pathname}?tab=${item.id}`)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold",
              tab === item.id ? "border-ink text-ink" : "border-transparent text-gray-500 hover:text-ink",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      {tab === "overview" ? <OverviewTab /> : null}
      {tab === "users" ? <UsersTab myClerkId={me.user.clerkId} /> : null}
      {tab === "invites" ? <InvitesTab /> : null}
      {tab === "content" ? <AdminStudio /> : null}
    </div>
  );
}

type Finance = FunctionReturnType<typeof api.adminActions.financeSnapshot>;

function OverviewTab() {
  const overview = useQuery(api.admin.overview, {});
  const financeSnapshot = useAction(api.adminActions.financeSnapshot);
  const [finance, setFinance] = useState<Finance | null>(null);
  const [financeError, setFinanceError] = useState<string | null>(null);

  useEffect(() => {
    void financeSnapshot({})
      .then(setFinance)
      .catch((error) => setFinanceError(friendlyError(error, "Couldn't reach Stripe.")));
  }, [financeSnapshot]);

  if (!overview) {
    return <Skeleton className="h-96" />;
  }

  const costThisMonth = overview.aiCost.thisMonth.totalUsd;

  return (
    <div className="space-y-10">
      <section>
        <SectionTitle
          action={
            finance?.configured ? (
              <Badge tone={finance.livemode ? "success" : "warning"}>{finance.livemode ? "Live" : "Test mode"}</Badge>
            ) : null
          }
        >
          Revenue (Stripe)
        </SectionTitle>
        {financeError ? <p className="text-sm text-record">{financeError}</p> : null}
        {!finance && !financeError ? <Skeleton className="h-28" /> : null}
        {finance && !finance.configured ? (
          <Card tone="muted" className="p-5 text-sm">
            Stripe isn&apos;t connected yet. Set <code>STRIPE_SECRET_KEY</code> in the Convex environment — see
            docs/runbooks/stripe-setup.md.
          </Card>
        ) : null}
        {finance?.configured ? (
          <>
            <Card className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="MRR" value={money(finance.mrrCents, finance.currency)} hint={`${finance.activeSubscriptions} active subscriptions`} />
              <Stat
                label="Gross, last 30 days"
                value={money(finance.last30DaysGrossCents, finance.currency)}
                hint={finance.last30DaysRefundedCents ? `${money(finance.last30DaysRefundedCents, finance.currency)} refunded` : "No refunds"}
              />
              <Stat label="Available balance" value={money(finance.availableBalanceCents, finance.currency)} hint={`${money(finance.pendingBalanceCents, finance.currency)} pending`} />
              <Stat label="Past due" value={finance.pastDueSubscriptions} hint="subscriptions retrying payment" />
            </Card>
            {finance.recentPayments.length > 0 ? (
              <Card className="mt-4 divide-y divide-gray-200">
                {finance.recentPayments.map((payment) => (
                  <div key={payment.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                    <span className="min-w-0 truncate">
                      <span className="font-semibold">{payment.email ?? "Unknown customer"}</span>
                      <span className="ml-2 text-gray-500">{payment.description ?? ""}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-gray-500">{shortDate(payment.createdAt)}</span>
                      {payment.status !== "succeeded" ? <Badge>{payment.status}</Badge> : null}
                      <span className="font-semibold tabular-nums">{money(payment.amountCents, payment.currency)}</span>
                    </span>
                  </div>
                ))}
              </Card>
            ) : null}
          </>
        ) : null}
      </section>

      <section>
        <SectionTitle>Users</SectionTitle>
        <Card className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total" value={overview.users.total} hint={`+${overview.users.last7Days} this week · +${overview.users.last30Days} in 30 days`} />
          <Stat label="Active, 30 days" value={overview.users.activeLast30Days} hint="started at least one session" />
          <Stat label="Paying (Pro)" value={overview.users.byPlan.professional} hint={`${overview.packs.totalSold} packs sold`} />
          <Stat label="Finished onboarding" value={overview.users.onboarded} />
        </Card>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(overview.users.byGoal).map(([goal, count]) => (
            <Badge key={goal}>
              {getGoal(goal)?.label ?? goal}: {count}
            </Badge>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Practice & costs</SectionTitle>
        <Card className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Sessions, 30 days" value={overview.practice.attemptsLast30Days} hint={`${overview.practice.gradedLast30Days} scored · ${overview.practice.abandonedLast30Days} abandoned`} />
          <Stat label="Minutes this month" value={overview.practice.minutesThisMonth} hint={`${overview.practice.minutesLastMonth} last month`} />
          <Stat label="Average score" value={overview.practice.averageScore} hint="all scored sessions" />
          <Stat
            label="AI cost this month (est.)"
            value={`US$${costThisMonth.toFixed(2)}`}
            hint={
              overview.practice.minutesThisMonth
                ? `≈ US$${(costThisMonth / overview.practice.minutesThisMonth).toFixed(3)} per minute`
                : `US$${overview.aiCost.lastMonth.totalUsd.toFixed(2)} last month`
            }
          />
        </Card>
        <p className="mt-2 text-xs text-gray-500">
          Cost is estimated from logged tokens and the rates in lib/costs.ts. Check it against the OpenAI usage dashboard.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <SectionTitle>Subscribers</SectionTitle>
          {overview.subscribers.length === 0 ? (
            <EmptyState title="No subscribers yet" />
          ) : (
            <Card className="divide-y divide-gray-200">
              {overview.subscribers.map((subscriber) => (
                <div key={subscriber.email} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{subscriber.name}</span>
                    <span className="block truncate text-gray-500">{subscriber.email}</span>
                  </span>
                  <Badge tone={subscriber.stripeStatus === "active" ? "success" : "warning"}>{subscriber.stripeStatus}</Badge>
                </div>
              ))}
            </Card>
          )}
        </div>
        <div>
          <SectionTitle>Minute packs</SectionTitle>
          <Card className="divide-y divide-gray-200">
            {overview.packs.breakdown.map((pack) => (
              <div key={pack.id} className="flex justify-between px-5 py-3 text-sm">
                <span>
                  <span className="font-semibold">{pack.label}</span>
                  <span className="ml-2 text-gray-500">{pack.priceLabel}</span>
                </span>
                <span className="tabular-nums">{pack.count} sold</span>
              </div>
            ))}
          </Card>
        </div>
      </section>
    </div>
  );
}

type UserRow = FunctionReturnType<typeof api.admin.listUsers>[number];

function UsersTab({ myClerkId }: { myClerkId: string }) {
  const users = useQuery(api.admin.listUsers, {});
  const setRole = useMutation(api.admin.setUserRole);
  const grantMinutes = useMutation(api.admin.grantMinutes);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (users ?? []).filter(
      (user) => !term || user.email.toLowerCase().includes(term) || user.name.toLowerCase().includes(term),
    );
  }, [search, users]);

  if (!users) {
    return <Skeleton className="h-96" />;
  }

  const changeRole = async (user: UserRow, role: Role) => {
    setMessage(null);
    try {
      await setRole({ clerkId: user.clerkId, role });
      setMessage(`${user.email} is now ${roleLabels[role]}.`);
    } catch (error) {
      setMessage(friendlyError(error));
    }
  };

  const grant = async (user: UserRow) => {
    const input = window.prompt(`Grant how many minutes to ${user.email}?`, "30");
    const minutes = Number(input);
    if (!input || !Number.isFinite(minutes)) return;

    try {
      await grantMinutes({ clerkId: user.clerkId, minutes, note: "Admin grant" });
      setMessage(`Granted ${minutes} minutes to ${user.email}.`);
    } catch (error) {
      setMessage(friendlyError(error));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name or email"
          className="h-10 w-full max-w-sm rounded-lg bg-gray-100 px-3 text-sm outline-none focus:ring-2 focus:ring-live"
        />
        <span className="text-sm text-gray-500">{filtered.length} users</span>
      </div>
      {message ? <p className="rounded-lg bg-gray-50 px-4 py-2 text-sm">{message}</p> : null}
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-gray-200 text-xs text-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 font-semibold">Goal · language</th>
              <th className="px-4 py-3 font-semibold">Sessions</th>
              <th className="px-4 py-3 font-semibold">Minutes left</th>
              <th className="px-4 py-3 font-semibold">Plan</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map((user) => (
              <tr key={user.clerkId}>
                <td className="px-4 py-3">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-gray-500">{user.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-500">{shortDate(user.createdAt)}</td>
                <td className="px-4 py-3 text-gray-500">
                  {getGoal(user.practiceGoal ?? undefined)?.label ?? "—"}
                  {user.languages.length ? ` · ${user.languages.join(", ")}` : ""}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {user.attempts}
                  <span className="block text-xs text-gray-500">last {shortDate(user.lastActive)}</span>
                </td>
                <td className="px-4 py-3 tabular-nums">{Math.floor(user.remainingMinutes)}</td>
                <td className="px-4 py-3">
                  <Badge tone={user.plan === "free" ? "neutral" : "dark"}>{user.plan}</Badge>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    disabled={user.clerkId === myClerkId}
                    onChange={(event) => void changeRole(user, event.target.value as Role)}
                    className="rounded-lg bg-gray-100 px-2 py-1.5 text-sm font-semibold disabled:opacity-60"
                  >
                    {(Object.keys(roleLabels) as Role[]).map((role) => (
                      <option key={role} value={role}>
                        {roleLabels[role]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => void grant(user)}>
                    Grant minutes
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function InvitesTab() {
  const invites = useQuery(api.admin.listInvites, {});
  const inviteUser = useAction(api.adminActions.inviteUser);
  const revokeInvite = useMutation(api.admin.revokeInvite);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("interpreter");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    try {
      const result = await inviteUser({ email, role });
      setMessage(
        result.existingUser
          ? `${email} already has an account — their role is now ${roleLabels[role]}.`
          : result.emailed
            ? `Invitation emailed to ${email}.`
            : `Invite saved. Clerk isn't configured in Convex, so no email was sent — share the sign-up link with ${email}.`,
      );
      setEmail("");
    } catch (error) {
      setMessage(friendlyError(error));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <p className="text-lg font-bold">Invite someone</p>
        <p className="mt-1 text-sm text-gray-500">
          They get a sign-up email. The role applies automatically when they sign in with this exact email address.
        </p>
        <form onSubmit={(event) => void submit(event)} className="mt-5 flex flex-wrap gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            className="h-11 min-w-0 flex-1 rounded-lg bg-gray-100 px-3 text-sm outline-none focus:ring-2 focus:ring-live"
          />
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as Role)}
            className="h-11 rounded-lg bg-gray-100 px-3 text-sm font-semibold"
          >
            <option value="interpreter">Learner</option>
            <option value="platform_admin">Admin</option>
          </select>
          <Button type="submit" disabled={pending}>
            {pending ? "Sending…" : "Send invite"}
          </Button>
        </form>
        {message ? <p className="mt-4 text-sm">{message}</p> : null}
      </Card>

      <section>
        <SectionTitle>Invitations</SectionTitle>
        {!invites ? (
          <Skeleton className="h-32" />
        ) : invites.length === 0 ? (
          <EmptyState title="No invitations yet" />
        ) : (
          <Card className="divide-y divide-gray-200">
            {invites.map((invite) => (
              <div key={invite._id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
                <span>
                  <span className="font-semibold">{invite.email}</span>
                  <span className="ml-2 text-gray-500">{roleLabels[invite.role]}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-gray-500">{shortDate(invite.createdAt)}</span>
                  <Badge tone={invite.status === "accepted" ? "success" : invite.status === "pending" ? "warning" : "neutral"}>
                    {invite.status}
                  </Badge>
                  {invite.status === "pending" ? (
                    <Button size="sm" variant="ghost" onClick={() => void revokeInvite({ email: invite.email })}>
                      Revoke
                    </Button>
                  ) : null}
                </span>
              </div>
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}
