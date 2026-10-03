# Design system

_The visual and interaction rules for XINGO. Tokens live in `app/globals.css`; components in `components/ui`._

## Philosophy

Think Uber: **calm, confident, monochrome**. The product asks people to do something hard
(interpret out loud under time pressure), so the interface should feel quiet and obvious.

1. **One obvious next action per screen.** Home has one dark card with one lime button. The room has one coach line. If a screen has two primary buttons, one of them is wrong.
2. **Colour carries meaning, never decoration.** If you remove all colour, the screen must still make sense. Every coloured state is also said in words.
3. **Say what's happening.** "Speaking", "Listening to you", "You're talking to them", "Scoring…", "3 min left". No mystery states.
4. **Hold hands at the start, get out of the way later.** First-run and first-session get coaching; returning users get a short Home and their history.
5. **Honest copy.** No invented stats, no features we haven't built, no internal notes on public pages.

## Tokens

| Token | Value | Use |
|---|---|---|
| `ink` | `#000000` | Text, primary buttons, inverse surfaces |
| `paper` | `#ffffff` | Page background |
| `gray-50` | `#f6f6f6` | Muted cards, unselected choices |
| `gray-100` | `#eeeeee` | Inputs, secondary buttons, chips |
| `gray-200` | `#e2e2e2` | Borders, dividers, progress track |
| `gray-500` | `#6b6b6b` | Secondary text |
| `gray-700` | `#333333` | Body text on light emphasis, primary hover |
| `accent` | `#c6f432` (on `accent-ink #1b2400`) | Progress fill, pass, success, *the* CTA on a dark card |
| `live` | `#276ef1` | Selected participant, AI speaking, focus ring |
| `record` | `#e11900` | Microphone open, errors, time almost up |
| `warning` | `#ffc043` | Non-blocking warnings (last minute, audio blocked) |
| `success` | `#05944f` | Pass ticks on light surfaces |

Use them as Tailwind classes: `bg-ink text-paper`, `bg-gray-50`, `text-gray-500`, `bg-accent text-accent-ink`, `ring-live`, `bg-record`.

**Never:** gradients, drop shadows on cards, violet/indigo/slate palettes, emoji as UI (flag emojis next to language names are the one exception).

## Type

- **Inter** everywhere (`--font-inter`).
- Page title: `text-3xl sm:text-4xl font-bold tracking-[-0.035em]` — exactly one `h1` per page (`PageHeader`).
- Section title: `text-lg font-bold` (`SectionTitle`).
- Body: 15px/24px (`text-[15px] leading-6`); secondary `text-sm text-gray-500`.
- Numbers that change (scores, timers, minutes): `tabular-nums`, big and bold.
- Australian English spelling in copy: practise (verb) / practice (noun), organisation, colour.

## Shape & spacing

- Radii: `rounded-lg` (8px) buttons, inputs, chips; `rounded-xl` (12px) cards; `rounded-2xl` participant tiles; `rounded-full` avatars and the mic.
- Borders: 1px `gray-200`. Selected choices use a 2px `ink` border.
- Page container: `max-w-6xl`, 16px side gutter on mobile, 32px on desktop. Sections separated by `space-y-8`–`space-y-10`.

## Components (`components/ui`)

| Component | Notes |
|---|---|
| `Button` | `primary` (black), `secondary` (gray), `outline`, `ghost`, `accent` (lime — only on dark surfaces or the single most important action), `inverse` (white on black). Sizes `sm`/`md`/`lg`/`icon`. `asChild` for links. |
| `PageHeader` | Title, description, optional actions. |
| `Card` | `default` (bordered), `muted` (gray-50), `inverse` (black). |
| `Badge` | `neutral`, `accent`, `live`, `dark`, `warning`, `success`. |
| `ProgressBar` | `ink`, `accent`, `record`. |
| `Stat`, `EmptyState`, `Skeleton`, `SectionTitle` | |

Room-specific: `ParticipantTile`, `MicButton`, `CoachBar`, `MicCheck`, `HeadphonesTip`, `SelfView` (`components/practice/room-parts.tsx`).

## Patterns

- **Loading:** `Skeleton` blocks in the shape of the content, never spinners for whole pages.
- **Empty:** `EmptyState` with one action.
- **Errors:** plain sentence in a `bg-record/10 text-record` box; map server codes through `lib/errors.ts`.
- **Paywall:** explain what's locked, offer the plan *and* a free alternative ("Try the free dialogue").
- **Focus routes:** the practice room and welcome flow hide the app chrome (`isFocusRoute` in the shell).
- **Accessibility:** status text alongside colour; `aria-live` on the coach bar; `aria-pressed` on toggles; keyboard path for everything (Space for talk/switch); `prefers-reduced-motion` stops pulsing rings.

## Copy voice

Plain, warm, brief. Second person. Verbs on buttons ("Start session", "Finish and get my score", "Get more minutes"). Explain consequences before they happen ("Minutes used so far still count").

## Words we use (D-030)

| Say | Never say | Meaning |
|---|---|---|
| **course** | module | A set of practice scenarios on one theme (e.g. "NAATI CCL", "Retail interviews"). URL: `/courses/<id>`. |
| **scenario** (creators), **dialogue** (interpreting learners), **role-play** (speaking learners) | lesson, exercise | One practice conversation with AI voice partners. |
| **session** / **attempt** | test, exam (unless it is one) | One run of a scenario, scored when it finishes. |
| **practice minutes** | credits, tokens | What learners spend while a session is live. |
| **marketplace** | store, shop | Where community courses are found and added. |
| **creator** | author, vendor | Someone who publishes a course on the marketplace. |

Code still uses `module`/`moduleId` (the `modules` table, `api.modules.*`) because renaming stored
data isn't worth the risk. That's fine, as long as the word never reaches the screen, emails or URLs.
