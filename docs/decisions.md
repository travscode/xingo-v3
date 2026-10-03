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

### D-025 — English-only role-play mode · 2026-10-02 · accepted
**Context.** The engine isn't only for bilinguals: OET, IELTS, AMC and OSCE candidates practise spoken role-plays where they play themselves.
**Decision.** Scenarios can set `practiceRuntime.practiceType = "roleplay"` with `learnerRole`, `taskCard`, `learnerOpens` and `timeLimitMinutes`. One AI participant (patient/relative/colleague/examiner) speaks English; the task card stays on screen; sessions end at the exam time limit. Grading uses a per-exam rubric (`lib/rubrics.ts`) mapped onto the five stored dimension slots, with honest caveats (no pronunciation from transcripts). Scores display on the exam's scale (OET /500 + grade, IELTS band /9, CCL /90) as estimates.
**Consequences.** One engine for interpreting and speaking exams. Speaking goals skip the language step in onboarding.

### D-026 — Exam selection · 2026-10-02 · accepted
**Decision.** Build OET (Nursing, Medicine), IELTS Speaking, AMC Clinical, NMBA OSCE and one US medical interpreter oral module serving both CMI and CHI landing pages. **Do not** market NAATI CI practice: the CI test has no dialogue task. Court interpreting and UK DPSI are next candidates. See [research/exams-2026-10.md](research/exams-2026-10.md).

### D-027 — Admin email campaigns via Resend with first-party tracking · 2026-10-03 · accepted
**Decision.** Campaigns live in Convex (`emailCampaigns`, `emailRecipients`, `emailClicks`); Resend's batch API delivers. Opens, clicks and unsubscribes are tracked by Convex HTTP routes proxied under `www.xingo.ai/e/*`, so links show the XINGO domain and work regardless of Resend plan. Batches are claimed atomically (no duplicate sends). Unsubscribes set `users.emailOptOut` and are always excluded. One-click `List-Unsubscribe` headers for Gmail/Yahoo bulk-sender rules. See [runbooks/email-setup.md](runbooks/email-setup.md).

### D-028 — Every session has an end, and unfinished sessions score lower · 2026-10-03 · accepted
**Context.** Learners reported that dialogues "never end": only exam role-plays had a time limit, and the room waited for the learner to press Finish.
**Decision.**
- **Time limit for every scenario.** `practiceRuntime.timeLimitMinutes`, or a default from `lib/plans.ts` (two-party interpreting 12 min, single speaker 10, role-play 10; roughly twice a typical run). The room ends the session at the limit; the heartbeat ends it server-side 20 s later as a backstop. Admins can set it per dialogue.
- **Objective reached.** The professional/role-player calls `end_conversation` (`objective_met`) after a closing line. Role-play: the room wraps up once the audio goes quiet. Interpreting: the learner first relays the closing line to the other party (45 s fallback), then the room wraps up.
- **Stuck.** The AI may end with `learner_stuck` when the learner clearly can't continue. The room also warns after 45 s with nobody speaking and ends the session as `stalled` at 90 s.
- **End reason recorded.** `sessions.endReason` ∈ objective_met | learner_finished | time_up | stalled | out_of_minutes. The client's claim is checked against the server clock (`resolveEndReason`): "time up" before the limit becomes `learner_finished`.
- **Completion-aware scoring.** The grader judges completion from the transcript (`reachedEnd`, `coveragePercent`, `unfinished`). An unfinished session's score is scaled by coverage (`applyCompletion` in `lib/scoring.ts`) and can never pass. A session that times out or stalls with fewer than 3 learner turns scores 0 rather than "too short". Leaving early by pressing Finish with < 3 turns stays ungraded. The results page explains the scaling.
**Consequences.** Older attempts have no `endReason`/`completion` and display as before.

### D-029 — One voice at a time; the room is live only when everyone is connected · 2026-10-03 · accepted
**Context.** Both AI participants could talk at once, and learners could talk or switch person before the voice connections were ready.
**Decision.** Both participants connect in parallel before the room goes live. While connecting, tiles show "Connecting…", the mic is disabled and pressing Space explains why. Floor rule: when the learner holds to talk, every other participant is interrupted and muted; after the learner releases, only the person addressed may answer. As a backstop, if level meters detect two voices at once, the one the learner isn't addressing is cut off.

### D-030 — "Course", not "module" · 2026-10-03 · accepted
**Context.** "Module" sounds like enterprise LMS jargon, and the founder dislikes it.
**Decision.** Learners and creators see **course** everywhere; the in-app library moved from `/modules` to `/courses` (permanent redirects in `next.config.ts`). A course contains **scenarios** (learners see dialogues or role-plays). Stored data and code identifiers keep `module` (`modules` table, `moduleId`) to avoid a risky migration. Glossary in `design-system.md`.

### D-031 — Community marketplace with a 25% creator revenue share · 2026-10-03 · accepted
**Context.** Growth through content we don't have to write ourselves: trainers, teachers and employers can turn the conversations they know into practice, including English-only role-plays, and earn from it.
**Decision.**
- Community courses are `modules` rows with `source: "community"` and an `ownerClerkId`, plus a `courseListings` row (marketing page: slug, tagline, banner, logo, keywords, what you'll get, certifications, status draft/published/removed). Ids start `rp-` (role-play) or `int-` (interpreting) so `rubricForModule` can pick the generic role-play rubric without a lookup.
- They appear in a learner's library **only after the learner adds them** (`libraryItems`); unpublishing or removal hides them and blocks practice (`COURSE_UNAVAILABLE`). Owners and admins can always open their drafts.
- Practice costs learners normal minutes; community courses are never plan-gated.
- **Creator earnings:** 25% (`CREATOR_REVENUE_SHARE`) of XINGO's net revenue (after GST and ~3% card fees) from *paid* minutes practised in the course: Pro allowance minutes valued at price ÷ allowance, pack minutes at the cheapest pack's per-minute price. Free-plan minutes, the creator's own practice and admin practice earn nothing. Recorded per charged attempt in `creatorEarnings` at charge time (`closeAndCharge`).
- **Payouts:** Stripe Connect Express, monthly, from A$50, after a 30-day hold, triggered by an admin (`connect.runPayouts`). Off until `STRIPE_CONNECT_ENABLED=true`. See `runbooks/stripe-connect-setup.md`.
- **Moderation:** signed-in users report courses (one open report each); admins get an email and review in Admin → Reports (dismiss or take down). Admin → Marketplace lists every course with take-down/restore.
**Consequences.** At current realtime costs XINGO's margin per minute is thin; the share is one constant to tune once `aiUsageEvents` has real cost data. Scenario prompts written by creators steer only their own course's AI; graders still treat transcripts as untrusted.
**Open.** Creator terms (revenue share, takedown, withholding) need a legal page before payouts go live. Course ratings/reviews and team-private courses are not built.

### D-032 — Public pages don't load Clerk or Convex · 2026-10-03 · accepted
**Context.** The root layout wrapped every page in `ClerkProvider`, the Convex client and the user-sync component, so anonymous visitors to marketing, SEO and blog pages downloaded and ran the heaviest scripts on the site (and hit Clerk's API) before seeing anything.
**Decision.** `AppProviders` (`components/providers/app-providers.tsx`) wraps only the route groups that need them: `(dashboard)`, `(marketplace)` and `(auth)` (sign-in/sign-up moved out of `(marketing)`). The public header and mobile nav pick "Dashboard" vs "Log in" from Clerk's non-secret `__client_uat` cookie (`components/auth/signed-in-hint.ts`) — a display hint only, never access control. `clerkMiddleware` still runs on every route, so server-side auth and route protection are unchanged.
**Consequences.** Marketing pages make no Clerk or Convex requests. Signed-in users no longer see their avatar menu on public pages, just a Dashboard button. Moving between public and app pages mounts Clerk once.

### D-033 — Admin Lab: auto-switch by spoken language (experiment) · 2026-10-03 · proposed
**Context.** Hold-to-talk plus tap-to-switch works and stays as the learner experience. The founder wants to test whether the room can route speech by language instead of by tapping.
**Decision.** An admin-only Lab (`/admin/lab`, linked from Admin) with a separate room (`components/admin/lab/auto-switch-room.tsx`) that doesn't touch the practice room. Both AI participants receive the microphone with turn detection off. Each utterance (hands-free voice activity detection, or hold Space) is also recorded locally and sent to `labActions.detectLanguage` (admin-only; Whisper `verbose_json` returns the language). The buffered audio is then committed only to the participant who speaks that language and cleared for the other; ambiguous results alternate. Sessions are `practice` mode (never scored). A routing log shows detected language, latency and reason.
**Consequences.** Adds roughly a Whisper round-trip (~1 s) per turn plus a small Whisper cost. Hands-free needs headphones (agent audio would otherwise trigger the voice detection). If it works well, the next step is lower latency: detect from the first second of speech, or use the realtime transcript's language.

### D-034 — Practice room: step guide, transcript reveal ends scoring, full-width layout · 2026-10-03 · accepted
**Context.** Learners lost the context once a session started (the briefing disappeared), the transcript couldn't be found, and the room was a narrow centre column even on large monitors. An AI "customer" also introduced herself as the interpreter during an English-only session.
**Decision.**
- **Side panel**, docked to the right on large screens: "Your task" (one line) and the current step only; finished steps collapse into ✓ / ~ / ✗ markers. Interpreting: introduce yourself to each party, then one step per speaker turn ("Interpret Olivia's turn for Elena"). Role-plays: the task card as a checklist. Logic is a pure function of the transcript (`components/practice/session-guide.ts`), so push-to-talk is untouched.
- **Practice mode coaching:** each attempt is checked by `practiceActions.coachTurn` (refused in assessed mode) and gets a verdict and one-line tip. After a missed or partial turn the learner can ask the speaker to repeat and try again, up to three tries, then the step closes. Assessed mode only tracks progress, like the real test.
- **Transcript:** hidden by default in both modes. Showing it during an assessed session asks for confirmation and switches the attempt to practice (`practice.switchToPractice`, one way), so it isn't scored.
- **Layout:** live sessions use the full width: stage centred with larger participants, panel fixed to the right (400–460 px); stacks on small screens.
- **Agent identity:** interpreting agents are told they are never the interpreter. When both parties share a language (English only), authored notes like "you don't speak English" are overridden instead of contradicting the language rule.

### D-035 — Terms, Privacy Policy and Creator Terms, accepted before use · 2026-10-03 · accepted
**Context.** Taking payments, paying creators and processing voice through AI providers needs published terms and a privacy policy (Australian Privacy Act / APPs, Australian Consumer Law), and users must actually agree to them.
**Decision.** `/terms`, `/privacy` and `/creator-terms` (drafts written in plain English; to be reviewed by a lawyer before relying on them). Acceptance is recorded per user (`users.termsVersion`, `termsAcceptedAt`) against `LEGAL_VERSION` in `lib/legal.ts`. A blocking `TermsGate` appears in the app straight after sign-up and, for existing users, on their next visit; the server refuses practice (`startAttempt`) and checkout with `TERMS_REQUIRED` until the current version is accepted, so the gate can't be bypassed. Bumping `LEGAL_VERSION` asks everyone again. Publishing a marketplace course requires agreeing to the Creator Terms. Sign-up shows a notice linking both documents.
**Open.** Lawyer review. (Entity XINGO Pty Ltd, ABN 26 683 778 010, added to all three documents and the footer.)

### D-036 — Customer emails for major account events · 2026-10-03 · accepted
**Decision.** Event emails are sent through Resend from `XINGO <hello@xingo.ai>` with the branded "letter" template: welcome (sign-up), minute pack bought, Pro started, Pro cancelled (ends on date), Pro ended, payment failed, out of minutes (at most monthly), and for creators: course published (first time), course removed, payouts set up, payout sent. Content in `lib/email/transactional.ts`; queued from the server mutation where the change happens (`queueEmail`, `convex/model/notify.ts`), so only committed changes email anyone; sent by `transactional.send` with a Resend idempotency key per event so Stripe webhook retries don't duplicate. Subscription emails fire on state *transitions* only. **No monthly invoices or renewal emails** (Stripe's own receipts are a Dashboard setting). These are service emails, sent regardless of the news opt-out, and never contain marketing.

### D-037 — 14-day onboarding series, tailored to the learner's goal · 2026-10-03 · accepted
**Decision.** Every new learner (free included) gets an email on days 1, 3, 5, 7, 9, 11 and 13 after sign-up, on one of seven pathways chosen from their goal (IELTS, OET, clinical, CCL, interpreter, US interpreter, general — `trackForGoal`). Mostly genuinely useful prep advice for their test with one next step, adapting to progress (day 1 changes if they've practised; day 7 shows real sessions, best score and minutes). A daily cron at 23:07 UTC (~9–10am Sydney) queues the day that's due (`dueOnboardingDay`: one day of slack, never a backlog, so existing users aren't blasted); `onboardingEmails` records each send so nobody gets a day twice. It respects `users.emailOptOut`; every email has a one-click unsubscribe (`/e/u/<users.emailToken>`, RFC 8058 headers). Admin → Email shows counts. Content: `lib/email/onboarding-content.ts`.

### D-038 — XINGO Originals, creator pages and real ratings · 2026-10-03 · accepted
**Context.** The marketplace launched empty; the founder wanted it full of human, everyday practice (cafés, bars, neighbours, parents, first jobs, care work, trades, dating and friendship, new arrivals, community interpreting) to show what anyone could create, plus ratings and popularity.
**Decision.**
- **10 in-house studios ("XINGO Originals")**, 100 courses, 300 scenarios (`convex/content/originals/*`), seeded with `originals:seedCreator` (insert-only). Each studio has its own name, bio, accent colour and generated visual style (logo, avatar, profile banner, course banners) plus a photo portrait per AI character. They're labelled "XINGO Original" on cards, course pages and the creator page, owned by `house:<handle>`, free to add (normal minutes) and **never earn or get paid**.
- **No invented social proof.** Ratings, learner counts, sessions and passes are real: ratings only from learners who finished a session in that course (one each, editable, `courseRatings`); counters (`practiceCount`, `passCount`, `addCount`) update from real activity. Badges (New, Popular, Top rated) and sorting (Popular / Top rated / New) are computed from those numbers (`lib/marketplace.ts`). Fake ratings or user counts would be misleading under the Australian Consumer Law.
- **Creator pages** at `/marketplace/creators/<handle>` (profile, real totals, courses). Real creators get a profile automatically on their first course and can edit it from "Created by you".
- **Learner progress** per course ("2 of 3 scenarios passed", "Course passed") on the course page.
- **Update 2026-10-03: account-style creators and admin override.** The studio set read as obviously generated, so it was regrouped into 25 small creator accounts (`convex/content/originals/ugc.ts`, applied by `originals:applyUgcCreator` / `applyUgcDrops`): uneven course counts (1–7), 1–3 scenarios per course, 73 courses kept, 27 removed. Images are candid phone-style photos of places, objects and hands (no faces, no text). Creators are accounts, not invented people: no personal names, credentials or life stories. The loud "XINGO Original" card badge was removed; course and creator pages carry a quiet "Made by the XINGO team" line, so the disclosure stays. Platform admins can edit any course or creator, move courses between creators, publish/unpublish, take down, delete and remove reviews (`convex/marketplaceAdmin.ts`, Admin → Marketplace).

### D-039 — Organisations, collections, invites, verified creators and featured banners · 2026-10-03 · accepted
**Context.** Partners such as 2M's clients want to put their own practice on XINGO: a page at xingo.ai/<name>, some courses public and some only for invited staff, and a way to onboard many people at once. The founder also wanted a verified tick for trusted creators and admin-picked banners at the top of the marketplace.
**Decision.**
- **Organisations are self-serve**: any signed-in user can create one (`orgs:create`, up to 5 owned). An organisation is a `creatorProfiles` row with `kind: "organization"` and no `ownerClerkId`; its team is `orgMembers` (owner / admin / creator). Owners and admins manage the team and profile; creators make courses, edit collections, invite learners and approve requests.
- **xingo.ai/<handle>** serves any creator or organisation (`app/(marketplace)/[handle]`). Handles can't take a site path (`RESERVED_HANDLES`, checked against `app/` by a test).
- **Collections** group an org's courses and are **Public** or **Invite only**. Org courses start private (`courseListings.restricted`) and are public only while in at least one public collection (`syncCourseVisibility`). Private courses are hidden from browse, search, the sitemap and course pages, and can't be practised, except by the team, platform admins and learners with access.
- **Invites and requests** live in `orgInvites`: invite up to 200 emails at a time; access starts when the person signs in with that verified email or opens `/join/<token>`. Learners can request access to invite-only collections; the team approves or declines. Removing access removes the courses from the learner's library.
- **Minute pool**: a XINGO admin sets `orgMonthlyMinutes` (invoiced outside XINGO for now). The team and invited learners practising the org's courses use the pool (`sessions.fundedByOrg`, `orgUsageCharges`) until it runs out, then their own minutes; members of the public on public collections always use their own. Org courses don't earn creator revenue.
- **Verified tick**: platform admins set `verifiedAt` on any creator or org. **Featured banners**: up to three `featuredSlots` (image, title, subtitle, link to a site path or https URL), managed in Admin → Marketplace.

### D-040 — Progress is kept per language pair; one-on-one sessions choose their language · 2026-10-03 · accepted
**Context.** Travis: switching the top-bar pair (e.g. English ⇄ Arabic) still showed scores earned in Spanish; and one-on-one sessions were always in English with no way to practise another language.
**Decision.**
- Scores, passes, recent results, the course library's stats, Progress and Home metrics are filtered to the selected pair (`pair` argument; `lib/languages.ts sessionsForPair`). Sessions recorded before pairs existed count towards the learner's first saved pair. Home lists every pair practised ("Your languages") and switches on tap.
- One-on-one sessions (role-plays and single-character scenarios) are held in the pair's practice language; "English only" keeps them in English. The language picker sits under Session type in the briefing. XINGO's English test role-plays (OET, IELTS, OSCE) always stay in English. The session records `spokenLanguage`, and grading judges the learner's use of that language.
