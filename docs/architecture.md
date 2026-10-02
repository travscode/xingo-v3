# Architecture

_Last updated 2026-10-02 (v4)._

## 1. Shape of the system

```
Browser (Next.js 16 App Router, React 19, Tailwind v4)
  │  Clerk session ─────────────▶ Clerk (auth, invitations)
  │  Convex client (websocket) ─▶ Convex  ◀── the only trusted backend
  │                                 ├─ queries / mutations (DB, rules, metering)
  │                                 ├─ actions ─▶ OpenAI (realtime secrets, grading, translation)
  │                                 ├─ actions ─▶ Stripe (checkout, portal, finance)
  │                                 ├─ http   ◀── Stripe webhook  /stripe/webhook
  │                                 └─ cron   (close stale attempts every 2 min)
  └─ WebRTC audio ──────────────▶ OpenAI Realtime (one session per AI participant)
GA4 ◀─ page views + funnel events
```

**Rule (D-001): Next.js renders UI and marketing only.** Everything that decides money, access,
roles or scores runs in Convex, behind `requireUser` / `requirePlatformAdmin` or as an
`internal*` function. There are no Next.js API routes.

## 2. Repository map

| Path | What |
|---|---|
| `app/(marketing)` | Public site: home, pricing, how-it-works, for-teams, NAATI CCL landing, sign-in/up |
| `app/(dashboard)` | Signed-in app (Clerk-protected by `proxy.ts`): home, modules, practice room, results, progress, billing, account, help, admin, welcome |
| `components/practice` | Practice room (`practice-room.tsx`), room UI parts, realtime voice hook, results |
| `components/dashboard` | Shell, minutes meter, language picker, home, progress |
| `components/admin` | Admin console (overview/users/invites) + content studio |
| `components/ui` | Design-system primitives (Button, Card, Badge, ProgressBar, …) |
| `convex/` | Schema and backend functions (see §4) |
| `convex/model/` | Shared server logic: auth guards, entitlements, grading prompt, scenario normalisation |
| `convex/tests/` | `convex-test` suite (`pnpm vitest run`) |
| `lib/` | Framework-free shared code: `plans.ts` (pricing/limits), `scoring.ts`, `goals.ts`, `languages.ts`, `ai.ts` (agent prompts), `analytics.ts`, `errors.ts`, `costs.ts` |
| `docs/` | This documentation |

`lib/plans.ts`, `lib/scoring.ts` and `lib/goals.ts` are imported by **both** Convex and the UI — keep them free of React/Next imports.

## 3. Data model (Convex)

| Table | Purpose | Key fields |
|---|---|---|
| `users` | Profile synced from Clerk | `clerkId`, `email`, `emailVerified`, `role`, `subscriptionStatus`, `stripeCustomerId`, `stripeSubscriptionStatus`, `languagePreferences[]`, `practiceGoal`, `onboardedAt` |
| `modules` | Learning modules | `id` (slug), `isFree`, `industryCategory`, objectives |
| `scenarios` | Dialogues | `aiAgentA/B` (role, voice, language, goal, instructions, openingLine, `endCondition`), `practiceRuntime`, `isFreePreview` |
| `sessions` | Practice attempts | `id`, `clerkId`, `completionStatus` (`in_progress`/`completed`/`needs_review`/`ungraded`/`abandoned`), `mode` (`assessed`/`practice`), `startedAtMs`, `lastActiveAtMs`, `chargedMinutes`, `realtimeKeysIssued`, transcript, `assessment`, `ungradedReason` |
| `usageCharges` | Minutes charged per attempt (one row per attempt) | `minutes`, `fromAllowance`, `fromPacks`, `billingMonth` |
| `minuteGrants` | Pack purchases and admin/promo grants | `minutes`, `source`, `packId`, `stripeCheckoutSessionId` |
| `aiUsageEvents` | Token usage for cost analytics (not billing) | `source` (realtime/assessment/translation), `model`, tokens, `billingMonth` |
| `stripeEvents` | Webhook idempotency | `eventId` |
| `invites` | Admin-issued invitations | `email`, `role`, `status` |
| `organizations`, `organizationMembers`, `jobs` | Reserved for team/marketplace features (unused) | |

Legacy fields on `aiUsageEvents` (`usageCredits`, `overage*`, `stripeCharge*`) are optional and no longer written.

## 4. Backend modules

| File | Exposes |
|---|---|
| `users.ts` | `me` (profile + entitlement), `syncCurrentUser`, `completeOnboarding`, `updateLanguagePreferences`; internal `setRole`, `applySubscription`, `applyInviteForEmail` |
| `catalog.ts` | `forCurrentUser` (goal-ordered modules, lock state, stats, `nextUp`), `scenarioForPractice` |
| `practice.ts` | `startAttempt`, `heartbeat`, `cancelAttempt`; internal `reserveRealtimeKey`, `closeForGrading`, `saveAssessment`, `sweepStaleAttempts` |
| `practiceActions.ts` | `createRealtimeSecret`, `finishAttempt`, `retryGrading`, `translateLine` |
| `billing.ts` (node) | `createCheckout`, `createPortal`; internal `handleWebhook` |
| `billingData.ts` | internal `grantPack`, `claimStripeEvent`, `grantMinutes` |
| `usage.ts` | `summaryForCurrentUser`, `reportRealtimeUsage`; internal `recordAiUsage`, `monthlyReport` |
| `admin.ts` / `adminActions.ts` | `overview`, `listUsers`, `setUserRole`, `grantMinutes`, `listInvites`, `revokeInvite`, `inviteUser`, `financeSnapshot` |
| `sessions.ts` | Progress queries, `resultForCurrentUser` |
| `modules.ts` / `scenarios.ts` | Catalog reads + admin-guarded writes |
| `migrations.ts`, `seed.ts` | Internal one-off data operations (CLI only) |
| `http.ts`, `crons.ts` | Stripe webhook route; stale-attempt sweeper |

## 5. The practice engine

### 5.1 Two isolated voices
Each AI participant has its own OpenAI Realtime WebRTC session (`use-realtime-voice-session.ts`).
Neither can hear the other — the learner's speech is the only bridge. Turn detection is off; the
learner controls turns with push-to-talk (`input_audio_buffer.clear` → speak → `commit` + `response.create`).

### 5.2 Languages (D-010)
`planAgentLanguages()` in `lib/ai.ts`: the agent the scenario authored as English keeps the pair's
English side; the other gets the learner's language. Scenario text written for another language
(e.g. "Spanish-speaking patient", a Spanish opening line) is re-pointed at runtime, and a final
`LANGUAGE RULE` line overrides everything. Input transcription is **forced** per session to the
language the learner speaks to that participant (ISO-639-1 code + prompt), fixing Greek→Slavic
and Hindi/Punjabi mis-detection.

### 5.3 Conversation flow
The learner opens by introducing themselves to the client (D-011). Agent prompts tell each side
what to expect. The English-speaking professional has an `end_conversation` tool and an
`endCondition` (what it must collect); when satisfied it closes and calls the tool, and the UI
prompts the learner to finish (D-013).

### 5.4 Metering (D-003)
```
startAttempt  ── checks access + remaining ≥ 1 min, closes any other live attempt, stamps startedAtMs
heartbeat/20s ── updates lastActiveAtMs; returns shouldEnd when elapsed ≥ min(remaining, 30 min)
createRealtimeSecret ── reserveRealtimeKey (≤ 6 per attempt, attempt live, time left) → OpenAI client secret (10-min TTL)
finishAttempt ── closeForGrading charges ceil((now − start)/60s) minutes, idempotent per attempt
cron/2 min    ── attempts with no heartbeat for 2 min → abandoned, charged to last heartbeat
```
Charges come out of the monthly allowance first, then packs (`splitCharge`), never below zero.

### 5.5 Grading (D-009)
`finishAttempt` stores the client-captured transcript, loads the scenario **from the database**,
and calls the Responses API with a JSON schema. The grader prompt marks the transcript as
untrusted. Scores are clamped and the pass decision is derived from the score server-side.
Practice-mode attempts and attempts with < 3 interpreter turns are never sent to the grader.

## 6. Billing

```
UI ─ billing.createCheckout ─▶ Stripe Checkout (customer pre-created, metadata.clerkId, kind, packId)
Stripe ─ webhook ─▶ convex.site/stripe/webhook ─▶ billing.handleWebhook
     checkout.session.completed (pack, paid)   → billingData.grantPack (idempotent by session id)
     checkout.session.completed (subscription) → users.applySubscription(professional)
     customer.subscription.created/updated     → professional if Pro price & active|trialing|past_due, else free
     customer.subscription.deleted             → free
```
Every event id is claimed in `stripeEvents` first; a failure releases the claim so Stripe's retry runs it.

## 7. Auth & roles

- Clerk handles sign-in; Convex validates Clerk JWTs (`convex/auth.config.ts`, `CLERK_JWT_ISSUER_DOMAIN`).
- `proxy.ts` (Next middleware) requires a session on app routes.
- Roles live only in Convex. They change via **Admin → Users**, **Admin → Invites**, or `npx convex run users:setRole`. The client can never set a role (D-002).
- Invites apply only when the email comes from the Clerk token (`emailVerified`), never from client arguments (D-020).

## 8. Environments

| | Next.js (Vercel) | Convex | Clerk | Stripe |
|---|---|---|---|---|
| Local | `pnpm dev` | your dev deployment (`npx convex dev`) | Development instance | Test mode |
| Production | Vercel production | **prod** deployment | Production instance | Live mode |

⚠️ As of Oct 2026 live users are on the Convex **dev** deployment (`deafening-cow-810`) and the
prod deployment is empty. Moving to prod is step 1 of [runbooks/release-v4.md](runbooks/release-v4.md).

### Environment variables

**Vercel / `.env.local`:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CONVEX_URL`, `CONVEX_DEPLOY_KEY` (build-time deploys), `NEXT_PUBLIC_GA4_MEASUREMENT_ID`.

**Convex (`npx convex env set …`):** `CLERK_JWT_ISSUER_DOMAIN`, `CLERK_SECRET_KEY` (invites), `SITE_URL`, `OPENAI_API_KEY`, `OPENAI_REALTIME_MODEL` (opt.), `OPENAI_ASSESSMENT_MODEL` (opt.), `OPENAI_TRANSLATION_MODEL` (opt.), `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`, `STRIPE_PACK_STARTER_PRICE_ID`, `STRIPE_PACK_PLUS_PRICE_ID`, `STRIPE_PACK_SPRINT_PRICE_ID`.

## 9. Testing & tooling

- `pnpm vitest run` — Convex rules (security, paywall, metering, billing idempotency, invites, practice mode) against an in-memory backend.
- `pnpm typecheck`, `pnpm lint`, `pnpm build`.
- `npx convex codegen` only analyses functions; it does not deploy.
- `npm run ship` is **deprecated** — it committed everything with random messages and deployed Convex from a laptop. Use PRs + CI (see release runbook).
