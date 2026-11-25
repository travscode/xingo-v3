"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/primitives";
import { OnboardingSeries } from "@/components/admin/email/onboarding-series";

export function OnboardingSeriesPage() {
  const me = useQuery(api.users.me, {});
  if (me === undefined) return <Skeleton className="h-96" />;
  return <OnboardingSeries adminName={me?.user.name ?? "Admin"} adminEmail={me?.user.email ?? ""} />;
}
