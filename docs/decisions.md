# Decision log

Short records of decisions that shape the product and code. Newest at the bottom. To change a
decision, add a new entry that supersedes the old one rather than editing history.

Format: **ID — title** · date · status. Context → Decision → Consequences.

---

### D-001 — Convex is the only trusted backend · 2026-10-02 · accepted
**Context.** Scores, Stripe state and usage were written by public Convex mutations and Next.js API routes that trusted client input.
**Decision.** All logic that affects money, access, roles or scores runs in Convex (queries/mutations/actions/http). Next.js is UI and marketing only. Writes that only the system should make are `internal*` functions.
**Consequences.** One trust boundary; secrets (OpenAI, Stripe) live in Convex env. Next.js API routes were deleted. Stripe webhook URL moves to `<deployment>.convex.site/stripe/webhook`.

### D-002 — Roles are never accepted from the client · 2026-10-02 · accepted
**Context.** `users.syncCurrentUser` accepted a `role` argument, so anyone could make themselves `platform_admin` from the browser console.
**Decision.** Roles change only via the admin console, admin invites, or `npx convex run users:setRole`. Clerk `publicMetadata.role` is no longer read.
**Consequences.** Existing admins keep their role. Thomas (and future admins) are added via **Admin → Invites**.

### D-003 — Bill server-metered practice minutes, not tokens · 2026-10-02 · accepted
**Context.** Credits were 1,000 tokens each, counted from browser-reported events (which never arrived for realtime voice). Learners can't reason about tokens; realtime audio tokens cost far more than text tokens.
**Decision.** The unit is the practice minute: server time from `startAttempt` to finish/last heartbeat, rounded up per attempt, capped at 30 min. Grading and translation are included.
**Consequences.** Billing is tamper-resistant and understandable. Token usage is still logged (`aiUsageEvents`) for cost analysis only.

### D-004 — Hard limits, no overage invoicing · 2026-10-02 · accepted
**Context.** v3 created Stripe invoice items for overage on paid plans and did nothing on Free.
**Decision.** Minutes are prepaid. When they run out, sessions can't start and live sessions end; the learner tops up with a pack or upgrades.
**Consequences.** No surprise bills, simpler support. Revenue upside from heavy users comes from packs.

### D-005 — Free tier: 10 min/month, free modules, one preview per premium module · 2026-10-02 · accepted
**Decision.** Free covers enough for one or two full dialogues a month. Each premium module (e.g. NAATI CCL) has at least one `isFreePreview` dialogue so the paywall comes *after* the learner has felt the product.
**Consequences.** Run `migrations:setFreePreviews` to choose the preview dialogues.

### D-006 — Any pack purchase unlocks premium modules · 2026-10-02 · accepted
**Context.** CCL candidates prefer one-off packs over subscriptions; a pack that only works on free modules would be useless.
**Decision.** `premiumAccess = paid plan || has any pack grant`.

### D-007 — Launch prices are provisional · 2026-10-02 · open
**Decision.** Pro A$29/150 min; packs A$19/30, A$39/80, A$69/160 (matching the prices already on the CCL page). AUD.
**Consequences.** Revisit after ~200 metered minutes using Admin → AI cost per minute. Change in `lib/plans.ts` and Stripe together.

### D-008 — Pack minutes never expire · 2026-10-02 · accepted
**Context.** Expiry needs FIFO consumption accounting and generates support load.
**Decision.** No expiry. Allowance is spent before packs.

### D-009 — Grading is server-side; transcripts remain client-captured · 2026-10-02 · accepted (known limitation)
**Decision.** The grader loads the scenario from the database, treats the transcript as untrusted, clamps scores and derives pass/fail itself. The transcript still comes from the browser (that's where Realtime transcription events arrive).
**Consequences.** Scores can't be set directly, but a determined user could forge a transcript. Fine for practice; not fine for credentials. Future: OpenAI Realtime sideband/webhooks to capture transcripts server-side before issuing anything credential-like.

### D-010 — The English professional always speaks English; no direction flip · 2026-10-02 · accepted
**Context.** Thomas: choosing English/Spanish produced an English-speaking traveller and a Spanish-speaking officer; the flip toggle was unnecessary. A runtime bug since 21 Aug assigned agent A the *target* language, contradicting its own "speak only English" instructions.
**Decision.** Pairs are "English ⇄ X". The participant authored as English keeps English; the other speaks X. The flip button is removed. Scenario text naming another language is re-pointed to X at runtime.

### D-011 — The interpreter opens by introducing themselves to the client · 2026-10-02 · accepted
**Context.** Thomas: in practice the interpreter first introduces themselves to the non-English speaker and explains how they will help. Users didn't know how to start.
**Decision.** No AI speaks first. The coach bar walks: (1) introduce to the client, (2) switch and introduce to the professional, (3) interpret.

### D-012 — Assessed vs Practice sessions · 2026-10-02 · accepted
**Context.** Thomas: the live transcript is "kind of cheating"; useful for practice/debug. Scoreless sessions shouldn't spend tokens on grading.
**Decision.** Assessed (default): transcript hidden, scored. Practice: live transcript with per-line translation, never sent to the grader. `translateLine` is refused for assessed attempts. Both consume minutes (voice is the cost).

### D-013 — The professional ends the conversation · 2026-10-02 · accepted
**Context.** Thomas: sessions could go on forever.
**Decision.** The English-speaking agent has an `endCondition` (admin-editable; defaults to its goal) and an `end_conversation` tool. When it has what it needs and nothing is pending, it closes and calls the tool; the UI prompts the learner to Finish. Hard cap 30 min per attempt.

### D-014 — "Clinician", not "Practitioner" · 2026-10-02 · accepted
**Context.** Thomas: "practitioner" also describes interpreters.
**Decision.** Seed data and the admin default say "Clinician"; `migrations:renamePractitionerRole` updates live scenarios. Prefer specific titles (doctor, nurse) when authoring.

### D-015 — Visual language: Uber-like monochrome, colour means something · 2026-10-02 · accepted
**Decision.** See [design-system.md](design-system.md). Black/white, Inter, flat surfaces. Lime = progress/success/primary action on dark; blue = live/selected; red = mic open.

### D-016 — NAATI CCL is the provisional wedge · 2026-10-02 · open
**Context.** The CCL landing page and pack pricing exist, but production data shows no CCL sessions; signups spiked late September.
**Decision.** Build onboarding and the catalog around goals (CCL first for CCL learners) and measure with GA funnel events before committing roadmap effort.

### D-017 — One live attempt per user · 2026-10-02 · accepted
**Decision.** Starting an attempt closes (and charges) any other live attempt. Prevents parallel sessions on one balance.

### D-018 — CCL scores display out of 90 · 2026-10-02 · accepted
**Context.** v3 showed raw 0–100 scores with "/90" appended.
**Decision.** Store 0–100; display `round(score × 0.9)` out of 90, pass at 63 (`lib/scoring.ts`). Real CCL also requires ≥29/45 per dialogue — implement with the two-dialogue mock test.

### D-019 — Camera self-view is opt-in and never recorded · 2026-10-02 · accepted
**Context.** v3 requested camera permission on load, adding a scary prompt before practice.
**Decision.** Off by default; "Show camera" toggle in the room.

### D-020 — Admin invites via Clerk; role applies only to a verified email · 2026-10-02 · accepted
**Decision.** `adminActions.inviteUser` sends a Clerk invitation and stores the role. `syncCurrentUser` applies a pending invite only when the email comes from the Clerk identity token.
**Consequences.** Requires the Clerk "convex" JWT template to include `email` and `email_verified` (it does by default) and `CLERK_SECRET_KEY` in Convex env.

### D-021 — No self-serve organisation plan yet · 2026-10-02 · accepted
**Decision.** Team features (cohorts, trainer dashboards, CSV import) aren't built, so the Team tier is "contact us" and not purchasable.

### D-022 — Testing with convex-test, pinned to the installed Convex · 2026-10-02 · accepted
**Decision.** Business rules are covered by `convex/tests/*.test.ts`. `convex-test` is pinned to 0.0.54 (peer `convex@^1.32`); upgrade both together.

### D-023 — Long-tail SEO pages backed by real scenarios · 2026-10-02 · accepted
**Context.** Traffic rose after the CCL landing page; generic CCL terms are competitive.
**Decision.** Programmatic per-language CCL pages plus domain pages (NDIS, telephone, medical, legal, diploma, CPI), each listing only dialogues that exist. Content in `lib/seo-pages.ts`; new scenarios in an insert-only content pack. See [seo.md](seo.md).

### D-024 — Generated portrait avatars · 2026-10-02 · proposed
**Context.** Only one scenario had avatars; initials circles feel impersonal.
**Decision.** `avatars:generateMissing` creates one portrait per participant with the OpenAI Images API and stores it in Convex. Admin uploads are never replaced. Style (monochrome vs colour) to be chosen by the founder.
