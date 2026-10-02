"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProgressBar } from "@/components/ui/primitives";

/** Practice minutes left, always visible in the sidebar. */
export function MinutesMeter() {
  const me = useQuery(api.users.me, {});

  if (!me) {
    return <div className="h-24" />;
  }

  const { entitlement } = me;
  const total = entitlement.monthlyMinutes + entitlement.packMinutesPurchased - entitlement.packMinutesUsed;
  const low = entitlement.remainingMinutes <= 3;

  return (
    <Link href="/billing" className="block rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-bold">{entitlement.planLabel}</span>
        <span className="text-xs text-gray-500">this month</span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums tracking-[-0.03em]">
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
