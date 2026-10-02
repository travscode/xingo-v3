# Known issues & follow-ups

_Open items after the v4 foundation work (2026-10-02). Ordered by priority._

## Must do before / at launch
1. **Environments.** Live users are on a dev-type Convex deployment and local `.env.local` uses live Clerk keys. Follow [runbooks/release-v4.md](runbooks/release-v4.md).
2. **Stripe products not created yet.** Until they exist, checkout shows "Payments aren't switched on yet". [runbooks/stripe-setup.md](runbooks/stripe-setup.md).
3. **Not yet tested end-to-end in a real browser with live voice.** The v4 room was verified by typecheck, lint, unit tests and build only — local sign-in needs Clerk Development keys. Run the release smoke test (§7) on a preview deployment before switching production.
4. **Pick the free preview dialogues** (`migrations:setFreePreviews`).
5. **Support email.** Help and pricing pages use `support@xingo.ai` / `hello@xingo.ai` — confirm these mailboxes exist or change them.

## Product / pricing
6. **Validate unit economics.** Realtime cost per minute is now logged (Admin → Overview). Revisit `lib/plans.ts` after ~200 metered minutes. Consider `gpt-realtime-mini` (`OPENAI_REALTIME_MODEL`) if margins are thin.
7. **Existing complimentary Pro user** (from test checkouts) — keep or downgrade (stripe-setup §8).
8. **CCL realism:** two-dialogue mock test, combined /90 with ≥29/45 per dialogue, CCL-specific timing.
9. **Scenario personas don't adapt to language.** Names like "Rosita Sanchez" stay when the client speaks Arabic. Option: per-language persona names in the studio, or generate a culturally plausible name at runtime.

## Engineering
10. **Transcripts are client-captured** (D-009). Move to server capture (Realtime sideband/webhooks) before anything credential-like.
11. **Realtime token usage is client-reported** (analytics only). Cross-check monthly against the OpenAI usage dashboard.
12. **Progress page** (`components/dashboard/live-progress.tsx`, ~900 lines) was restyled, not redesigned; it has unused code (`getQuickRange`, `selectedRange`) and could be simplified.
13. **Admin content** was redesigned into drill-down screens (Oct 2026). Still missing: delete/archive, draft vs published, and reordering dialogues.
14. **Mobile practice room.** Hold-to-talk works with touch, but the room isn't tuned for small screens or iOS Safari audio quirks.
15. **`convex-test` is pinned** to 0.0.54 for Convex 1.35; upgrade together.
16. **Unused tables** `organizations`, `organizationMembers`, `jobs` and the `/jobs` page remain for future team features.
17. **No error monitoring.** Add Sentry (Next.js + Convex) and uptime checks.
18. **Lifecycle email** (welcome, minutes low, inactivity) not built.
