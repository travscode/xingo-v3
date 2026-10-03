import type { Metadata } from "next";
import { Suspense } from "react";
import { OrgDashboard } from "@/components/orgs/org-dashboard";
import { Skeleton } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Organisation", robots: { index: false } };

export default async function OrgDashboardPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <OrgDashboard handle={decodeURIComponent(handle)} />
    </Suspense>
  );
}
