[OPEN] Stripe checkout 500 debug session

Session ID: stripe-checkout-500
Started: 2026-06-29

Symptom:
- Visiting `/billing` and submitting `Start checkout` navigates to `/api/stripe/checkout` and returns HTTP 500.

Expected:
- The route should create a Stripe Checkout Session and redirect to the hosted Stripe checkout page.

Initial hypotheses:
- H1: `stripe.checkout.sessions.create()` is throwing because the configured Stripe secret key is invalid, revoked, or mismatched with account/test mode.
- H2: The request reaches Stripe, but the provided `price` ID is missing, malformed, or from the wrong Stripe mode/account.
- H3: The route fails before redirect because user/account data fetched from Clerk is incomplete or unavailable at runtime.
- H4: The app is building an invalid callback URL because `NEXT_PUBLIC_APP_URL` or request origin handling is wrong in the current environment.
- H5: A local server/runtime configuration issue is causing the route to throw before or during the Stripe API call.

Planned evidence collection:
- Reproduce the POST to `/api/stripe/checkout`.
- Capture the server-side error/stack.
- Confirm which hypothesis matches the runtime evidence.

Evidence collected:
- Vercel runtime error: `StripeInvalidRequestError: No such price: 'prod_Un8LwCUa8OnTev'`
- Local env inspection confirms `STRIPE_PROFESSIONAL_PRICE_ID` and `STRIPE_ORGANIZATION_PRICE_ID` are set to `prod_...` values instead of `price_...` values.

Hypothesis verification:
- H1: REJECTED. The error is not an auth/key error; Stripe successfully processed the request and returned a resource lookup error.
- H2: CONFIRMED. `line_items[0][price]` is being passed a product ID (`prod_...`) instead of a price ID (`price_...`).
- H3: REJECTED. The failure occurs inside Stripe request validation, after auth/user handling.
- H4: REJECTED. The error is unrelated to success/cancel URLs.
- H5: REJECTED. The issue reproduces consistently as a Stripe configuration mismatch rather than local runtime instability.

Root cause:
- The app code correctly calls Stripe Checkout with a `price` parameter, but the configured environment variables hold Stripe Product IDs instead of Stripe Price IDs.

Minimal fix:
- Replace `STRIPE_PROFESSIONAL_PRICE_ID` and `STRIPE_ORGANIZATION_PRICE_ID` in local and Vercel environments with recurring `price_...` IDs from Stripe Dashboard.

Additional evidence after successful checkout:
- User reaches `/billing?status=checkout-success`.
- Stripe Billing Portal shows an active subscription for the same email/customer.
- App UI still reads `free`, which means the Stripe customer/subscription exists but Convex user state was not patched.

Follow-up analysis:
- The app does not update subscription state on the success redirect. The only sync path is the Stripe webhook handler in `app/api/stripe/webhook/route.ts`.
- Most likely causes now:
  - The Stripe webhook endpoint for production is not configured to `https://<your-domain>/api/stripe/webhook`.
  - `STRIPE_WEBHOOK_SECRET` on Vercel does not match the signing secret for that endpoint.
  - The webhook is reaching the route, but the route cannot write to Convex because `NEXT_PUBLIC_CONVEX_URL` or `CONVEX_DEPLOY_KEY` is missing/incorrect in Vercel.
