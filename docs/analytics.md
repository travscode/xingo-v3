# Analytics

GA4 property `G-J7M1JVS5HM` (override with `NEXT_PUBLIC_GA4_MEASUREMENT_ID`). All events go through `track()` in `lib/analytics.ts`.

## What is sent

- **One `page_view` per navigation** (`components/providers/ga4-analytics.tsx`). GA's automatic page view is disabled, which fixes v3's double-counted first page view. Only `utm_*`, `gclid` and `fbclid` query params are sent. Attempt IDs, statuses and Stripe session IDs are stripped.
- **Who is signed in** (`components/auth/app-bootstrap.tsx` → `identify()`): GA `user_id` is the opaque Clerk id, so one person's journey joins up across visits and devices. User properties: `plan` (free / professional / admin), `practice_goal`, `pack_buyer` (yes/no). Admins are sent with `traffic_type=internal`. Cleared when nobody is signed in.
- **Sign-up / log-in clicks site-wide** (`trackLinkClick`): any link to `/sign-up` or `/sign-in` sends `cta_click` with its text and where it sits on the page, and `mailto:` links send `generate_lead`. New landing pages get this automatically. To name a section, add `data-analytics-location="hero"` to a wrapper. To rename a button, add `data-analytics-cta="..."`.

## Events

| Area | Event | When | Params |
|---|---|---|---|
| Acquisition | `cta_click` | Sign-up / log-in link clicked (or "Add to my courses" while signed out) | `cta_text`, `cta_location`, `destination`, `redirect`, `goal`, `page_path` |
| | `generate_lead` | Email link clicked | `method`, `cta_location`, `page_path` |
| Account | `sign_up` | Convex profile created for the first time | `method` |
| | `login` | A new Clerk session is seen (once per sign-in) | `method` |
| | `terms_accept` | Terms gate accepted | `version`, `updated` |
| | `onboarding_step` | Welcome flow step completed | `step` (goal / language), `goal`, `language`, `preset`, `custom_language` |
| | `onboarding_complete` | Welcome flow finished | `goal`, `language` |
| | `language_pair_change` | Practice language switched | `language`, `pair`, `from` |
| Learning | `course_view` | Course page opened in the app | `module_id`, `course_title`, `free`, `locked` |
| | `practice_start` | Attempt started | `scenario_id`, `module_id`, `mode` |
| | `practice_error` | Session couldn't start (other than paywall) | `code` (e.g. `MIC_BLOCKED`), `scenario_id`, `module_id`, `mode` |
| | `practice_abandon` | Learner left a live session | `scenario_id`, `module_id`, `mode`, `turns` |
| | `practice_finish` | Learner pressed Finish or time ran out | `scenario_id`, `mode`, `reason`, `turns` |
| | `results_view` | Scored result shown | `score`, `module_id` |
| Money | `paywall_view` | Locked dialogue / out of minutes | `reason`, `scenario_id` |
| | `checkout_start` | Pro or pack checkout opened | `kind`, `pack_id`, `value`, `currency`, `items` |
| | `checkout_cancel` | Back from Stripe without paying | `kind`, `item_id` |
| | `purchase` | Back from Stripe after paying | `transaction_id` (Stripe session), `value`, `currency`, `kind`, `items` |
| | `billing_portal_open` | "Invoices & payment" / "Manage subscription" | none |
| Marketplace | `search` | Marketplace search, after typing stops | `search_term`, `area`, `kind` |
| | `marketplace_course_view` | Marketplace course page opened | `module_id`, `course_title`, `kind`, `creator`, `signed_in`, `in_library` |
| | `course_add` / `course_remove` | Course added to / removed from a library | `module_id`, `source` (listing / browse / creator / organisation) |
| | `course_rate` | Rating saved | `module_id`, `stars`, `with_comment`, `updated` |
| | `course_report` | Course reported | `module_id`, `reason` |
| Creators | `course_create` | Course wizard finished | `module_id`, `kind`, `organisation` |
| | `course_publish` / `course_unpublish` / `course_delete` | Course status changed | `module_id` |
| | `payout_setup_start` | "Connect Stripe" pressed on Earnings | none |
| Organisations | `org_create` | Organisation created | `handle` |
| | `org_invite_send` | Team or collection invites sent | `kind`, `role`, `invited`, … |
| | `invite_accept` | Invitation accepted | `kind`, `organisation` |
| | `org_access_request` | Access to a private collection requested | `collection_id`, `with_note`, `status` |
| | `collection_save` | Collection created or edited | `created`, `visibility`, `courses` |

`purchase` is reported from the browser when Stripe returns the learner to `/billing?status=success`. Its value is the list price, so promo codes aren't reflected. GA de-duplicates on `transaction_id`. Stripe is the source of truth for revenue.

## One-off GA setup (Admin)

1. **Key events** (Admin → Events → mark as key event): `sign_up`, `onboarding_complete`, `practice_finish`, `purchase`. Optional: `checkout_start`, `course_create`, `generate_lead`.
2. **Custom dimensions** (Admin → Custom definitions). Event-scoped: `cta_location`, `cta_text`, `destination`, `goal`, `language`, `step`, `mode`, `reason`, `code`, `module_id`, `course_title`, `kind`, `source`. User-scoped: `plan`, `practice_goal`, `pack_buyer`. Metric: `score`, `turns`, `stars`.
3. **Internal traffic**: Admin → Data filters → "Internal traffic" → set to *Active* (admins are already tagged).
4. **User-ID**: Admin → Data display → Reporting identity → *Blended*, so the signed-in `user_id` joins sessions up.
5. **Enhanced measurement** (Admin → Data streams → web): keep scrolls, outbound clicks and file downloads on. Under page views, untick **"Page changes based on browser history events"**, because the app already sends one page view per navigation.
6. **Data retention**: Admin → Data retention → 14 months, so explorations can look back further than 2 months.

## Reading user journeys

- **Funnel** (Explore → Funnel exploration, open funnel): `page_view` (landing) → `cta_click` → `sign_up` → `onboarding_complete` → `practice_start` → `practice_finish` → `results_view`. Break down by `first_user_source` or landing page.
- **Money funnel**: `paywall_view` → `checkout_start` → `purchase`. Compare `checkout_cancel`.
- **Path exploration** (Explore → Path exploration): start at `sign_up` to see what new learners do next, or end at `purchase` to see what leads to buying.
- **Where sign-ups come from**: Reports → Engagement → Events → `cta_click`, add `cta_location` / `page_path` as dimensions.
- **Drop-off in the room**: `practice_error` by `code` (mic problems) and `practice_abandon` vs `practice_finish`.
- **Is the NAATI CCL page bringing people in?** Funnel starting at `page_view` with page path `/naati/ccl`, compared with the same funnel starting at `/`.

## Not tracked (on purpose)

No names, emails, transcripts, invite tokens or Stripe ids other than the checkout session. Per-person analysis happens in the admin console.
