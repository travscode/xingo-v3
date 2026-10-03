import type { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { DashboardShell } from "@/components/dashboard/shell";
import { AppProviders } from "@/components/providers/app-providers";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await auth.protect();

  return (
    <AppProviders>
      <DashboardShell>{children}</DashboardShell>
    </AppProviders>
  );
}
