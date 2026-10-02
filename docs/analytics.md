# Analytics

GA4 property `G-J7M1JVS5HM` (override with `NEXT_PUBLIC_GA4_MEASUREMENT_ID`).

## What is sent

- **One `page_view` per navigation** (`components/providers/ga4-analytics.tsx`). GA's automatic page view is disabled, which fixes v3's double-counted first page view. Only `utm_*`, `gclid` and `fbclid` query params are sent — attempt IDs and statuses are stripped.
- **Funnel events** (`lib/analytics.ts → track()`):

| Event | When | Params |
|---|---|---|
| `sign_up` | Convex profile created for the first time | `method` |
| `onboarding_complete` | Welcome flow finished | `goal`, `language` |
| `practice_start` | Attempt started | `scenario_id`, `module_id`, `mode` |
| `practice_finish` | Learner pressed Finish or time ran out | `scenario_id`, `mode`, `reason`, `turns` |
| `results_view` | Scored result shown | `score`, `module_id` |
| `paywall_view` | Locked dialogue / out of minutes | `reason`, `scenario_id` |
| `checkout_start` | Pro or pack checkout opened | `kind`, `pack_id` |

## Answering "is the NAATI CCL page bringing people in?"

1. GA4 → **Reports → Acquisition → Traffic acquisition**: sessions by source/medium; then **Engagement → Pages and screens**, filter `page_path` contains `/naati/ccl`.
2. **Explore → Funnel exploration** with steps: `page_view` (path = `/naati/ccl`) → `sign_up` → `onboarding_complete` → `practice_start` → `practice_finish`. Compare against the same funnel starting at `/`.
3. Mark `sign_up`, `practice_finish` and `checkout_start` as **key events** (Admin → Events) so they appear in acquisition reports.
4. Register `goal`, `mode` and `module_id` as **custom dimensions** (Admin → Custom definitions) to break funnels down by goal.
5. Cross-check in the app: **Admin → Overview → Users by goal** shows how many learners chose "NAATI CCL test" at onboarding.

## Not tracked (on purpose)

No names, emails, transcripts or scores tied to people in GA. Per-user analysis happens in the admin console.
