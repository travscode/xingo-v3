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

export const examPages: ExamPage[] = [
  {
    slug: "oet-speaking",
    shortName: "OET Speaking",
    fullName: "Occupational English Test — Speaking sub-test",
    body: "OET (Cambridge Boxhill Language Assessment)",
    region: "Australia",
    moduleId: "oet-speaking-nursing",
    goal: "oet",
    title: "OET Speaking Practice — Nursing & Medicine Role-Plays with AI",
    metaDescription:
      "Practise OET Speaking role-plays out loud with an AI patient. Nursing and medicine task cards, 5-minute timer, feedback on OET's clinical communication and language criteria. AHPRA needs 360.",
    headline: "Practise OET Speaking role-plays with a patient who talks back.",
    intro:
      "Read your task card, then run a timed five-minute role-play with an AI patient or relative who is anxious, reluctant or confused — just like the interlocutor. Get feedback on the criteria assessors actually use.",
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
      "An official OET score — " + commonLimits.toLowerCase(),
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
      { q: "Is this the official OET?", a: "No. XINGO is independent practice software with original role-play cards modelled on the public format." },
      { q: "Which professions are covered?", a: "Nursing and Medicine today. Tell us which profession you need next." },
      { q: "Can it score my pronunciation?", a: "Not reliably — feedback is based on what you said, so intelligibility isn't assessed. Everything else on the card is." },
      { q: "How long is each role-play?", a: "Five minutes, timed. Read your card first; it stays on screen during the role-play." },
    ],
    sources: [
      { label: "OET — Speaking test information", url: "https://oet.com/test-information/speaking/" },
      { label: "OET — Speaking criteria overview", url: "https://oet.com/en-us/post/speaking-criteria-overview" },
      { label: "AHPRA — Accepted English language tests", url: "https://www.ahpra.gov.au/Registration/Registration-Standards/English-language-skills/Accepted-English-language-tests.aspx" },
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
    title: "IELTS Speaking Mock Test Online — AI Examiner with Estimated Band",
    metaDescription:
      "Take a full IELTS Speaking mock test out loud with an AI examiner: Part 1 interview, Part 2 cue card, Part 3 discussion. Timed like the real test, with an estimated band and feedback.",
    headline: "A full IELTS Speaking mock test, any time you need one.",
    intro:
      "An AI examiner runs all three parts on the real timings and never helps you out — then you get an estimated band and specific feedback on fluency, vocabulary and grammar.",
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
    notCovered: ["Pronunciation (a quarter of the real band) — the estimate leaves it out", "An official band score — " + commonLimits.toLowerCase()],
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
      { q: "Is the band accurate?", a: "It's an estimate based on three of the four criteria from your transcript. Pronunciation isn't included." },
      { q: "Is this the same for Academic and General Training?", a: "Yes — the Speaking test is the same for both." },
      { q: "What band do I need in Australia?", a: "It depends on your visa, university or registration body. Check the official requirement for your pathway." },
      { q: "Does the examiner give feedback?", a: "Not during the test — just like the real thing. You get detailed feedback afterwards." },
    ],
    sources: [
      { label: "IELTS — Speaking test format", url: "https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-speaking" },
      { label: "IELTS — Speaking band descriptors (PDF)", url: "https://ielts.org/cdn/ielts-guides/ielts-speaking-band-descriptors.pdf" },
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
    title: "AMC Clinical Exam Practice — 8-Minute Stations with an AI Patient",
    metaDescription:
      "Practise AMC clinical exam stations out loud: focused histories, counselling, breaking bad news and explaining management with an AI simulated patient. 8-minute timer, examiner-style feedback.",
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
    notCovered: ["Physical examination technique", "Interpreting images, ECGs and charts", "An official AMC result — " + commonLimits.toLowerCase()],
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
      { q: "Can I practise examination stations?", a: "Not hands-on. You can practise describing your approach, which suits the online format." },
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
    title: "NMBA OSCE Practice for Overseas Nurses — ISBAR & Communication Stations",
    metaDescription:
      "Practise the communication side of the NMBA RN OSCE: ISBAR calls to a doctor, bedside handover, medication education, consent and angry relatives. 8-minute stations with an AI patient or colleague.",
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
    notCovered: ["Hands-on clinical skills (injections, ANTT, BLS, IV)", "Documentation in the patient folder", "An official OSCE result — " + commonLimits.toLowerCase()],
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
      { q: "Can I practise clinical skills?", a: "No — voice practice covers the communication in each station, which is assessed throughout." },
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
    title: "CMI Oral Exam Practice — Consecutive Medical Role-Plays with AI",
    metaDescription:
      "Practise for the NBCMI CMI oral exam: short, fast consecutive medical role-plays in both directions across specialties, with feedback on accuracy, terminology and completeness.",
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
    notCovered: ["Sight translation", "Exam software conditions (think time, recorded prompts)", "An official CMI result — " + commonLimits.toLowerCase()],
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
      { q: "Does this cover sight translation?", a: "Not yet — XINGO covers the consecutive role-play section." },
      { q: "Can I practise in my language?", a: "Choose any language; the clinician always speaks English. Check NBCMI for which languages have an oral exam." },
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
    title: "CCHI CHI Oral Exam Practice — Consecutive Healthcare Interpreting with AI",
    metaDescription:
      "Practise the consecutive dialogue section of the CCHI CHI oral exam with AI provider–patient role-plays: short turns both ways, terminology, register and accuracy feedback.",
    headline: "Practise the biggest section of the CHI exam: consecutive dialogues.",
    intro:
      "Consecutive dialogue vignettes make up most of the CHI performance exam. Practise short provider–patient turns in both directions and get feedback on lexical accuracy, grammar and quality of speech.",
    format: [
      { title: "Consecutive vignettes", body: "Dialogue vignettes interpreted in both directions — the largest share of the exam score." },
      { title: "Simultaneous and sight", body: "Short simultaneous items and English-to-other-language sight translation are also included." },
      { title: "Recorded prompts", body: "Computer-based with recorded audio, taken at a proctored test centre." },
      { title: "Three scales", body: "Lexical content & accuracy, grammar, and quality of speech, rated by trained raters." },
      { title: "Languages", body: "The CHI oral exam is offered in a small set of languages; other languages take CoreCHI-Performance. Check CCHI." },
    ],
    covered: ["Consecutive dialogue practice in both directions", "Terminology across common clinical settings", "Feedback on omissions, additions and register shifts"],
    notCovered: ["Simultaneous items", "Sight translation", "The English-only ETOE exam for CoreCHI-Performance", "An official CCHI result — " + commonLimits.toLowerCase()],
    scenarios: [
      { title: "Emergency — chest pain", description: "Fast, short exchanges with urgent register." },
      { title: "Pediatrics — fever and ear pain", description: "A parent, doses by weight and warning signs." },
      { title: "Pharmacy — warfarin", description: "Dosing schedule, INR checks, diet." },
      { title: "OB/GYN — prenatal visit", description: "Glucose testing and symptom review." },
      { title: "Neurology — possible TIA", description: "Symptoms, imaging and medication." },
      { title: "Endocrinology — new diabetes", description: "Lab values and medication changes." },
    ],
    tips: [
      { title: "Keep the register", body: "Don't make the provider casual or the patient formal — register shifts cost points." },
      { title: "Fewer false starts", body: "Pause briefly to plan, then deliver cleanly; repeated self-repairs count against quality of speech." },
      { title: "Hold up to ~35 words", body: "Build memory for longer turns so you don't summarise." },
    ],
    faqs: [
      { q: "Is XINGO affiliated with CCHI?", a: "No. XINGO is independent practice software." },
      { q: "Does this cover simultaneous and sight translation?", a: "Not yet — XINGO covers the consecutive dialogue section." },
      { q: "Is it useful for CoreCHI-Performance?", a: "Partly. The ETOE is an English-only exam with different tasks; dialogue practice builds general skills." },
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
