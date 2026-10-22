/**
 * Interpreting certification exams XINGO helps candidates practise for.
 * Each entry powers a landing page at /exams/[slug] and maps to a seeded
 * module (convex/content/examsPack.ts). Facts are summarised from the official
 * sources listed per exam — keep them hedged and link out (docs/seo.md rules).
 */

export type ExamPage = {
  slug: string;
  /** Short name used in nav, badges and CTAs, e.g. "NAATI CI". */
  shortName: string;
  fullName: string;
  body: string;
  region: "Australia" | "United States" | "United Kingdom";
  /** Module id seeded for this exam. */
  moduleId: string;
  /** Welcome-flow goal. */
  goal: string;
  title: string;
  metaDescription: string;
  headline: string;
  intro: string;
  format: Array<{ title: string; body: string }>;
  covered: string[];
  notCovered: string[];
  scenarios: Array<{ title: string; description: string }>;
  tips: Array<{ title: string; body: string }>;
  faqs: Array<{ q: string; a: string }>;
  sources: Array<{ label: string; url: string }>;
};

const commonLimits = "Your score is an estimate from an AI examiner, not an official result.";
const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

export const examPages: ExamPage[] = [
  {
    slug: "oet-speaking",
    shortName: "OET Speaking",
    fullName: "Occupational English Test — Speaking sub-test",
    body: "OET (Cambridge Boxhill Language Assessment)",
    region: "Australia",
    moduleId: "oet-speaking-nursing",
    goal: "oet",
    title: "Occupational English Test (OET) Speaking Guide",
    metaDescription:
      "The Occupational English Test (OET) Speaking sub-test explained: two 5-minute role-plays, nine criteria, the 0–500 scale and the scores Australia asks for.",
    headline: "OET Speaking: how the Occupational English Test role-plays work.",
    intro:
      "The Occupational English Test (OET) is the English test built for health professionals, accepted by Home Affairs for visas and by Ahpra for registration. In its Speaking sub-test you run two five-minute role-plays with a patient, relative or carer. Here's the format, how it's marked and how to prepare.",
    format: [
      { title: "Two role-plays", body: "Each about 5 minutes, after 3 minutes to read the card. You play your own profession; the interlocutor plays a patient, relative or carer." },
      { title: "You lead", body: "The candidate card sets the scene and lists 3–5 tasks. You normally open the conversation and keep it moving." },
      { title: "Nine criteria", body: "Four linguistic (intelligibility, fluency, appropriateness, grammar & expression) and five clinical communication criteria, converted to a 0–500 score." },
      { title: "AHPRA requirement", body: "For tests from 23 April 2026, AHPRA's Speaking minimum is 360. Check AHPRA's page for your circumstances." },
      { title: "Recorded and marked later", body: "Two trained assessors mark the recording; the interlocutor doesn't mark you." },
    ],
    covered: [
      "Five-minute timed role-plays with an original task card",
      "Openings, signposting, open-then-closed questions, plain-language explanations",
      "Handling anxious, angry or reluctant patients and relatives",
      "Feedback on relationship building, structure, information gathering & giving, language and fluency",
    ],
    notCovered: [
      "Intelligibility and pronunciation (can't be judged from a transcript)",
      "Professions other than nursing and medicine (coming later)",
      "An official OET score — " + lowerFirst(commonLimits),
    ],
    scenarios: [
      { title: "Post-op mobilisation (Nursing)", description: "A frightened patient refuses to get out of bed after hip surgery." },
      { title: "Newly diagnosed diabetes (Nursing)", description: "An overwhelmed patient learning to check his glucose." },
      { title: "Angry relative in ED (Nursing)", description: "De-escalate, gather history, explain triage." },
      { title: "Warfarin discharge (Nursing)", description: "A sceptical patient who thinks warfarin is rat poison." },
      { title: "Headaches — wants a scan (Medicine)", description: "Red flags, reassurance and saying no to a scan." },
      { title: "Worsening pneumonia (Medicine)", description: "An honest update to a distressed son." },
    ],
    tips: [
      { title: "Open like a professional", body: "Introduce yourself, confirm the patient's name and the purpose of the conversation before diving into the tasks." },
      { title: "Ask, then explain", body: "Find out what the patient already knows before explaining. Chunk information and check understanding." },
      { title: "Respond to emotion", body: "Acknowledge worry or frustration specifically — formulaic phrases like 'I understand how you feel' can count against you." },
    ],
    faqs: [
      {
        q: "What is the Occupational English Test?",
        a: "OET is an English language test for health professionals, with Listening, Reading, Writing and Speaking sub-tests. Writing and Speaking are set in your own profession. Home Affairs accepts it for visas, and Ahpra accepts it for registration.",
      },
      {
        q: "What OET score do I need in Australia?",
        a: "It depends on your goal. For tests taken from 23 April 2026, Ahpra's minimums are 350 in Listening and Writing and 360 in Reading and Speaking. For visas, Home Affairs sets a minimum in each sub-test for each English level; for example, Proficient English needs 350 Listening, 360 Reading, 380 Writing and 360 Speaking. Check the official pages before you book.",
      },
      { q: "How long is each role-play?", a: "About five minutes, after three minutes to read your role-play card." },
      {
        q: "Can I practise OET Speaking on XINGO?",
        a: "Not yet. OET Speaking practice for nursing and medicine is coming soon. XINGO is independent and not affiliated with OET.",
      },
    ],
    sources: [
      { label: "OET — Speaking test information", url: "https://oet.com/test-information/speaking/" },
      { label: "OET — Speaking criteria overview", url: "https://oet.com/en-us/post/speaking-criteria-overview" },
      { label: "AHPRA — Accepted English language tests", url: "https://www.ahpra.gov.au/Registration/Registration-Standards/English-language-skills/Accepted-English-language-tests.aspx" },
      { label: "Home Affairs — Proficient English", url: "https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/english-language/proficient-english" },
    ],
  },
  {
    slug: "ielts-speaking",
    shortName: "IELTS Speaking",
    fullName: "IELTS Speaking test",
    body: "IELTS (British Council, IDP and Cambridge)",
    region: "Australia",
    moduleId: "ielts-speaking",
    goal: "ielts",
    title: "IELTS Speaking Test: Format, Bands and AI Practice",
    metaDescription:
      "The IELTS Speaking test explained: three parts in 11–14 minutes, the four band criteria, and the scores Australian visas and Ahpra ask for. AI mock tests soon.",
    headline: "The IELTS Speaking test: format, band criteria and how to practise.",
    intro:
      "IELTS Speaking is a face-to-face English speaking test with an examiner, the same for Academic and General Training. Here's how the three parts run, what the examiner listens for and the scores Australia asks for. An IELTS Speaking mock test with an AI examiner is coming soon on XINGO.",
    format: [
      { title: "11–14 minutes", body: "A one-to-one conversation with an examiner, the same for Academic and General Training." },
      { title: "Part 1 · 4–5 min", body: "Questions about you and familiar topics." },
      { title: "Part 2 · 3–4 min", body: "A cue card: 1 minute to prepare, then speak for 1–2 minutes, plus a rounding-off question." },
      { title: "Part 3 · 4–5 min", body: "A discussion of wider issues linked to your Part 2 topic." },
      { title: "Four criteria", body: "Fluency & coherence, lexical resource, grammatical range & accuracy, and pronunciation — each a quarter of the band." },
    ],
    covered: [
      "All three parts, on real timings, with an examiner who doesn't give feedback mid-test",
      "Estimated band with feedback on fluency & coherence, vocabulary and grammar",
      "Practice extending answers and speaking for the full two minutes",
    ],
    notCovered: ["Pronunciation (a quarter of the real band) — the estimate leaves it out", "An official band score — " + lowerFirst(commonLimits)],
    scenarios: [
      { title: "Mock test 1 — Neighbourhoods", description: "Describe a public place you enjoy visiting." },
      { title: "Mock test 2 — Learning", description: "Describe a skill you learned as an adult." },
      { title: "Mock test 3 — Helping others", description: "Describe a time you helped a stranger." },
      { title: "Mock test 4 — Celebrations", description: "Describe a family celebration you remember." },
      { title: "Mock test 5 — Decisions", description: "Describe an important decision you made." },
      { title: "Mock test 6 — Work", description: "Describe a job you would like to try." },
    ],
    tips: [
      { title: "Extend every answer", body: "One-line Part 1 answers cap your band. Add a reason and an example." },
      { title: "Use the full two minutes", body: "In Part 2, cover every prompt on the card and keep going until the examiner stops you." },
      { title: "Don't memorise", body: "Examiners spot rehearsed answers. Practise flexible language instead of scripts." },
    ],
    faqs: [
      { q: "Is the Speaking test the same for Academic and General Training?", a: "Yes. Both versions use the same Speaking test." },
      {
        q: "What IELTS score do I need in Australia?",
        a: "For visas, Home Affairs sets a minimum in each component: at least 6 for Competent English, 7 for Proficient and 8 for Superior, for tests taken from 7 August 2025. Universities and registration bodies set their own scores.",
      },
      {
        q: "What IELTS score do doctors need in Australia?",
        a: "For registration, Ahpra's minimums for IELTS Academic taken from 23 April 2026 are 7 overall, 7 in Listening, Reading and Speaking, and 6.5 in Writing. General Training isn't accepted for registration. Check Ahpra's page for the full rules.",
      },
      {
        q: "Can I take an English speaking test with AI on XINGO?",
        a: "Not yet. An IELTS Speaking mock test with an AI examiner is coming soon. It will give an estimated band, not an official result, and XINGO isn't affiliated with IELTS.",
      },
    ],
    sources: [
      { label: "IELTS — Speaking test format", url: "https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-speaking" },
      { label: "IELTS — Speaking band descriptors (PDF)", url: "https://ielts.org/cdn/ielts-guides/ielts-speaking-band-descriptors.pdf" },
      { label: "Home Affairs — Proficient English", url: "https://immi.homeaffairs.gov.au/help-support/meeting-our-requirements/english-language/proficient-english" },
      { label: "Ahpra — Accepted English language tests", url: "https://www.ahpra.gov.au/Registration/Registration-Standards/English-language-skills/Accepted-English-language-tests.aspx" },
    ],
  },
  {
    slug: "amc-clinical-exam",
    shortName: "AMC Clinical",
    fullName: "Australian Medical Council Clinical Examination",
    body: "the Australian Medical Council",
    region: "Australia",
    moduleId: "amc-clinical-exam",
    goal: "amc",
    title: "AMC Clinical Exam Practice — 8-Minute AI Stations",
    metaDescription:
      "Practise AMC clinical stations out loud with an AI patient: histories, counselling and breaking bad news on an 8-minute timer, with examiner-style feedback.",
    headline: "Rehearse AMC stations with a patient who only tells you what you ask.",
    intro:
      "Read the stem, then run an eight-minute station with an AI simulated patient or relative who reveals key history only when asked, questions your jargon and reacts like a real person.",
    format: [
      { title: "16 assessed stations", body: "Each has 2 minutes' reading and 8 minutes for the tasks. There are also rest stations." },
      { title: "Station types", body: "History taking, examination, diagnostic formulation, and management, counselling or education." },
      { title: "Disciplines", body: "Adult medicine, surgery, women's health, child health and mental health, across community and hospital settings." },
      { title: "Global rating decides", body: "Each station has key steps, domain ratings and a global rating; you need to pass enough stations overall (AMC states the number)." },
      { title: "Online or in person", body: "Online stations have no hands-on examination — you describe your approach instead." },
    ],
    covered: [
      "History-taking, including third-party histories from a parent or relative",
      "Explaining diagnoses, counselling, breaking bad news and safety-netting",
      "Completing every task in the stem within eight minutes",
    ],
    notCovered: ["Physical examination technique", "Interpreting images, ECGs and charts", "An official AMC result — " + lowerFirst(commonLimits)],
    scenarios: [
      { title: "Fatigue in a 58-year-old", description: "Find the red flags and explain your differentials." },
      { title: "Toddler with fever and rash", description: "Third-party history and urgent management." },
      { title: "Pregnant on valproate", description: "Counsel without blame; don't stop abruptly." },
      { title: "Post-op delirium", description: "Explain delirium to an angry daughter." },
      { title: "Breaking bad news", description: "A likely pancreatic mass on CT." },
      { title: "Low mood — risk assessment", description: "Direct, compassionate suicide risk questions and a safety plan." },
    ],
    tips: [
      { title: "Do every task", body: "Not completing all tasks in the stem is the most common reason stations are failed." },
      { title: "Think out loud", body: "Explain your reasoning and plan in plain language the patient can follow." },
      { title: "Use Australian practice", body: "Management should follow Australian guidelines and services, with clear safety-netting and follow-up." },
    ],
    faqs: [
      { q: "Is this endorsed by the AMC?", a: "No. XINGO is independent; the stations are original practice scenarios." },
      { q: "Will XINGO cover examination stations?", a: "Not hands-on. When AMC practice opens, you'll be able to practise describing your approach, which suits the online format." },
      { q: "How long is each station?", a: "Eight minutes, timed, after you read the stem." },
    ],
    sources: [
      { label: "AMC — Clinical examination", url: "https://www.amc.org.au/assessment/clinical-exam/" },
      { label: "AMC — Clinical Examination Specifications (PDF)", url: "https://www.amc.org.au/wp-content/uploads/2025/04/2025-04-09-Clinical-Exam-Spec-V8.pdf" },
    ],
  },
  {
    slug: "nmba-osce",
    shortName: "NMBA OSCE",
    fullName: "NMBA Outcomes-Based Assessment — RN OSCE for internationally qualified nurses",
    body: "the Nursing and Midwifery Board of Australia (NMBA) and Ahpra",
    region: "Australia",
    moduleId: "nmba-osce-nursing",
    goal: "nmba_osce",
    title: "NMBA OSCE Practice — ISBAR & Communication Stations",
    metaDescription:
      "Practise the communication side of the NMBA OSCE for overseas nurses: ISBAR calls, handover, medication education, consent and upset relatives.",
    headline: "Practise the talking parts of the OSCE until they're second nature.",
    intro:
      "Escalate a deteriorating patient to a rushed doctor, hand over to a colleague, educate a nervous patient and calm an angry relative — in timed eight-minute stations with feedback.",
    format: [
      { title: "10 stations", body: "Each has 2 minutes' reading outside and 8 minutes to perform, with no prompting or feedback." },
      { title: "Who you'll meet", body: "Simulated patients or carers, manikins, and people playing another nurse or health professional." },
      { title: "What's assessed", body: "Assessment, care planning, care delivery and evaluation against the Registered Nurse Standards for Practice." },
      { title: "Communication everywhere", body: "Every station assesses how you identify patients, explain care, gain consent and communicate with the team (including ISBAR)." },
      { title: "In person", body: "Held in Australia. Check NMBA for venues, fees and whether a fast-track pathway applies to you." },
    ],
    covered: [
      "ISBAR escalation calls and bedside handover",
      "Patient education with teach-back, consent conversations",
      "De-escalating anxious or angry relatives; pain reassessment",
    ],
    notCovered: ["Hands-on clinical skills (injections, ANTT, BLS, IV)", "Documentation in the patient folder", "An official OSCE result — " + lowerFirst(commonLimits)],
    scenarios: [
      { title: "ISBAR call — deteriorating patient", description: "A rushed after-hours doctor asks 'what do you want me to do?'" },
      { title: "New anticoagulant education", description: "Apixaban, bleeding signs, supplements and teach-back." },
      { title: "Falls — angry daughter", description: "De-escalate and involve family in the plan." },
      { title: "Pain reassessment", description: "A stoic patient afraid of opioids." },
      { title: "Blood transfusion consent", description: "Beliefs, risks and when to escalate." },
      { title: "Bedside handover — hypo", description: "Accurate ISBAR with numbers and outstanding tasks." },
    ],
    tips: [
      { title: "Make a specific request", body: "End every escalation with exactly what you need and by when (e.g. 'review within 30 minutes')." },
      { title: "Identify and consent", body: "Check identity with two or three identifiers and gain consent before you start." },
      { title: "Use teach-back", body: "Ask the patient to explain the plan back in their own words." },
    ],
    faqs: [
      { q: "Is this endorsed by NMBA or Ahpra?", a: "No. XINGO is independent; stations are original practice scenarios." },
      { q: "Will XINGO cover clinical skills?", a: "No. When OSCE practice opens, voice practice will cover the communication in each station, which is assessed throughout." },
      { q: "Is it timed?", a: "Yes, eight minutes per station after reading your task." },
    ],
    sources: [
      { label: "NMBA — Objective structured clinical examination", url: "https://www.nursingmidwiferyboard.gov.au/Accreditation/IQNM/Examination/Objective-structured-clinical-exam.aspx" },
      { label: "NMBA — Registered nurses (OBA)", url: "https://www.nursingmidwiferyboard.gov.au/Accreditation/IQNM/Examination/Registered-nurses" },
    ],
  },
  {
    slug: "cmi-oral-exam",
    shortName: "CMI Oral Exam",
    fullName: "NBCMI Certified Medical Interpreter (CMI) oral exam",
    body: "the National Board of Certification for Medical Interpreters (NBCMI)",
    region: "United States",
    moduleId: "us-medical-interpreter-oral",
    goal: "us_medical_oral",
    title: "CMI Oral Exam Practice — Consecutive Role-Plays",
    metaDescription:
      "Practise for the NBCMI CMI oral exam: short consecutive medical role-plays in both directions across specialties, with feedback on accuracy and terminology.",
    headline: "Drill the CMI role-play section with short, fast medical exchanges.",
    intro:
      "The CMI oral exam's role-plays are brief clinician–patient exchanges across specialties, interpreted consecutively both ways. Practise that rhythm with an AI doctor and patient, then see exactly what you dropped.",
    format: [
      { title: "Sight translation first", body: "Two short English documents into your other language." },
      { title: "Consecutive role-plays", body: "Many short mini-scenarios, each a few utterances, interpreted in both directions with limited repeats." },
      { title: "Recorded and rated later", body: "Computer-based at a test centre or remotely proctored; raters score your recordings." },
      { title: "Five criteria", body: "Accuracy, listening & retention, grammar, interpreting style (first person, delivery) and terminology." },
      { title: "Languages", body: "The oral exam is offered in a limited set of languages — check NBCMI's current list." },
    ],
    covered: ["Short consecutive turns in both directions, first person", "Doses, numbers and drug names across specialties", "Feedback on omissions, additions and register"],
    notCovered: ["Sight translation", "Exam software conditions (think time, recorded prompts)", "An official CMI result — " + lowerFirst(commonLimits)],
    scenarios: [
      { title: "Endocrinology — new type 2 diabetes", description: "HbA1c, metformin dosing, hypoglycaemia." },
      { title: "OB/GYN — 28-week visit", description: "Glucose test, swelling, kick counts." },
      { title: "Emergency — chest pain", description: "Onset, radiation, aspirin, troponin." },
      { title: "Pediatrics — ear infection", description: "Weight-based dosing and a 10-day course." },
      { title: "Neurology — possible TIA", description: "MRI, clopidogrel and stroke warning signs." },
      { title: "Pharmacy — warfarin", description: "INR targets and food interactions." },
    ],
    tips: [
      { title: "Stay in first person", body: "Render 'I have pain', not 'she says she has pain'." },
      { title: "Every number counts", body: "Doses, dates and frequencies are where accuracy points are lost." },
      { title: "Don't stall on one word", body: "If a term won't come, convey the meaning and move on rather than freezing." },
    ],
    faqs: [
      { q: "Is XINGO affiliated with NBCMI?", a: "No. XINGO is independent practice software." },
      { q: "Can I practise for the CMI on XINGO?", a: "CMI-style practice is coming soon and will cover the consecutive role-play section, not sight translation. Today you can practise medical interpreting free with XINGO's emergency department course." },
      { q: "Which languages have a CMI oral exam?", a: "NBCMI offers the oral exam in a limited set of languages. Check NBCMI's current list before you plan." },
    ],
    sources: [
      { label: "NBCMI — Candidate Handbook (PDF)", url: "https://www.certifiedmedicalinterpreters.org/assets/docs/NBCMI_Handbook.pdf" },
      { label: "NBCMI — Oral exam preparation document (PDF)", url: "https://nbcmi.memberclicks.net/assets/docs/candidate-test-preparation-document-for-the-oral-exam.pdf" },
    ],
  },
  {
    slug: "cchi-oral-exam",
    shortName: "CCHI CHI Exam",
    fullName: "CCHI Certified Healthcare Interpreter (CHI™) oral performance exam",
    body: "the Certification Commission for Healthcare Interpreters (CCHI)",
    region: "United States",
    moduleId: "us-medical-interpreter-oral",
    goal: "us_medical_oral",
    title: "CHI Oral Exam (CCHI): Format, Scoring and Prep",
    metaDescription:
      "The CCHI CHI oral exam explained: four consecutive dialogues worth 70%, simultaneous and sight translation, 60 minutes, a pass score of 450, and how to prepare.",
    headline: "The CCHI CHI oral exam, explained.",
    intro:
      "The CHI™ oral performance exam is the spoken test healthcare interpreters of Spanish, Mandarin and Arabic take after passing CoreCHI™. It runs for 60 minutes at a US test centre, and four consecutive dialogues make up 70% of the score. Here's the format, how it's scored and how to prepare.",
    format: [
      { title: "Pass CoreCHI first", body: "You take the CHI after passing the CoreCHI™ knowledge exam, and must pass it within 12 months or your CoreCHI score expires." },
      { title: "Consecutive dialogues: 70%", body: "Four two-way provider–patient dialogues of 14–24 utterances, each up to 35 words. You can play each utterance up to twice." },
      { title: "Simultaneous: 17%", body: "Two passages of up to 2 minutes, one from each language, played once while you interpret." },
      { title: "Sight translation: 11%", body: "Three short English passages into your other language, plus one multiple-choice translation question (2%)." },
      { title: "60 minutes, in person", body: "Taken in a private room at a secure, proctored US test centre during quarterly testing windows. You answer through a headset and are recorded." },
      { title: "Scored 300–600, pass 450", body: "Two raters score each recording on lexical content and accuracy, grammar, and quality of speech. Raw scores are scaled, and 450 passes." },
      { title: "Languages", body: "CHI is offered in Spanish, Mandarin and Arabic. Interpreters of other languages can take CCHI's English-only ETOE™ exam for CoreCHI-Performance™. Check CCHI." },
    ],
    covered: ["Consecutive dialogue practice in both directions", "Terminology across common clinical settings", "Feedback on omissions, additions and register shifts"],
    notCovered: ["Simultaneous items", "Sight translation", "The English-only ETOE exam for CoreCHI-Performance", "An official CCHI result — " + lowerFirst(commonLimits)],
    scenarios: [
      { title: "Emergency — chest pain", description: "Fast, short exchanges with urgent register." },
      { title: "Pediatrics — fever and ear pain", description: "A parent, doses by weight and warning signs." },
      { title: "Pharmacy — warfarin", description: "Dosing schedule, INR checks, diet." },
      { title: "OB/GYN — prenatal visit", description: "Glucose testing and symptom review." },
      { title: "Neurology — possible TIA", description: "Symptoms, imaging and medication." },
      { title: "Endocrinology — new diabetes", description: "Lab values and medication changes." },
    ],
    tips: [
      { title: "Weight your practice", body: "Consecutive dialogues are 70% of the exam, so spend most of your practice on two-way provider–patient exchanges." },
      { title: "Hold up to 35 words", body: "Utterances run up to 35 words. Build memory for the longer turns so you don't summarise or drop details." },
      { title: "Keep the register", body: "Don't make the provider casual or the patient formal. Register shifts affect your accuracy rating." },
      { title: "Fewer false starts", body: "Pause briefly to plan, then deliver cleanly. Repeated self-repairs count against quality of speech." },
    ],
    faqs: [
      {
        q: "What is the CCHI CHI oral exam?",
        a: "It's the performance part of CCHI's Certified Healthcare Interpreter™ credential: a 60-minute recorded exam of consecutive, simultaneous and sight translation, taken after you pass the CoreCHI™ knowledge exam.",
      },
      { q: "Which languages is the CHI offered in?", a: "Spanish, Mandarin and Arabic at the time of writing. Interpreters of other languages can take the English-only ETOE™ exam for CoreCHI-Performance™. Check CCHI's site for the current list." },
      { q: "What is the passing score?", a: "CCHI scales raw scores to a range of 300 to 600, and 450 passes. Two raters score each recorded response on three equally weighted scales." },
      { q: "Can I take the CHI exam online?", a: "No. CCHI says the CHI is delivered only at a secure, proctored test centre in the US." },
      {
        q: "Can I practise for the CHI on XINGO?",
        a: "CHI-style practice is coming soon. Today you can practise medical interpreting free with XINGO's emergency department course: an English-speaking clinician and a patient who speaks your language, with scored feedback.",
      },
      { q: "Is XINGO affiliated with CCHI?", a: "No. XINGO is independent practice software." },
    ],
    sources: [
      { label: "CCHI — CHI exam description", url: "https://cchicertification.org/certifications/preparing/chi-description/" },
      { label: "CCHI — CHI scoring", url: "https://cchicertification.org/certifications/preparing/chi-score/" },
    ],
  },
];

export function getExamPage(slug: string) {
  return examPages.find((page) => page.slug === slug) ?? null;
}
