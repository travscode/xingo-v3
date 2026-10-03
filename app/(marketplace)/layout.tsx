import type { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { DashboardShell } from "@/components/dashboard/shell";
import { MarketingShell } from "@/components/marketing/marketing-shell";

/**
 * The marketplace is public (and indexable), but signed-in people browse it inside
 * the app so it feels like part of their library.
 */
export default async function MarketplaceLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();

  if (userId) {
    return <DashboardShell>{children}</DashboardShell>;
  }

  return (
    <MarketingShell>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">{children}</div>
    </MarketingShell>
  );
}
