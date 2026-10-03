# On-page SEO audit — October 2026

_Audited 3 October 2026 against the post-redesign marketing site (commit `cef8045`) and the new blog. Applied in phase 2 the same day unless marked otherwise. Keyword targets: [research/seo-keywords-2026-10.md](research/seo-keywords-2026-10.md)._

Status: **Done** = applied in this pass · **Open** = not done, with the reason.

## P1 — biggest wins

| # | Issue | Where | Fix | Status |
|---|---|---|---|---|
| 1 | Home page had **no metadata export**, so it used the generic root title "XINGO" and a CCL-only description, with no canonical | `app/(marketing)/page.tsx` | Absolute title aimed at the main searches (NAATI CCL, OET, IELTS), a 150–160 character description, canonical `/`, Organization and WebSite JSON-LD | Done |
| 2 | **No Open Graph image anywhere**, so shared links had no preview | site-wide | Added a default 1200×630 `app/opengraph-image.tsx` (`next/og`, no new dependency) and set the Twitter card to `summary_large_image` | Done |
| 3 | **Open Graph objects were overwritten per page.** In Next, a page's `openGraph` replaces the root one, so pages lost `siteName`, `locale` and `type` | exam, topic, CCL language pages | New `lib/seo-metadata.ts` `pageMetadata()` builds title, description, canonical, a full OG block and Twitter tags in one place; used on every public page | Done |
| 4 | **Canonical missing** on `/naati/ccl`, `/pricing`, `/how-it-works`, `/for-interpreters`, `/for-organizations` and home | those pages | Added through `pageMetadata()` | Done |
| 5 | **Titles too long:** most exam and topic titles were 63–81 characters including " \| XINGO", so Google cuts them off | `lib/exam-pages.ts`, `lib/seo-pages.ts` | Rewritten to about 60 characters or less, primary keyword first | Done |
| 6 | **Meta descriptions too long:** 164–197 characters on exam, topic and CCL language pages | same | Rewritten to 160 characters or less, ending with a clear benefit | Done |
| 7 | `/naati/ccl` (the main traffic page) had the title **"NAATI CCL Practice"**, which reads as thin and doesn't say what you get | `app/(marketing)/naati/ccl/page.tsx` | Descriptive title and description, canonical, a Course JSON-LD for the CCL practice course, and a "Guides" section linking the CCL articles and the vocabulary page | Done |
| 8 | **No internal links from the money pages to the guides** (the blog is new) | CCL hub, CCL language pages, CPI, exam and topic pages | A shared "Guides" link row (`components/marketing/seo/guide-links.tsx`), filled automatically by each article's `cta.pagePath` | Done |

## P2 — structure and consistency

| # | Issue | Where | Fix | Status |
|---|---|---|---|---|
| 9 | **No breadcrumbs** (visible or schema) on deep pages | `/naati/ccl/[language]`, `/exams/[slug]`, `/interpreting/[topic]`, `/naati/cpi` | Breadcrumb trail with BreadcrumbList JSON-LD, rendered inside `MarketingIntro` (new optional `breadcrumbs` prop) so the spacing doesn't change | Done |
| 10 | **Generic titles on secondary pages:** "Pricing", "How it works", "For interpreters", "For teams" | those pages | Descriptive titles and descriptions; the `h1` copy is unchanged | Done |
| 11 | The `FaqSection` JSON-LD didn't escape `<` | `components/marketing/seo/faq-section.tsx` | Now uses `serializeJsonLd` from `lib/structured-data.ts` | Done |
| 12 | `app/not-found.tsx` used classes that don't exist (`bg-brand`, `rounded-full`, display font), was off-brand, and said "This route does not exist." | `app/not-found.tsx` | Restyled with the design-system Button, plain copy and links to the main hubs | Done |
| 13 | `html lang="en"`, but the audience and copy are Australian | `app/layout.tsx` | `lang="en-AU"` | Done |
| 14 | No Guides entry in the footer | `components/marketing/marketing-shell.tsx` | Added "Guides" (`/blog`) and "CCL vocabulary" | Done |
| 15 | Auth pages (`/sign-in`, `/sign-up?redirect=…`) were crawlable, producing endless URL variants; creator tools in the marketplace were crawlable too | `app/robots.ts` | Disallowed them, plus `/e/` email-tracking links. Marketplace listings stay crawlable | Done |
| 16 | Sitemap used `new Date()` for every URL, didn't list the blog, vocabulary page or marketplace, and had no real `lastModified` | `app/sitemap.ts` | Blog posts use their `updated` date; added the blog, vocabulary page, `/marketplace`, `/marketplace/create` and published courses (fetched from Convex, falling back to none) | Done |

## P3 — performance and Core Web Vitals risks (not changed — needs a decision)

| # | Risk | Notes | Status |
|---|---|---|---|
| 17 | **Every public page ships Clerk, the Convex client and `AppBootstrap`** because the root layout wraps everything in `ClerkProvider` + `ConvexClientProvider` | This is the biggest JS cost on marketing pages (it affects INP and LCP on mid-range Android). Option: move the providers into `app/(dashboard)` and `app/(marketplace)` layouts and give marketing a lighter `HeaderAuth` (signed-in check via `<SignedIn>` only). Touches auth bootstrap, so it needs a careful test | Open — architectural |
| 18 | `HeaderAuth` shows a grey placeholder until Clerk loads | Small layout shift risk in the header (fixed size, so CLS is near zero). Fine for now | Open — low |
| 19 | GA4 loads `afterInteractive` on every page | Acceptable. `lazyOnload` would help INP slightly but delays page_view | Open — low |
| 20 | Large unused images in `public/images` (`doctor*.webp` ~550 KB each, `hero-interpreter-training.jpg` 560 KB) | Not referenced by the marketing pages today. If they're reused, serve them through `next/image` with `sizes` | Open — watch |
| 21 | Animated mocks (`practice-mock.tsx`) are CSS-only server components | Good: no client JS. Keep animations behind `prefers-reduced-motion` (they already are) | OK |

## Content and thin-page checks

- **CCL language pages (21):** each has three language-specific tips, which is what keeps them from being duplicates. They now also link to the guides and the vocabulary page. _Next:_ add a short, reviewed vocabulary section per language (numbers and respectful forms), written by a fluent speaker. Don't machine-generate it.
- **Exam pages (6):** strong — format, covered/not covered, scenarios, tips, FAQ and sources. Titles and descriptions fixed.
- **Topic pages (5):** shorter, but each is backed by real scenarios. _Next:_ add one paragraph of domain-specific guidance (for example, NDIS terms) when someone can write it accurately.
- **`/for-interpreters`, `/for-organizations`:** thin, but they're conversion pages rather than search targets. They now have canonicals and better titles; no further content needed.
- **No invented numbers** were found on public pages. Prices come from `lib/plans.ts` and pass marks from `lib/scoring.ts`.
- **Heading structure:** each page has one `h1` (`MarketingIntro` or the CCL hero); sections use `h2` and cards use `h3`/`p`.

## Structured data now in place

| Page | Types |
|---|---|
| Home | Organization, WebSite |
| `/naati/ccl` | Course (XINGO's CCL practice course), BreadcrumbList |
| CCL language, CPI, exam and topic pages | BreadcrumbList, FAQPage |
| `/naati/ccl/vocabulary` | BreadcrumbList, FAQPage |
| `/blog` | BreadcrumbList, ItemList |
| `/blog/[slug]` | Article (author "XINGO team"), BreadcrumbList, FAQPage |
| `/marketplace/[slug]` | Owned by the marketplace pages (unchanged) |

Google now shows FAQ rich results mainly for government and health sites, so FAQPage markup is for clarity rather than a guaranteed SERP feature. Never add Review or AggregateRating markup without real reviews.

## After deploying

1. Search Console: resubmit `https://www.xingo.ai/sitemap.xml` and check Coverage for `/blog/*` and `/naati/ccl/vocabulary` after about a week.
2. Use the Rich Results Test on one blog post, one exam page and `/naati/ccl`.
3. In GA4, compare blog-landing sessions → `sign_up` over 4–6 weeks; expand the topics that convert (see the research doc for the P2/P3 article backlog).
4. Re-check the facts flagged "to re-check" in the research doc (Home Affairs points table, NMBA OSCE station count, CCHI weights) before updating articles.
