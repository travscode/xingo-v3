import { BillingActions } from "@/components/billing/billing-actions";

const statusMessages: Record<string, string> = {
  "checkout-success": "Stripe checkout completed successfully.",
  "checkout-cancelled": "Stripe checkout was cancelled.",
  "missing-price-id": "Add Stripe price IDs before starting checkout from this UI.",
  "missing-customer": "No Stripe customer exists yet for this account.",
  "invalid-plan": "The selected billing plan was not recognized.",
  "session-error": "Stripe did not return a checkout session URL.",
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  return (
    <div className="space-y-6">
      {status && statusMessages[status] ? (
        <div className="surface-card rounded-[1.5rem] p-4 text-sm text-muted">
          {statusMessages[status]}
        </div>
      ) : null}
      <BillingActions />
    </div>
  );
}
