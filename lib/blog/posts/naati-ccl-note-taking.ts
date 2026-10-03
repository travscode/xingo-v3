import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "naati-ccl-note-taking",
  title: "Note-taking for the NAATI CCL: a light system for 35-word segments",
  metaTitle: "NAATI CCL Note-Taking: Symbols, Layout and Practice",
  description:
    "A simple note-taking system for NAATI CCL segments: what to write, what to remember, useful symbols, page layout, and drills to build memory and speed.",
  excerpt:
    "What to write and what to leave to memory, a handful of symbols that cover most CCL dialogues, and drills to make it automatic.",
  category: "NAATI CCL",
  keywords: [
    "CCL note taking",
    "NAATI note taking symbols",
    "CCL notes tips",
    "consecutive interpreting note taking",
    "NAATI CCL tips",
  ],
  published: "2026-10-03",
  updated: "2026-10-03",
  intro: [
    "CCL segments are short — 35 words or less — so you won't need the elaborate note-taking systems conference interpreters use. But 35 words with a date, an amount and a list of documents is a lot to hold in your head after a chime, especially when you're nervous.",
    "NAATI allows you to take notes with a pen on loose paper during the test. The goal is a light system: a few marks that trigger your memory, not a transcript. Here's one that works for most candidates, and how to practise it.",
  ],
  sections: [
    {
      heading: "Memory first, notes second",
      blocks: [
        {
          type: "p",
          text: "The most common note-taking mistake is writing too much. If you're busy writing, you're not listening, and you'll end up reading half-sentences back instead of interpreting the meaning. Listen for the message — who is doing what, and why — and write only what memory is likely to drop.",
        },
        {
          type: "table",
          head: ["Write down", "Leave to memory"],
          rows: [
            ["Numbers, amounts, percentages", "The general flow of the sentence"],
            ["Dates, times, days", "Polite phrases and greetings"],
            ["Names of people, places, organisations", "Emotion and tone"],
            ["Lists (documents, symptoms, steps)", "Ideas that follow logically from the previous one"],
            ["Negatives and conditions ('not', 'unless', 'only if')", "Repetition of something already said"],
          ],
        },
      ],
    },
    {
      heading: "A handful of symbols",
      blocks: [
        {
          type: "p",
          text: "Pick a small set and use it consistently. You don't need dozens — ten to fifteen cover most CCL dialogues. These are common choices, but whatever you'll recognise instantly is best:",
        },
        {
          type: "table",
          head: ["Symbol", "Meaning"],
          rows: [
            ["→", "go to, lead to, result in, send"],
            ["←", "come from, receive"],
            ["↑ / ↓", "increase / decrease, more / less"],
            ["✓ / ✗", "yes, approved, correct / no, refused, wrong"],
            ["?", "question, ask, unsure"],
            ["!", "important, warning, urgent"],
            ["=", "is, means, same as"],
            ["≠", "different, not the same"],
            ["b/c", "because"],
            ["w/ , w/o", "with, without"],
            ["Dr, appt, ins, $", "doctor, appointment, insurance, money/payment"],
          ],
        },
        {
          type: "p",
          text: "Write your symbols in the language that's fastest for you. Many candidates mix English abbreviations with their own script; that's fine as long as you can read it back instantly.",
        },
      ],
    },
    {
      heading: "Lay out the page so you can read it at a glance",
      blocks: [
        {
          type: "ul",
          items: [
            "**One segment per block.** Draw a line across the page after each segment so you never read the previous segment's notes.",
            "**Write down the page, not across.** Short lines stacked vertically are faster to scan than long lines.",
            "**Indent for detail.** Put the main idea on the left and details (amount, date) indented beneath.",
            "**Number your pages** before the test starts so a dropped sheet doesn't throw you.",
          ],
        },
        {
          type: "example",
          label: "One segment and its notes",
          lines: [
            { speaker: "Segment", text: "Your claim was approved, but because you didn't send the receipts we can only refund $340 of the $520 — unless you upload them before Friday the 14th." },
            { speaker: "Notes", text: "claim ✓  |  b/c no receipts → $340 / $520  |  unless upload → Fri 14" },
          ],
        },
        {
          type: "p",
          text: "Those few marks capture everything memory would drop: the two amounts, the condition, the deadline. The rest — 'your claim was approved', 'we can only refund' — you remember because you understood it.",
        },
      ],
    },
    {
      heading: "Numbers: write them the way you'll say them",
      blocks: [
        {
          type: "p",
          text: "Numbers deserve special attention because number systems differ. If you'll render $250,000 as ढाई लाख in Hindi or 25万 in Mandarin, practise writing the number in a form that makes the conversion instant. Some candidates write the target-language form directly; others write the digits and convert while speaking. Try both in practice and keep whichever produces fewer errors. Our language pages include number tips — for example [Hindi](/naati/ccl/hindi), [Mandarin](/naati/ccl/mandarin) and [Korean](/naati/ccl/korean).",
        },
      ],
    },
    {
      heading: "Drills that build the skill",
      blocks: [
        {
          type: "ol",
          items: [
            "**Memory-only round.** Interpret short segments with no notes at all. This shows you how much you can hold without help.",
            "**Numbers-only round.** Listen to segments and note only numbers, dates and names. Then interpret.",
            "**Full round.** Use your light system on a complete dialogue with test rules: one repeat, start within five seconds.",
            "**Review.** Compare your notes with what you said. Did you write things you didn't need? Did you miss something you should have noted?",
          ],
        },
        {
          type: "p",
          text: "Ten minutes of drills a day for two or three weeks usually makes a visible difference. The aim is for note-taking to become automatic, so your attention stays on meaning.",
        },
      ],
    },
    {
      heading: "Common note-taking problems",
      blocks: [
        {
          type: "ul",
          items: [
            "**Writing whole words** — use abbreviations and symbols.",
            "**Not being able to read your notes** — slow down slightly and write larger.",
            "**Reading notes aloud word by word** — glance at them, then look up and speak naturally.",
            "**Missing the end of the segment while writing the start** — write less, listen more.",
          ],
        },
      ],
    },
    {
      heading: "Practise with real conversations",
      blocks: [
        {
          type: "p",
          text: "Note-taking only improves with practice on realistic speech. NAATI's free practice materials are a good start. XINGO's [CCL practice](/naati/ccl) gives you CCL-style dialogues — insurance claims, bank home loans, workplace injuries, Centrelink appointments — spoken by two AI speakers in your language pair, so you can drill note-taking on fresh material and get feedback on what you dropped.",
        },
      ],
    },
  ],
  faqs: [
    {
      q: "Can I take notes in the NAATI CCL test?",
      a: "Yes. NAATI allows notes with a pen on loose sheets of paper. Electronic devices and prepared notes aren't allowed. Check the candidate instructions for current rules.",
    },
    {
      q: "Should I learn a formal note-taking system?",
      a: "For the CCL, a light personal system is usually enough. Formal systems are more useful for longer consecutive interpreting, such as in the NAATI CPI or CI tests.",
    },
  ],
  sources: [
    { label: "NAATI — CCL candidate instructions", url: "https://www.naati.com.au/resources/candidate-instructions-ccl/" },
    { label: "NAATI — Downloadable CCL practice materials", url: "https://www.naati.com.au/migration-assessments/ccl/downloadable-ccl-practice-materials-by-language/" },
  ],
  cta: {
    title: "Drill note-taking on fresh dialogues",
    body: "CCL-style dialogues in your language pair, spoken by two AI speakers, with feedback on what you dropped.",
    goal: "naati_ccl",
    pagePath: "/naati/ccl",
    pageLabel: "About CCL practice",
    buttonLabel: "Try a free CCL dialogue",
  },
  related: ["naati-ccl-repeats-and-self-correction", "naati-ccl-test-format-and-marking", "naati-ccl-topics-domains"],
};
