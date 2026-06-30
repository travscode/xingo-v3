"use client";

import type { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar";

function MobileSidebarBackdrop() {
  const { isDesktop, open, setOpen } = useSidebar();

  if (isDesktop || !open) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label="Close sidebar"
      className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    />
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-dvh w-full overflow-hidden">
        <DashboardSidebar />
        <SidebarInset className="h-dvh overflow-y-auto">
          <div className="flex min-h-full flex-col gap-6 p-4 sm:p-6 lg:p-8">
            <DashboardTopbar />
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </SidebarInset>
        <MobileSidebarBackdrop />
      </div>
    </SidebarProvider>
  );
}
