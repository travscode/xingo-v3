"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function DashboardTopbar() {
  const { user } = useUser();
  const currentUser = useQuery(api.users.current, {});
  const firstName = user?.firstName ?? user?.fullName ?? "Interpreter";

  return (
    <div className="section-frame flex items-center justify-between rounded-[2rem] px-6 py-5">
      <div>
        <p className="text-sm text-muted">Welcome back</p>
        <h1 className="display text-3xl font-semibold tracking-tight">{firstName}&apos;s workspace</h1>
      </div>
      <div className="flex items-center gap-4 text-right">
        <div>
          <p className="text-sm text-muted">Current plan</p>
          <p className="text-base font-semibold capitalize">
            {currentUser?.subscriptionStatus ?? "free"}
          </p>
        </div>
        <UserButton />
      </div>
    </div>
  );
}
