import { CCL_MAX_SCORE } from "../../scoring";
import type { MigrationGuide } from "../types";

export const guide: MigrationGuide = {
  slug: "celpip-for-australian-pr",
  title: "CELPIP for Australian PR: accepted scores and points",
  metaTitle: "CELPIP for Australia: Scores for PR Points",
  description:
    "Is CELPIP accepted for Australian PR? Yes. The CELPIP General scores for Competent, Proficient and Superior English, and what they're worth in the points test.",
  excerpt: "CELPIP General is now accepted for Australian visas. The scores for each English level, and what they add to your points.",
  group: "Language & tests",
  keywords: [
    "celpip australia",
    "celpip australia points test",
    "celpip for australian pr",
    "celpip proficient english australia",
    "celpip superior english australia",
  ],
  published: "2026-10-22",
  updated: "2026-10-22",
  atAGlance: [
    "Home Affairs accepts **CELPIP General** for tests taken on or after **7 August 2025**, at a test centre. CELPIP Online isn't accepted.",
    "Each English level is a minimum CELPIP score in **every** component: 7 in each for Competent English, and higher scores for Proficient and Superior.",
    "In the points test, Proficient English adds **10 points** and Superior adds **20**.",
    "For most visas, the result must be from the **three years** before you apply.",
  ],
  intro: [
    "CELPIP is a Canadian English test, best known for Canadian immigration. Since the list of English tests approved for Australian visas changed on 7 August 2025, Home Affairs also accepts CELPIP General. That makes it an option if you're already in Canada, have sat CELPIP before, or simply prefer its format.",
    "This guide sets out the CELPIP General scores Home Affairs asks for at each English level and what they're worth in the points test. It's general information checked against the official pages in October 2026, not migration advice. Check the [English language requirements page](https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/english-language) and the page for your visa before you book.",
  ],
  sections: [
    {
      heading: "Is CELPIP accepted for Australian visas?",
      blocks: [
        {
          type: "p",
          text: "Yes, with two conditions. First, it must be **CELPIP General** taken on or after 7 August 2025; CELPIP doesn't appear in the Home Affairs tables for tests taken before that date. Second, you must sit it in person. Home Affairs doesn't accept tests delivered completely online, and it names **CELPIP Online** among the at-home tests it won't accept.",
        },
        {
          type: "p",
          text: "CELPIP describes the General test as computer-delivered and taken in one sitting of about three hours, with the speaking section included rather than booked separately. Check [CELPIP's website](https://www.celpip.ca/) for current test centres, dates and fees outside Canada.",
        },
      ],
    },
    {
      heading: "CELPIP scores for each English level",
      blocks: [
        {
          type: "table",
          caption:
            "Minimum CELPIP General score in each component, tests taken on or after 7 August 2025. Source: Home Affairs English level pages, checked October 2026.",
          head: ["English level", "Listening", "Reading", "Writing", "Speaking"],
          rows: [
            ["Competent", "7", "7", "7", "7"],
            ["Proficient", "9", "8", "10", "8"],
            ["Superior", "10", "10", "12", "10"],
          ],
        },
        {
          type: "p",
          text: "Every component has its own minimum, so your weakest skill decides your level. For Proficient English, for example, a 10 in Writing doesn't make up for a 7 in Speaking. Notice too that Writing has the highest minimum at Proficient and Superior. Our [English proficiency tests guide](/migrate-to-australia/english-test-for-australian-pr) compares the minimums for all eight accepted tests.",
        },
      ],
    },
    {
      heading: "What CELPIP is worth in the points test",
      blocks: [
        {
          type: "p",
          text: "The Skilled Independent (189), Skilled Nominated (190) and Skilled Work Regional (491) visas use a points test. At the time of writing, English is worth:",
        },
        {
          type: "ul",
          items: ["**Competent English:** 0 points (the usual minimum)", "**Proficient English:** 10 points", "**Superior English:** 20 points"],
        },
        {
          type: "p",
          text: "A CELPIP result counts exactly like an IELTS or PTE result at the same level. Our [Australian PR points test guide](/migrate-to-australia/skilled-migration-points-test) shows the full table and has a quick estimator.",
        },
        {
          type: "callout",
          title: "Canadian passport holders",
          text: "Home Affairs says citizens holding a valid Canadian passport meet Competent English without a test. To claim Proficient or Superior English for points, you still need a test result.",
        },
      ],
    },
    {
      heading: "CELPIP, IELTS or PTE?",
      blocks: [
        {
          type: "p",
          text: "No accepted test is officially easier; each has its own score table for the same levels. Choose the format you perform best in, and think about logistics:",
        },
        {
          type: "ul",
          items: [
            "**Where you'll sit it.** CELPIP is most widely available in Canada. IELTS and PTE Academic have more test centres in Australia and elsewhere.",
            "**How you speak.** IELTS Speaking is a face-to-face interview; PTE Academic and CELPIP General are computer-delivered.",
            "**Other uses.** If you also need a result for registration in a health profession, check that body's list: Ahpra, for example, doesn't list CELPIP among its accepted tests.",
          ],
        },
        {
          type: "p",
          text: "See [IELTS, PTE or OET?](/migrate-to-australia/ielts-vs-pte-vs-oet) for a closer look at the three most common tests.",
        },
      ],
    },
  ],
  xingo: {
    text: [
      "XINGO doesn't offer CELPIP practice, and our IELTS and OET Speaking practice is coming soon. If you speak a language other than English, you can work on a separate 5-point claim today: practise for the NAATI CCL with CCL-style dialogues in your language pair, scored out of " +
        `${CCL_MAX_SCORE}.`,
      "XINGO is independent and isn't affiliated with CELPIP, NAATI or Home Affairs.",
    ],
    links: [
      { href: "/naati/ccl", label: "NAATI CCL practice", description: `Two-speaker dialogues in your language, scored out of ${CCL_MAX_SCORE}.` },
      { href: "/migrate-to-australia/community-language-points", label: "Community language points", description: "Which NAATI test counts for PR." },
    ],
  },
  faqs: [
    {
      q: "Is CELPIP accepted for Australian PR?",
      a: "Yes. Home Affairs accepts CELPIP General for tests taken on or after 7 August 2025, sat in person. CELPIP Online isn't accepted.",
    },
    {
      q: "What CELPIP score do I need for 10 points in Australia?",
      a: "Proficient English, worth 10 points, needs at least 9 in Listening, 8 in Reading, 10 in Writing and 8 in Speaking. Superior English, worth 20 points, needs 10, 10, 12 and 10.",
    },
    {
      q: "Can I use a CELPIP test I took before August 2025?",
      a: "CELPIP isn't in the Home Affairs tables for tests taken on or before 6 August 2025, so plan on a result from a test taken on or after 7 August 2025.",
    },
    {
      q: "Is CELPIP-General LS accepted?",
      a: "Home Affairs lists CELPIP General with scores for all four components, so you need a result that covers listening, reading, writing and speaking. Check with Home Affairs if you're unsure which version you hold.",
    },
  ],
  sources: [
    { label: "Home Affairs — English language visa requirements", url: "https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/english-language" },
    { label: "Home Affairs — Competent English", url: "https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/english-language/competent-english" },
    { label: "Home Affairs — Proficient English", url: "https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/english-language/proficient-english" },
    { label: "Home Affairs — Superior English", url: "https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/english-language/superior-english" },
    { label: "CELPIP — official website", url: "https://www.celpip.ca/" },
  ],
  related: ["english-test-for-australian-pr", "skilled-migration-points-test", "ielts-vs-pte-vs-oet", "community-language-points"],
  cta: {
    title: "Bilingual? Work on 5 more points",
    body: `Practise for the NAATI CCL in your language with CCL-style dialogues, scored out of ${CCL_MAX_SCORE}. Free practice minutes every month, no card needed.`,
    goal: "naati_ccl",
    buttonLabel: "Try a free CCL dialogue",
  },
};
