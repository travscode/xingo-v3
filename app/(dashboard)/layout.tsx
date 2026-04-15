import type { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await auth.protect();

  return <DashboardShell>{children}</DashboardShell>;
}
