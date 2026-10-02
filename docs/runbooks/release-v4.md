# Runbook — releasing v4 and getting production-ready

v4 changes the backend contract (new functions, Stripe moved into Convex, roles locked down), so
it's released as a **cutover**: the current app keeps running untouched on the dev deployment
until the new one is verified on a proper production deployment.

Estimated time: ~2 hours, best done at a quiet time (data written to the old deployment after the export is not carried over).

## 0. Before you start

- [ ] Branch `v4-foundation` reviewed; `pnpm typecheck && pnpm lint && pnpm vitest run && pnpm build` pass (CI runs these on every PR).
- [ ] You know the Convex **prod** deployment (`grand-flamingo-29`, currently empty) and have its deploy key (Convex dashboard → prod → Settings → Generate deploy key).
- [ ] Stripe test-mode setup done ([stripe-setup.md](stripe-setup.md) steps 1–6).

## 1. Back up the live data

```bash
npx convex export --path backups/xingo-2026-10-pre-v4.zip --include-file-storage
```
(Runs against `deafening-cow-810`, the deployment in `.env.local`.) Keep this file somewhere safe and **out of git**. It contains user emails and transcripts.

## 2. Deploy v4 to the production deployment

```bash
# deploys functions + schema to prod (not dev)
CONVEX_DEPLOY_KEY='prod:grand-flamingo-29|...' npx convex deploy
```

## 3. Copy the data into production

```bash
CONVEX_DEPLOY_KEY='prod:grand-flamingo-29|...' npx convex import --replace-all backups/xingo-2026-10-pre-v4.zip
```
The v4 schema accepts all existing documents: new fields are optional and old fields were kept optional.

## 4. Production environment variables (Convex)

```bash
export CONVEX_DEPLOY_KEY='prod:grand-flamingo-29|...'
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://clerk.<your-domain>   # same value as the dev deployment today
npx convex env set CLERK_SECRET_KEY sk_live_...                          # for admin invites
npx convex env set SITE_URL https://<your-domain>
npx convex env set OPENAI_API_KEY sk-...
# Stripe: see stripe-setup.md step 5 (live values once you go live; test values until then)
```
Check `CLERK_JWT_ISSUER_DOMAIN` on the current deployment with `npx convex env get CLERK_JWT_ISSUER_DOMAIN`.

**Clerk JWT template:** Clerk → JWT Templates → `convex`. Make sure the claims include `email` and `email_verified`; the default Convex template does. Invites rely on them.

## 5. Run the data migrations (dry run first)

```bash
export CONVEX_DEPLOY_KEY='prod:grand-flamingo-29|...'
npx convex run migrations:removeDemoData '{"dryRun": true}'          # expect 135 sessions / 45 users
npx convex run migrations:removeDemoData '{"dryRun": false}'
npx convex run migrations:closeLegacyOpenAttempts '{"dryRun": false}' # ~88 old in-progress attempts → abandoned
npx convex run migrations:renamePractitionerRole '{"dryRun": true}'
npx convex run migrations:renamePractitionerRole '{"dryRun": false}'
npx convex run migrations:setFreePreviews '{"dryRun": false, "scenarioIds": ["ccl-medical-scan-booking", "cpi-gp-clinic-registration"]}'
```
Choose whichever CCL/CPI dialogue you want as the free taster. Scenario IDs are in Admin → Content or the `scenarios` table.

## 6. Point Vercel at production

Vercel → Project → Settings → Environment Variables (**Production**):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | `https://grand-flamingo-29.convex.cloud` |
| `CONVEX_DEPLOY_KEY` | the prod deploy key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | unchanged (live Clerk) |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | `G-J7M1JVS5HM` |

Settings → Build & Development → **Build command:** `npx convex deploy --cmd 'pnpm build'`
(deploys Convex functions and the Next.js build together, so they never drift.)

**Delete** from Vercel (now unused): `OPENAI_API_KEY`, `OPENAI_*_MODEL`, `STRIPE_*`, `STRIPE_WEBHOOK_CALLBACK`, `ELEVENLABS_API_KEY`.

Merge the PR → Vercel deploys.

## 7. Smoke test (production)

- [ ] Sign in with your account → you land on **Welcome** (everyone onboards once) → finish → you're in a practice room.
- [ ] Mic check shows a level; **Start session** → coach step 1 → introduce yourself → step 2 → switch with Space → step 3.
- [ ] Clinician speaks English; client speaks your chosen language; the live transcript (Practice mode) shows the right language.
- [ ] **Finish** → Results show "Scoring…" then a score.
- [ ] Plan & minutes shows minutes used.
- [ ] **Admin** appears in your sidebar → Overview loads (Stripe badge), Users lists 45, Invites works.
- [ ] Convex dashboard → Logs: no errors; the cron "close stale practice attempts" runs every 2 min.

## 8. Give Thomas admin access

Admin → **Invites** → `thomas@2m.com.au`, role **Admin** → Send invite.
- If he already has an account, his role changes immediately (provided his email was verified by Clerk; otherwise he just needs to sign in once more).
- Otherwise he gets a Clerk sign-up email; the role applies when he signs up with that address.

## 9. Rollback

The old app still works against the untouched dev deployment:
1. Vercel → Deployments → previous production deployment → **Promote/Instant rollback**.
2. Set `NEXT_PUBLIC_CONVEX_URL` back to `https://deafening-cow-810.convex.cloud` if you changed it.
Data written to prod in the meantime stays in prod and can be re-exported.

## 10. After cutover: local development

- `.env.local` today holds **live** Clerk keys and the dev deployment that served real users. Switch local dev to:
  - the Clerk **Development** instance keys (Clerk dashboard → Development → API keys), and
  - a dev Convex deployment (`npx convex dev`). Either reuse `deafening-cow-810` (it now contains a copy of real user data, so consider clearing it) or create a fresh one.
- Seed a fresh dev deployment with `npx convex run seed:seedBaseData`.
- Make yourself admin locally: `npx convex run users:setRole '{"email":"you@example.com","role":"platform_admin"}'`.
- Stop using `npm run ship` (it was removed). Branch, open a PR, merge.
