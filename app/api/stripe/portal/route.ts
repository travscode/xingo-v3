import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getBaseUrl, stripe } from "@/lib/stripe";

function redirectToBilling(baseUrl: string, reason: string) {
  return NextResponse.redirect(new URL(`/billing?status=${reason}`, baseUrl), 303);
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url), 303);
  }

  const baseUrl = getBaseUrl(request.headers.get("origin"));
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  if (!email) {
    return redirectToBilling(baseUrl, "missing-email");
  }

  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });

  const customer = customers.data[0];

  if (!customer) {
    return redirectToBilling(baseUrl, "missing-customer");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: `${baseUrl}/billing`,
  });

  return NextResponse.redirect(session.url, 303);
}
