# CLAUDE.md

Guidance for AI coding sessions in this repo. Read `docs/architecture.md` and `docs/decisions.md` before non-trivial changes. Marketplace: `docs/marketplace.md`.

## Ground rules
- **Convex is the trust boundary (D-001).** Anything affecting money, access, roles, minutes or scores goes in `convex/`, behind `requireUser`/`requirePlatformAdmin` (`convex/model/auth.ts`) or as an `internal*` function. Never trust client-supplied roles, scores, prices, minutes or scenario content.
- **Pricing/limits live in `lib/plans.ts`; scoring rules in `lib/scoring.ts`.** Both are imported by Convex *and* the UI — keep them framework-free. Don't hardcode prices, pass marks or minute values elsewhere.
- New business rules need a test in `convex/tests/` (`pnpm test`).
- Typed user-facing errors: `throw new ConvexError("CODE")` and map it in `lib/errors.ts`.
- Live users exist. Never run `convex deploy`, `convex import`, `convex run` against a deployment, or anything that writes to Stripe/Clerk without the user's explicit go-ahead. `npx convex codegen` is safe (analysis only).

## UI
- Follow `docs/design-system.md`: black/white, Inter, `components/ui` primitives (`Button`, `Card`, `Badge`, `PageHeader`…). Colour only for meaning (accent = progress/success, live = active, record = mic open).
- One `h1` per page via `PageHeader`. One primary action per screen.
- Copy: Australian English, plain, no invented numbers or unbuilt features.
- **Never show the word "module"** to users: say **course** (D-030, glossary in `docs/design-system.md`). Code identifiers (`moduleId`, `modules` table) stay.

## Practice room
- `components/practice/practice-room.tsx` holds session logic; `room-parts.tsx` is presentational. Agent prompts and language rules are in `lib/ai.ts` (D-010…D-013).
- Push-to-talk and audio-element handling are subtle — change them carefully and test in a real browser with headphones.

## Commands
`pnpm dev` · `npx convex dev` · `pnpm typecheck` · `pnpm lint` · `pnpm test` · `pnpm build`
