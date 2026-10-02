# Findings — October 2026 review

Snapshot taken 2026-10-02 from the live Convex deployment (`deafening-cow-810`, which is a
*dev*-type deployment serving production traffic). Aggregates only.

## Usage

| | |
|---|---|
| Accounts | 45 (44 learners, 1 admin); 1 on Professional, 2 with a Stripe customer |
| Signups by month | Apr 3 · May 10 · Jun 5 · Jul 6 · Aug 5 · **Sep 14** · Oct (2 days) 2 |
| Tried at least one session | 34 of 45 (most within the first hour of signing up) |
| Real attempts | 168 (plus 135 fake "demo" sessions seeded into every account) |
| Outcome | **88 abandoned (52%)**, 73 needs review, 7 passed |
| Scored attempts | 80; avg ≈ 45/100; 19 had fewer than 3 interpreter turns |
| Breakdown averages | accuracy 35 · terminology 37 · fluency 39 · turn management 41 · professionalism 43 |
| By scenario | ER triage 69 · paediatric 69 · housing 14 · bail 11 · visa 5 · **CCL/CPI 0** |
| Heavy users | top learner 37 attempts; next five 11–14 |
| Saved languages | Arabic, Haitian Creole, Greek, French, Italian, Spanish |
| Email TLDs | 40 `.com`, 3 `.au`, 1 `.mx`, 1 `.jp` |
| AI usage logged | 41 events — grading + translation only; **0 realtime events** |

## What it means

1. **People don't know what to do once they're in.** Half of attempts were abandoned, many after 1–2 minutes, and many scored attempts were too short to judge. This matches team feedback ("not intuitive how one should start").
2. **Nobody reached the CCL product.** The old Home sent everyone to `modules[0]` (Medical ER, created first) and CCL modules sorted last. Whether the CCL page drives signups is still unknown — GA has only been live since late August.
3. **Languages were broken for six weeks.** Since 21 Aug the room told the English clinician to speak the learner's language while its own instructions said "speak only English"; the patient got the reverse. That likely contributed to confusion and low scores.
4. **Costs were invisible.** The realtime usage reporter dropped every event because the model name is missing from `response.done`; voice — the main cost — was never logged.
5. **Everyone's progress included fake data** (3 demo sessions each, scores ~82), so dashboards overstated performance.

## Security issues found (all fixed in v4)

| Issue | Fix |
|---|---|
| Any user could set their role to `platform_admin` (`users.syncCurrentUser` took `role`) | Role removed from client API (D-002) |
| Any user could give themselves a paid plan (`users.applyStripeSubscription` public, no auth) | Internal-only, webhook-driven |
| Usage/invoice writers public (`usage.recordEventAdmin`, `markInvoiceStatusAdmin`) | Replaced by internal `recordAiUsage` |
| Scores written by the client (`sessions.completeAttempt`) and graded against a client-sent scenario | Server-side grading (D-009) |
| Unlimited OpenAI realtime keys for any signed-in user | Keys only for a live, owned, in-budget attempt; ≤ 6 per attempt |
| `seed.seedBaseData` / `seed.syncScenarioRuntime` public (second one resets admin edits) | Internal |
| `organizations.list` public | Admin-only |
| Stripe checkout sent debug data to `127.0.0.1:7777`; `.dbg/` committed | Removed |
| Admin page logged Clerk metadata and email to the console | Removed |

## Team feedback (Thomas Lespes-Muñoz, 2M — Jul/Aug 2026)

| # | Feedback | v4 response |
|---|---|---|
| 1 | Language switcher didn't filter modules; flip toggle unnecessary; English agent should always speak English | Pair is "English ⇄ X", applies account-wide to every module; flip removed; English agent fixed to English (D-010) |
| 2 | Unclear who's talking and how to switch; wants clearer active marker / audio waves | Status label on each card in words + blue ring + wave animation; red when mic open; coach bar; keyboard hints |
| 3 | Not obvious how to start; interpreter should introduce themselves to the non-English speaker first | Setup briefing with a 4-step script; coach bar steps 1→2→3 starting with the client (D-011) |
| 4 | Transcript is cheating; hide by default; scoreless practice option with live transcript; fixed-height scroll; force transcription language (Greek→Slavic, Hindi/Punjabi) | Assessed mode hides transcript; Practice mode shows it and isn't graded (D-012); scrollable panel; per-participant forced transcription language |
| 5 | "Practitioner" ambiguous — use clinician / specific title | Renamed + migration (D-014) |
| 6 | Agents need to know when to end the session | `endCondition` + `end_conversation` tool (D-013) |
| 7 | How does Thomas get admin access? | **Admin → Invites → Admin role** (see release runbook) |
