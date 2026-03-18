# XINGO

XINGO is an AI interpreter training platform built on Next.js. This repository now contains a live foundation matching the supplied PRD: marketing site, Clerk auth, Convex-backed dashboard data, protected routes, Stripe billing endpoints, and the initial module/scenario catalog seeded into Convex.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Planned integrations: Clerk, Convex, Stripe, external voice AI

## Available routes

- `/`
- `/pricing`
- `/how-it-works`
- `/for-interpreters`
- `/for-organizations`
- `/sign-in`
- `/sign-up`
- `/dashboard`
- `/modules`
- `/modules/[moduleId]`
- `/practice/[scenarioId]`
- `/progress`
- `/credentials`
- `/jobs`
- `/billing`
- `/account`
- `/help`

## Project structure

- `app/`: route groups for marketing and dashboard surfaces
- `components/`: shared UI, dashboard, modules, and practice components
- `lib/`: navigation, integration helpers, and Stripe/Convex utilities
- `types/`: domain models from the architecture spec
- `utils/`: scoring and permission helpers
- `convex/`: live schema, auth config, seed data, and backend functions

## Environment

Copy `.env.example` and provide the values required for Clerk, Convex, Stripe, and voice AI.

For a fully live billing flow, you still need Stripe price IDs:

- `STRIPE_PROFESSIONAL_PRICE_ID`
- `STRIPE_ORGANIZATION_PRICE_ID`

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Next build stages

1. Replace the authentication placeholder pages with Clerk components and middleware.
2. Expand the live Convex model into organization admin workflows, credentials, and notifications.
3. Add Stripe price IDs and test checkout plus webhook flows end to end.
4. Build the live voice practice session flow and scoring pipeline.
