import type { BlogPost } from "../types";
import { plans } from "../../plans";
import { CCL_MAX_SCORE } from "../../scoring";

export const post: BlogPost = {
  slug: "naati-ccl-free-practice-resources",
  title: "Free NAATI CCL practice resources, and a four-week plan to use them",
  metaTitle: "Free NAATI CCL Practice Tests and a 4-Week Study Plan",
  description:
    "Where to find free NAATI CCL practice tests and materials, what each is good for, and a realistic four-week plan to prepare for the CCL out loud.",
  excerpt:
    "NAATI's own free practice test and materials, how to combine them with other practice, and a week-by-week plan for the month before your test.",
  category: "NAATI CCL",
  keywords: [
    "free CCL practice test",
    "NAATI practice test",
    "CCL practice materials",
    "how to prepare for CCL in 4 weeks",
    "CCL mock test online",
    "NAATI CCL preparation",
  ],
  published: "2026-10-03",
  updated: "2026-10-03",
  intro: [
    "You don't need to spend a lot to prepare for the NAATI CCL. NAATI publishes free practice material, and the most important ingredient — speaking out loud, under realistic conditions, many times — costs nothing but time.",
    "This guide lists the free official resources, explains what each is best for, and lays out a four-week plan. If you have longer, stretch it; if you have less, compress weeks one and two.",
  ],
  sections: [
    {
      heading: "Start with NAATI's own resources",
      blocks: [
        {
          type: "ul",
          items: [
            "**[NAATI's free CCL practice test](https://www.naati.com.au/ccl-practice-test/)** — a single dialogue in the test format, so you can hear the chimes, segment lengths and pace. Do this first, before anything else.",
            "**[Downloadable CCL practice materials by language](https://www.naati.com.au/migration-assessments/ccl/downloadable-ccl-practice-materials-by-language/)** — past dialogues with audio and transcripts. Excellent for drilling, but once you've heard a dialogue, it's no longer a fair test of your level.",
            "**NAATI's paid practice test with feedback** — at the time of writing, NAATI also offers an assessed practice test through myNAATI. Check the NAATI site for availability and cost.",
          ],
        },
        {
          type: "callout",
          title: "Be wary of 'predicted questions'",
          text: "NAATI test content is confidential. Sites selling 'recent' or 'predicted' CCL dialogues can't guarantee they're accurate, and memorising dialogues doesn't build the skill the test measures.",
        },
      ],
    },
    {
      heading: "What else you need: a partner, a recorder, a timer",
      blocks: [
        {
          type: "p",
          text: "The CCL is a speaking test, so the core of your preparation is speaking practice. A study partner who speaks your language can read dialogues to you. Record every session on your phone and listen back — it's uncomfortable, but it's the fastest way to hear hesitations, English loanwords and dropped details. Use a timer so starting within five seconds of each segment becomes a habit.",
        },
        {
          type: "p",
          text: `If you don't have a partner available, XINGO's [CCL practice](/naati/ccl) gives you two AI speakers — an English-speaking professional and a community member in your language — and scores each assessed attempt out of ${CCL_MAX_SCORE}. There are ${plans.free.monthlyMinutes} free practice minutes each month and a free CCL dialogue; it's independent practice, not an official NAATI score.`,
        },
      ],
    },
    {
      heading: "Week 1: diagnose",
      blocks: [
        {
          type: "ul",
          items: [
            "Do NAATI's free practice test under test conditions. Record it.",
            "Listen back and list your weak points: numbers, a particular domain, one direction, register, hesitation.",
            "Read our guide to [how the CCL is marked](/blog/naati-ccl-test-format-and-marking) so you know which errors cost most.",
            "Start a glossary organised by the twelve domains. Our [CCL vocabulary page](/naati/ccl/vocabulary) has English terms to start from.",
          ],
        },
      ],
    },
    {
      heading: "Week 2: build the skills",
      blocks: [
        {
          type: "ul",
          items: [
            "Daily numbers drill (ten minutes): amounts, dates, phone numbers, percentages, both directions.",
            "Set up a light [note-taking system](/blog/naati-ccl-note-taking) and practise it on short segments.",
            "Two or three dialogues from the downloadable materials, segment by segment, out loud. Repeat any segment you struggled with until it's clean.",
            "Add ten glossary terms a day, saying each aloud in both languages.",
          ],
        },
      ],
    },
    {
      heading: "Week 3: full dialogues under test rules",
      blocks: [
        {
          type: "ul",
          items: [
            "One or two full dialogues a day with test rules: one repeat, no pausing, start within five seconds.",
            "Rotate domains so you cover at least six of the twelve this week.",
            "After each dialogue, write down your three biggest errors and drill those specifically.",
            "Practise your self-correction phrase so it's clean. See [CCL repeats and self-correction](/blog/naati-ccl-repeats-and-self-correction).",
          ],
        },
      ],
    },
    {
      heading: "Week 4: mock tests and test-day preparation",
      blocks: [
        {
          type: "ul",
          items: [
            "Two back-to-back dialogues, three or four times this week, on material you haven't seen. Remember each must reach 29 out of 45 on its own.",
            "Check NAATI's technical requirements for the online test and set up your room, computer and second camera in advance.",
            "Ease off the day before. Light review of your glossary and numbers is enough.",
          ],
        },
      ],
    },
    {
      heading: "How to review a practice recording",
      blocks: [
        {
          type: "p",
          text: "Recording yourself only helps if you review it with a purpose. Listen once with the transcript in front of you and mark every omission, change of meaning and addition. Listen a second time without the transcript, as an examiner would, and note long pauses, fillers, corrections and English words where your language has a common term. Then pick the single most frequent problem and make it the focus of tomorrow's session. Reviewing takes about as long as the dialogue itself, and it's where most of the improvement happens.",
        },
      ],
    },
    {
      heading: "Common pitfalls",
      blocks: [
        {
          type: "ul",
          items: [
            "Practising silently — reading dialogues instead of speaking them.",
            "Only practising into your stronger language.",
            "Re-using the same dialogues until you've memorised them, then mistaking familiarity for progress.",
            "Leaving technical setup until the morning of the test.",
          ],
        },
        {
          type: "p",
          text: "Our article on [common CCL mistakes](/blog/naati-ccl-common-mistakes) goes into each of these in more detail.",
        },
      ],
    },
  ],
  faqs: [
    {
      q: "Is there a free NAATI CCL practice test?",
      a: "Yes. NAATI offers a free one-dialogue practice test on its website, plus downloadable practice materials by language. Check the NAATI website for what's currently available.",
    },
    {
      q: "Is four weeks enough to prepare for the CCL?",
      a: "It depends on your starting level in both languages. Many candidates who are already comfortable in both languages find a focused month enough to learn the format and fix their main weaknesses. Start with the practice test to find out where you stand.",
    },
    {
      q: "Can I practise the CCL online?",
      a: "Yes. NAATI's practice test is online, and tools such as XINGO let you interpret CCL-style dialogues with AI speakers. Neither replaces the official test.",
    },
  ],
  sources: [
    { label: "NAATI — Free CCL practice test", url: "https://www.naati.com.au/ccl-practice-test/" },
    {
      label: "NAATI — Downloadable CCL practice materials by language",
      url: "https://www.naati.com.au/migration-assessments/ccl/downloadable-ccl-practice-materials-by-language/",
    },
    { label: "NAATI — Paid practice tests", url: "https://www.naati.com.au/news/paid-practice-tests/" },
  ],
  cta: {
    title: "No practice partner? Start here",
    body: "Two AI speakers in your language pair, available whenever you have ten minutes. Your first CCL dialogue is free.",
    goal: "naati_ccl",
    pagePath: "/naati/ccl",
    pageLabel: "About CCL practice",
    buttonLabel: "Try a free CCL dialogue",
  },
  related: ["naati-ccl-test-format-and-marking", "naati-ccl-common-mistakes", "naati-ccl-topics-domains"],
};
