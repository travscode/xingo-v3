# Runbook — Stripe setup

How to switch payments on for XINGO v4. Do it in **test mode** first, end to end, then repeat in live mode.

Everything Stripe-related now runs in **Convex** (not Vercel): checkout, portal, webhook and the
admin finance view. Prices and minute amounts shown in the app come from `lib/plans.ts`; Stripe
only needs matching products.

---

## 1. Account basics (once)

1. In the Stripe dashboard, make sure the account is set up for your Australian business (Settings → Business details) and the **default currency is AUD**.
2. **GST:** prices in `lib/plans.ts` are written as the amount the customer pays. Decide with your accountant whether you're registered for GST and whether prices are GST-inclusive. If you are, turn on **Stripe Tax** (or add a tax rate) before going live. _(This isn't tax advice.)_
3. Settings → Branding: logo, black brand colour `#000000`, accent `#C6F432`.
4. Settings → Customer emails: turn on receipts for successful payments and refunds.

## 2. Create the products (test mode)

Toggle **Test mode** on (top right). Products → **+ Add product**, four times:

| Product name | Pricing | Price | Env var for its **price** ID |
|---|---|---|---|
| XINGO Pro | Recurring, monthly | A$29.00 | `STRIPE_PRO_PRICE_ID` |
| CCL Starter (30 minutes) | One-off | A$19.00 | `STRIPE_PACK_STARTER_PRICE_ID` |
| Practice Plus (80 minutes) | One-off | A$39.00 | `STRIPE_PACK_PLUS_PRICE_ID` |
| Exam Sprint (160 minutes) | One-off | A$69.00 | `STRIPE_PACK_SPRINT_PRICE_ID` |

For each, open the product, find the **Pricing** section and copy the ID that starts with
**`price_`**. Not the `prod_` ID: that mix-up caused the June checkout 500. The code now rejects
anything that doesn't start with `price_`.

> If you change a price later: create a **new price** on the same product, update the env var and `lib/plans.ts` (`priceLabel`), and archive the old price.

## 3. Customer portal

Settings → Billing → **Customer portal** → activate it in test mode:
- ✅ Customers can update payment methods
- ✅ Customers can view invoice history
- ✅ Customers can cancel subscriptions → "At end of billing period"
- ❌ Switch plans (there's only one plan)
- Business information: add a terms and privacy link, plus support email.

## 4. Webhook

Developers → Webhooks → **+ Add endpoint**:

- **Endpoint URL:** `https://<your-convex-deployment>.convex.site/stripe/webhook`
  - This is the `.convex.site` domain, not `.convex.cloud`. Find it in the Convex dashboard under Settings → URL & Deploy Key ("HTTP Actions URL").
- **Events to send:**
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- After saving, click **Reveal** under *Signing secret* and copy the `whsec_…` value.

## 5. Put the keys into Convex

From the repo, for the deployment you're configuring (add `--prod` for production):

```bash
npx convex env set STRIPE_SECRET_KEY sk_test_...
npx convex env set STRIPE_WEBHOOK_SECRET whsec_...
npx convex env set STRIPE_PRO_PRICE_ID price_...
npx convex env set STRIPE_PACK_STARTER_PRICE_ID price_...
npx convex env set STRIPE_PACK_PLUS_PRICE_ID price_...
npx convex env set STRIPE_PACK_SPRINT_PRICE_ID price_...
npx convex env set SITE_URL https://your-domain
```

`SITE_URL` is where Stripe sends people back after checkout (`/billing?status=success`).

The old Vercel variables `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PROFESSIONAL_PRICE_ID` and `STRIPE_ORGANIZATION_PRICE_ID` are no longer read. Delete them from Vercel once v4 is live.

## 6. Test it end to end (test mode)

Use card `4242 4242 4242 4242`, any future expiry, any CVC.

| Test | Expected |
|---|---|
| Free user → Plan & minutes → **Buy** CCL Starter | Redirects to Stripe → pay → back to `/billing?status=success`; within seconds "Pack minutes" shows 30 and premium modules unlock |
| **Upgrade to Pro** | Badge becomes "Pro plan", monthly allowance 150 |
| **Invoices & payment** | Opens Stripe portal for that customer |
| Cancel in portal ("at period end") | Stays Pro until period end. Stripe test clocks or **Cancel immediately** in the dashboard → plan returns to Free |
| Card `4000 0000 0000 0341` (attach succeeds, charge fails) on renewal | Subscription `past_due` → still Pro (grace) → `canceled` → Free |
| Re-send the same event from Stripe (Webhooks → event → Resend) | No double minutes (idempotent) |
| Admin → Overview | Shows MRR, recent payments, "Test mode" badge |

Watch it work: Convex dashboard → Logs (look for `billing:handleWebhook`); Stripe → Webhooks → endpoint → recent deliveries should all be `200`.

**Local testing:** `stripe listen --forward-to https://<dev-deployment>.convex.site/stripe/webhook`, then put the `whsec_` it prints into your dev deployment's `STRIPE_WEBHOOK_SECRET`.

## 7. Go live

1. Complete Stripe account activation (identity, bank account for payouts).
2. Turn **Test mode** off and repeat **steps 2–4** in live mode. Products, prices, portal and webhook are all separate per mode.
3. Set the **live** values on the **production** Convex deployment (`npx convex env set --prod …`).
4. Do one real purchase of the cheapest pack with your own card, check minutes appear, then refund it from the dashboard.
5. Check Admin → Overview shows the green **Live** badge.

## 8. Clean up legacy state

- One existing account has `professional` from earlier test checkouts (Stripe wasn't live), and two accounts have test-mode `stripeCustomerId`s. Test customer IDs don't exist in live mode, so before go-live either:
  - leave them as complimentary Pro (no action), or
  - set them back to free: Convex dashboard → `users` table → set `subscriptionStatus` to `free`, and clear `stripeCustomerId` / `stripeSubscriptionId` so a fresh live customer is created on their next purchase.

## How it works (for reference)

- `billing:createCheckout` creates (once) a Stripe customer with `metadata.clerkId`, then a Checkout Session (`mode: subscription` for Pro, `payment` for packs) carrying `clerkId`, `kind` and `packId` metadata.
- `POST /stripe/webhook` → `billing:handleWebhook` verifies the signature, claims the event ID (idempotency), then:
  - grants pack minutes (amount taken from `lib/plans.ts`, never from Stripe metadata), or
  - sets the plan from the subscription status (`active`/`trialing`/`past_due` → Pro, else Free).
- Minutes are enforced in `practice:startAttempt`, `practice:heartbeat` and `practice:reserveRealtimeKey`.
