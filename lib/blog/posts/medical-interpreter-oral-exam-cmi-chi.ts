import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "medical-interpreter-oral-exam-cmi-chi",
  title: "CMI vs CHI oral exam: how the US medical interpreter oral exams compare and how to prepare",
  metaTitle: "CMI vs CHI Oral Exam: How to Prepare",
  description:
    "The NBCMI CMI and CCHI CHI oral exams compared — format, languages and what's scored — plus a practical plan for consecutive and sight translation practice.",
  excerpt:
    "The two US national medical interpreter credentials side by side, and a practical way to prepare for the consecutive role-plays both oral exams rely on.",
  category: "Medical interpreting",
  keywords: [
    "CMI vs CHI",
    "medical interpreter oral exam",
    "CMI oral exam practice",
    "CCHI oral exam",
    "NBCMI oral exam",
    "medical interpreter certification",
  ],
  published: "2026-10-03",
  updated: "2026-10-03",
  intro: [
    "In the United States there are two national certifications for healthcare interpreters: the Certified Medical Interpreter (CMI) from the National Board of Certification for Medical Interpreters (NBCMI), and the Certified Healthcare Interpreter (CHI) from the Certification Commission for Healthcare Interpreters (CCHI). Both start with a written exam and finish with an oral performance exam.",
    "The oral exams are where most candidates feel the pressure. This guide compares them at a high level and then focuses on what both reward: accurate, complete consecutive interpreting of short medical exchanges.",
  ],
  sections: [
    {
      heading: "The two credentials at a glance",
      blocks: [
        {
          type: "table",
          head: ["", "CMI (NBCMI)", "CHI (CCHI)"],
          rows: [
            ["Written exam first", "Yes", "Yes (CoreCHI)"],
            ["Oral exam languages", "A limited set, including Spanish, Mandarin, Cantonese, Russian, Korean and Vietnamese", "A small set, including Spanish, Mandarin and Arabic; other languages have a different performance option"],
            ["Oral exam tasks", "Sight translation, then short consecutive role-plays in both directions; no simultaneous", "Consecutive vignettes (the largest share), plus simultaneous and sight translation items"],
            ["Delivery", "Recorded prompts; at a test site or from home with online proctoring", "Recorded prompts at a proctored test centre"],
            ["What raters look at", "Accuracy, listening and retention, grammar, interpreting style, terminology", "Lexical content and accuracy, grammar, quality of speech"],
          ],
          caption: "Summarised from NBCMI and CCHI candidate information in 2026. Languages, prerequisites and fees change — always check the official sites.",
        },
        {
          type: "p",
          text: "Both bodies set prerequisites such as minimum age, education, language proficiency and completed medical interpreter training. Read the [NBCMI](https://www.certifiedmedicalinterpreters.org/) and [CCHI](https://cchicertification.org/) candidate handbooks for current details before choosing a pathway.",
        },
      ],
    },
    {
      heading: "What consecutive items are like",
      blocks: [
        {
          type: "p",
          text: "In both exams, you hear a short exchange between a provider and a patient, one utterance at a time, and interpret each into the other language. The utterances are realistic: symptoms, medication instructions, test results, consent. They're short enough to hold in memory but packed with details — numbers, frequencies, body parts, negatives — that are easy to drop.",
        },
        {
          type: "example",
          label: "The kind of utterance that loses points",
          lines: [
            { speaker: "Provider", text: "Take one tablet twice a day with food for ten days, and don't stop even if the rash goes away after three or four days." },
            { speaker: "Risky rendition", text: "Take the tablets with food for ten days and keep taking them." },
            { speaker: "What's missing", text: "'One tablet', 'twice a day', and the condition 'even if the rash goes away after three or four days'." },
          ],
        },
      ],
    },
    {
      heading: "Five habits raters notice",
      blocks: [
        {
          type: "ol",
          items: [
            "**First person, always.** Render 'I have chest pain', not 'She says she has chest pain'. Third-person reporting is a style error in both exams.",
            "**Every number and qualifier.** Doses, frequencies, durations, 'only', 'never', 'unless' — these carry meaning and are where accuracy is lost.",
            "**Register preserved.** Don't make a casual patient sound formal, or a formal provider sound chatty.",
            "**Clean delivery.** A short pause to plan beats a false start and two self-corrections.",
            "**Don't freeze on a term.** If one word won't come, convey the meaning accurately and keep going rather than leaving a gap.",
          ],
        },
      ],
    },
    {
      heading: "Building memory for longer utterances",
      blocks: [
        {
          type: "p",
          text: "Many candidates can interpret a ten-word sentence perfectly but start summarising at thirty. Train this deliberately:",
        },
        {
          type: "ul",
          items: [
            "**Shadow first.** Repeat English medical audio in English, a beat behind, to build listening stamina.",
            "**Then repeat whole utterances** in the same language after they finish, increasing length gradually.",
            "**Then interpret.** Start with short utterances and lengthen them as accuracy holds.",
            "**Visualise structure.** Picture the who, what, how much and when. A few candidates use minimal notes for numbers if the exam allows; practise however you'll actually be tested.",
          ],
        },
      ],
    },
    {
      heading: "Terminology: learn it in context",
      blocks: [
        {
          type: "p",
          text: "Lists of anatomy terms help, but exam utterances use terms in sentences, often in lay language from the patient and technical language from the provider. Group your study by specialty — cardiology, endocrinology, obstetrics, paediatrics, neurology, pharmacy — and for each, practise both the clinical and everyday ways people say things ('myocardial infarction' and 'heart attack').",
        },
      ],
    },
    {
      heading: "Sight translation",
      blocks: [
        {
          type: "p",
          text: "Both exams include sight translation from English. Practise with real-world documents such as discharge instructions, consent forms and medication leaflets: skim for structure for a few seconds, then render at a steady pace without going back. Steady and complete beats fast and patchy.",
        },
      ],
    },
    {
      heading: "A four-week practice outline",
      blocks: [
        {
          type: "table",
          head: ["Week", "Focus"],
          rows: [
            ["1", "Diagnose: record yourself on mixed consecutive items. Note where accuracy drops — numbers, length or terminology."],
            ["2", "Memory and numbers: daily shadowing and progressively longer utterances."],
            ["3", "Specialty terminology in context; sight translation of two documents a day."],
            ["4", "Timed mock sessions in exam conditions, with limited repeats and no pausing."],
          ],
        },
        {
          type: "p",
          text: "XINGO's [CMI](/exams/cmi-oral-exam) and [CHI](/exams/cchi-oral-exam) practice gives you short consecutive medical role-plays — endocrinology, OB/GYN, emergency, paediatrics, neurology and pharmacy — with an AI provider and patient, then scores accuracy, terminology and delivery from your transcript. Sight translation and simultaneous items aren't covered, so practise those separately.",
        },
      ],
    },
  ],
  faqs: [
    {
      q: "Which is better, CMI or CHI?",
      a: "Neither is universally better. Employers in the US generally recognise both. Your choice often comes down to whether an oral exam is offered in your language and the prerequisites each body sets.",
    },
    {
      q: "Can I take the oral exam if my language isn't offered?",
      a: "Both bodies have arrangements for languages without a full oral exam. CCHI, for example, offers a different performance credential for other languages. Check the official sites for the current options.",
    },
  ],
  sources: [
    { label: "NBCMI — National Board of Certification for Medical Interpreters", url: "https://www.certifiedmedicalinterpreters.org/" },
    { label: "CCHI — Certification Commission for Healthcare Interpreters", url: "https://cchicertification.org/" },
  ],
  cta: {
    title: "Practise consecutive medical role-plays",
    body: "Short provider–patient exchanges in both directions, scored for accuracy, terminology and delivery.",
    goal: "us_medical_oral",
    pagePath: "/exams/cmi-oral-exam",
    pageLabel: "About CMI oral practice",
    buttonLabel: "Try a medical role-play free",
  },
  related: ["telephone-interpreting-tips", "naati-cpi-test-preparation"],
};
