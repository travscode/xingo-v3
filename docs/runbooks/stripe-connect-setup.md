# Runbook — Stripe Connect (creator payouts)

How to switch on payouts to marketplace creators. **Do this after normal payments work**
([stripe-setup.md](stripe-setup.md)): creators are paid out of the revenue that plans and packs bring in.

Until you finish this, everything else in the marketplace works: creators publish, learners practise,
and earnings are recorded in `creatorEarnings`. Nobody is paid until `STRIPE_CONNECT_ENABLED=true`.

## How it works

- Each creator gets a **Stripe Express** connected account. Stripe hosts their onboarding (identity,
  bank account, tax details), so XINGO never sees bank details.
- XINGO is the platform. Learners pay XINGO; once a month an admin presses **Admin → Marketplace →
  Pay creators**, which sends a **transfer** from XINGO's Stripe balance to each creator whose
  available balance is at least A$50 (`PAYOUT_THRESHOLD_CENTS`). Stripe then pays it to their bank.
- Earnings are held for 30 days (`EARNINGS_HOLD_DAYS`) to cover refunds and chargebacks.
- Rates and thresholds live in `lib/marketplace.ts` (D-031).

## Checklist

- [ ] 1. Enable Connect on your Stripe account (test mode first)
- [ ] 2. Platform profile and Express settings
- [ ] 3. Connect branding
- [ ] 4. Connect webhook
- [ ] 5. Convex env vars
- [ ] 6. Test end to end in test mode
- [ ] 7. Go live
- [ ] 8. Legal and tax housekeeping

## 1. Enable Connect

1. Stripe dashboard (test mode on) → **Connect** in the left menu → **Get started**.
2. When asked how you'll use Connect, choose **Platform** (or "Marketplace"; either fits: XINGO
   collects payments itself and pays creators separately).
3. Account type: **Express**.
4. Who pays fees: XINGO, the platform. Express accounts have a small monthly active-account fee and a
   per-payout fee. Check the current figures on stripe.com/au/connect/pricing.

## 2. Platform profile and settings

1. Connect → **Settings** → complete the **platform profile**: what XINGO does, that creators are
   paid a revenue share for content, and that you don't hold funds for them beyond the 30-day window.
2. **Countries:** start with **Australia** only. The code creates AU accounts (`country: "AU"` in
   `convex/connect.ts`). Paying creators in other countries needs Stripe's cross-border payouts. If
   you want that later, check eligibility in Connect settings, then change the code to ask the creator
   for their country.
3. Capabilities: the code requests **transfers** only (creators don't charge cards themselves).
4. **Onboarding options:** leave the Stripe-hosted onboarding on.
5. **Payout schedule for connected accounts:** daily or weekly automatic payouts are fine. The money
   reaches their Stripe balance when we transfer it monthly.

## 3. Branding

Connect → Settings → **Branding**: icon (`public/email/xingo-logo-black.png`), name "XINGO", brand
colour `#000000`, accent `#C6F432`. Creators see this during onboarding and in their Express dashboard.

## 4. Webhook

Developers → Webhooks → **+ Add endpoint**:

- **Listen to:** choose **Events on Connected accounts** (this is a different endpoint from the
  payments webhook).
- **Endpoint URL:** `https://<your-convex-deployment>.convex.site/stripe/connect-webhook`
- **Events:** `account.updated`
- Save, then **Reveal** the signing secret (`whsec_…`).

## 5. Convex environment

Same deployment as your other Stripe keys (today `deafening-cow-810`, so no `--prod`):

```bash
npx convex env set STRIPE_CONNECT_WEBHOOK_SECRET whsec_...
npx convex env set STRIPE_CONNECT_ENABLED true
```

`STRIPE_SECRET_KEY` and `SITE_URL` are shared with payments. Onboarding returns creators to
`SITE_URL/marketplace/earnings`.

## 6. Test it (test mode)

| Step | Expected |
|---|---|
| As a test user, create and publish a course | Shows under Marketplace → Created by you |
| Marketplace → Earnings → **Set up payouts** | Opens Stripe-hosted onboarding. In test mode use the test data Stripe suggests (e.g. bank BSB `110000`, account `000123456`; follow the on-screen prompts) |
| Finish onboarding | Back on Earnings: "Payouts are on" (the `account.updated` webhook and the page refresh both update it) |
| As a second user with a minute pack, practise the course for a few minutes | Course Insights shows the session; Earnings shows a **Pending** amount |
| To test a payout without waiting 30 days | Convex dashboard (test deployment only) → `creatorEarnings` → set `createdAt` on a row to 31+ days ago, and make the creator's total ≥ A$50 (or lower `PAYOUT_THRESHOLD_CENTS` temporarily in a branch) |
| Admin → Marketplace → **Pay creators** | Transfer appears in Stripe → Connect → the creator's account; Earnings shows it under Payouts |

**Your Stripe balance must have available funds** for transfers. In test mode, create a charge with
card `4000 0000 0000 0077` (funds become available immediately).

## 7. Go live

1. Make sure live payments have been running and your Stripe balance has **available** AUD funds.
2. Repeat steps 1–5 in **live mode** (Connect settings, branding and the webhook are per mode).
3. Set `STRIPE_CONNECT_WEBHOOK_SECRET` (live `whsec_`) and `STRIPE_CONNECT_ENABLED=true` on the live
   deployment.
4. Pay creators monthly from Admin → Marketplace. Once you're comfortable, this can become a cron job
   (`convex/crons.ts`) that calls the same logic.

## 8. Legal, tax and housekeeping (talk to your accountant)

- **Creator terms:** publish creator terms covering the 25% revenue share, the 30-day hold, the A$50
  minimum, takedowns (earnings from removed courses can be withheld), and that XINGO may change rates
  with notice. The guidelines shown on publish are in `CREATOR_GUIDELINES` (`lib/marketplace.ts`).
- **GST:** payouts to creators may be payments for a supply by them. Find out whether you need ABNs
  from creators, and whether to issue recipient-created tax invoices (RCTIs). _(This isn't tax advice.)_
- **Records:** every earning row links the attempt, learner and minutes; every payout links its
  Stripe transfer ID (`creatorPayouts.stripeTransferId`).
- **Refunds:** if you refund a learner after their earnings were paid, adjust manually for now (insert
  a negative `creatorEarnings` row via an internal mutation) and note it in the payout.
