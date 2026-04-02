"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function DashboardTopbar() {
  const { user } = useUser();
  const currentUser = useQuery(api.users.current, {});
  const firstName = user?.firstName ?? user?.fullName ?? "Interpreter";

  return (
    <div className="section-frame flex items-center justify-between rounded-[1.75rem] px-5 py-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Workspace</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">{firstName}</h1>
      </div>
      <div className="flex items-center gap-4 text-right">
        <div className="hidden sm:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Plan</p>
          <p className="mt-1 text-sm font-semibold capitalize">
            {currentUser?.subscriptionStatus ?? "free"}
          </p>
        </div>
        <UserButton />
      </div>
    </div>
  );
}
