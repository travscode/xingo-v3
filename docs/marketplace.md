# Marketplace

Community practice courses: anyone can create one, learners add them to their library, and creators
earn a share of the revenue from paid minutes practised in their courses. Decision record: D-031.

## User journeys

**Learner:** Marketplace (`/marketplace`, public and in-app) → search or filter → course page
(`/marketplace/<slug>`) → **Add to my courses** → it appears in Practice (`/courses`) under
"From the marketplace" → practise like any course. Signed-out visitors are sent to sign-up and
returned to the course page.

**Creator:** Banner on the marketplace → **Learn more** (`/marketplace/create`: how it works, how
earnings work, guidelines) → **Create your first course** (`/marketplace/new`, 5 short steps: kind,
name, who the AI plays, the learner's part or the person needing an interpreter, when it's finished) → draft
course editor (`/marketplace/manage/<id>`):
- **Course page**: title, summary, banner, logo, about, what you'll get, who it's for, keywords,
  related certifications (with logos), and a page-strength checklist.
- **Scenarios**: add, edit, delete, try. Short form: character (role, name, voice, manner, photo,
  goal, finish condition, opening line), learner role and task card (role-play), or client (interpreting), level, time limit.
- **Insights**: views, adds, learners, sessions, minutes, earnings, 30-day charts.
- **Publish**: requires accepting the creator guidelines.

Earnings and payout setup: `/marketplace/earnings`.

**Admin:** Admin → **Reports** (open/dismissed/taken down; take down or dismiss with a note; an email
goes to every platform admin per report) and Admin → **Marketplace** (all courses, take down /
restore, money owed and paid, **Pay creators**).

## Code map

| Concern | Where |
|---|---|
| Rules (share, hold, threshold, limits, report reasons, guidelines, voices) | `lib/marketplace.ts` |
| Access & earnings helpers | `convex/model/courses.ts` |
| Queries/mutations (browse, listing, library, create/edit/publish, analytics, reports, admin) | `convex/marketplace.ts` |
| Report emails | `convex/marketplaceActions.ts` |
| Stripe Connect (onboarding, dashboard link, payouts, webhook) | `convex/connect.ts`, `convex/connectData.ts`, `/stripe/connect-webhook` in `convex/http.ts` |
| Earnings recorded on charge | `closeAndCharge` in `convex/practice.ts` |
| Library visibility | `catalog.forCurrentUser`, `modules.list`, `scenarios.*` (via `courseVisibility`) |
| Pages | `app/(marketplace)/marketplace/**`: signed-in users get the app shell, visitors the marketing shell |
| UI | `components/marketplace/*`, `components/admin/marketplace-admin.tsx` |
| Tests | `convex/tests/marketplace.test.ts` |

## Data

`courseListings`, `libraryItems`, `courseViews` (per course per day), `creatorAccounts`,
`creatorEarnings`, `creatorPayouts`, `contentReports`; `modules.source` / `modules.ownerClerkId`.

## Not built yet

Ratings and reviews; private (team-only) courses with invite links; creator-set prices; automatic
monthly payout cron; refunds clawing back paid earnings automatically.
