import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { type BillingPlan, getBaseUrl, getStripePriceId, stripe } from "@/lib/stripe";

async function reportCheckoutDebug(
  hypothesisId: string,
  traceId: string,
  msg: string,
  data: Record<string, unknown>,
) {
  // #region debug-point A:report
  let debugUrl = "http://127.0.0.1:7777/event";
  let sessionId = "stripe-checkout-500";

  try {
    const fs = await import("node:fs/promises");
    const env = await fs.readFile(".dbg/stripe-checkout-500.env", "utf8");
    debugUrl = env.match(/DEBUG_SERVER_URL=(.+)/)?.[1]?.trim() || debugUrl;
    sessionId = env.match(/DEBUG_SESSION_ID=(.+)/)?.[1]?.trim() || sessionId;
  } catch {}

  await fetch(debugUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      runId: "pre-fix",
      hypothesisId,
      traceId,
      location: "app/api/stripe/checkout/route.ts",
      msg: `[DEBUG] ${msg}`,
      data,
      ts: Date.now(),
    }),
  }).catch(() => undefined);
  // #endregion
}

function redirectToBilling(baseUrl: string, reason: string) {
  return NextResponse.redirect(new URL(`/billing?status=${reason}`, baseUrl), 303);
}

export async function POST(request: Request) {
  const traceId = crypto.randomUUID();

  await reportCheckoutDebug("E", traceId, "checkout request received", {
    method: request.method,
    url: request.url,
    origin: request.headers.get("origin"),
  });

  try {
    const { userId } = await auth();

    await reportCheckoutDebug("C", traceId, "auth resolved", {
      hasUserId: Boolean(userId),
    });

    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", request.url), 303);
    }

    const formData = await request.formData();
    const plan = formData.get("plan");
    const baseUrl = getBaseUrl(request.headers.get("origin"));

    await reportCheckoutDebug("D", traceId, "request data parsed", {
      plan,
      baseUrl,
    });

    if (plan !== "professional" && plan !== "organization") {
      return redirectToBilling(baseUrl, "invalid-plan");
    }

    const normalizedPlan: BillingPlan = plan;
    const priceId = getStripePriceId(normalizedPlan);

    await reportCheckoutDebug("B", traceId, "price resolved", {
      plan: normalizedPlan,
      hasPriceId: Boolean(priceId),
      priceIdPrefix: priceId ? priceId.slice(0, 8) : null,
    });

    if (!priceId) {
      return redirectToBilling(baseUrl, "missing-price-id");
    }

    const user = await currentUser();
    const primaryEmail = user?.primaryEmailAddress?.emailAddress;

    await reportCheckoutDebug("C", traceId, "current user resolved", {
      hasPrimaryEmail: Boolean(primaryEmail),
    });

    await reportCheckoutDebug("A", traceId, "creating stripe checkout session", {
      plan: normalizedPlan,
      hasPrimaryEmail: Boolean(primaryEmail),
      priceIdPrefix: priceId.slice(0, 8),
      baseUrl,
    });

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

    await reportCheckoutDebug("A", traceId, "stripe checkout session created", {
      hasSessionUrl: Boolean(session.url),
      sessionIdPrefix: session.id.slice(0, 8),
    });

    if (!session.url) {
      return redirectToBilling(baseUrl, "session-error");
    }

    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    await reportCheckoutDebug("A", traceId, "checkout route threw", {
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message : String(error),
      stackTop:
        error instanceof Error ? error.stack?.split("\n").slice(0, 3).join(" | ") : undefined,
    });
    throw error;
  }
}
