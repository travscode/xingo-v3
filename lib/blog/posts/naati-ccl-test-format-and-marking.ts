import type { BlogPost } from "../types";
import { CCL_MAX_SCORE, CCL_PASS_SCORE } from "../../scoring";

export const post: BlogPost = {
  slug: "naati-ccl-test-format-and-marking",
  title: "NAATI CCL test format and marking, explained",
  metaTitle: "NAATI CCL Test Format and Marking Explained",
  description: `How the NAATI CCL test works: two dialogues, 35-word segments, marking out of ${CCL_MAX_SCORE}, the ${CCL_PASS_SCORE} pass mark and 29-per-dialogue minimum, repeats and what loses marks.`,
  excerpt: `Two dialogues, short segments, mark deduction and a pass mark of ${CCL_PASS_SCORE}/${CCL_MAX_SCORE} with a minimum per dialogue — what each part means for how you practise.`,
  category: "NAATI CCL",
  keywords: [
    "NAATI CCL test format",
    "CCL marking criteria",
    "CCL pass mark",
    "how is CCL marked",
    "CCL 29 per dialogue",
    "CCL segments 35 words",
  ],
  published: "2026-10-03",
  updated: "2026-10-03",
  intro: [
    "The NAATI Credentialed Community Language (CCL) test checks whether you can communicate between English and another language at a community level. Many people sit it for the five points it can add to an Australian skilled migration points test; others want a first step towards interpreting work.",
    "The test is short, and the format is very consistent. Knowing exactly how it runs and how it's marked changes how you should practise. This guide summarises NAATI's published information — always read NAATI's own [CCL test page](https://www.naati.com.au/migration-assessments/ccl/) and [candidate instructions](https://www.naati.com.au/resources/candidate-instructions-ccl/) before your test, because details change.",
  ],
  sections: [
    {
      heading: "The format at a glance",
      blocks: [
        {
          type: "table",
          head: ["What", "How it works"],
          rows: [
            ["Dialogues", "Two recorded dialogues between an English speaker and a speaker of your other language."],
            ["Length", "About 300 words each, roughly half in English and half in the other language."],
            ["Segments", "Each dialogue is broken into segments of 35 words or less. You interpret each one after a chime."],
            ["Direction", "Both ways: English into your language, and your language into English."],
            ["Settings", "Everyday community situations such as health, legal, housing, education, employment and consumer affairs."],
            ["Notes", "You can take notes with a pen on loose paper. No dictionaries or prepared notes."],
            ["Delivery", "Online, on NAATI's test platform with remote proctoring, at the time of writing."],
          ],
          caption: "Summarised from NAATI's CCL test page and candidate instructions, October 2026.",
        },
        {
          type: "p",
          text: "The dialogues are set in Australia and feel like real conversations: a parent talking to a school, a client at a bank, a patient at a clinic. The English speaker is usually a professional or service provider; the other speaker is a community member.",
        },
      ],
    },
    {
      heading: "How marking works: deduction, not addition",
      blocks: [
        {
          type: "p",
          text: `Each dialogue is marked out of 45, for a total of ${CCL_MAX_SCORE}. NAATI uses **mark deduction**: you start with full marks and lose marks for errors, weighted by how much each error affects communication. A small slip in grammar costs less than a changed number or a missing instruction.`,
        },
        {
          type: "p",
          text: "In practice, deductions come from a few broad areas:",
        },
        {
          type: "ul",
          items: [
            "**Accuracy** — distorting meaning, leaving something out, or adding something that wasn't said.",
            "**Quality of language** — grammar, word choice and naturalness in both English and your other language, including using English words where your language has a common equivalent.",
            "**Register** — keeping an appropriately polite, respectful tone with each speaker.",
            "**Delivery** — long hesitations, frequent self-corrections, unfinished sentences.",
            "**Repeats** — asking for more repeats than allowed (see below).",
          ],
        },
      ],
    },
    {
      heading: "The pass mark: both rules matter",
      blocks: [
        {
          type: "p",
          text: `To pass, you need **at least ${CCL_PASS_SCORE} out of ${CCL_MAX_SCORE} overall** and **at least 29 out of 45 in each dialogue**. That second rule catches people out: a strong first dialogue can't rescue a weak second one.`,
        },
        {
          type: "table",
          head: ["Dialogue 1", "Dialogue 2", "Total", "Result"],
          rows: [
            ["34", "30", "64", "Pass — both dialogues at 29+, total 63+"],
            ["40", "27", "67", "Fail — dialogue 2 is under 29"],
            ["31", "30", "61", "Fail — total under 63"],
          ],
          caption: "Illustrative numbers only, to show how the two rules interact.",
        },
        {
          type: "p",
          text: "For practice, this means you should treat every dialogue as if it has to pass on its own. Consistency beats a few brilliant segments.",
        },
      ],
    },
    {
      heading: "Repeats and self-correction",
      blocks: [
        {
          type: "p",
          text: "NAATI's candidate instructions allow you to ask for **one segment per dialogue to be repeated without penalty**. Further repeats attract deductions. You can also correct yourself if you notice an error — but frequent corrections are themselves penalised, because they affect delivery.",
        },
        {
          type: "p",
          text: "Our guide to [CCL repeats and self-correction](/blog/naati-ccl-repeats-and-self-correction) covers when it's worth using your free repeat and how to correct yourself cleanly.",
        },
      ],
    },
    {
      heading: "Timing: start promptly",
      blocks: [
        {
          type: "p",
          text: "After each segment there's a chime, and NAATI's instructions ask you to start interpreting within about five seconds. A brief pause to gather your thoughts is fine; long silences cost marks for delivery and can leave you short of time overall.",
        },
      ],
    },
    {
      heading: "What the format means for your practice",
      blocks: [
        {
          type: "ol",
          items: [
            "**Practise both directions equally.** Many candidates are stronger into English or into their language. The examiner hears both.",
            "**Practise segment by segment, out loud.** Reading dialogues silently doesn't build the speed you need after the chime.",
            "**Drill numbers, dates and names.** They're the easiest marks to lose and the easiest to train.",
            "**Train your memory for 35 words**, with light notes as backup. See our [CCL note-taking guide](/blog/naati-ccl-note-taking).",
            "**Cover all domains.** Our [CCL topics guide](/blog/naati-ccl-topics-domains) lists them with the kinds of situations to expect.",
            "**Do full dialogues under test conditions** — no pausing, one repeat, start within five seconds.",
          ],
        },
      ],
    },
    {
      heading: "Practising the format",
      blocks: [
        {
          type: "p",
          text: "NAATI offers a free practice test and downloadable past materials, which are the best place to hear the official format. For repetition beyond that, XINGO's [CCL practice](/naati/ccl) runs CCL-style dialogues with two AI speakers — an English-speaking professional and a community member speaking your language — so you interpret both ways, out loud, turn by turn. Each assessed attempt is scored out of 90 with feedback on accuracy, language quality and delivery. It's independent practice, not an official NAATI score.",
        },
      ],
    },
  ],
  faqs: [
    {
      q: "What is the NAATI CCL pass mark?",
      a: `${CCL_PASS_SCORE} out of ${CCL_MAX_SCORE} overall, with at least 29 out of 45 in each of the two dialogues. Check NAATI's website for the current rules.`,
    },
    {
      q: "How long is each CCL dialogue?",
      a: "About 300 words each, split into segments of 35 words or less.",
    },
    {
      q: "Is the CCL test pass or fail for migration points?",
      a: "For points purposes, what matters is holding the credential. Scoring 63 or 90 gives the same result. Confirm points rules with the Department of Home Affairs.",
    },
    {
      q: "Can I take notes in the CCL test?",
      a: "Yes, with a pen on loose sheets of paper. Electronic devices, dictionaries and prepared notes aren't allowed.",
    },
  ],
  sources: [
    { label: "NAATI — Credentialed Community Language test", url: "https://www.naati.com.au/migration-assessments/ccl/" },
    { label: "NAATI — CCL candidate instructions", url: "https://www.naati.com.au/resources/candidate-instructions-ccl/" },
    { label: "NAATI — Free CCL practice test", url: "https://www.naati.com.au/ccl-practice-test/" },
  ],
  cta: {
    title: "Try a CCL-style dialogue now",
    body: "Two AI speakers, your language pair, both directions. Scored out of 90 with specific feedback.",
    goal: "naati_ccl",
    pagePath: "/naati/ccl",
    pageLabel: "About CCL practice",
    buttonLabel: "Try a free CCL dialogue",
  },
  related: ["naati-ccl-repeats-and-self-correction", "naati-ccl-note-taking", "naati-ccl-5-points-australian-pr"],
};
