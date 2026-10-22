# SEO & landing pages

_Added 2026-10-02. Content lives in `lib/seo-pages.ts`; scenarios in `convex/content/australiaPack.ts`._

## Why
Traffic rose after the NAATI CCL page went up. Competitors already rank for generic "NAATI CCL practice", so the plan is **long-tail pages with genuinely specific content**, each backed by real scenarios in the app.

## Pages

| URL | Targets | Backed by |
|---|---|---|
| `/naati/ccl/[language]` (21 languages) | "NAATI CCL Punjabi practice", "CCL Hindi mock test", "naati sinhala", … | CCL course (11 dialogues) |
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
| `/migrate-to-australia/[guide]` (14 guides; guides.test.ts caps the cluster at 14, so raise the cap deliberately before adding more) | Topic cluster around the hub — see table below | Typed data in `lib/migration-guides/guides/*.ts`, one route (`[guide]/page.tsx`). Each guide: at-a-glance box, migration disclaimer, "How XINGO helps", FAQ, official sources, related guides, back link to the hub. Article + BreadcrumbList + FAQPage JSON-LD |

Every page: one `h1`, unique title/description, canonical URL, FAQ with `FAQPage` JSON-LD, links to sibling pages, and a sign-up CTA that lands in the welcome flow with **goal and language preselected** (`signUpHref`).

| `/naati/ccl/vocabulary` | "NAATI CCL vocabulary", "CCL health vocabulary" | English word lists for the 12 CCL domains (`lib/ccl-vocabulary.ts`), linked to CCL course dialogues |
| `/blog` + `/blog/[slug]` | long-tail informational queries (CCL format/marking, 5 points, repeats, note-taking, topics; CPI; OET; IELTS Part 2; AMC; OSCE/ISBAR; CMI vs CHI; phone interpreting) | 14 typed articles in `lib/blog/posts/*.ts`; each ends in a CTA to the matching course page |

Technical: `app/sitemap.ts` (incl. blog dates and published marketplace courses), `app/robots.ts` (app routes, auth and creator tools disallowed), `metadataBase` + default OG image (`app/opengraph-image.tsx`). Every public page builds its metadata with `pageMetadata()` (`lib/seo-metadata.ts`) and its JSON-LD with `lib/structured-data.ts`. Keyword research: [research/seo-keywords-2026-10.md](research/seo-keywords-2026-10.md). Audit: [seo-audit-2026-10.md](seo-audit-2026-10.md).

### Adding a blog post
Create `lib/blog/posts/<slug>.ts` exporting `post: BlogPost`, register it in `lib/blog/index.ts`. `lib/blog/blog.test.ts` checks length (800–1500 words), meta lengths, internal links, related slugs and the "course, not module" rule. Cite the official source for every exam fact and hedge anything that changes.

### Migration guide cluster (`/migrate-to-australia/<slug>`)

Hub: `/migrate-to-australia` ("Migration guides" section, anchor `#guides`, grouped cards; pathway steps also link the matching guide). Footer: one "Migration guides" link to `#guides`. Facts checked against official pages on 2026-10-03 (Home Affairs, NAATI, Ahpra/NMBA, AMC, Medical Board, OMARA, TIS National, Services Australia, ATO, Fair Work, DEWR).

| Group | Slug | Target queries |
|---|---|---|
| Language & tests | `english-test-for-australian-pr` | english proficiency test, english (language) tests for australia, english test for australian pr, competent/proficient/superior english points |
| Language & tests | `celpip-for-australian-pr` | celpip australia, celpip australia points test, celpip for australian pr |
| Language & tests | `ielts-vs-pte-vs-oet` | ielts vs pte for australia pr, oet or ielts for nurses, ahpra accepted tests |
| Language & tests | `free-english-classes-amep` | free english classes for migrants, AMEP eligibility/time limits, SEE program |
| Points & visas | `skilled-migration-points-test` | australian pr points test, pr test, points test guide, points table 189, 65 points, SkillSelect EOI (has the points estimator) |
| Points & visas | `community-language-points` | credentialed/credentialled community language, which naati test for pr, naati ccl points, ccl vs cpi (complements the blog's CCL 5-points article — keep them distinct) |
| Points & visas | `find-a-registered-migration-agent` | registered migration agent, check MARN, OMARA register, visa scams |
| Points & visas | `translating-documents-for-a-visa` | naati translation for visa, free translating service |
| Professions | `nurses-moving-to-australia` | nurses moving to australia, NMBA OSCE, Self-check streams, OET for nurses |
| Professions | `doctors-moving-to-australia` | AMC pathways, AMC clinical exam format, IMG registration |
| Settling in | `first-weeks-in-australia` | new migrant checklist, Medicare enrolment, TFN, work rights |
| Settling in | `free-interpreter-services` | free interpreter australia, TIS National 131 450, free interpreting at GP |
| Work | `become-an-interpreter-in-australia` | how to become an interpreter in australia, CPI eligibility, TIS panel; 2M partnership |
| Work | `jobs-for-bilingual-migrants` | bilingual jobs, NAATI CLA test, bilingual worker vs interpreter; 2M partnership |

Links into the cluster: `MigrationGuidesCallout` ("Moving to Australia?", 1–2 guides, mapping in `lib/migration-guides/index.ts`) on `/naati/ccl`, every `/naati/ccl/[language]`, `/naati/cpi`, `/interpreting`, and the IELTS, OET, AMC and NMBA OSCE exam pages; a "Moving to Australia?" callout in six blog posts (CCL 5 points, CPI prep, IELTS Part 2, OET role-play, AMC, NMBA OSCE).

Rules (checked by `lib/migration-guides/guides.test.ts`): unique slug/title/meta, full `<title>` ≤ 60 chars, description 110–160, ≥ 700 words, 3–5 at-a-glance points, 4–6 FAQs, ≥ 3 https sources, 3–5 related siblings, no orphans, internal links resolve, no "module", no salaries/pass rates/processing times. "2M Language Services" only in body text/FAQ answers, where `RichText`/`FaqSection` auto-link it to 2m.com.au, and always with "2M makes its own decisions about who it engages". Re-check the English score tables and points table before big promotion.

## Search Console query → page map (2026-10-19)

From Search Console impressions after the CCL-first launch (D-043). Rule: **one page per intent**. Retarget the page that already fits rather than creating a near-duplicate that splits rankings. Every page's main call to action leads to something open today: NAATI CCL practice, or the free medical course for US medical interpreters (`openAlternativeFor` in `lib/site-status.ts`).

| Query (clicks / impressions / position) | Page | What changed |
|---|---|---|
| xingo 4/184/4.9 · xingos · xingo train | `/` | Brand-first, CCL-first title and description; Organization JSON-LD now has `logo` (`/logo.png`, from `app/logo.png/route.tsx`), `alternateName` and `knowsAbout`; WebSite has `alternateName`. Root `applicationName`. Hero, course list and "different test?" chips no longer imply IELTS/OET are open. New "Moving to Australia?" section links the guides below. OG image text is CCL-first |
| pr test 0/3/88 · points test guide 0/3/91 | `/migrate-to-australia/skilled-migration-points-test` | Retitled "Australian PR Points Test Guide (189, 190, 491)". Full points table (checked against Home Affairs, page updated June 2026), an "Is there a PR test?" FAQ, and an interactive **points estimator** (`components/marketing/points-estimator.tsx`, data in `lib/points-test.ts`) that shows "+5 with a NAATI CCL pass" and links to CCL practice. Linked from home, footer and every `/naati/ccl/[language]` page |
| english proficiency test 0/2/9.5 · english tests · english language tests | `/migrate-to-australia/english-test-for-australian-pr` | Retitled "English Proficiency Tests for Australian Visas"; defines an English proficiency test, names the eight accepted tests, adds a "best test?" FAQ and a "speak another language? +5 points" bridge. CTA is now CCL (IELTS/OET practice is coming soon). `ielts-vs-pte-vs-oet` keeps the comparison intent and got the same honest CTA. Linked from home and footer |
| chii chii oral 0/1/6 (CCHI CHI oral) | `/exams/cchi-oral-exam` | Rewritten as an explainer: "CHI Oral Exam (CCHI): Format, Scoring and Prep". Verified figures from CCHI (60 min, 4 consecutive dialogues = 70%, simultaneous 17%, sight 11%, MCQ 2%, scaled 300–600 with 450 to pass, Spanish/Mandarin/Arabic, in person in the US). Coming soon; CTA goes to the free medical course |
| naati sinhala 0/1/6 | `/naati/ccl/sinhala` | Title "NAATI CCL Sinhala (Sinhalese) Practice Test" (NAATI spells it Sinhalese), Sinhala-specific tips and a certification FAQ. All 21 language pages gained two FAQs: "Is the NAATI CCL available in X?" (all 21 checked against NAATI's list on 2026-10-19) and "How many PR points does a CCL pass give?" |

Site-wide in the same pass:
- **Coming-soon CTAs everywhere (D-043):** blog posts and migration guides whose `cta.goal` is coming soon now show "{Goal} practice is coming soon" and send people to the open course. "How XINGO helps" links and the migration hub's "Practise on XINGO" links show a Coming soon badge (`isPathComingSoonOnSite`). `/for-interpreters` and home course lists show Coming soon badges from `courseOpenAtLaunch`.
- **Footer:** "PR points test guide" and "English tests for Australia".
- `/migrate-to-australia` description and feature copy are CCL-first.
- `CCL_DIALOGUE_PASS_SCORE` (29 per dialogue, NAATI) added to `lib/scoring.ts` for public copy.

Re-check before promoting: the Home Affairs points table (`lib/points-test.ts`, `POINTS_TABLE_CHECKED`), NAATI's CCL language list (`NAATI_CCL_LANGUAGES_CHECKED` in `lib/seo-pages.ts`) and CCHI's CHI description.

## Query → page map, update (2026-10-22 export, last 6 months)

Every query in the 22 October Search Console export has exactly one target page. Where a query fitted an existing page, that page was retargeted rather than duplicated.

| Queries (impressions / avg position) | Target page | Change |
|---|---|---|
| xingo (193 / 4.9), xingo train, xingos | `/` | As above. **Host split:** `xingo.ai` (171 impressions) and `www.xingo.ai` (84) are both indexed because the apex returns a **307 (temporary)** redirect to www, set in Vercel. Fix in Vercel → Domains: set `xingo.ai` to redirect to `www.xingo.ai` with **308 (permanent)**. Canonicals, `metadataBase` and the sitemap already use www |
| pr test (5 / 85), points test guide (5 / 90), point test, points test, pr point system in australia, australia pr point system, pr poin | `/migrate-to-australia/skilled-migration-points-test` | Title "Australian PR Points Test and Point System Guide", h1 "…how the point system works", "PR point system" in the intro. Anchor text on internal links now says "PR points test guide" (hub, CCL 5-points post, footer, home) |
| which naati test for pr, credentialed community language (2 / 58), credentialled community language | `/migrate-to-australia/community-language-points` | Retitled "Credentialed Community Language: Which NAATI Test?". Both spellings explained in the intro (Home Affairs says "credentialled", NAATI says "Credentialed"), a "Which NAATI test for PR: CCL or certification?" section and FAQ. Linked from the CCL hub's format section |
| ccl test, ccl exam, c.c.l | `/naati/ccl` | Title "NAATI CCL Test Practice — Mock Dialogues Online"; the eyebrow, intro and description name the "Credentialed Community Language (CCL) test". New "About the CCL test" FAQ (format, pass mark, points, languages, fee, validity) with FAQPage JSON-LD, using facts from `lib/naati-ccl.ts` |
| naati exam format | `/blog/naati-ccl-test-format-and-marking` | Retitled "NAATI CCL Exam Format and Marking, Explained"; linked from the CCL hub's format section |
| naati languages | **New** `/naati/ccl/languages` | All 55 CCL test languages in NAATI's spelling (from `lib/naati-ccl.ts`; `lib/naati-ccl.test.ts` checks that every practice page is on the list), linking the 21 practice pages. Linked from the CCL hub, every language page, the footer and the community-language guide |
| naati sinhala | `/naati/ccl/sinhala` | As above |
| english proficiency test (3 / 9.3), english tests, english language tests | `/migrate-to-australia/english-test-for-australian-pr` (the English-tests hub) | Now has a score table for all 8 accepted tests × 3 levels (Home Affairs, tests from 7 August 2025) and a "Which test suits you" section linking IELTS, OET, CELPIP and the comparison guide |
| celpip australia points test | **New** `/migrate-to-australia/celpip-for-australian-pr` | CELPIP General is accepted for tests taken from 7 August 2025, but CELPIP Online isn't. Scores per level, points, a note for Canadian passport holders. Linked from the English-tests guide, the points guide and the "Language & tests" group on the hub |
| occupational english test | `/exams/oet-speaking` | Retitled "Occupational English Test (OET) Speaking Guide"; FAQs give the Ahpra (from 23 April 2026) and Home Affairs Proficient OET scores |
| english speaking test with ai, ielts practice test for doctors australia | `/exams/ielts-speaking` | Retitled "IELTS Speaking Test: Format, Bands and AI Practice"; FAQs give the Home Affairs IELTS levels and Ahpra's IELTS Academic minimums for doctors (7 overall, 7 L/R/S, 6.5 W). The AI mock test is labelled coming soon |
| chii chii oral | `/exams/cchi-oral-exam` | As above |

Also in this pass:
- **Coming-soon copy (D-043):** body text in 7 blog posts and 8 migration guides no longer implies that IELTS, OET, AMC, OSCE, CPI, CMI/CHI, telephone, NDIS or legal practice is open. Each now points to NAATI CCL or the free emergency department course. Coming-soon exam pages get an automatic "Can I practise for the X on XINGO?" FAQ that says "Not yet". The NDIS and legal topic FAQs were fixed the same way.
- Shared CCL facts live in `lib/naati-ccl.ts` (fee, segment length, review threshold, validity, language list, `NAATI_CCL_CHECKED`).

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
