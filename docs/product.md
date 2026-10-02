# XINGO — Product (PRD v2)

_Last updated 2026-10-02. Supersedes the March 2026 PRD ([archive-prd-v1.md](archive-prd-v1.md)), which is kept for history._

## 1. What XINGO is

XINGO is a practice gym for spoken interpreting. A learner picks a dialogue, and two AI
role-play partners — an English-speaking professional and a client who speaks the
learner's other language — hold a conversation that only the learner can bridge. The
learner interprets out loud, turn by turn. When the conversation ends, an examiner-style
AI scores the transcript and tells them what to work on next.

**One-line pitch:** practise interpreting out loud, get scored in minutes.

## 2. Who it is for

| Segment | Evidence | Priority |
|---|---|---|
| **NAATI CCL candidates** (Australia; credentialed community language test, scored /90, pass 63) | Dedicated landing page since late June; CCL "credit pack" pricing; Thomas/2M team are AU-based | **Primary wedge (provisional)** — confirm with GA (see [analytics.md](analytics.md)) |
| Working community/medical interpreters wanting reps | Most real practice so far is on medical scenarios (ER triage, paediatric) | Secondary |
| Training providers / LSPs (cohorts) | PRD v1 vision; 2M (Thomas) as a design partner | Later — "contact us", not self-serve |

Production data (Oct 2026, see [findings-2026-10.md](findings-2026-10.md)) shows 45 accounts and
34 who tried a session, but **zero sessions on the CCL/CPI modules**. Either the CCL page isn't
bringing people in yet, or people arriving from it were sent to the wrong dialogue (the old Home always pointed at the
first-created module). v4 fixes the routing (goal-ordered catalog, CCL free preview); GA will
tell us which.

## 3. Jobs to be done

1. "Before my CCL test, I want realistic timed dialogues in my language pair and an honest score, so I know if I'm ready."
2. "I want to keep my interpreting sharp between jobs without needing a practice partner."
3. (Later) "As a trainer, I want my cohort practising between classes and to see who is falling behind."

## 4. Core experience (v4)

```
Sign up ─▶ Welcome (goal → language → how it works + mic check)
        ─▶ Practice room: briefing ─▶ live session ─▶ Finish
        ─▶ Results (score, breakdown, feedback, next step) ─▶ Practise again / next dialogue
```

### 4.1 Welcome flow (first run)
- Goal: NAATI CCL, NAATI CPI, Medical, Legal & immigration, General. Orders the library.
- Language: "English ⇄ X". The professional always speaks English (D-010).
- How it works: two AI people, hold-Space to talk / tap to switch, scoring, free minutes; headphones tip and live mic check.
- Ends **inside a practice room** on the recommended dialogue — a new learner is speaking within a minute.

### 4.2 Practice room
- **Setup:** briefing, who's who (name, role, language), the 4-step script, headphones tip, mic level test, choice of **Assessed** (scored, transcript hidden — like the test) or **Practice** (live transcript + per-line translation, not scored).
- **Live:** a coach bar shows the one thing to do now:
  1. Introduce yourself to the client in their language.
  2. Switch to the professional and introduce yourself in English.
  3. Interpret each turn.
  …and "X has wrapped up — press Finish" when the professional calls `end_conversation`.
- Participant cards state their status in words ("Speaking", "Listening to you", "You're talking to them"); colour is a secondary cue (blue = selected/speaking, red = mic open).
- Hold **Space** or the mic button to talk; tap **Space** or a card to switch.
- Timer with minutes remaining; warning under 1 minute; the server ends the session when the balance runs out.
- Optional camera self-view (off by default, never recorded).

### 4.3 Results
- Live "Scoring…" state while grading runs (10–20 s), then score (out of 100, or /90 for CCL), pass badge, change since last attempt, summary, 5-dimension breakdown, strengths, work-on-next, one next step, full transcript on demand.
- Unscored outcomes are explained: practice mode, too short (< 3 interpreter turns), scoring failed (retry, no double charge), ended early.

### 4.4 Library, progress, plan
- **Practice** library: modules ordered by goal; each shows first dialogues, lock state, best score.
- **Progress:** stats, history chart, achievement badges, attempt history linking to results.
- **Plan & minutes:** minutes left (monthly allowance + packs), Pro upgrade, minute packs, Stripe portal.

### 4.5 Admin (platform admins)
- **Overview:** Stripe MRR, 30-day gross, balance, recent payments, subscribers, pack sales, users (growth, active, onboarding), practice volume, minutes metered, estimated AI cost and cost per minute.
- **Users:** search, plan, minutes left, sessions, last active; change role; grant minutes.
- **Invites:** invite learners or admins by email (Clerk invitation); the role applies on sign-in with that verified email.
- **Content:** module and scenario studio (agents, voices, avatars, language, opening lines, end conditions, free preview flag).

## 5. Monetisation

Unit: the **practice minute** — wall-clock time while a session is live, measured on the server, rounded up per session. Scoring and translation are included. See [decisions.md](decisions.md) D-003…D-008.

| | Price (AUD) | Minutes | Access |
|---|---|---|---|
| Free | A$0 | 10 / month | Free modules + 1 preview dialogue per premium module |
| Pro | A$29 / month | 150 / month | Every module |
| CCL Starter pack | A$19 one-off | 30 | Every module (any pack unlocks premium) |
| Practice Plus pack | A$39 one-off | 80 | 〃 |
| Exam Sprint pack | A$69 one-off | 160 | 〃 |
| Team | Contact us | — | Not self-serve yet |

**These numbers are launch defaults, not validated.** Realtime voice is the dominant cost and is now
being logged per session. Check **Admin → Overview → AI cost per minute** after the first ~200
metered minutes and adjust `lib/plans.ts` so each tier keeps a healthy margin.

## 6. What is built vs not

| Area | Status |
|---|---|
| Voice practice with two isolated AI agents, push-to-talk | ✅ |
| Server-side grading, scoring rules, CCL /90 display | ✅ |
| Server-metered minutes, paywall, packs, Pro subscription | ✅ (needs Stripe products — [runbook](runbooks/stripe-setup.md)) |
| Onboarding, guided room, assessed/practice modes | ✅ |
| Admin console (finance, users, invites, content) | ✅ |
| Funnel analytics events (GA4) | ✅ |
| Organisation dashboards, cohorts, CSV import | ❌ schema only |
| Job marketplace | ❌ hidden (`/jobs` unlinked) |
| Accredited micro-credentials | ❌ achievement badges only |
| Server-captured transcripts (anti-cheat) | ❌ client-captured (D-009) |
| Email notifications / lifecycle | ❌ |
| Mobile-optimised room / native app | ⚠️ responsive, not tuned; iOS project exists separately |

## 7. Success metrics

| Metric | Definition | Where |
|---|---|---|
| Activation | % of sign-ups who finish ≥1 assessed session in 24 h | GA funnel `sign_up → practice_finish` |
| Session completion | scored ÷ started | Admin overview |
| Paywall conversion | `checkout_start` ÷ `paywall_view`; paid ÷ active | GA + Stripe |
| Retention | users with sessions in ≥2 distinct weeks | Admin users (last active) |
| Gross margin / minute | (revenue − AI cost) ÷ metered minutes | Admin overview + Stripe |

Baseline (pre-v4): 52% of attempts abandoned, 7 of 80 scored attempts passed, avg score ~45.

## 8. Roadmap (proposed)

**Now (v4 launch):** Stripe products live, environments split, migrations, GA funnel, invite Thomas.

**Next (measure → tune):**
1. CCL depth: more CCL dialogues per language, two-dialogue "mock test" mode with a combined /90 and per-dialogue 29/45 minimum (real CCL rules).
2. Lifecycle email: welcome, "you have N minutes left", "you haven't practised this week" (Resend/Postmark via Convex actions).
3. Pricing tuning from real cost-per-minute.
4. Server-side transcript capture (OpenAI Realtime sideband/webhooks) to make scores tamper-resistant.
5. Content pipeline: generate scenario drafts with an LLM from a brief, human review in the studio.

**Later:** team plans (cohort invite, trainer dashboard), credentials with a partner institution, native mobile.
