/**
 * Content for SEO landing pages (docs/seo.md).
 *
 * - /naati/ccl/[language] — one page per CCL language (long-tail search).
 * - /naati/cpi            — NAATI Certified Provisional Interpreter test prep.
 * - /interpreting/[topic] — domain pages (medical, legal, NDIS, telephone, diploma).
 *
 * Copy rules: Australian English, no invented statistics, hedge test rules
 * ("check the NAATI website"), never imply affiliation with NAATI, NDIA or TIS.
 */

export const SITE_URL = "https://www.xingo.ai";

export type CclLanguagePage = {
  slug: string;
  name: string;
  nativeName: string;
  /** ISO country code for the decorative flag. */
  flag: string;
  /** Language-specific advice; this is what makes each page genuinely useful. */
  tips: Array<{ title: string; body: string }>;
  /** Shown when realtime voice support for the language is less mature. */
  voiceNote?: boolean;
};

const englishLoanwordsTip = (language: string) => ({
  title: "Watch your English borrowings",
  body: `Everyday ${language} often mixes in English words. In the CCL, use the ${language} term where a common one exists — examiners assess the quality of your language, and leaning on English can cost marks.`,
});

const numbersTip = {
  title: "Numbers, dates and money",
  body: "Dialogues are full of times, dates, dollar amounts and phone numbers. Practise converting them instantly and say them the way a native speaker would, not digit by digit.",
};

export const cclLanguagePages: CclLanguagePage[] = [
  {
    slug: "hindi",
    name: "Hindi",
    nativeName: "हिन्दी",
    flag: "IN",
    tips: [
      englishLoanwordsTip("Hindi"),
      {
        title: "Lakh and crore",
        body: "Australian dialogues use thousands and millions. If you think in lakh and crore, drill conversions like $250,000 = ढाई लाख डॉलर until they're automatic.",
      },
      {
        title: "Use आप consistently",
        body: "Keep a respectful register with आप throughout, even when the English speaker is casual.",
      },
    ],
  },
  {
    slug: "punjabi",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
    flag: "IN",
    tips: [
      englishLoanwordsTip("Punjabi"),
      {
        title: "Respectful forms",
        body: "Use ਤੁਸੀਂ and respectful verb endings with the community member; match the formality of the English speaker without becoming casual.",
      },
      numbersTip,
    ],
  },
  {
    slug: "mandarin",
    name: "Mandarin",
    nativeName: "普通话",
    flag: "CN",
    tips: [
      {
        title: "Converting to 万",
        body: "Large amounts trip people up: $25,000 is 两万五千, $650,000 is 六十五万. Practise switching between thousands and 万 without pausing.",
      },
      {
        title: "Dates and addresses",
        body: "Chinese puts year–month–day and general-to-specific; English does the opposite. Re-order naturally rather than translating word by word.",
      },
      { title: "Measure words", body: "Choose the right measure word (张, 份, 次) for documents, forms and appointments — it's a common slip under time pressure." },
    ],
  },
  {
    slug: "cantonese",
    name: "Cantonese",
    nativeName: "粵語",
    flag: "HK",
    tips: [
      { title: "Spoken, not written, Cantonese", body: "The test is oral. Use natural spoken Cantonese rather than reading-style Chinese, while staying polite with the community member." },
      { title: "Large numbers", body: "Practise 萬 conversions: $38,000 is 三萬八千. Hesitating on numbers is one of the easiest ways to lose accuracy marks." },
      englishLoanwordsTip("Cantonese"),
    ],
  },
  {
    slug: "arabic",
    name: "Arabic",
    nativeName: "العربية",
    flag: "SA",
    tips: [
      { title: "Choose a widely understood register", body: "Use a clear, educated register that speakers from different regions understand, rather than heavy local slang." },
      { title: "Gender agreement", body: "Keep verbs and adjectives agreeing with the person you are addressing or describing — easy to drop when speaking quickly." },
      numbersTip,
    ],
  },
  {
    slug: "vietnamese",
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    flag: "VN",
    tips: [
      { title: "Pronouns and respect", body: "Pick an appropriate respectful pronoun (anh, chị, cô, chú, bác) for the community member and keep it consistent through the dialogue." },
      { title: "Clear tones under pressure", body: "Fast speech blurs tones and changes meaning. Slow down slightly on key words such as amounts, names and medical terms." },
      numbersTip,
    ],
  },
  {
    slug: "nepali",
    name: "Nepali",
    nativeName: "नेपाली",
    flag: "NP",
    voiceNote: true,
    tips: [
      { title: "Honorific levels", body: "Use तपाईं (or हजुर where appropriate) with the community member rather than तिमी." },
      englishLoanwordsTip("Nepali"),
      numbersTip,
    ],
  },
  {
    slug: "urdu",
    name: "Urdu",
    nativeName: "اردو",
    flag: "PK",
    tips: [
      { title: "Formal register", body: "Use آپ and polite verb forms throughout, and prefer standard Urdu terms over regional variants." },
      englishLoanwordsTip("Urdu"),
      numbersTip,
    ],
  },
  {
    slug: "bangla",
    name: "Bangla (Bengali)",
    nativeName: "বাংলা",
    flag: "BD",
    tips: [
      { title: "আপনি, not তুমি", body: "Address the community member with আপনি and keep that register even if the English speaker is informal." },
      englishLoanwordsTip("Bangla"),
      numbersTip,
    ],
  },
  {
    slug: "tamil",
    name: "Tamil",
    nativeName: "தமிழ்",
    flag: "IN",
    tips: [
      { title: "Spoken vs literary Tamil", body: "Aim for clear, natural spoken Tamil that is still polite — avoid both overly literary forms and heavy colloquial mixing." },
      englishLoanwordsTip("Tamil"),
      numbersTip,
    ],
  },
  {
    slug: "telugu",
    name: "Telugu",
    nativeName: "తెలుగు",
    flag: "IN",
    voiceNote: true,
    tips: [englishLoanwordsTip("Telugu"), { title: "Respectful forms", body: "Use మీరు and respectful verb forms with the community member." }, numbersTip],
  },
  {
    slug: "malayalam",
    name: "Malayalam",
    nativeName: "മലയാളം",
    flag: "IN",
    voiceNote: true,
    tips: [englishLoanwordsTip("Malayalam"), { title: "Respectful address", body: "Use respectful forms such as നിങ്ങൾ / താങ്കൾ consistently." }, numbersTip],
  },
  {
    slug: "sinhala",
    name: "Sinhala",
    nativeName: "සිංහල",
    flag: "LK",
    voiceNote: true,
    tips: [
      { title: "Spoken Sinhala", body: "Sinhala has distinct written and spoken forms. Use natural spoken Sinhala with a polite register — not the written style." },
      englishLoanwordsTip("Sinhala"),
      numbersTip,
    ],
  },
  {
    slug: "gujarati",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    flag: "IN",
    voiceNote: true,
    tips: [englishLoanwordsTip("Gujarati"), { title: "Respect markers", body: "Use આપ / તમે appropriately and keep the register steady across the dialogue." }, numbersTip],
  },
  {
    slug: "persian",
    name: "Persian (Farsi)",
    nativeName: "فارسی",
    flag: "IR",
    tips: [
      { title: "شما and polite verbs", body: "Use شما and plural polite verb forms with the community member throughout." },
      englishLoanwordsTip("Persian"),
      numbersTip,
    ],
  },
  {
    slug: "filipino",
    name: "Filipino (Tagalog)",
    nativeName: "Filipino",
    flag: "PH",
    tips: [
      { title: "Limit Taglish", body: "Code-switching is natural in everyday Filipino, but in the CCL use Filipino terms where common ones exist." },
      { title: "Po and opo", body: "Keep po/opo and respectful forms with the community member." },
      numbersTip,
    ],
  },
  {
    slug: "korean",
    name: "Korean",
    nativeName: "한국어",
    flag: "KR",
    tips: [
      { title: "Speech level", body: "Use polite 해요체 or formal 합니다체 consistently; don't drift into casual speech when the English speaker is relaxed." },
      { title: "Large numbers", body: "Practise 만 conversions: $45,000 is 4만 5천 달러." },
      numbersTip,
    ],
  },
  {
    slug: "japanese",
    name: "Japanese",
    nativeName: "日本語",
    flag: "JP",
    tips: [
      { title: "Keigo", body: "Use polite です/ます forms and appropriate honorifics for an official setting, without becoming stiff or slow." },
      { title: "Large numbers", body: "Practise 万 conversions: $120,000 is 12万ドル." },
      numbersTip,
    ],
  },
  {
    slug: "thai",
    name: "Thai",
    nativeName: "ไทย",
    flag: "TH",
    tips: [
      { title: "Polite particles", body: "Use ครับ/ค่ะ naturally — not on every phrase, but enough to keep the register respectful." },
      englishLoanwordsTip("Thai"),
      numbersTip,
    ],
  },
  {
    slug: "indonesian",
    name: "Indonesian",
    nativeName: "Bahasa Indonesia",
    flag: "ID",
    tips: [
      { title: "Formal address", body: "Use Bapak/Ibu or Anda and standard Indonesian, not Jakarta slang." },
      englishLoanwordsTip("Indonesian"),
      numbersTip,
    ],
  },
  {
    slug: "spanish",
    name: "Spanish",
    nativeName: "Español",
    flag: "ES",
    tips: [
      { title: "Usted", body: "Address the community member with usted unless the dialogue clearly calls for tú." },
      { title: "Neutral vocabulary", body: "Choose widely understood words over strongly regional ones (e.g. for car, bus, appointment)." },
      numbersTip,
    ],
  },
];

export function getCclLanguagePage(slug: string) {
  return cclLanguagePages.find((page) => page.slug === slug) ?? null;
}

export type TopicPage = {
  slug: string;
  /** Primary search phrase the page targets. */
  keyword: string;
  title: string;
  metaDescription: string;
  eyebrow: string;
  headline: string;
  intro: string;
  whoFor: string[];
  scenarios: Array<{ title: string; description: string }>;
  skills: string[];
  faqs: Array<{ q: string; a: string }>;
  /** Welcome-flow goal to preselect after sign-up. */
  goal: string;
};

export const topicPages: TopicPage[] = [
  {
    slug: "medical-interpreting-practice",
    keyword: "medical interpreting practice",
    title: "Medical Interpreting Practice — Role-Play with AI",
    metaDescription:
      "Practise medical interpreting out loud: emergency triage, discharge planning, pharmacy and GP calls with AI clinicians and patients, then get scored feedback.",
    eyebrow: "Medical interpreting",
    headline: "Practise healthcare interpreting before the real appointment.",
    intro:
      "Doctors, nurses and pharmacists speak English; the patient speaks your language. You interpret everything — symptoms, medications, doses and warning signs — and get scored on accuracy and terminology.",
    whoFor: ["Healthcare interpreters building confidence", "Diploma of Interpreting students", "CCL and CPI candidates practising the health domain"],
    scenarios: [
      { title: "Emergency room triage", description: "Chest pain, onset, medications and urgency." },
      { title: "Paediatric consultation", description: "A worried parent, a child's symptoms and next steps." },
      { title: "Hospital discharge planning", description: "Medication schedules, wound care and warning signs." },
      { title: "Pharmacy medication review", description: "A new blood thinner, interactions and timing." },
      { title: "GP test results call", description: "Remote call about results and a follow-up appointment." },
    ],
    skills: ["Medication names and doses", "Symptom chronology", "Warning signs and instructions", "Calm, reassuring register"],
    faqs: [
      {
        q: "Is the medical course free?",
        a: "Yes. The emergency and hospital dialogues are part of the free plan, which includes practice minutes every month.",
      },
      {
        q: "How is my interpreting scored?",
        a: "An examiner-style AI reviews your transcript for accuracy, terminology, fluency, turn management and professionalism, and tells you what to work on next.",
      },
      {
        q: "Which languages can I practise?",
        a: "The clinician always speaks English; the patient speaks the language you choose, from 30+ options or any language you type in.",
      },
    ],
    goal: "medical",
  },
  {
    slug: "ndis-interpreting",
    keyword: "NDIS interpreter practice",
    title: "NDIS Interpreting Practice — Planning Meetings",
    metaDescription:
      "Practise interpreting NDIS planning meetings, plan reassessments and support coordinator visits with AI role-plays. Build NDIS terminology, get scored.",
    eyebrow: "NDIS interpreting",
    headline: "Get confident interpreting NDIS meetings.",
    intro:
      "NDIS meetings are long, personal and full of program terms — plans, supports, plan managers, reviews. Practise them with an AI planner and participant, then see exactly where meaning slipped.",
    whoFor: ["Community interpreters taking NDIS assignments", "Interpreters new to disability services", "Students preparing for community work"],
    scenarios: [
      { title: "NDIS planning meeting", description: "Goals, a typical day, informal supports and plan management." },
      { title: "NDIS plan reassessment", description: "Therapy hours used, progress and a parent's concerns." },
      { title: "Support coordinator home visit", description: "Support worker days, preferences and a service agreement." },
    ],
    skills: ["NDIS terminology", "Goals in the participant's own words", "Three-way meetings with family", "Numbers and funding amounts"],
    faqs: [
      {
        q: "Is XINGO affiliated with the NDIS or NDIA?",
        a: "No. XINGO is independent practice software. The scenarios are realistic role-plays, not official NDIS material.",
      },
      {
        q: "Can I try an NDIS scenario for free?",
        a: "Yes — the planning meeting is a free preview dialogue. The full course is included with Pro or any minute pack.",
      },
      {
        q: "Do I need to know NDIS terms first?",
        a: "It helps. The planner uses real program terms, and your feedback flags terminology you rendered inconsistently.",
      },
    ],
    goal: "ndis",
  },
  {
    slug: "telephone-interpreting-practice",
    keyword: "telephone interpreting practice",
    title: "Telephone Interpreting Practice — Audio-Only Calls",
    metaDescription:
      "Practise telephone interpreting with AI callers: Centrelink payment enquiries, GP results calls and energy hardship calls. Audio only, like real phone work.",
    eyebrow: "Telephone interpreting",
    headline: "Practise interpreting when all you have is the voice.",
    intro:
      "Most on-demand interpreting in Australia happens over the phone. There are no faces to read, people talk fast, and reference numbers fly past. Build the habits that make remote calls go smoothly.",
    whoFor: ["Interpreters starting on-demand phone work", "NAATI CPI candidates (the test includes a remote task)", "Anyone who finds phone assignments stressful"],
    scenarios: [
      { title: "Centrelink payment enquiry", description: "Reference numbers, income reporting and a repayment plan." },
      { title: "GP test results call", description: "Results, a medication change and a follow-up booking." },
      { title: "Energy bill hardship call", description: "Overdue amounts, concessions and a payment plan." },
    ],
    skills: ["Holding numbers without visual cues", "Asking for repetition professionally", "Managing interruptions", "Clear phone delivery"],
    faqs: [
      {
        q: "Is this affiliated with TIS National or Services Australia?",
        a: "No. XINGO is independent. The calls are realistic role-plays of the kinds of calls phone interpreters handle.",
      },
      {
        q: "Does this help with the NAATI CPI remote task?",
        a: "The CPI test includes a remote dialogue task, so practising audio-only interpreting is directly relevant. Check NAATI's website for current test details.",
      },
      {
        q: "Can I practise without a headset?",
        a: "You can, but headphones stop the AI hearing itself through your speakers and make sessions much smoother.",
      },
    ],
    goal: "naati_cpi",
  },
  {
    slug: "legal-interpreting-practice",
    keyword: "legal interpreting practice",
    title: "Legal & Court Interpreting Practice — AI Role-Plays",
    metaDescription:
      "Practise legal interpreting with AI role-plays: bail hearings, Local Court mentions, tribunal visa reviews and police statements. First person, scored feedback.",
    eyebrow: "Legal interpreting",
    headline: "Rehearse court and tribunal interpreting before it counts.",
    intro:
      "Legal settings demand first-person rendering, formal register and absolute accuracy. Practise with an AI duty lawyer, magistrate or tribunal member and get feedback on exactly what changed in meaning.",
    whoFor: ["Interpreters moving into legal work", "CPI holders working towards Certified Interpreter", "Students in legal interpreting units"],
    scenarios: [
      { title: "Bail hearing", description: "Conditions, sureties and procedural language." },
      { title: "Local Court mention", description: "A duty lawyer explains pleas, bail conditions and the next date." },
      { title: "Tribunal visa review hearing", description: "Formal questioning about a refused visa." },
      { title: "Visa eligibility interview", description: "Timelines, documents and careful questioning." },
      { title: "Police witness statement", description: "A CCL-style dialogue with a police officer." },
    ],
    skills: ["First-person rendition", "Formal register", "Legal terminology", "Preserving hesitation and exact answers"],
    faqs: [
      { q: "Are these real court transcripts?", a: "No — they're realistic role-plays written for practice. Nothing is taken from real proceedings." },
      { q: "Which course is free?", a: "Legal courses are premium. Every premium course includes a free preview dialogue so you can try the format first." },
      { q: "Is this legal advice?", a: "No. The content is for interpreting practice only." },
    ],
    goal: "legal",
  },
  {
    slug: "diploma-of-interpreting-practice",
    keyword: "Diploma of Interpreting practice",
    title: "Diploma of Interpreting Practice — Extra Role-Plays",
    metaDescription:
      "Studying the Diploma of Interpreting? Get extra role-play practice between classes — health, legal, community and phone dialogues — with scored feedback.",
    eyebrow: "For interpreting students",
    headline: "More role-play practice than class time allows.",
    intro:
      "In class you get a few role-plays a week. XINGO gives you a patient AI partner whenever you have twenty minutes — the same dialogue format you'll meet in assessments and the NAATI CPI test.",
    whoFor: ["Diploma of Interpreting (PSP50922) students", "Graduates preparing for the NAATI CPI test", "Trainers looking for homework practice"],
    scenarios: [
      { title: "GP clinic registration", description: "Forms, Medicare details and appointment rules." },
      { title: "School enrolment meeting", description: "Documents, catchment and support services." },
      { title: "Employment services intake", description: "Job history, obligations and next steps." },
      { title: "Rental repair request", description: "A tenant, an agent and an urgent repair." },
      { title: "Centrelink payment call", description: "Audio-only, with reference numbers and amounts." },
    ],
    skills: ["Consecutive interpreting in both directions", "Note-taking for longer turns", "Domain terminology", "Professional conduct"],
    faqs: [
      { q: "Is XINGO part of my course?", a: "No — it's independent extra practice. Many students use it alongside their course role-plays." },
      { q: "Can my trainer see my results?", a: "Not yet. Team access for trainers is on the way — contact us if your provider is interested." },
      { q: "Which languages are supported?", a: "30+ languages are listed and you can type in another. The other participant always speaks English." },
    ],
    goal: "naati_cpi",
  },
];

export function getTopicPage(slug: string) {
  return topicPages.find((page) => page.slug === slug) ?? null;
}

export function flagFor(code: string) {
  return code.toUpperCase().replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

/** Sign-up link that lands in the welcome flow with goal (and language) preselected. */
export function signUpHref(goal: string, language?: string) {
  const params = new URLSearchParams({ goal });
  if (language) params.set("language", language);
  return `/sign-up?redirect=${encodeURIComponent(`/welcome?${params.toString()}`)}`;
}
