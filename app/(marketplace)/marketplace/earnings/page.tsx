import type { Metadata } from "next";
import { Suspense } from "react";
import { CreatorEarnings } from "@/components/marketplace/creator-earnings";
import { Skeleton } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Earnings & payouts", robots: { index: false } };

export default function EarningsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <CreatorEarnings />
    </Suspense>
  );
}
