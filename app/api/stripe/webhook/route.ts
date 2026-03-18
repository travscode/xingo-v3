import Stripe from "stripe";
import { NextResponse } from "next/server";
import { runConvexMutation } from "@/lib/convex-admin";
import { getPlanFromPriceId, mapStripeStatusToSubscription, stripe, stripeWebhookEvents } from "@/lib/stripe";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing webhook configuration" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook verification failed" },
      { status: 400 },
    );
  }

  if (!stripeWebhookEvents.has(event.type)) {
    return NextResponse.json({ received: true });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const plan = session.metadata?.plan;

      await runConvexMutation("users:applyStripeSubscription", {
        clerkId: session.metadata?.clerkUserId,
        email: session.customer_details?.email ?? session.customer_email ?? undefined,
        stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
        stripeSubscriptionId:
          typeof session.subscription === "string" ? session.subscription : undefined,
        subscriptionStatus: plan === "organization" ? "organization" : "professional",
      });
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id ?? "";
      const plan = getPlanFromPriceId(priceId);

      await runConvexMutation("users:applyStripeSubscription", {
        stripeCustomerId: typeof subscription.customer === "string" ? subscription.customer : undefined,
        stripeSubscriptionId: subscription.id,
        subscriptionStatus:
          event.type === "customer.subscription.deleted"
            ? "free"
            : plan ?? mapStripeStatusToSubscription(subscription.status),
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook handling failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
