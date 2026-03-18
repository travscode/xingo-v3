import Stripe from "stripe";

export type BillingPlan = "professional" | "organization";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

export const stripeWebhookEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

const priceEnvMap: Record<BillingPlan, string[]> = {
  professional: [
    "STRIPE_PROFESSIONAL_PRICE_ID",
    "STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID",
    "STRIPE_PRICE_PROFESSIONAL",
  ],
  organization: [
    "STRIPE_ORGANIZATION_PRICE_ID",
    "STRIPE_ORGANIZATION_MONTHLY_PRICE_ID",
    "STRIPE_PRICE_ORGANIZATION",
  ],
};

export function getStripePriceId(plan: BillingPlan) {
  return priceEnvMap[plan].map((key) => process.env[key]?.trim()).find(Boolean) ?? "";
}

export function getPlanFromPriceId(priceId: string) {
  if (!priceId) {
    return null;
  }

  if (priceId === getStripePriceId("organization")) {
    return "organization" as const;
  }

  if (priceId === getStripePriceId("professional")) {
    return "professional" as const;
  }

  return null;
}

export function getBaseUrl(origin: string | null) {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();

  return explicit || origin || "http://localhost:3000";
}

export function mapStripeStatusToSubscription(status: string) {
  switch (status) {
    case "active":
    case "trialing":
      return "professional" as const;
    default:
      return "free" as const;
  }
}
