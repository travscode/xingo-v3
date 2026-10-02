# XINGO

AI role-play practice for spoken interpreting. Two AI participants who can't understand each
other, one human interpreter, an instant examiner-style score. Built for NAATI CCL candidates
and working community, medical and legal interpreters.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind v4 · Convex (database + backend) · Clerk (auth) · Stripe (payments) · OpenAI Realtime + Responses · GA4.

## Docs

| | |
|---|---|
| [docs/product.md](docs/product.md) | What XINGO is, who it's for, the experience, pricing, roadmap (PRD v2) |
| [docs/architecture.md](docs/architecture.md) | System design, data model, practice engine, metering, billing, environments |
| [docs/decisions.md](docs/decisions.md) | Decision log (why things are the way they are) |
| [docs/design-system.md](docs/design-system.md) | Visual language, tokens, components, copy voice |
| [docs/analytics.md](docs/analytics.md) | GA4 events and how to read the funnel |
| [docs/findings-2026-10.md](docs/findings-2026-10.md) | Production data review, security fixes, team feedback log |
| [docs/known-issues.md](docs/known-issues.md) | Open risks and follow-ups |
| [docs/runbooks/stripe-setup.md](docs/runbooks/stripe-setup.md) | Step-by-step payments setup |
| [docs/runbooks/release-v4.md](docs/runbooks/release-v4.md) | Cutover to the production deployment, admin access, rollback |

## Run locally

```bash
pnpm install
npx convex dev          # starts/attaches your dev Convex deployment and watches convex/
pnpm dev                # Next.js on http://localhost:3000
```

`.env.local` needs `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` (Clerk **Development** instance keys), `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT` (written by `npx convex dev`). Server secrets (OpenAI, Stripe, Clerk issuer) are Convex environment variables, set with `npx convex env set` — see [architecture §8](docs/architecture.md#8-environments).

First time on an empty deployment:

```bash
npx convex run seed:seedBaseData
npx convex run users:setRole '{"email":"you@example.com","role":"platform_admin"}'   # after signing in once
```

## Checks

```bash
pnpm typecheck
pnpm lint
pnpm test        # Convex business rules (convex-test)
pnpm build
```

CI runs typecheck, lint and tests on every pull request (`.github/workflows/ci.yml`).
