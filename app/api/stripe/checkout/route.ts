import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { type BillingPlan, getBaseUrl, getStripePriceId, stripe } from "@/lib/stripe";

function redirectToBilling(baseUrl: string, reason: string) {
  return NextResponse.redirect(new URL(`/billing?status=${reason}`, baseUrl), 303);
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url), 303);
  }

  const formData = await request.formData();
  const plan = formData.get("plan");
  const baseUrl = getBaseUrl(request.headers.get("origin"));

  if (plan !== "professional" && plan !== "organization") {
    return redirectToBilling(baseUrl, "invalid-plan");
  }

  const normalizedPlan: BillingPlan = plan;
  const priceId = getStripePriceId(normalizedPlan);

  if (!priceId) {
    return redirectToBilling(baseUrl, "missing-price-id");
  }

  const user = await currentUser();
  const primaryEmail = user?.primaryEmailAddress?.emailAddress;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${baseUrl}/billing?status=checkout-success`,
    cancel_url: `${baseUrl}/billing?status=checkout-cancelled`,
    customer_email: primaryEmail,
    client_reference_id: userId,
    metadata: {
      clerkUserId: userId,
      plan: normalizedPlan,
    },
  });

  if (!session.url) {
    return redirectToBilling(baseUrl, "session-error");
  }

  return NextResponse.redirect(session.url, 303);
}
