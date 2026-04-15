"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PanelLeft } from "lucide-react";

export function DashboardTopbar() {
  const { user } = useUser();
  const currentUser = useQuery(api.users.current, {});
  const firstName = user?.firstName ?? user?.fullName ?? "Interpreter";

  return (
    <div className="flex items-center justify-between gap-4 rounded-[2rem] border border-line bg-white/84 px-5 py-4 shadow-[0_12px_30px_rgba(18,18,18,0.04)]">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="shrink-0">
          <PanelLeft className="h-4 w-4" />
        </SidebarTrigger>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            Workspace
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
            Welcome back, {firstName}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-3 text-right">
        <Link href="/modules" className="action-primary hidden sm:inline-flex">
          Start practice
        </Link>
        <div className="hidden sm:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            Plan
          </p>
          <p className="mt-1 text-sm font-semibold capitalize">
            {currentUser?.subscriptionStatus ?? "free"}
          </p>
        </div>
        <UserButton />
      </div>
    </div>
  );
}
