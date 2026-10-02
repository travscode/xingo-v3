/**
 * Australia content pack (Oct 2026): new modules and scenarios for the SEO
 * landing pages (NDIS, telephone interpreting, more CCL domains, medical, legal).
 *
 * Seeded with `npx convex run content:seedAustraliaPack '{"dryRun":true}'` —
 * insert-only, so admin edits to existing records are never overwritten.
 *
 * Authoring rules:
 * - Participant A is the English-speaking professional; participant B the client.
 * - Client text never names a language: the learner's language is applied at
 *   runtime (lib/ai.ts). `language: "Spanish"` is only the authored default.
 * - Use specific professional titles, never "Practitioner" (D-014).
 * - `endCondition` lists what the professional must collect before closing (D-013).
 */

type Difficulty = "beginner" | "intermediate" | "advanced";

type PackScenarioInput = {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  difficultyLevel: Difficulty;
  isFreePreview?: boolean;
  interpreterRole: string;
  briefing: string;
  assessmentFocus: string[];
  expectedSkills: string[];
  professional: {
    name: string;
    role: string;
    voice: string;
    goal: string;
    demeanor: string;
    openingLine: string;
    endCondition: string;
    context?: string;
  };
  client: {
    name: string;
    role: string;
    voice: string;
    goal: string;
    demeanor: string;
    openingLine: string;
    context?: string;
  };
};

function scenario(input: PackScenarioInput) {
  return {
    id: input.id,
    moduleId: input.moduleId,
    title: input.title,
    description: input.description,
    agentCount: 2 as const,
    difficultyLevel: input.difficultyLevel,
    isFreePreview: input.isFreePreview ?? false,
    expectedSkills: input.expectedSkills,
    aiAgentA: {
      name: input.professional.name,
      role: input.professional.role,
      voice: input.professional.voice,
      goal: input.professional.goal,
      language: "English",
      demeanor: input.professional.demeanor,
      openingLine: input.professional.openingLine,
      endCondition: input.professional.endCondition,
      instructions: [
        `You are ${input.professional.name}, a ${input.professional.role} in Australia, speaking to a client through a professional interpreter.`,
        input.professional.context ?? "",
        "Use plain Australian English, short turns (one to three sentences), and realistic details: names, dates, times, amounts and next steps.",
        "Ask one thing at a time. If an answer is unclear, ask a follow-up question rather than guessing.",
      ]
        .filter(Boolean)
        .join(" "),
    },
    aiAgentB: {
      name: input.client.name,
      role: input.client.role,
      voice: input.client.voice,
      goal: input.client.goal,
      language: "Spanish",
      demeanor: input.client.demeanor,
      openingLine: input.client.openingLine,
      instructions: [
        `You are ${input.client.name}, the ${input.client.role}. You do not speak English and rely entirely on the interpreter.`,
        input.client.context ?? "",
        "Answer only what you are asked, in short natural turns. Volunteer one realistic concern or question during the conversation. Never translate for anyone.",
      ]
        .filter(Boolean)
        .join(" "),
    },
    practiceRuntime: {
      interpreterRole: input.interpreterRole,
      sourceLanguage: "English",
      targetLanguage: "Spanish",
      openingSpeaker: "agent_a" as const,
      briefing: input.briefing,
      assessmentFocus: input.assessmentFocus,
    },
  };
}

export const packModules = [
  {
    id: "ndis-disability-services",
    title: "NDIS & Disability Services",
    description:
      "Interpret NDIS access, planning and review conversations: goals, daily living supports, funding categories and plan management, with the participant and their family.",
    industryCategory: "community" as const,
    durationMinutes: 30,
    difficultyLevel: "intermediate" as const,
    learningObjectives: [
      "Carry NDIS terms (participant, plan, supports, plan manager, review) accurately and consistently",
      "Relay goals and daily-living needs in the participant's own words",
      "Manage three-way meetings with a planner, participant and family member",
    ],
    isFree: false,
    isAccredited: false,
    badgeIcon: "NDIS",
    createdAt: "2026-10-02T00:00:00Z",
  },
  {
    id: "telephone-interpreting",
    title: "Telephone Interpreting",
    description:
      "Practise remote, audio-only interpreting: no body language, short turns, and calls to government services, clinics and utilities — the format used for most on-demand interpreting in Australia.",
    industryCategory: "community" as const,
    durationMinutes: 25,
    difficultyLevel: "intermediate" as const,
    learningObjectives: [
      "Open and manage a call professionally as a remote interpreter",
      "Hold numbers, reference IDs and dates accurately without visual cues",
      "Ask for repetition or clarification appropriately on the phone",
    ],
    isFree: false,
    isAccredited: false,
    badgeIcon: "Phone",
    createdAt: "2026-10-02T00:00:01Z",
  },
] as const;

export const packScenarios = [
  // ---- NDIS -------------------------------------------------------------------
  scenario({
    id: "ndis-planning-meeting",
    moduleId: "ndis-disability-services",
    title: "NDIS Planning Meeting",
    description:
      "An NDIA planner meets a new participant to discuss goals, daily routine and the supports they need for their first plan.",
    difficultyLevel: "intermediate",
    isFreePreview: true,
    interpreterRole: "Community interpreter (NDIS)",
    briefing:
      "First planning meeting. Carry goals and daily-living details faithfully, keep NDIS terms consistent, and interpret in the first person.",
    assessmentFocus: ["NDIS terminology", "Goals in the participant's own words", "Completeness of daily-living details"],
    expectedSkills: ["Terminology consistency", "First-person rendition", "Long-turn retention"],
    professional: {
      name: "Rebecca Taylor",
      role: "NDIA Planner",
      voice: "coral",
      goal: "Understand the participant's goals, daily routine, informal supports and the help they need, to build a first plan.",
      demeanor: "Warm, structured and patient",
      openingLine:
        "Thanks for coming in. Today I'd like to understand what a normal day looks like for you and what you'd like to be able to do in the next twelve months.",
      endCondition:
        "two personal goals, a description of a typical day, who currently helps them (informal supports), and whether they want their plan self-managed, plan-managed or NDIA-managed",
      context: "You work for the National Disability Insurance Agency and explain NDIS terms simply when asked.",
    },
    client: {
      name: "Daniel Ortiz",
      role: "NDIS participant with a spinal injury after a work accident",
      voice: "ash",
      goal: "Explain your daily challenges and get help with getting to appointments and returning to part-time work.",
      demeanor: "Polite, a little anxious about forms and money",
      openingLine:
        "Mornings are the hardest — my wife helps me shower and dress before she goes to work.",
      context: "You use a wheelchair, live with your wife and teenage son, and worry the plan will not cover transport.",
    },
  }),
  scenario({
    id: "ndis-plan-review",
    moduleId: "ndis-disability-services",
    title: "NDIS Plan Reassessment",
    description:
      "A local area coordinator reviews how a child's plan has been used and what has changed for the family.",
    difficultyLevel: "intermediate",
    interpreterRole: "Community interpreter (NDIS)",
    briefing:
      "Plan reassessment with a parent. Keep therapy names, hours and funding amounts exact; preserve the parent's concerns and tone.",
    assessmentFocus: ["Numbers and funding amounts", "Therapy terminology", "Register with a worried parent"],
    expectedSkills: ["Numbers accuracy", "Specialist terms", "Tone preservation"],
    professional: {
      name: "Michael Chen",
      role: "Local Area Coordinator",
      voice: "cedar",
      goal: "Find out how the current plan's therapy hours were used, what progress the child made, and what the family needs next.",
      demeanor: "Friendly, efficient, explains terms",
      openingLine:
        "Let's look at how the last twelve months went. Your son's plan had funding for speech therapy and occupational therapy — how many sessions did he manage to attend?",
      endCondition:
        "how many speech and occupational therapy sessions were used, one area of progress, one new concern, and whether the parent wants a change of providers",
    },
    client: {
      name: "Lucia Fernandes",
      role: "parent of a seven-year-old autistic child on the NDIS",
      voice: "shimmer",
      goal: "Explain that therapy helped but waiting lists meant missed sessions, and ask for more support at school.",
      demeanor: "Tired, determined, sometimes frustrated",
      openingLine:
        "We only managed about twenty speech sessions because the therapist had a long waiting list in the middle of the year.",
    },
  }),
  scenario({
    id: "ndis-support-coordinator-visit",
    moduleId: "ndis-disability-services",
    title: "Support Coordinator Home Visit",
    description:
      "A support coordinator visits an older participant to arrange in-home support workers and explain service agreements.",
    difficultyLevel: "beginner",
    interpreterRole: "Community interpreter (NDIS)",
    briefing:
      "Home visit. Relay schedules, provider names and the meaning of a service agreement clearly; check understanding without adding information.",
    assessmentFocus: ["Schedules and times", "Explaining agreements without adding content", "Clarification requests"],
    expectedSkills: ["Instruction transfer", "Clarification technique", "Plain-language delivery"],
    professional: {
      name: "Sarah O'Brien",
      role: "NDIS Support Coordinator",
      voice: "marin",
      goal: "Agree on support-worker days and times, explain the service agreement, and confirm the participant's consent.",
      demeanor: "Kind, clear, unhurried",
      openingLine:
        "I've found a provider who can send a support worker three mornings a week. Which days would suit you best?",
      endCondition:
        "the chosen days and times, whether a male or female worker is preferred, and the participant's agreement to sign the service agreement",
    },
    client: {
      name: "Rosa Alvarez",
      role: "NDIS participant with multiple sclerosis, living alone",
      voice: "sage",
      goal: "Arrange help with cleaning and shopping, ask for a female worker, and understand what you are signing.",
      demeanor: "Courteous, cautious about strangers in the house",
      openingLine: "Monday, Wednesday and Friday mornings are fine, but I would prefer a woman, please.",
    },
  }),

  // ---- Telephone interpreting -------------------------------------------------
  scenario({
    id: "phone-centrelink-payment-enquiry",
    moduleId: "telephone-interpreting",
    title: "Centrelink Payment Enquiry (Phone)",
    description:
      "A Services Australia officer handles a phone call about a reduced payment, income reporting and a debt notice.",
    difficultyLevel: "intermediate",
    isFreePreview: true,
    interpreterRole: "Telephone interpreter",
    briefing:
      "Audio-only call. Keep reference numbers, dates and dollar amounts exact. Ask for repetition rather than guessing a number.",
    assessmentFocus: ["Reference numbers and amounts", "Government terminology", "Remote turn management"],
    expectedSkills: ["Number retention", "Telephone etiquette", "Clarification on the phone"],
    professional: {
      name: "Jason Wright",
      role: "Services Australia Customer Service Officer",
      voice: "ash",
      goal: "Verify identity, explain why the payment dropped, and set up a repayment arrangement for a small debt.",
      demeanor: "Courteous, procedural, a little rushed",
      openingLine:
        "Thanks for calling. Before I can discuss the account, can I please get your customer reference number and date of birth?",
      endCondition:
        "identity verified, the reason for the reduced payment explained, the income amount the client reported, and an agreed fortnightly repayment amount",
      context: "Your call centre is busy; you speak a little fast and use terms like 'fortnight', 'income test' and 'debt notice'.",
    },
    client: {
      name: "Hoang Nguyen",
      role: "Centrelink JobSeeker recipient who works casual shifts",
      voice: "verse",
      goal: "Find out why your payment dropped by $180 and avoid paying back too much at once.",
      demeanor: "Worried, speaks quickly, sometimes interrupts",
      openingLine: "My payment this fortnight was a lot less, and then I got a letter saying I owe money. I don't understand why.",
      context: "Your customer reference number is 304 118 927K. You earned $640 last fortnight from casual work.",
    },
  }),
  scenario({
    id: "phone-gp-test-results",
    moduleId: "telephone-interpreting",
    title: "GP Test Results Call (Phone)",
    description:
      "A practice nurse phones a patient with blood test results and arranges a follow-up appointment and medication change.",
    difficultyLevel: "beginner",
    interpreterRole: "Telephone interpreter",
    briefing:
      "Phone call from a clinic. Medication names, doses and appointment times must be exact. Keep the nurse's reassuring tone.",
    assessmentFocus: ["Medication names and doses", "Appointment details", "Reassuring register"],
    expectedSkills: ["Medical terminology", "Detail accuracy", "Tone matching"],
    professional: {
      name: "Emma Collins",
      role: "Practice Nurse",
      voice: "coral",
      goal: "Explain that the cholesterol result is high, arrange a GP appointment and confirm the pharmacy for a new prescription.",
      demeanor: "Reassuring, clear, unhurried",
      openingLine:
        "Your blood test results are back. Nothing urgent, but your cholesterol is a bit high, so the doctor would like to see you next week.",
      endCondition: "a booked appointment time, the patient's preferred pharmacy, and confirmation they understood not to stop their current medication",
    },
    client: {
      name: "Marta Silva",
      role: "patient in her sixties",
      voice: "shimmer",
      goal: "Understand whether the result is serious and arrange an appointment around your grandchildren's school pick-up.",
      demeanor: "Anxious at first, then relieved",
      openingLine: "Is it serious? My husband had a heart attack two years ago.",
    },
  }),
  scenario({
    id: "phone-energy-hardship",
    moduleId: "telephone-interpreting",
    title: "Energy Bill Hardship Call (Phone)",
    description:
      "An energy retailer's hardship officer discusses an overdue bill, a payment plan and government concessions.",
    difficultyLevel: "intermediate",
    interpreterRole: "Telephone interpreter",
    briefing:
      "Consumer affairs call. Carry amounts, due dates and the conditions of the payment plan precisely.",
    assessmentFocus: ["Amounts and dates", "Consumer terms (concession, payment plan, disconnection)", "Completeness"],
    expectedSkills: ["Financial terminology", "Number retention", "Telephone turn-taking"],
    professional: {
      name: "Liam Murphy",
      role: "Energy Retailer Hardship Officer",
      voice: "cedar",
      goal: "Agree an affordable payment plan for an overdue $860 bill and check eligibility for a concession.",
      demeanor: "Patient, supportive, factual",
      openingLine:
        "I can see your account is $860 overdue. I want to help you avoid disconnection — can we talk about a payment plan you can afford?",
      endCondition: "an agreed fortnightly amount, the customer's concession card type if any, and confirmation they know the next due date",
    },
    client: {
      name: "Farida Haddad",
      role: "single mother of three on a low income",
      voice: "sage",
      goal: "Keep the power on, explain your income, and agree to a payment you can manage.",
      demeanor: "Embarrassed, polite, stressed",
      openingLine: "Please don't cut the power off — I have three children. I can maybe pay forty dollars a fortnight.",
      context: "You have a Health Care Card.",
    },
  }),

  // ---- More CCL domains ---------------------------------------------------------
  scenario({
    id: "ccl-car-insurance-claim",
    moduleId: "naati-certification-practice-ccl",
    title: "Car Insurance Claim",
    description: "An insurance claims officer takes details of a minor car accident in a shopping-centre car park.",
    difficultyLevel: "intermediate",
    interpreterRole: "NAATI CCL dialogue candidate",
    briefing: "CCL-style dialogue (Insurance). Keep the sequence of events, times and policy details exact.",
    assessmentFocus: ["Chronology", "Numbers and policy details", "Complete meaning transfer"],
    expectedSkills: ["Short-turn transfer", "Chronology", "Insurance terminology"],
    professional: {
      name: "Grace Kelly",
      role: "Insurance Claims Officer",
      voice: "marin",
      goal: "Record what happened, whether anyone was injured, the other driver's details and the excess payable.",
      demeanor: "Professional, methodical",
      openingLine: "I'm sorry to hear about the accident. Can you tell me where and when it happened?",
      endCondition: "the location and time, whether anyone was hurt, the other driver's registration number, and agreement to pay the $650 excess",
    },
    client: {
      name: "Ahmed Rahimi",
      role: "policyholder",
      voice: "ash",
      goal: "Report that another car reversed into you and find out whether you must pay the excess.",
      demeanor: "Frustrated, insists it wasn't their fault",
      openingLine: "It was on Saturday around two o'clock at the Westfield car park. Another car reversed into my door.",
    },
  }),
  scenario({
    id: "ccl-workplace-injury",
    moduleId: "naati-certification-practice-ccl",
    title: "Workplace Injury Claim",
    description: "A workers' compensation case manager discusses a warehouse back injury, time off work and a return-to-work plan.",
    difficultyLevel: "intermediate",
    interpreterRole: "NAATI CCL dialogue candidate",
    briefing: "CCL-style dialogue (Employment). Medical and workplace terms; keep hours and dates precise.",
    assessmentFocus: ["Employment and medical terms", "Dates and hours", "Register"],
    expectedSkills: ["Terminology", "Detail retention", "Natural delivery"],
    professional: {
      name: "Peter Walsh",
      role: "Workers' Compensation Case Manager",
      voice: "cedar",
      goal: "Confirm how the injury happened, the doctor's certificate, and agree suitable duties for a gradual return to work.",
      demeanor: "Supportive, practical",
      openingLine: "I've received your medical certificate. Can you tell me how the injury happened at the warehouse?",
      endCondition: "how and when the injury happened, the certificate end date, and the hours the worker agrees to start back on",
    },
    client: {
      name: "Ravi Kumar",
      role: "warehouse forklift operator",
      voice: "verse",
      goal: "Explain the injury, worry about losing your job, and agree to light duties only.",
      demeanor: "Worried about money, cooperative",
      openingLine: "I was lifting a box of tiles on the fourteenth of last month and felt something go in my lower back.",
    },
  }),
  scenario({
    id: "ccl-faulty-product-refund",
    moduleId: "naati-certification-practice-ccl",
    title: "Faulty Product Refund",
    description: "A store manager handles a refund request for a washing machine that broke within the warranty period.",
    difficultyLevel: "beginner",
    interpreterRole: "NAATI CCL dialogue candidate",
    briefing: "CCL-style dialogue (Consumer affairs). Keep dates, amounts and the customer's rights accurate.",
    assessmentFocus: ["Consumer terms (warranty, refund, repair)", "Amounts and dates", "Polite register"],
    expectedSkills: ["Short-turn transfer", "Numbers", "Register"],
    professional: {
      name: "Olivia Bennett",
      role: "Store Manager",
      voice: "coral",
      goal: "Check the receipt and fault, then offer a repair or replacement under Australian Consumer Law.",
      demeanor: "Polite, firm on store policy",
      openingLine: "I understand the washing machine has stopped working. When did you buy it, and do you have the receipt?",
      endCondition: "the purchase date and price, a description of the fault, and whether the customer chooses repair or replacement",
    },
    client: {
      name: "Elena Popescu",
      role: "customer",
      voice: "shimmer",
      goal: "Get a full refund for a machine that broke after five months.",
      demeanor: "Polite but determined",
      openingLine: "I bought it in May for $799 and it stopped spinning last week. I'd like my money back.",
    },
  }),
  scenario({
    id: "ccl-bank-home-loan",
    moduleId: "naati-certification-practice-ccl",
    title: "Bank Home Loan Enquiry",
    description: "A bank lending specialist explains deposits, repayments and documents for a first home loan.",
    difficultyLevel: "advanced",
    interpreterRole: "NAATI CCL dialogue candidate",
    briefing: "CCL-style dialogue (Finance). Large numbers, percentages and financial terms must be exact.",
    assessmentFocus: ["Large numbers and percentages", "Financial terminology", "Completeness"],
    expectedSkills: ["Number conversion", "Finance terms", "Accuracy under load"],
    professional: {
      name: "Andrew Mitchell",
      role: "Home Lending Specialist",
      voice: "ash",
      goal: "Explain deposit, repayments and the First Home Guarantee, and list the documents needed.",
      demeanor: "Professional, uses some jargon",
      openingLine:
        "For a $650,000 property you'd usually need a 20 percent deposit, but under the First Home Guarantee it can be as low as 5 percent.",
      endCondition: "the couple's combined income, their savings, and confirmation of which documents they will bring",
    },
    client: {
      name: "Wei Zhang",
      role: "first-home buyer",
      voice: "verse",
      goal: "Understand how much you can borrow and what the monthly repayments would be.",
      demeanor: "Careful, asks about numbers",
      openingLine: "We have saved about forty thousand dollars. Is that enough, and what would we pay each month?",
    },
  }),
  scenario({
    id: "ccl-council-business-permit",
    moduleId: "naati-certification-practice-ccl",
    title: "Council Food Business Permit",
    description: "A council officer explains registration, inspections and fees for a new food business.",
    difficultyLevel: "intermediate",
    interpreterRole: "NAATI CCL dialogue candidate",
    briefing: "CCL-style dialogue (Business). Requirements, fees and steps in the right order.",
    assessmentFocus: ["Business terminology", "Sequence of steps", "Fees and dates"],
    expectedSkills: ["Instruction transfer", "Chronology", "Terminology"],
    professional: {
      name: "Linda Harris",
      role: "Council Environmental Health Officer",
      voice: "marin",
      goal: "Explain food business registration, the inspection, the food safety supervisor requirement and the fee.",
      demeanor: "Helpful, procedural",
      openingLine:
        "Before you open, you need to register the business with council and have a certified food safety supervisor on staff.",
      endCondition: "the planned opening date, whether they have a food safety supervisor, and a booked inspection date",
    },
    client: {
      name: "Samir Aziz",
      role: "new café owner",
      voice: "cedar",
      goal: "Open your café within a month and understand the costs.",
      demeanor: "Eager, a bit impatient",
      openingLine: "I want to open on the first of next month. How much does the registration cost?",
    },
  }),
  scenario({
    id: "ccl-visa-document-query",
    moduleId: "naati-certification-practice-ccl",
    title: "Migration Agent Document Check",
    description: "A registered migration agent checks documents for a partner visa application.",
    difficultyLevel: "intermediate",
    interpreterRole: "NAATI CCL dialogue candidate",
    briefing: "CCL-style dialogue (Immigration). Document names, dates and relationship evidence.",
    assessmentFocus: ["Immigration terminology", "Dates", "Lists of documents"],
    expectedSkills: ["List retention", "Terminology", "Short-turn delivery"],
    professional: {
      name: "Karen Lee",
      role: "Registered Migration Agent",
      voice: "coral",
      goal: "Confirm the relationship history and the evidence the couple can provide.",
      demeanor: "Precise, reassuring",
      openingLine: "For the partner visa we need to show your relationship is genuine. When did you start living together?",
      endCondition: "the date they began living together, two types of evidence they have, and whether either has been married before",
    },
    client: {
      name: "Ana Torres",
      role: "partner visa applicant",
      voice: "shimmer",
      goal: "Understand which documents you need and how long the process takes.",
      demeanor: "Nervous, detailed",
      openingLine: "We moved in together in March 2024. We have a joint lease and a joint bank account.",
    },
  }),

  // ---- Medical -------------------------------------------------------------------
  scenario({
    id: "hospital-discharge-planning",
    moduleId: "medical-er-intake",
    title: "Hospital Discharge Planning",
    description: "A ward nurse explains discharge medications, wound care and follow-up after surgery.",
    difficultyLevel: "intermediate",
    interpreterRole: "Healthcare interpreter",
    briefing: "Discharge conversation. Medications, doses and warning signs must be complete and exact.",
    assessmentFocus: ["Medication names and doses", "Warning signs", "Follow-up instructions"],
    expectedSkills: ["Medical terminology", "Instruction transfer", "Completeness"],
    professional: {
      name: "Jessica Moore",
      role: "Ward Nurse",
      voice: "coral",
      goal: "Explain pain medication, wound care, warning signs and the follow-up clinic appointment.",
      demeanor: "Clear, kind, thorough",
      openingLine:
        "You're going home today. You'll take paracetamol every six hours and the antibiotic twice a day for five more days.",
      endCondition: "the patient repeating the medication schedule, two warning signs that mean returning to hospital, and the follow-up date",
    },
    client: {
      name: "Jorge Ramirez",
      role: "patient recovering from appendix surgery",
      voice: "ash",
      goal: "Understand the medicines and when you can return to work.",
      demeanor: "Tired, wants to go home",
      openingLine: "Can I go back to work on Monday? I drive a delivery truck.",
    },
  }),
  scenario({
    id: "pharmacy-medication-review",
    moduleId: "medical-er-intake",
    title: "Pharmacy Medication Review",
    description: "A pharmacist reviews an older patient's medicines, including a new blood thinner.",
    difficultyLevel: "beginner",
    interpreterRole: "Healthcare interpreter",
    briefing: "Community pharmacy. Medicine names, timings and interactions; keep the pharmacist's cautions intact.",
    assessmentFocus: ["Medicine names", "Timing and dosage", "Cautions and interactions"],
    expectedSkills: ["Terminology", "Detail retention", "Register"],
    professional: {
      name: "Thomas Nguyen",
      role: "Community Pharmacist",
      voice: "cedar",
      goal: "Check all current medicines, explain the new blood thinner and warn about bleeding and other medicines.",
      demeanor: "Careful, friendly",
      openingLine: "Your doctor has started you on a blood thinner called apixaban. Are you taking any other tablets or vitamins?",
      endCondition: "a list of the patient's other medicines, confirmation of the twice-daily timing, and that they know to avoid ibuprofen",
    },
    client: {
      name: "Carmen Diaz",
      role: "patient in her seventies",
      voice: "sage",
      goal: "Understand the new tablet and whether you can keep taking your arthritis medicine.",
      demeanor: "Polite, a little confused",
      openingLine: "I take a tablet for blood pressure in the morning, and sometimes ibuprofen for my knees.",
    },
  }),

  // ---- Legal & immigration --------------------------------------------------------
  scenario({
    id: "tribunal-visa-review-hearing",
    moduleId: "immigration-interviews",
    title: "Tribunal Visa Review Hearing",
    description: "A tribunal member questions an applicant about why a visa was refused and their circumstances in Australia.",
    difficultyLevel: "advanced",
    interpreterRole: "Legal interpreter (tribunal)",
    briefing:
      "Formal hearing. Interpret in the first person, keep register formal, and preserve hesitations and exact answers.",
    assessmentFocus: ["Formal register", "First-person interpreting", "Accuracy of testimony"],
    expectedSkills: ["Legal terminology", "Register control", "Faithful rendition"],
    professional: {
      name: "Member Davies",
      role: "Tribunal Member",
      voice: "ash",
      goal: "Understand the applicant's employment history and why documents were missing from the original application.",
      demeanor: "Formal, measured, neutral",
      openingLine:
        "This is a review of the decision to refuse your visa. Please explain why your employment reference was not included with your application.",
      endCondition: "the applicant's account of the missing reference, their current job and employer, and whether they have new evidence to submit",
      context: "You are a member of the Administrative Review Tribunal conducting a hearing.",
    },
    client: {
      name: "Javier Morales",
      role: "visa applicant seeking review",
      voice: "verse",
      goal: "Explain that your former employer closed down and you could not get a reference, and present new evidence.",
      demeanor: "Respectful, nervous, careful with words",
      openingLine: "The company I worked for closed in 2023 and the owner went back overseas, so I could not get a letter from him.",
    },
  }),
  scenario({
    id: "local-court-mention",
    moduleId: "courtroom-hearings",
    title: "Local Court Mention",
    description: "A duty lawyer explains a court mention, bail conditions and the next court date to a client.",
    difficultyLevel: "intermediate",
    interpreterRole: "Legal interpreter (court)",
    briefing: "Pre-court conference with a duty lawyer. Legal terms and conditions must be precise.",
    assessmentFocus: ["Legal terminology (mention, plea, bail conditions)", "Conditions and dates", "Register"],
    expectedSkills: ["Legal terms", "Condition lists", "Clarification"],
    professional: {
      name: "Rachel Stone",
      role: "Duty Lawyer",
      voice: "marin",
      goal: "Explain what a mention is, the bail conditions, and get instructions on how the client wants to plead.",
      demeanor: "Brisk, professional, kind",
      openingLine:
        "Today is only a mention — the magistrate won't decide guilt today. I need to know if you want to plead guilty or not guilty.",
      endCondition: "the client's plea instructions, confirmation they understand the three bail conditions, and the next court date",
    },
    client: {
      name: "Miguel Santos",
      role: "client charged with driving while unlicensed",
      voice: "cedar",
      goal: "Understand what will happen and whether you can keep driving for work.",
      demeanor: "Anxious, embarrassed",
      openingLine: "Will I go to jail? I need to drive to get to my job.",
    },
  }),
];
