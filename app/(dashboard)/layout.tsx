import type { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await auth.protect();

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-6 py-6 lg:px-10">
      <DashboardSidebar />
      <main className="min-w-0 flex-1 space-y-6">
        <DashboardTopbar />
        {children}
      </main>
    </div>
  );
}
