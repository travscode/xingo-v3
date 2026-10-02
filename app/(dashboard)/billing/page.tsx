import { Suspense } from "react";
import { LiveBilling } from "@/components/billing/live-billing";

export const metadata = { title: "Plan & minutes" };

export default function BillingPage() {
  return (
    <Suspense fallback={null}>
      <LiveBilling />
    </Suspense>
  );
}
