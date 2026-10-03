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
| `/staff-training` | AI role-play training for staff, customer service training simulation, multilingual staff and volunteer training | Scenario builder, scoring, practice/assessed modes; team view, invites and private courses shown as **pilot** (D-021), demo labelled illustrative |
| `/sell-practice-courses` | sell practice courses online, monetise your expertise, create AI role-play training, sell practice exams, earn money teaching | Marketplace landing (header "Marketplace" link); creator wizard, page tools, insights and the 25% share (D-031) are built; team-only courses shown as **pilot**; hero mock labelled illustrative. Cross-links /marketplace, /marketplace/create, /staff-training |
| `/migrate-to-australia` | migrate to Australia English test, CCL points for PR, IELTS/OET for Australian visa, how to become an interpreter in Australia | Pathway hub linking IELTS, OET, CCL, AMC, OSCE, CPI pages + 2M partnership. General information only (registered migration agents give advice); facts sourced from Home Affairs/NAATI/Ahpra, re-check the points table before big promotion |

Every page: one `h1`, unique title/description, canonical URL, FAQ with `FAQPage` JSON-LD, links to sibling pages, and a sign-up CTA that lands in the welcome flow with **goal and language preselected** (`signUpHref`).

| `/naati/ccl/vocabulary` | "NAATI CCL vocabulary", "CCL health vocabulary" | English word lists for the 12 CCL domains (`lib/ccl-vocabulary.ts`), linked to CCL course dialogues |
| `/blog` + `/blog/[slug]` | long-tail informational queries (CCL format/marking, 5 points, repeats, note-taking, topics; CPI; OET; IELTS Part 2; AMC; OSCE/ISBAR; CMI vs CHI; phone interpreting) | 14 typed articles in `lib/blog/posts/*.ts`; each ends in a CTA to the matching course page |

Technical: `app/sitemap.ts` (incl. blog dates and published marketplace courses), `app/robots.ts` (app routes, auth and creator tools disallowed), `metadataBase` + default OG image (`app/opengraph-image.tsx`). Every public page builds its metadata with `pageMetadata()` (`lib/seo-metadata.ts`) and its JSON-LD with `lib/structured-data.ts`. Keyword research: [research/seo-keywords-2026-10.md](research/seo-keywords-2026-10.md). Audit: [seo-audit-2026-10.md](seo-audit-2026-10.md).

### Adding a blog post
Create `lib/blog/posts/<slug>.ts` exporting `post: BlogPost`, register it in `lib/blog/index.ts`. `lib/blog/blog.test.ts` checks length (800–1500 words), meta lengths, internal links, related slugs and the "course, not module" rule. Cite the official source for every exam fact and hedge anything that changes.

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
- More guides from the research backlog: CCL online test-day checklist, CCL results/review/validity.
