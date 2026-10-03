"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProgressBar } from "@/components/ui/primitives";
import { Clock, Crown } from "lucide-react";

/** Practice minutes left, always visible in the sidebar. */
export function MinutesMeter() {
  const me = useQuery(api.users.me, {});

  if (!me) {
    return <div className="h-24" />;
  }

  const { entitlement } = me;

  if (entitlement.planLabel === "Admin") {
    return (
      <Link href="/admin" className="block rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100">
        <span className="flex items-center gap-1.5 text-sm font-bold">
          <Crown className="h-3.5 w-3.5" aria-hidden /> Admin
        </span>
        <p className="mt-2 text-sm text-gray-500">Every module unlocked. Minutes aren&apos;t limited.</p>
      </Link>
    );
  }
  const total = entitlement.monthlyMinutes + entitlement.packMinutesPurchased - entitlement.packMinutesUsed;
  const low = entitlement.remainingMinutes <= 3;

  return (
    <Link href="/billing" className="block rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100">
      <div className="flex items-baseline justify-between">
        <span className="flex items-center gap-1.5 text-sm font-bold">
          {entitlement.plan !== "free" ? <Crown className="h-3.5 w-3.5" aria-hidden /> : null}
          {entitlement.planLabel}
        </span>
        <span className="text-xs text-gray-500">this month</span>
      </div>
      <p className="mt-2 flex items-baseline gap-1.5 text-2xl font-bold tabular-nums tracking-[-0.03em]">
        <Clock className="h-4 w-4 self-center text-gray-500" aria-hidden />
        {Math.floor(entitlement.remainingMinutes)}
        <span className="ml-1 text-sm font-semibold text-gray-500">min left</span>
      </p>
      <ProgressBar
        className="mt-2"
        value={total > 0 ? entitlement.remainingMinutes / total : 0}
        tone={low ? "record" : "accent"}
      />
      {entitlement.plan === "free" ? (
        <p className="mt-3 text-xs font-semibold">{low ? "Get more minutes →" : "Upgrade for every module →"}</p>
      ) : null}
    </Link>
  );
}
