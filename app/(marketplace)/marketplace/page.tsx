import type { Metadata } from "next";
import { Suspense } from "react";
import { MarketplaceHome } from "@/components/marketplace/marketplace-home";
import { Skeleton } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Practice course marketplace",
  description:
    "Spoken practice courses made by trainers, teachers and organisations: role-plays and interpreting scenarios with AI voice partners and scored feedback.",
  alternates: { canonical: "/marketplace" },
};

export default function MarketplacePage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <MarketplaceHome />
    </Suspense>
  );
}
