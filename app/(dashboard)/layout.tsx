import type { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await auth.protect();

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl gap-6 px-4 py-4 sm:px-6 lg:px-10 lg:py-6">
      <DashboardSidebar />
      <main className="min-w-0 flex-1 space-y-6">
        <DashboardTopbar />
        {children}
      </main>
    </div>
  );
}
