import { CCL_DIALOGUE_PASS_SCORE, CCL_MAX_SCORE, CCL_PASS_SCORE } from "../../scoring";
import type { MigrationGuide } from "../types";

export const guide: MigrationGuide = {
  slug: "skilled-migration-points-test",
  title: "Australian PR points test: how the point system works",
  metaTitle: "Australian PR Points Test and Point System Guide",
  description:
    "The Australian PR points test and point system in plain English: the full table for 189, 190 and 491 visas, the 65-point pass mark and a points estimate.",
  excerpt: "The full points table, the pass mark, how invitations work and the 5 points your second language can add.",
  group: "Points & visas",
  keywords: [
    "australian pr points test",
    "pr test australia",
    "points test guide",
    "pr points calculator",
    "pr point system in australia",
    "australia pr point system",
    "points test",
    "points table 189",
    "65 points pr australia",
    "how to increase pr points australia",
  ],
  published: "2026-10-03",
  updated: "2026-10-22",
  tool: "points-estimator",
  atAGlance: [
    "There's no single \"PR test\". Skilled visas 189, 190 and 491 use a **points test**: you add up points for age, English, work, study and other factors.",
    "You need at least **65 points** to be invited, but reaching 65 doesn't guarantee an invitation.",
    "English can add up to **20 points**, and a credentialled community language, usually a pass in the **NAATI CCL test**, adds **5**.",
    "Nomination adds 5 points for a 190 visa and 15 for a 491 visa.",
  ],
  intro: [
    "Australia's main permanent skilled visas use a points test, often called the PR point system. You make claims about yourself in an expression of interest, the claims add up to a score, and the Department of Home Affairs invites people to apply from that pool. When people search for the \"PR test\", this is usually what they mean, along with the English and NAATI tests whose results add points.",
    "This guide sets out the whole points table in plain English, with a rough estimator you can try, and focuses on the parts you can still change. It isn't migration advice. The tables are published on [immi.homeaffairs.gov.au](https://immi.homeaffairs.gov.au/) and can change, so check the current table for your visa before you rely on any number here.",
  ],
  sections: [
    {
      heading: "Which visas use the points test",
      blocks: [
        {
          type: "p",
          text: "At the time of writing, Home Affairs lists three points-tested skilled visas that you apply for through SkillSelect:",
        },
        {
          type: "ul",
          items: [
            "**Skilled Independent (subclass 189)**, which doesn't need a sponsor or nomination.",
            "**Skilled Nominated (subclass 190)**, which needs nomination by a state or territory government. Its points table adds 5 points for nomination.",
            "**Skilled Work Regional (Provisional) (subclass 491)**, which needs nomination by a state or territory or sponsorship by an eligible relative in a designated regional area. Its table adds 15 points for nomination or sponsorship.",
          ],
        },
        {
          type: "p",
          text: "Apart from the nomination points, the three tables use the same factors. Each visa also has other requirements, such as an occupation on the relevant list, a skills assessment and an age limit, which a registered migration agent can explain for your situation.",
        },
      ],
    },
    {
      heading: "The points table",
      id: "points-table",
      blocks: [
        {
          type: "table",
          caption:
            "Summary of the Home Affairs points table for subclass 189 (page updated June 2026, checked October 2026). The 190 and 491 tables add nomination points. Check the current table and its conditions for your visa.",
          head: ["Factor", "Claim", "Points"],
          rows: [
            ["Age", "18 to 24 / 25 to 32 / 33 to 39 / 40 to 44", "25 / 30 / 25 / 15"],
            ["English", "Competent / Proficient / Superior", "0 / 10 / 20"],
            ["Skilled work outside Australia", "3 to under 5 years / 5 to under 8 / 8 or more", "5 / 10 / 15"],
            ["Skilled work in Australia", "1 to under 3 years / 3 to under 5 / 5 to under 8 / 8 or more", "5 / 10 / 15 / 20"],
            ["Qualification (highest only)", "Doctorate / Bachelor or higher / Australian diploma or trade, or a recognised award", "20 / 15 / 10"],
            ["Specialist education", "Australian Masters by research or Doctorate in a STEM field", "10"],
            ["Australian study requirement", "Met", "5"],
            ["Professional Year in Australia", "Completed", "5"],
            ["Credentialled community language", "NAATI credential, for example a CCL pass", "5"],
            ["Study in regional Australia", "Met", "5"],
            ["Partner", "Skilled partner / single or partner is a citizen or PR / partner has Competent English", "10 / 10 / 5"],
            ["Nomination or sponsorship", "190 / 491", "5 / 15"],
          ],
        },
        {
          type: "p",
          text: "Points for skilled work outside and inside Australia are added together but **capped at 20**, and only work in your nominated or a closely related occupation in the 10 years before your invitation counts. Each row has conditions, such as how the Australian study requirement is defined, so read the [official table](https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189/points-table) before you claim anything.",
        },
      ],
    },
    {
      heading: "The pass mark and invitations",
      blocks: [
        {
          type: "p",
          text: "Home Affairs says you must meet or exceed a points threshold of **65** to be invited to apply for a 189, 190 or 491 visa. Reaching 65 doesn't mean you'll be invited. Invitations depend on the occupation, the number of places and how other people in the pool score, and state or territory nominations can ask for more than 65.",
        },
        {
          type: "p",
          text: "This is why applicants often talk about \"competitive\" scores well above the pass mark. We don't publish typical invitation scores here: they change from round to round and differ by occupation. A registered migration agent can explain current patterns for your occupation.",
        },
      ],
    },
    {
      heading: "Where your languages count",
      id: "where-your-languages-count",
      blocks: [
        {
          type: "p",
          text: "Most factors are fixed by your history, like your age or the qualifications you already hold. Language is different: you can prepare for it. That's why it's usually the first place applicants look when they're a few points short.",
        },
        {
          type: "p",
          text: "**English: up to 20 points.** Moving from Competent to Proficient English adds 10 points, and Superior adds 20. Each level is a minimum score in every component of an accepted test, so your weakest skill decides your level. Our guide to [English proficiency tests](/migrate-to-australia/english-test-for-australian-pr) shows the scores for all eight accepted tests, and there's a separate guide to [CELPIP for Australian PR](/migrate-to-australia/celpip-for-australian-pr).",
        },
        {
          type: "p",
          text: "**A community language: 5 points.** You can claim 5 points if you hold a NAATI credential in a language other than English. Most people get it by passing the [NAATI CCL test](/naati/ccl), which NAATI says is generally taken by people applying for a points-based skilled visa. At the time of writing it's held online, with two recorded dialogues marked out of " +
            `${CCL_MAX_SCORE}; you need ${CCL_PASS_SCORE} overall and at least ${CCL_DIALOGUE_PASS_SCORE} in each dialogue. NAATI certification at Certified Provisional level or above also counts. See [community language points](/migrate-to-australia/community-language-points) for what counts and what doesn't.`,
        },
        {
          type: "callout",
          title: "Check your language first",
          text: "NAATI offers the CCL in a set list of languages that changes over time. Check that yours is listed on the [NAATI CCL page](https://www.naati.com.au/migration-assessments/ccl/) before you book, and see our [CCL practice by language](/naati/ccl) pages.",
        },
      ],
    },
    {
      heading: "SkillSelect and your expression of interest",
      blocks: [
        {
          type: "p",
          text: "You don't apply for these visas directly. First you lodge an **expression of interest (EOI)** in [SkillSelect](https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect), where you record your claims. You don't upload documents at that stage, and SkillSelect shows an indicative points score.",
        },
        {
          type: "ol",
          items: [
            "**Lodge an EOI** with your current claims.",
            "**Update it** if your situation changes, for example when you get a better English result or a NAATI credential. You can update until you're invited.",
            "**If you're invited,** Home Affairs says you have 60 days to lodge your visa application.",
            "**Prove every claim** with evidence when you apply. Claims are generally assessed as at the time you're invited, so don't claim points you don't yet hold.",
          ],
        },
        {
          type: "callout",
          title: "Claim carefully",
          text: "Points you can't prove can lead to a refused application. If you're unsure whether a claim applies to you, ask a [registered migration agent](/migrate-to-australia/find-a-registered-migration-agent) before you lodge.",
        },
      ],
    },
  ],
  xingo: {
    text: [
      `XINGO can't tell you how many points you have; that's for Home Affairs and your agent. What we can help with today is the community language claim. Practise CCL-style dialogues in your language pair with two AI speakers, then get a score out of ${CCL_MAX_SCORE} and feedback on what to fix before test day. English speaking practice is coming soon.`,
      "XINGO is independent practice. It isn't affiliated with Home Affairs or NAATI, and practising doesn't give you a credential or points.",
    ],
    links: [
      { href: "/naati/ccl", label: "NAATI CCL practice", description: `Two-speaker dialogues in your language, scored out of ${CCL_MAX_SCORE}.` },
      { href: "/naati/ccl/vocabulary", label: "CCL vocabulary", description: "English word lists for the 12 CCL domains." },
    ],
  },
  faqs: [
    {
      q: "Is there a PR test in Australia?",
      a: "Not a single exam. Skilled PR visas use a points test, which is a score worked out from your claims. The tests people sit to raise that score are an accepted English test and, for a second language, the NAATI CCL test.",
    },
    {
      q: "What is the pass mark for Australian PR?",
      a: "Home Affairs says you need at least 65 points to be invited to apply for a 189, 190 or 491 visa. Meeting 65 doesn't guarantee an invitation, and nominations can require more.",
    },
    {
      q: "How can I increase my PR points?",
      a: "The factors you can change most directly are usually English (up to 20 points for Superior) and a credentialled community language (5 points, usually from passing the NAATI CCL test). Others depend on your circumstances. A registered migration agent can review your options.",
    },
    {
      q: "How many points does the NAATI CCL give?",
      a: "A credentialled community language is worth 5 points in the 189, 190 and 491 points tables at the time of writing. NAATI issues the credential; Home Affairs decides whether you can claim the points.",
    },
    {
      q: "Is the points test the same for 189, 190 and 491?",
      a: "The factors are the same, but the 190 table adds 5 points for state or territory nomination and the 491 table adds 15 points for nomination or sponsorship.",
    },
    {
      q: "Can I update my expression of interest after improving my score?",
      a: "Home Affairs says you can update your EOI until you're invited. Make sure you hold the new result or credential before you claim it.",
    },
  ],
  sources: [
    { label: "Home Affairs — Points table, Skilled Independent visa (subclass 189)", url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189/points-table" },
    { label: "Home Affairs — Points table, Skilled Nominated visa (subclass 190)", url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-nominated-190/points-table" },
    { label: "Home Affairs — Points table, Skilled Work Regional visa (subclass 491)", url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-work-regional-provisional-491/points-table" },
    { label: "Home Affairs — SkillSelect", url: "https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect" },
    { label: "Home Affairs — SkillSelect expression of interest", url: "https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect/expression-of-interest" },
    { label: "NAATI — Credentialed Community Language test", url: "https://www.naati.com.au/migration-assessments/ccl/" },
  ],
  related: ["english-test-for-australian-pr", "community-language-points", "find-a-registered-migration-agent", "translating-documents-for-a-visa"],
  cta: {
    title: "Work on your 5 community language points",
    body: `Practise CCL-style dialogues in your language, scored out of ${CCL_MAX_SCORE} like the real test. Free practice minutes every month, no card needed.`,
    goal: "naati_ccl",
    buttonLabel: "Try a free CCL dialogue",
  },
};
