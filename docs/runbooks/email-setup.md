# Runbook — Email (Admin → Email)

Branded campaign emails with preview, test sends, batched delivery, and open/click/unsubscribe tracking.
Sending uses **Resend** (resend.com); everything else runs in Convex.

## 1. Resend account and domain (once)
1. Create a Resend account.
2. **Domains → Add domain** → `xingo.ai` (or a subdomain such as `mail.xingo.ai` to protect your main domain's reputation).
3. Add the DNS records Resend shows (SPF/MX on a `send` subdomain, DKIM `resend._domainkey`) at your DNS provider, then **Verify**.
4. Add a DMARC record if you don't have one, e.g. `TXT _dmarc.xingo.ai  v=DMARC1; p=none; rua=mailto:dmarc@xingo.ai`. Gmail and Yahoo require SPF, DKIM and DMARC for bulk senders.
5. **API Keys → Create** (permission: sending access, restricted to your domain).
6. Resend's own open/click tracking can stay **off** — XINGO tracks opens and clicks itself through `www.xingo.ai/e/*`.

## 2. Convex environment variables
```bash
npx convex env set RESEND_API_KEY re_...
npx convex env set EMAIL_FROM_ADDRESS hello@xingo.ai
npx convex env set EMAIL_REPLY_TO hello@xingo.ai
npx convex env set EMAIL_SENDER_NAME "XINGO"
npx convex env set EMAIL_POSTAL_ADDRESS "Your business name, street address, suburb STATE postcode"
```
`SITE_URL` (already set) is used for tracking, unsubscribe and image links. Admin → Overview shows which of these are missing.

## 3. Bounces and complaints (recommended)
Resend → **Webhooks → Add endpoint**: `https://<deployment>.convex.site/e/resend-webhook`, events `email.bounced` and `email.complained`. Copy the signing secret:
```bash
npx convex env set RESEND_WEBHOOK_SECRET whsec_...
```
Bounces mark the recipient as bounced; a spam complaint unsubscribes that person permanently.

## 4. How it works
- **Templates** (`lib/email/render.ts`): Announcement, Spotlight, Newsletter, Personal note. Table-based, inline styles, 600px, PNG logo, hidden preheader, plain-text part. The admin preview uses the same renderer as sending.
- **Personalisation:** `{{firstName}}`, `{{name}}`, `{{email}}` in the body and headline.
- **Sending:** "Send" freezes the audience (skipping unsubscribed people and duplicate addresses) into recipient rows, then a Convex job sends batches through Resend's batch API. Each batch is claimed atomically so nobody is emailed twice. "In batches" spaces them out (e.g. 50 every 30 minutes) — useful for a new domain warming up.
- **Tracking:** a 1×1 pixel (`/e/o/<token>.gif`) records opens; links are rewritten to `/e/c/<token>/<n>` and redirect only to URLs stored with the campaign (no open redirect). `www.xingo.ai/e/*` is proxied to Convex by `next.config.ts`.
- **Unsubscribe:** every email has a visible unsubscribe link and `List-Unsubscribe` + one-click headers (RFC 8058). Unsubscribed users are excluded from all future campaigns and can opt back in from Account.

## 5. Accuracy of stats
- **Opens are approximate.** Apple Mail Privacy Protection pre-loads images (inflating opens); some clients block images (deflating them). Treat clicks as the reliable signal.
- Some corporate security scanners pre-click links; a burst of clicks seconds after sending may be automated.

## 6. Compliance (Australia — Spam Act 2003; not legal advice)
- **Consent:** email people who have an account with you (inferred consent) about related products and services. Don't import purchased lists.
- **Identify the sender:** the footer shows `EMAIL_SENDER_NAME` and `EMAIL_POSTAL_ADDRESS` — set them to your real business details.
- **Unsubscribe:** must work and be honoured within 5 business days; XINGO applies it immediately.

## 7. Before your first real send
1. Send a test to yourself on Gmail and Outlook/Apple Mail; check images, button and unsubscribe.
2. Start with a small batch (e.g. 20 people) and check the report for bounces.
3. Keep the "Personal note" template for important one-to-one style messages — plain emails land in the primary inbox more often.

## Automated emails (set up 2026-10-03)

Live configuration on the deployment serving users (`deafening-cow-810`): domain **xingo.ai** verified in Resend; `RESEND_API_KEY` set by the owner; `EMAIL_FROM_ADDRESS=hello@xingo.ai`, `EMAIL_SENDER_NAME=XINGO`, `EMAIL_REPLY_TO=hello@xingo.ai`, `EMAIL_POSTAL_ADDRESS=XINGO Pty Ltd (ABN 26 683 778 010), Australia`. Make sure the hello@xingo.ai mailbox exists, because customers will reply to it.

- **Customer emails** (D-036): welcome, pack bought, Pro started/cancelling/ended, payment failed, out of minutes, and creator emails. Content: `lib/email/transactional.ts`.
- **Onboarding series** (D-037): days 1–13, every other day, by goal pathway. Content: `lib/email/onboarding-content.ts`. Sent by the daily cron "send onboarding emails".
- **Check sending:** Resend dashboard → Emails (filter by tag `type`), Convex logs for `transactional` / `onboarding`, and Admin → Email.
- **Pause the series:** comment out the cron in `convex/crons.ts` and deploy, or unset `RESEND_API_KEY` (pauses all email).

