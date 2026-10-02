# SEO & landing pages

_Added 2026-10-02. Content lives in `lib/seo-pages.ts`; scenarios in `convex/content/australiaPack.ts`._

## Why
Traffic rose after the NAATI CCL page went up. Competitors already rank for generic "NAATI CCL practice", so the plan is **long-tail pages with genuinely specific content**, each backed by real scenarios in the app.

## Pages

| URL | Targets | Backed by |
|---|---|---|
| `/naati/ccl/[language]` (21 languages) | "NAATI CCL Punjabi practice", "CCL Hindi mock test", … | CCL module (11 dialogues) |
| `/naati/cpi` | "NAATI CPI test preparation" | CPI module + Telephone module |
| `/interpreting/medical-interpreting-practice` | medical / healthcare interpreting practice | Medical ER intake (free) + discharge + pharmacy |
| `/interpreting/ndis-interpreting` | NDIS interpreter / planning meeting interpreting | **New** NDIS & Disability Services module |
| `/interpreting/telephone-interpreting-practice` | phone / remote interpreting practice | **New** Telephone Interpreting module |
| `/interpreting/legal-interpreting-practice` | court / tribunal interpreting practice | Courtroom + Immigration modules (+ new Local Court, Tribunal) |
| `/interpreting/diploma-of-interpreting-practice` | Diploma of Interpreting students | CPI + community + phone |
| `/interpreting` | hub for internal linking | — |
| `/exams` + `/exams/[slug]` | OET Speaking, IELTS Speaking, AMC Clinical, NMBA OSCE, CMI oral, CCHI CHI oral | Exam pack (`convex/content/examsPack.ts`) |

Every page: one `h1`, unique title/description, canonical URL, FAQ with `FAQPage` JSON-LD, links to sibling pages, and a sign-up CTA that lands in the welcome flow with **goal and language preselected** (`signUpHref`).

Technical: `app/sitemap.ts`, `app/robots.ts` (app routes disallowed), `metadataBase` + Open Graph in `app/layout.tsx`.

## After deploying
1. Google Search Console → add `xingo.ai` (DNS verification) → submit `https://www.xingo.ai/sitemap.xml`.
2. Run the content seeds so every advertised scenario exists: `content:seedAustraliaPack` and `content:seedExamPack` (dry run first).
3. In GA4, compare sign-ups by landing page (see analytics.md) after 4–6 weeks; expand languages/topics that convert.

## Writing rules
- Never imply affiliation with NAATI, NDIA/NDIS, TIS National or Services Australia; hedge test rules ("check the NAATI website").
- No invented statistics or testimonials.
- Language tips must be specific to that language (that's what keeps pages from being thin duplicates).
- If a page lists a dialogue, it must exist in the app.

## Next ideas (not built)
- More OET professions (pharmacy, physiotherapy, dentistry…), court consecutive, UK DPSI.
- Per-language CCL dialogue variants (names, places) and per-language sample vocab lists.
- Blog-style guides: "CCL marking criteria explained", "How to prepare for the CCL in 4 weeks".
