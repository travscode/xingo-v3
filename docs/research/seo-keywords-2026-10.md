# SEO keyword research — October 2026

Researched 3 October 2026 for www.xingo.ai. Feeds the blog (`lib/blog/posts`, currently empty) and landing-page work. Writing rules from `docs/seo.md` still apply: Australian English, no invented numbers, hedge exam rules and link the official source.

## Method

- Ran web searches (US-based search index, so Australian rankings are approximate) for each exam/area in the brief, and fetched official pages where they would load (NAATI, OET, AMC, IELTS/British Council, NBCMI, CCHI). Some official pages (Home Affairs points table, NMBA OSCE pages, CCHI CHI page) returned 403/404 to the fetcher; for those, facts come from search snippets of the official domain and are marked **to re-check**.
- **There is no search-volume data here.** Volume and competition are qualitative estimates (high / medium / low), based on how many dedicated competitor pages rank, whether the official body ranks first, and how commercial the SERP looks. Treat them as directional only.
- "People Also Ask" (PAA) questions were not directly visible in the tool output. The questions listed below were collected from FAQ-style headings and repeated questions across ranking pages (e.g. cclhub FAQ, a2znaati results page, OET's "ten common questions"). Treat them as likely PAA, not confirmed PAA.
- Competitor domains listed are what actually appeared in results.

## Key takeaways

1. **NAATI CCL is crowded but formulaic.** Top results are dominated by naati.com.au plus a cluster of coaching/practice sites (cclhub.com.au, a2znaati.com, ccl.lingo-copilot.com, practicenaati.com.au, naaticcl.com, learnwithhafiz.com, passccl.com.au, naclprep.com, naatininja.com, per-language sites like nepalinaati.com and sinhalanaati.com) and migration agents (desiremigration.com.au, oneaustraliagroup.com, scoresmart.au). Several already market "AI scoring" (lingo-copilot, a2znaati, naclprep). XINGO's angle is a live voice role-play rather than recorded audio — content should show that, not claim "first AI".
2. **Accuracy is a real differentiator.** Competitor pages contradict each other and NAATI (e.g. "Microsoft Teams", "20 minutes total", pass rates from 15% to 90%). Pages that quote NAATI exactly and link the source can earn trust and links.
3. **Per-language CCL pages are the long tail.** "[language] NAATI CCL practice / vocabulary / dialogues / sample" is served mostly by cclhub and a2znaati, often thin. Our existing `/naati/ccl/[language]` pages are the right target; vocabulary is the most obvious sub-intent we don't cover.
4. **OET and IELTS speaking are high-volume but saturated** (oet.com, ielts.org, British Council, IDP, plus gradding, e2language-style coaching sites and many AI IELTS tools). Go long-tail: specific role-play types, criteria explainers, "practise out loud" angles.
5. **Interpreter-professional topics (CPI, CI, medical/NDIS/telephone/legal interpreting, CMI/CHI) are low-volume, low-competition** and fit XINGO's product well. NAATI Learn is the main free resource; few commercial pages target "practice" intent.
6. **AMC clinical and NMBA OSCE** are niche but high-intent; results are mostly course providers (passgp.au/PassAMC, mostlymedicine.com, medexamexpert.com, ihm.edu.au, key2learning.edu.au, gdaynurse.com.au). Role-play practice for communication stations is an under-served angle.

## Keyword clusters

Competition and intent are estimates. Priority: P1 = do first, P2 = next quarter, P3 = opportunistic.

| Cluster | Example queries | Intent | Competition (est.) | Target XINGO page | Priority |
|---|---|---|---|---|---|
| CCL hub / what is CCL | naati ccl, ccl test, naati ccl test, what is ccl test | Informational / navigational | High (naati.com.au ranks #1) | `/naati/ccl` | P1 |
| CCL practice test | ccl practice test, naati ccl practice test, ccl mock test online, free ccl practice test | Commercial | High | `/naati/ccl` + proposed `/naati/ccl/practice-test` | P1 |
| CCL per language | punjabi ccl practice, hindi naati ccl, nepali naati ccl dialogues, mandarin ccl practice, urdu/bangla/vietnamese/arabic/tamil/sinhala ccl practice | Commercial | Medium (cclhub, a2znaati, practicenaati, lingo-copilot, YouTube playlists) | `/naati/ccl/[language]` (21 langs) | P1 |
| CCL format & marking | ccl test format, ccl marking criteria, ccl pass mark, ccl score 63, how is ccl marked | Informational | Medium–high | `/blog/naati-ccl-test-format-and-marking` | P1 |
| CCL 5 points PR | ccl 5 points pr, naati ccl points australia, credentialed community language points, ccl for 189 190 491 | Informational | Medium (migration agents) | `/blog/naati-ccl-5-points-australian-pr` | P1 |
| CCL vocabulary | naati ccl vocabulary list, ccl health vocabulary, [language] ccl vocabulary pdf | Informational / commercial | Medium (cclhub per-language posts, Scribd/CourseHero PDFs) | Proposed `/naati/ccl/vocabulary` + per-language sections on `/naati/ccl/[language]` | P1 |
| CCL dialogues / topics | ccl dialogues, ccl practice dialogues with answers, ccl topics, ccl domains | Commercial | Medium | `/blog/naati-ccl-topics-domains` → `/naati/ccl` | P1 |
| CCL results & validity | ccl results how long, ccl result time, ccl validity, ccl review | Informational | Low–medium | `/blog/naati-ccl-results-review-validity` | P2 |
| CCL booking & fee | ccl test fee, ccl booking, ccl test dates, ccl online test requirements | Informational / navigational | Medium (NAATI dominates) | `/blog/naati-ccl-online-test-day-checklist` | P2 |
| CCL repeats / note-taking / tips | ccl repeat penalty, ccl note taking, ccl tips, ccl last minute tips, how to pass ccl first attempt | Informational | Medium (many thin "tips" posts) | `/blog/naati-ccl-repeats-and-self-correction`, `/blog/naati-ccl-note-taking` | P1 |
| CCL difficulty / pass rate | is ccl hard, ccl pass rate | Informational | Low–medium, poor-quality answers | Fold into format article; do not quote a pass rate (no reliable source found) | P3 |
| NAATI CPI | naati cpi test, cpi test preparation, cpi practice dialogues, cpi test format | Informational / commercial | Low (NAATI + a few colleges) | `/naati/cpi`, `/blog/naati-cpi-test-format-and-preparation` | P1 |
| NAATI CI | naati certified interpreter test, ci test sight translation | Informational | Low | `/blog/naati-cpi-vs-ci` → `/naati/cpi` | P3 |
| Diploma of Interpreting | diploma of interpreting online, psp50922, diploma of interpreting practice | Informational / commercial (colleges) | Medium (RMIT, TAFE SA, colleges) | `/interpreting/diploma-of-interpreting-practice` | P2 |
| OET speaking role-play | oet speaking role play nursing, oet speaking sample role play, oet speaking cards nursing, oet speaking medicine role play | Commercial / informational | High (oet.com, gradding, edubenchmark, YouTube) | `/exams/oet-speaking` + blog | P2 |
| OET speaking criteria | oet speaking criteria, oet clinical communication criteria, oet speaking band b 350 | Informational | Medium | `/blog/oet-speaking-criteria-explained` | P2 |
| IELTS speaking | ielts speaking practice, ielts speaking mock test online, ai ielts speaking practice, ielts speaking part 2 cue cards | Commercial | Very high (ielts.org, BC, IDP, ieltsliz, many AI tools: smalltalk2me, oneielts, prepask, ieltsnext) | `/exams/ielts-speaking` + one long-tail blog | P3 |
| AMC clinical | amc clinical exam format, amc clinical communication stations, amc clinical practice partner, amc clinical recalls | Informational / commercial | Medium (course providers) | `/exams/amc-clinical-exam` + blog | P2 |
| NMBA OSCE / OBA | nmba osce, oba osce stations, osce for overseas nurses australia, isbar handover osce | Informational / commercial | Medium (nursing colleges) | `/exams/nmba-osce` + ISBAR blog | P2 |
| CMI vs CHI | cmi vs chi, nbcmi oral exam, cchi oral exam practice, medical interpreter certification oral exam | Informational (US) | Low–medium (interpremed, masterword, interpretertrain) | `/exams/cmi-oral-exam`, `/exams/cchi-oral-exam`, `/blog/cmi-vs-chi-oral-exam` | P2 |
| Medical interpreting practice | medical interpreting practice, medical interpreter practice scenarios, medical interpreting role play | Commercial | Low–medium | `/interpreting/medical-interpreting-practice` | P2 |
| NDIS interpreting | ndis interpreting, interpreting in ndis settings, ndis terminology interpreter | Informational | Low (NAATI Learn, NEDA, CEH) | `/interpreting/ndis-interpreting` | P3 |
| Telephone interpreting | telephone interpreting tips, phone interpreting tips for interpreters, remote interpreting practice | Informational | Low (results skew to *client* guidance from TIS National) | `/interpreting/telephone-interpreting-practice` + blog | P2 |
| Legal interpreting | legal interpreting practice, court interpreting practice australia | Informational | Low | `/interpreting/legal-interpreting-practice` | P3 |
| AI interpreting practice | ai interpreting practice, interpreter practice partner, ai interpreter training | Commercial | Low–medium (InterpreterPro, Sight-Terp, interpreting.com) | `/for-interpreters` (existing) + `/naati/cpi` | P2 |
| Pricing / brand | xingo, xingo pricing, ccl practice cost | Navigational / commercial | Low | `/pricing` | P2 |

## Likely "People Also Ask" questions

Collected from FAQ headings and repeated questions on ranking pages (not confirmed PAA boxes).

**NAATI CCL**
- What is the pass mark for NAATI CCL? (63/90, minimum 29 per dialogue)
- How many dialogues are in the CCL test? How long is each?
- How is the CCL test marked? / What is the CCL marking criteria?
- How many repeats are allowed in CCL? Is there a penalty?
- Can I take notes in the CCL test?
- How long does it take to get CCL results?
- How much does the CCL test cost?
- How long is the CCL credential valid?
- How many points does CCL give for PR? Which visas?
- Is the CCL test hard? What is the CCL pass rate?
- Is the CCL test online? What do I need for the online test?
- What topics come up in CCL? Health, legal, immigration…
- How do I prepare for CCL in [language]? Where can I find practice dialogues?
- Can I get my CCL test reviewed?

**NAATI CPI / interpreting**
- What is the difference between CCL and CPI?
- What tasks are in the CPI test? Is there sight translation?
- Do I need a Diploma of Interpreting to sit CPI?
- How do I practise dialogue interpreting on my own?

**OET**
- How long is the OET speaking test? How many role-plays?
- What are the OET speaking criteria?
- What score do nurses/doctors need for registration (B / 350)?
- How do I start an OET role-play?

**IELTS**
- How long is IELTS speaking? What happens in Part 2?
- How long do I speak for in Part 2?
- Can I practise IELTS speaking with AI?

**AMC / NMBA OSCE**
- How many stations are in the AMC clinical exam? What is the pass mark?
- Can I sit the AMC clinical online?
- How many stations are in the NMBA OSCE? Where is it held?
- What is ISBAR and how is it used in OSCE handover?

**CMI / CHI**
- Which is better, CMI or CHI?
- What is in the oral exam? Is there simultaneous interpreting?

## Competitor notes

| Domain | What ranks | Notes |
|---|---|---|
| naati.com.au / learn.naati.com.au | CCL hub, candidate instructions, free practice test, downloadable practice materials, CPI/CI pages, NAATI Learn prep modules | Ranks first for almost every head term. Free official practice materials (one-dialogue practice test; downloadable old tests with PDF + MP3; paid assessed practice test via myNAATI). We should link to these, not compete with them. |
| cclhub.com.au | Format, marking, per-language "test samples", per-language vocabulary posts, FAQ, "predicted questions" posts | Biggest content footprint on CCL long tail. Lots of per-language vocabulary posts (Telugu, Sinhala, Filipino, Nepali, health list). |
| a2znaati.com | Per-language pages, results-time guide, "2,500+ dialogues", AI mock tests | Direct competitor on AI practice. |
| ccl.lingo-copilot.com | Test format guide, test-day walkthrough, per-language AI practice | Direct AI competitor; well-structured blog. |
| practicenaati.com.au, naaticcl.com, naclprep.com, naatininja.com, learniiz.com | Per-language practice, results guides, free dialogues | Practice platforms; mostly recorded audio. |
| learnwithhafiz.com, passccl.com.au, nepalinaati.com, nepalinaaticcl.com.au, sinhalanaati.com | Marking criteria, tips, examiner perspective, single-language coaching | Coach-led content; tips articles rank for "ccl tips". |
| desiremigration.com.au, oneaustraliagroup.com, scoresmart.au, qualitymigration.com, mystportal.com, iesportal.com | "CCL 5 points PR", format explainers | Migration agents own the PR-points intent. |
| YouTube | Per-language "NAATI CCL [language] practice dialogue N" playlists (e.g. Hindi series) | Video results show for per-language practice queries; consider short demo clips later. |
| Scribd / CourseHero | Vocabulary PDFs and old practice scripts | Signals demand for downloadable vocab lists. |
| oet.com | Criteria overview, preparation-time post, "how to start the role play", ten common questions | Official and strong. |
| gradding.com, edubenchmark.com, talkdrill.com, speakshark.com, hzadeducation.com, oet-bank.com | OET speaking cards, sample role-plays, criteria | Saturated; many sample role-play scripts. |
| ielts.org, takeielts.britishcouncil.org, ielts.idp.com, ieltsliz.com | Format, practice tests, topics | Official/near-official dominate head terms. |
| smalltalk2.me, oneielts.com, prepask.com, testandscore.com, ieltsnext.com, speechful.ai, cue-card banks (cathoven, ielts9.io, allthingsielts, alfaielts) | AI IELTS speaking mocks; cue-card lists | Very crowded AI IELTS market. |
| amc.org.au; passgp.au (PassAMC), mostlymedicine.com, medexamexpert.com, learnmedicine.com.au, academically.com | AMC clinical format; recall banks; workshops | Communication/role-play stations are a recurring theme. |
| nursingmidwiferyboard.gov.au, ahpra.gov.au; ihm.edu.au, key2learning.edu.au, gdaynurse.com.au, nursetrainer.org, nursingeta.com | OBA/OSCE pathway, OSCE prep courses | Course providers; little "practise the conversation" content. |
| certifiedmedicalinterpreters.org, cchicertification.org; interpremed.com, masterword.institute, interpretertrain.com, gotranscript.com | CMI vs CHI comparisons, oral exam study tips | Low competition; interpremed has relevant "how to practise for the oral exams" post. |
| interpretrain.com / interpreterpro.ai, sightterp.com, interpreting.com | AI practice tools for interpreters | Direct competitors for "AI interpreting practice". |

## Verified facts (for articles)

Quote these and link the source. Re-check before publishing — fees and rules change.

### NAATI CCL
Source: [NAATI — CCL test](https://www.naati.com.au/migration-assessments/ccl/), [NAATI — CCL candidate instructions](https://www.naati.com.au/resources/candidate-instructions-ccl/)

- **Two dialogues**, each **approximately 300 words**, about half in English and half in the other language. (The brief's "300–350" is not NAATI's wording — use "about 300".)
- Dialogues are split into **segments of 35 words or less**.
- Each dialogue is marked **out of 45 (90 total)**. NAATI uses **mark deduction** — you start from full marks and lose marks for errors, weighted by impact on communication.
- **Pass: 63 or more out of 90, and at least 29 in each dialogue.**
- NAATI pays particular attention to language quality, register and excessive repeats.
- **Repeats:** one repeated segment per dialogue without penalty; more than one attracts deductions. You **may self-correct** ("Sorry, I'll just say that part again"), but repeated corrections can be penalised.
- **Start interpreting within 5 seconds of the chime.** Long pauses can lose marks, especially if the recording runs past 20 minutes.
- **Notes:** pen and loose sheets of paper allowed; no existing notes, dictionaries, electronic resources or typing.
- **Delivery:** online only, on NAATI's test platform (Televic) with **ProctorExam** online proctoring; Google Chrome with the ProctorExam extension; laptop/computer with built-in mic and speakers (**no headsets**), phone/tablet as a second camera; minimum 10 Mbps down / 1.5 Mbps up; test is audio and video recorded. **Not Microsoft Teams** — the brief's Teams reference appears to be wrong (one third-party page mentions Teams; NAATI does not). NAATI has also announced in-person options in some overseas cities (e.g. [Manila](https://www.naati.com.au/news/in-person-testing-option-in-manila-philippines/), [Sharjah/Dubai](https://www.naati.com.au/news/in-person-testing-option-in-sharjah-uae/)) — re-check before mentioning.
- **Fee: A$814.** Results review: **A$187**.
- **Results within 4–6 weeks** by email; issued individually, so people on the same date may get results on different days.
- **Validity:** credentials issued from **9 August 2022 are valid for five years** (earlier ones three years).
- **Domains (12):** business, consumer affairs, employment, health, immigration/settlement, legal, community, education, financial, housing, insurance, social services.
- **Booking:** apply via myNAATI (application processed generally within a week), then choose a date and pay; bookings close 1 week before the test; high-demand languages monthly, low-demand at least 4 times a year. Source: [NAATI — Find a test date](https://www.naati.com.au/test-date/).
- **Free official practice:** [NAATI CCL practice test](https://www.naati.com.au/ccl-practice-test/) (free, one dialogue, no proctoring); [downloadable CCL practice materials by language](https://www.naati.com.au/migration-assessments/ccl/downloadable-ccl-practice-materials-by-language/) (old tests, PDF + MP3); a paid assessed practice test with examiner feedback via myNAATI ([NAATI news](https://www.naati.com.au/news/paid-practice-tests/)).
- NAATI tells candidates to confirm points eligibility with Home Affairs or a migration agent.

### CCL and Australian PR points — **to re-check**
- The Home Affairs points test awards **5 points for credentialled community language** (NAATI CCL, or NAATI certification at Certified Provisional level or above). Confirmed via Home Affairs documents in search ([Schedule 6D points test, FOI release](https://www.homeaffairs.gov.au/foi/files/2020/fa-200601127-document-released.pdf)); the live points table page ([subclass 189 points table](https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189/points-table)) blocked our fetcher. Commonly cited as applying to 189, 190 and 491 points-tested visas — confirm on immi.homeaffairs.gov.au before publishing.
- Home Affairs ran a points-test review (2024 discussion paper submissions mention CCL), so **hedge** ("at the time of writing") and re-check.
- Passing is pass/fail for points: 63 and 90 earn the same points.

### NAATI CPI
Source: [NAATI — Certified Provisional Interpreter](https://www.naati.com.au/certification/cpi/), [CPI candidate instructions](https://www.naati.com.au/resources/candidate-instructions-cpi/)
- **Three tasks**, each a **live role-play of 10–12 minutes** with two role-players (English and LOTE): **two face-to-face consecutive dialogues and one remote consecutive dialogue**, each in a different domain.
- Online or in person at a NAATI venue.
- Prerequisites: an eligibility pathway (e.g. NAATI-endorsed qualification such as the Diploma of Interpreting within 3 years) plus **ethical and intercultural competency** (screening tests may be required).
- Assessed on transfer competency (meaning transfer, application of mode, interactional management, delivery) and language competency. Pass needs at least Band 2 in meaning transfer, delivery and language proficiency; Band 3 allowed in either application of mode or interactional management, not both.
- **Fee A$660**; supplementary test A$220; results review A$275. 71 languages.
- Free official prep: [NAATI Learn CPI preparation module](https://learn.naati.com.au/course/view.php?id=337) with practice dialogues in 46+ languages and a recorder ([NAATI news](https://www.naati.com.au/news/test-preparation-modules-ct-ci-cpi/)).

### NAATI CI
Source: [NAATI — Certified Interpreter](https://www.naati.com.au/certification/ci/)
- Online only; **six tasks**: two sight translations (~200 words each, one each direction), two consecutive monologues (~300 words), two simultaneous monologues (~300 words); at least one health and one legal domain. Must pass all six tasks, Band 2 or better on each criterion.

### Diploma of Interpreting
- PSP50922 Diploma of Interpreting is NAATI-endorsed; graduates are eligible to sit CPI. Delivered by RMIT, TAFE SA (live online, part-time over 12 months), colleges and others. Sources: [RMIT](https://www.rmit.edu.au/study-with-us/levels-of-study/vocational-study/diplomas/diploma-of-interpreting-spoken-language-c5427), [NAATI news — TAFE SA](https://www.naati.com.au/news/diploma-of-interpreting-at-tafesa-live-online-apply-now-for-2024/).

### OET Speaking
Sources: [OET — speaking criteria overview](https://oet.com/en-us/post/speaking-criteria-overview), [OET — three preparation minutes](https://oet.com/post/did-you-know-the-oet-speaking-test-gives-you-three-preparation-minutes), [OET — ten common speaking questions](https://oet.com/en-us/post/10-common-speaking-questions), [OET Speaking guide (linguistic) PDF](https://cdn-aus.aglty.io/oet/pdf-files/OET%20Speaking%20Guide%20Part%201%20Linguistics.pdf)
- Unassessed warm-up, then **two role-plays of about five minutes each**, **three minutes' preparation** per role card. Candidate plays their profession; interlocutor plays patient/relative/carer.
- **Linguistic criteria (4):** intelligibility, fluency, appropriateness of language, resources of grammar and expression — scored 0–6.
- **Clinical communication criteria (5):** relationship building; understanding and incorporating the patient's perspective; providing structure; information gathering; information giving — scored 0–3.
- Recorded and rated by at least two assessors. The 0–6 / 0–3 scales come from OET material quoted by third parties; confirm in OET's assessment criteria PDF before quoting. Grade B = 350 is the common regulator requirement — confirm with AHPRA/board requirements before stating.

### IELTS Speaking
Sources: [IELTS — Academic speaking format](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-speaking), [British Council — speaking test format](https://takeielts.britishcouncil.org/what-is-ielts/how-it-works/test-format/speaking)
- **11–14 minutes, three parts.** Part 1: 4–5 min interview on familiar topics. Part 2: task card, **1 minute to prepare** (paper and pencil provided), speak for **up to 2 minutes**, then one or two follow-up questions; 3–4 min total. Part 3: 4–5 min discussion linked to Part 2.
- Cue-card "topic lists" for 2026 published by third parties are reported/recalled, not official — don't present them as real exam questions.

### AMC clinical examination
Source: [AMC — Clinical examination](https://www.amc.org.au/pathways/standard-pathway/amc-assessments/clinical-examination/), [Clinical Exam Specifications PDF](https://www.amc.org.au/wp-content/uploads/2025/10/2025-10-21-Clinical-Exam-Spec-V8-3-1.pdf)
- **16 assessed stations plus 4 rest stations**; each station **10 minutes = 2 minutes reading + 8 minutes assessment**.
- Areas: history taking, examination, diagnostic formulation, management/counselling/education; across medicine, surgery, women's health, paediatrics and mental health.
- Result based on **14 scored stations** (2 pilot); **pass = pass score in 9 or more of 14**.
- In person (National Test Centre) or online. Fees shown at time of fetch: A$3,000 in person, A$3,400 online — re-check.
- Third-party claim that communication/counselling stations are ~15–25% of the circuit is **unverified**; don't quote.

### NMBA OSCE (internationally qualified nurses) — **partly unverified**
Sources: [NMBA — OSCE](https://www.nursingmidwiferyboard.gov.au/Accreditation/IQNM/Examination/Objective-structured-clinical-exam.aspx), [NMBA — Information for registered nurses](https://www.nursingmidwiferyboard.gov.au/accreditation/iqnm/examination/registered-nurses.aspx), [AHPRA — second exam location](https://www.ahpra.gov.au/News/2023-11-20-Second-location-selected-for-examination-of-internationally-qualified-nurses-and-midwives.aspx)
- Outcomes-based assessment (since March 2020) for IQNMs whose qualification is relevant but not substantially equivalent: stage 1 MCQ, stage 2 OSCE. Stream B candidates must pass the OSCE before applying for registration. (Official, via search snippets.)
- Delivered at **Adelaide Health Simulation (SA)** and **RANZCOG (Melbourne)**; RN OSCEs held monthly at one of the locations. (Official, via search snippets.)
- **Station count and timing (often stated as 10 stations × 10 minutes, 2 min reading + 8 min performance)** came only from third-party course sites. NMBA pages blocked our fetcher. **Do not publish station numbers until checked against the NMBA OSCE orientation guide.**
- ISBAR: no official NMBA source found in this pass stating ISBAR is assessed. Write about ISBAR as a widely used Australian clinical handover tool and hedge its role in the OSCE.

### NBCMI CMI
Source: [NBCMI](https://www.certifiedmedicalinterpreters.org/), [NBCMI candidate handbook (Feb 2026)](https://www.certifiedmedicalinterpreters.org/assets/docs/NBCMI_Handbook.pdf?v=20250520), [Oral exam — at a site](https://www.certifiedmedicalinterpreters.org/testing-at-a-site-oral), [Oral exam from home](https://www.certifiedmedicalinterpreters.org/testing-from-home)
- Written exam (English, multiple choice) then oral exam. Full CMI in **six languages: Spanish, Mandarin, Cantonese, Russian, Vietnamese, Korean**.
- Oral exam: consecutive interpreting and sight translation (no simultaneous). Third-party sources describe ~45–60 minutes, 12 mini-scenarios plus 2 sight translations — **confirm against the handbook**. Can be taken at a test site or from home (online proctoring).
- Oral pass marks by language reported in search results (70% most languages; 80% Mandarin; 65% Vietnamese) — **confirm in handbook before quoting**.

### CCHI CHI
Source: [CCHI — CHI exam description](https://cchicertification.org/certifications/preparing/chi-description/), [CCHI candidate handbook PDF](https://cchicertification.org/uploads/CCHI_Candidate_Examination_Handbook.pdf)
- CHI performance (oral) exam (prerequisite CoreCHI written exam). Per CCHI's description page (via search snippet): **8 items** — interpret consecutively (75%), simultaneously (14%), sight translate (9%), translate healthcare documents (2%).
- Consecutive: 4 bidirectional dialogues, 14–24 utterances each, utterances up to 35 words, each utterance can be played up to twice. Simultaneous: 2 unidirectional passages up to 2 minutes (180–220 words), played once. Sight translation: 3 short English healthcare documents (up to ~45 words). **Re-check against the current handbook** — third-party pages give slightly different percentages.
- CHI is offered in a limited set of languages (historically Spanish, Arabic, Mandarin) — confirm.

### Not verified / do not use
- **CCL pass rates.** Sources range from ~15% to ~90% with no NAATI citation. Don't publish a figure.
- **"Predicted"/"recent" CCL questions.** Commercial sites claim them; NAATI tests are confidential. Avoid.
- **CCL on Microsoft Teams.** Not supported by NAATI pages; NAATI uses ProctorExam.

## Proposed blog articles (prioritised)

All slugs under `/blog/<slug>`. Category values match `BlogCategory` in `lib/blog/types.ts`.

| # | Priority | Slug | Category | Primary keyword | Secondary keywords | CTA page |
|---|---|---|---|---|---|---|
| 1 | P1 | `naati-ccl-test-format-and-marking` | NAATI CCL | naati ccl test format | ccl marking criteria, ccl pass mark 63, ccl 29 per dialogue, how is ccl marked, ccl segments 35 words | `/naati/ccl` |
| 2 | P1 | `naati-ccl-5-points-australian-pr` | NAATI CCL | ccl 5 points pr | naati ccl points, credentialed community language points, ccl 189 190 491, does ccl expire | `/naati/ccl` |
| 3 | P1 | `naati-ccl-repeats-and-self-correction` | NAATI CCL | ccl repeat penalty | ccl how many repeats, ccl clarification, ccl self correction, ccl 5 second rule | `/naati/ccl` |
| 4 | P1 | `naati-ccl-note-taking` | NAATI CCL | ccl note taking | naati note taking symbols, ccl notes tips, consecutive interpreting note taking | `/naati/ccl` |
| 5 | P1 | `naati-ccl-topics-domains` | NAATI CCL | ccl topics | ccl domains list, ccl health dialogue, ccl legal dialogue, ccl practice dialogues by topic | `/naati/ccl` |
| 6 | P1 | `naati-ccl-free-practice-resources` | NAATI CCL | free ccl practice test | naati practice test, ccl practice materials pdf mp3, naati learn ccl, ccl mock test online | `/naati/ccl` (hub linking official + XINGO) |
| 7 | P1 | `naati-cpi-test-format-and-preparation` | NAATI CPI | naati cpi test | cpi test preparation, cpi practice dialogues, cpi role-play, cpi remote task, cpi vs ccl | `/naati/cpi` |
| 8 | P2 | `naati-ccl-online-test-day-checklist` | NAATI CCL | ccl online test requirements | ccl test fee, ccl booking, proctorexam ccl, ccl test day, ccl second camera | `/naati/ccl` |
| 9 | P2 | `naati-ccl-results-review-validity` | NAATI CCL | ccl results how long | ccl result time, ccl review fee, ccl validity 5 years, failed ccl what next | `/naati/ccl` |
| 10 | P2 | `oet-speaking-criteria-explained` | OET | oet speaking criteria | oet clinical communication criteria, oet linguistic criteria, oet speaking role play nursing, oet speaking sample | `/exams/oet-speaking` |
| 11 | P2 | `amc-clinical-exam-communication-stations` | AMC | amc clinical communication stations | amc clinical exam format, amc clinical 9 of 14, amc counselling station, amc clinical practice partner | `/exams/amc-clinical-exam` |
| 12 | P2 | `isbar-handover-nursing-osce` | Nursing OSCE | isbar handover example | nmba osce, oba osce stations, isbar nursing australia, osce communication | `/exams/nmba-osce` |
| 13 | P2 | `cmi-vs-chi-oral-exam` | Medical interpreting | cmi vs chi | nbcmi oral exam, cchi chi performance exam, medical interpreter oral exam practice, sight translation practice | `/exams/cmi-oral-exam` (+ link `/exams/cchi-oral-exam`) |
| 14 | P2 | `telephone-interpreting-tips` | Interpreting skills | telephone interpreting tips | phone interpreting for interpreters, remote interpreting practice, first-person interpreting on the phone, cpi remote task | `/interpreting/telephone-interpreting-practice` |
| 15 | P3 | `ielts-speaking-part-2-how-to-practise-out-loud` | IELTS | ielts speaking part 2 practice | ielts cue card practice, ielts speaking mock test online, 1 minute preparation part 2, ai ielts speaking practice | `/exams/ielts-speaking` |

Notes:
- Articles 1–6 interlink and all point at `/naati/ccl` and the language pages; each per-language page should link articles 1, 3, 4, 5.
- Article 6 should send people to NAATI's free materials honestly, then explain what XINGO adds (live two-sided role-play, feedback) without claiming official status.
- Avoid "predicted questions" / "real exam questions" framing anywhere.

## Proposed new landing pages (conservative)

Only where search intent is clearly distinct from existing pages and we can offer something real (not thin rewrites per keyword).

1. **`/naati/ccl/vocabulary`** — P1. Hub for "naati ccl vocabulary list" / "ccl health vocabulary". Organised by NAATI's 12 domains with English terms and short usage notes; links to each `/naati/ccl/[language]` page, where a language-specific vocabulary section can live (rather than 21 new vocabulary pages, which would risk doorway patterns). Only build if we can supply genuine, reviewed term lists.
2. **`/naati/ccl/practice-test`** — P1. Targets "ccl practice test / ccl mock test online". A real full mock (two dialogues, segment timing, one free repeat, score out of 90 using `lib/scoring.ts`) the user can start. Must be clearly unofficial and link NAATI's free practice test. Skip if it would just duplicate `/naati/ccl`.
3. **`/blog` index with category filters** — P2 (already routed via `app/(marketing)/blog/[slug]`; ensure an index exists) so articles have a crawlable home.

Not recommended now: per-language vocabulary pages, CCL "predicted questions" pages, separate IELTS cue-card pages (saturated, low fit).

## Sources

Official
- https://www.naati.com.au/migration-assessments/ccl/
- https://www.naati.com.au/resources/candidate-instructions-ccl/
- https://www.naati.com.au/ccl-practice-test/
- https://www.naati.com.au/migration-assessments/ccl/downloadable-ccl-practice-materials-by-language/
- https://www.naati.com.au/news/paid-practice-tests/
- https://www.naati.com.au/test-date/
- https://www.naati.com.au/news/in-person-testing-option-in-manila-philippines/
- https://www.naati.com.au/news/in-person-testing-option-in-sharjah-uae/
- https://www.naati.com.au/certification/cpi/
- https://www.naati.com.au/resources/candidate-instructions-cpi/
- https://www.naati.com.au/certification/ci/
- https://www.naati.com.au/news/test-preparation-modules-ct-ci-cpi/
- https://learn.naati.com.au/course/view.php?id=337
- https://www.naati.com.au/news/free-interpreting-ndis-training/
- https://www.naati.com.au/news/diploma-of-interpreting-at-tafesa-live-online-apply-now-for-2024/
- https://www.homeaffairs.gov.au/foi/files/2020/fa-200601127-document-released.pdf
- https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189/points-table (blocked; re-check manually)
- https://oet.com/en-us/post/speaking-criteria-overview
- https://oet.com/post/did-you-know-the-oet-speaking-test-gives-you-three-preparation-minutes
- https://oet.com/en-us/post/10-common-speaking-questions
- https://cdn-aus.aglty.io/oet/pdf-files/OET%20Speaking%20Guide%20Part%201%20Linguistics.pdf
- https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-speaking
- https://takeielts.britishcouncil.org/what-is-ielts/how-it-works/test-format/speaking
- https://www.amc.org.au/pathways/standard-pathway/amc-assessments/clinical-examination/
- https://www.amc.org.au/wp-content/uploads/2025/10/2025-10-21-Clinical-Exam-Spec-V8-3-1.pdf
- https://www.nursingmidwiferyboard.gov.au/Accreditation/IQNM/Examination/Objective-structured-clinical-exam.aspx (blocked; snippets only)
- https://www.nursingmidwiferyboard.gov.au/accreditation/iqnm/examination/registered-nurses.aspx (blocked; snippets only)
- https://www.ahpra.gov.au/News/2023-11-20-Second-location-selected-for-examination-of-internationally-qualified-nurses-and-midwives.aspx
- https://www.certifiedmedicalinterpreters.org/
- https://www.certifiedmedicalinterpreters.org/assets/docs/NBCMI_Handbook.pdf?v=20250520
- https://www.certifiedmedicalinterpreters.org/testing-at-a-site-oral
- https://www.certifiedmedicalinterpreters.org/testing-from-home
- https://cchicertification.org/certifications/preparing/chi-description/
- https://cchicertification.org/uploads/CCHI_Candidate_Examination_Handbook.pdf
- https://www.tisnational.gov.au/en/Our-services/Language-services/Phone-interpreting
- https://www.rmit.edu.au/study-with-us/levels-of-study/vocational-study/diplomas/diploma-of-interpreting-spoken-language-c5427

Competitor / SERP observation
- https://cclhub.com.au/naati-ccl-test-pattern-and-marking-breakdown/
- https://cclhub.com.au/naati-ccl-vocabulary-list-health-medical/
- https://cclhub.com.au/naati-ccl-test-sample/
- https://cclhub.com.au/faq/
- https://a2znaati.com/naati-ccl-result-time
- https://a2znaati.com/language/punjabi
- https://ccl.lingo-copilot.com/blog/naati-ccl-test-format-guide
- https://ccl.lingo-copilot.com/blog/naati-ccl-test-day
- https://practicenaati.com.au/language/punjabi
- https://naaticcl.com/guide/naati-ccl-results-time-and-validity/
- https://www.naclprep.com/
- https://naatininja.com/
- https://learnwithhafiz.com/naati-ccl-marking-criteria/
- https://passccl.com.au/learn/naati-ccl-examiner
- https://www.nepalinaati.com/free-tips/
- https://www.desiremigration.com.au/blog/how-naati-ccl-adds-5-extra-points-to-your-australian-pr-application
- https://www.scoresmart.au/blog/naati-ccl-free-5-points-australia-pr
- https://www.youtube.com/playlist?list=PLeKCCZlGpu0RbXMCBKePMzX6Xz8cxSnzs
- https://www.gradding.com/blog/oet/oet-speaking-cards-for-nurses
- https://www.talkdrill.com/blog/oet-speaking-nurses-guide/
- https://smalltalk2.me/ielts
- https://oneielts.com/
- https://www.prepask.com/ielts/speaking
- https://resources.cathoven.com/ielts-speaking/cue-card-bank
- https://www.passgp.au/passamc-clinical-exam-bank
- https://www.mostlymedicine.com/amc-clinical-exam-preparation
- https://ihm.edu.au/courses/osce-for-rns/
- https://gdaynurse.com.au/blog/osce-exam-preparation-australia-2026-complete-guide
- https://interpremed.com/blog-post/how-to-practice-for-the-nbcmi-and-cchi-oral-exams/
- https://masterword.institute/medical-interpreter-certification-which-should-i-choose/
- https://app.interpreterpro.ai/
- https://sightterp.com/
- https://interpreting.com/For-Interpreters/AI-for-Interpreters.html
