const demoAssessment = {
  overallScore: 82,
  summary:
    "Strong command of the encounter with a few moments where terminology or pacing softened the original emphasis.",
  strengths: [
    "Preserved the core medical concern and timeline accurately",
    "Maintained calm turn-taking under pressure",
    "Handled clarification prompts cleanly",
  ],
  improvementAreas: [
    "Carry medication details with tighter precision",
    "Keep long explanations segmented into shorter relays",
  ],
  recommendedNextStep:
    "Repeat the scenario once more and focus on dosage, chronology, and escalation language.",
  completionDecision: "completed" as const,
  breakdown: {
    accuracy: 84,
    terminology: 79,
    fluency: 83,
    turnManagement: 81,
    professionalism: 85,
  },
} satisfies {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvementAreas: string[];
  recommendedNextStep: string;
  completionDecision: "completed" | "needs_review";
  breakdown: {
    accuracy: number;
    terminology: number;
    fluency: number;
    turnManagement: number;
    professionalism: number;
  };
};

function buildTranscript(
  lines: Array<{
    speaker: string;
    text: string;
    role: "assistant" | "user" | "system";
  }>,
  baseTimestamp: string,
) {
  const startedAt = new Date(baseTimestamp).getTime();

  return lines.map((line, index) => ({
    id: `line_${index + 1}`,
    speaker: line.speaker,
    text: line.text,
    role: line.role,
    createdAt: new Date(startedAt + index * 14_000).toISOString(),
  }));
}

export const seedOrganizations = [
  {
    id: "org_community_language_hub",
    name: "Community Language Hub",
    ownerId: "platform",
    createdAt: "2026-03-01T00:00:00Z",
  },
] as const;

export const seedModules = [
  {
    id: "medical-er-intake",
    title: "Medical ER Intake",
    description:
      "Practice triage conversations with urgent symptoms, medication checks, and family context.",
    industryCategory: "medical",
    durationMinutes: 28,
    difficultyLevel: "intermediate",
    learningObjectives: [
      "Interpret symptom descriptions with precision",
      "Preserve clinical urgency and medication details",
      "Handle rapid turn-taking under stress",
    ],
    isFree: true,
    isAccredited: true,
    accreditationProvider: "Community Health Language Network",
    badgeIcon: "Medical Distinction",
    createdAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "courtroom-hearings",
    title: "Courtroom Hearings",
    description:
      "Run through bail hearings, judicial instructions, and procedural terminology.",
    industryCategory: "legal",
    durationMinutes: 34,
    difficultyLevel: "advanced",
    learningObjectives: [
      "Maintain register in formal legal settings",
      "Handle interruptions and clarifications cleanly",
      "Track dates, obligations, and legal outcomes",
    ],
    isFree: false,
    isAccredited: true,
    accreditationProvider: "National Interpreter Accreditation Board",
    badgeIcon: "Court Certified",
    createdAt: "2026-03-04T00:00:00Z",
  },
  {
    id: "immigration-interviews",
    title: "Immigration Interviews",
    description:
      "Navigate high-stakes interviews involving timelines, documents, and trauma-aware questioning.",
    industryCategory: "immigration",
    durationMinutes: 31,
    difficultyLevel: "advanced",
    learningObjectives: [
      "Protect meaning in long narrative answers",
      "Maintain consistency across dates and locations",
      "Use neutral delivery in emotionally loaded exchanges",
    ],
    isFree: false,
    isAccredited: false,
    badgeIcon: "Casework Ready",
    createdAt: "2026-03-08T00:00:00Z",
  },
  {
    id: "community-services",
    title: "Community Services Intake",
    description:
      "Train for housing, benefits, and social support appointments with diverse speaker styles.",
    industryCategory: "community",
    durationMinutes: 24,
    difficultyLevel: "beginner",
    learningObjectives: [
      "Control pacing for first-time learners",
      "Clarify names, addresses, and references",
      "Build confidence in public service settings",
    ],
    isFree: true,
    isAccredited: false,
    badgeIcon: "Starter Pathway",
    createdAt: "2026-03-10T00:00:00Z",
  },
  {
    id: "naati-certification-practice-cpi",
    title: "NAATI Certification Practice CPI",
    description:
      "This module introduces the NAATI Certified Provisional Interpreter (CPI) credential as an entry-level generalist pathway. It focuses on the foundational competencies expected of early-career interpreters in everyday community settings, including accuracy, role boundaries, clarification, and professional conduct.",
    industryCategory: "community",
    durationMinutes: 32,
    difficultyLevel: "beginner",
    learningObjectives: [
      "Understand the entry-level expectations of the CPI credential in generalist settings",
      "Practice accurate transfer of meaning, key details, and speaker intent in short consecutive dialogue",
      "Use introductions, clarification, and turn management strategies appropriate for early-career interpreters",
    ],
    isFree: false,
    isAccredited: false,
    badgeIcon: "CPI Practice Path",
    createdAt: "2026-06-29T00:00:00Z",
  },
  {
    id: "naati-certification-practice-ccl",
    title: "NAATI Certification Practice CCL",
    description:
      "This module is built around the NAATI Credentialed Community Language (CCL) test. It helps learners practice short bilingual community dialogues between an English speaker and a Language Other Than English speaker in settings such as health, education, housing, legal services, and public services.",
    industryCategory: "community",
    durationMinutes: 30,
    difficultyLevel: "intermediate",
    learningObjectives: [
      "Practice short two-speaker dialogue exchanges similar to the NAATI CCL test format",
      "Retain key information such as names, dates, instructions, and service details across both languages",
      "Build confidence in accurate, complete, and natural community-language transfer under time pressure",
    ],
    isFree: false,
    isAccredited: false,
    badgeIcon: "CCL Practice Path",
    createdAt: "2026-06-29T00:00:00Z",
  },
] as const;

export const seedScenarios = [
  {
    id: "er-triage",
    moduleId: "medical-er-intake",
    title: "Emergency Room Triage",
    description:
      "A practitioner assesses chest pain, prior medication use, and symptom onset while the patient is distressed.",
    aiAgentA: {
      name: "Callum Wallace",
      role: "Practitioner",
      voice: "cedar",
      goal: "Extract symptom details, confirm urgency, and recommend a safe next step.",
      language: "English",
      demeanor: "Calm, procedural, and reassuring",
      instructions:
        "You are a clinical practitioner taking an urgent intake call through an interpreter. Use short, direct turns, ask structured questions, and speak only in English.",
      openingLine:
        "Hello, I am the practitioner on duty. Please let the caller know I need to ask a few questions about the chest pain.",
    },
    aiAgentB: {
      name: "Rosita Sanchez",
      role: "Patient",
      voice: "sage",
      goal: "Explain the symptoms, prior medication, and level of distress without acting like an interpreter.",
      language: "Spanish",
      demeanor: "Anxious, cooperative, and worried about the situation",
      instructions:
        "You are a Spanish-speaking patient speaking through an interpreter. Never translate for anyone else, never speak English, and only answer what the interpreter tells you.",
      openingLine:
        "Me duele mucho el pecho desde hace como una hora y me cuesta respirar cuando camino.",
    },
    practiceRuntime: {
      interpreterRole: "Consecutive medical interpreter",
      sourceLanguage: "English",
      targetLanguage: "Spanish",
      openingSpeaker: "agent_a",
      briefing:
        "The interpreter is assisting an urgent medical triage call. Preserve symptom chronology, medication details, and escalation advice exactly.",
      assessmentFocus: [
        "Medical terminology",
        "Symptom chronology",
        "Medication and dosage details",
        "Urgency and escalation language",
      ],
    },
    expectedSkills: [
      "Medical terminology",
      "Clarification control",
      "Latency management",
    ],
    difficultyLevel: "intermediate",
  },
  {
    id: "pediatric-consult",
    moduleId: "medical-er-intake",
    title: "Pediatric Consultation",
    description:
      "A pediatrician and caregiver discuss fever history, dosage timing, and allergy risk.",
    aiAgentA: {
      name: "Dr. Claire Morgan",
      role: "Pediatrician",
      voice: "cedar",
      goal: "Confirm dosage, allergy triggers, and escalation signs in a child health consult.",
      language: "English",
      demeanor: "Warm, structured, and precise",
      instructions:
        "You are a pediatrician speaking through an interpreter. Keep questions concise and verify time, dosage, and allergy information carefully.",
      openingLine:
        "Thanks for joining the consultation. Please ask the parent when the fever started and what medication has already been given.",
    },
    aiAgentB: {
      name: "Lucia Fernandez",
      role: "Parent",
      voice: "sage",
      goal: "Describe the child’s symptoms, temperature changes, and prior dosing clearly.",
      language: "Spanish",
      demeanor: "Protective, tired, and detail-heavy",
      instructions:
        "You are a Spanish-speaking parent in a pediatric consult. Only speak in Spanish and respond as the caregiver, never as the interpreter.",
      openingLine:
        "Mi hija tiene fiebre desde anoche y le di una dosis de paracetamol hace dos horas.",
    },
    practiceRuntime: {
      interpreterRole: "Consecutive medical interpreter",
      sourceLanguage: "English",
      targetLanguage: "Spanish",
      openingSpeaker: "agent_a",
      briefing:
        "The interpreter is supporting a pediatric consult where timing, dosage, and allergy details matter.",
      assessmentFocus: [
        "Medication accuracy",
        "Chronology tracking",
        "Family communication tone",
      ],
    },
    expectedSkills: [
      "Medication accuracy",
      "Chronology tracking",
      "Family communication",
    ],
    difficultyLevel: "beginner",
  },
  {
    id: "bail-hearing",
    moduleId: "courtroom-hearings",
    title: "Bail Hearing",
    description:
      "A magistrate and defendant review prior appearances, risk factors, and release conditions.",
    aiAgentA: {
      name: "Magistrate Reid",
      role: "Magistrate",
      voice: "cedar",
      goal: "State the hearing issues, test understanding, and issue conditions in formal register.",
      language: "English",
      demeanor: "Direct, formal, and procedural",
      instructions:
        "You are a magistrate addressing a defendant through an interpreter. Use formal legal language in short segments and expect the interpreter to relay each part.",
      openingLine:
        "We are here to consider bail today. Please inform the defendant that I will review the prosecution concerns before making any decision.",
    },
    aiAgentB: {
      name: "Miguel Alvarez",
      role: "Defendant",
      voice: "sage",
      goal: "Respond to the allegations, confirm facts, and react to conditions without summarising others.",
      language: "Spanish",
      demeanor: "Guarded, tense, and reactive",
      instructions:
        "You are a Spanish-speaking defendant in court. Reply only as yourself, in Spanish, and never translate or summarise what others say.",
      openingLine:
        "Entiendo que estoy aquí por la fianza, pero quiero explicar que tengo trabajo y domicilio fijo.",
    },
    practiceRuntime: {
      interpreterRole: "Consecutive legal interpreter",
      sourceLanguage: "English",
      targetLanguage: "Spanish",
      openingSpeaker: "agent_a",
      briefing:
        "The interpreter must preserve legal register, conditions, dates, and risk language without simplification.",
      assessmentFocus: [
        "Formal legal register",
        "Conditional phrasing",
        "Dates and obligations",
        "Neutral delivery",
      ],
    },
    expectedSkills: [
      "Legal register",
      "Conditional phrasing",
      "Formal tone retention",
    ],
    difficultyLevel: "advanced",
  },
  {
    id: "visa-interview",
    moduleId: "immigration-interviews",
    title: "Visa Eligibility Interview",
    description:
      "An officer reviews travel history, supporting documents, and timeline consistency.",
    aiAgentA: {
      name: "Officer James Wu",
      role: "Case Officer",
      voice: "cedar",
      goal: "Test credibility through detailed, chronological questioning.",
      language: "English",
      demeanor: "Measured, skeptical, and methodical",
      instructions:
        "You are a case officer interviewing an applicant through an interpreter. Ask clear follow-up questions and focus on documents, dates, and consistency.",
      openingLine:
        "Please let the applicant know I will ask several questions about travel dates, supporting evidence, and the purpose of the application.",
    },
    aiAgentB: {
      name: "Ana Torres",
      role: "Applicant",
      voice: "sage",
      goal: "Explain purpose, evidence, and chronology while staying in character as the applicant.",
      language: "Spanish",
      demeanor: "Respectful, careful, and tense",
      instructions:
        "You are a Spanish-speaking visa applicant. Answer only the interpreter's questions, in Spanish, and never act as an interpreter yourself.",
      openingLine:
        "Vine para reunirme con mi hermana y tengo conmigo los documentos del patrocinio y mis fechas de viaje.",
    },
    practiceRuntime: {
      interpreterRole: "Consecutive immigration interpreter",
      sourceLanguage: "English",
      targetLanguage: "Spanish",
      openingSpeaker: "agent_a",
      briefing:
        "This interview tests chronology, document terminology, and emotional neutrality under sustained questioning.",
      assessmentFocus: [
        "Timeline fidelity",
        "Document terminology",
        "Neutral delivery",
        "Long-answer management",
      ],
    },
    expectedSkills: [
      "Timeline fidelity",
      "Document terminology",
      "Neutral delivery",
    ],
    difficultyLevel: "advanced",
  },
  {
    id: "housing-assessment",
    moduleId: "community-services",
    title: "Housing Support Assessment",
    description:
      "A case worker reviews tenancy risk, household makeup, and next-step referrals.",
    aiAgentA: {
      name: "Maya Collins",
      role: "Case Worker",
      voice: "shimmer",
      goal: "Collect facts, assess urgency, and explain available support pathways.",
      language: "English",
      demeanor: "Empathetic, methodical, and clear",
      instructions:
        "You are a housing support case worker speaking through an interpreter. Use accessible language, gather the facts, and explain next steps clearly.",
      openingLine:
        "Please ask the resident to describe the current housing issue and whether there is any immediate safety risk in the home.",
    },
    aiAgentB: {
      name: "Sofia Herrera",
      role: "Resident",
      voice: "sage",
      goal: "Explain current circumstances, tenancy risk, and urgent household needs.",
      language: "Spanish",
      demeanor: "Tired, cooperative, and worried about stability",
      instructions:
        "You are a Spanish-speaking resident seeking housing support. Speak only in Spanish and answer as the resident, not as an interpreter.",
      openingLine:
        "Recibi un aviso del propietario y no se si mi familia va a poder quedarse en el apartamento este mes.",
    },
    practiceRuntime: {
      interpreterRole: "Consecutive community interpreter",
      sourceLanguage: "English",
      targetLanguage: "Spanish",
      openingSpeaker: "agent_a",
      briefing:
        "The interpreter is navigating a community services intake where names, addresses, and service explanations need to stay clear.",
      assessmentFocus: [
        "Plain-language delivery",
        "Address and identity accuracy",
        "Empathy without drift",
      ],
    },
    expectedSkills: [
      "Plain-language delivery",
      "Address accuracy",
      "Empathy without drift",
    ],
    difficultyLevel: "beginner",
  },
  {
    id: "cpi-gp-clinic-registration",
    moduleId: "naati-certification-practice-cpi",
    title: "GP Clinic Registration Desk",
    description:
      "A clinic receptionist confirms identity details, Medicare information, and the reason for a same-day appointment.",
    aiAgentA: {
      name: "Emma Brooks",
      role: "Receptionist",
      voice: "shimmer",
      goal: "Collect the patient's registration details, verify documents, and explain the appointment process clearly.",
      language: "English",
      demeanor: "Polite, efficient, and structured",
      instructions:
        "You are a clinic receptionist speaking through an interpreter. Use short community-facing turns, confirm names, dates of birth, and document details, and speak only in English.",
      openingLine:
        "Good morning. Please ask the patient for their full name, date of birth, and whether they have their Medicare card with them.",
    },
    aiAgentB: {
      name: "Carlos Mendez",
      role: "Patient",
      voice: "sage",
      goal: "Provide personal details, explain the need for the appointment, and ask practical follow-up questions.",
      language: "Spanish",
      demeanor: "Respectful, slightly nervous, and cooperative",
      instructions:
        "You are a Spanish-speaking patient at a GP clinic. Speak only in Spanish, answer as the patient, and never translate for anyone else.",
      openingLine:
        "Buenos dias. Tengo cita hoy porque llevo varios dias con dolor de garganta y fiebre.",
    },
    practiceRuntime: {
      interpreterRole: "Consecutive dialogue interpreter",
      sourceLanguage: "English",
      targetLanguage: "Spanish",
      openingSpeaker: "agent_a",
      briefing:
        "This CPI practice scenario focuses on introductions, identity details, document checking, and clear turn-by-turn delivery in a routine health setting.",
      assessmentFocus: [
        "Name and date accuracy",
        "Role boundaries and first-person delivery",
        "Clarification technique",
        "Turn management in short dialogue",
      ],
    },
    expectedSkills: [
      "Accurate transfer of personal details",
      "Professional introductions",
      "Short-turn consecutive delivery",
    ],
    difficultyLevel: "beginner",
  },
  {
    id: "cpi-school-enrolment-meeting",
    moduleId: "naati-certification-practice-cpi",
    title: "School Enrolment Meeting",
    description:
      "A school administration officer reviews enrolment documents, emergency contacts, and a child's allergy information with a parent.",
    aiAgentA: {
      name: "Rachel Ng",
      role: "School Administration Officer",
      voice: "marin",
      goal: "Check the enrolment paperwork, confirm contact details, and explain the next steps for school entry.",
      language: "English",
      demeanor: "Friendly, organized, and patient",
      instructions:
        "You are a school administration officer speaking through an interpreter. Use plain language, ask one question at a time, and confirm addresses, phone numbers, and school documents clearly.",
      openingLine:
        "Thanks for coming in. Please ask the parent if they brought the child's passport, immunisation record, and proof of address.",
    },
    aiAgentB: {
      name: "Lucia Herrera",
      role: "Parent",
      voice: "sage",
      goal: "Provide the child's details, clarify missing documents, and explain the allergy information accurately.",
      language: "Spanish",
      demeanor: "Prepared, caring, and slightly unsure about the process",
      instructions:
        "You are a Spanish-speaking parent enrolling your child at school. Speak only in Spanish, respond as the parent, and do not interpret for anyone else.",
      openingLine:
        "Traje el pasaporte y el comprobante de domicilio, pero no estoy segura si falta algun otro documento.",
    },
    practiceRuntime: {
      interpreterRole: "Consecutive dialogue interpreter",
      sourceLanguage: "English",
      targetLanguage: "Spanish",
      openingSpeaker: "agent_a",
      briefing:
        "This scenario trains CPI candidates to manage everyday education dialogue with accurate document terms, contact details, and allergy information.",
      assessmentFocus: [
        "Document and school terminology",
        "Phone number and address accuracy",
        "Managing clarifications appropriately",
        "Maintaining a calm community register",
      ],
    },
    expectedSkills: [
      "Plain-language interpreting",
      "Document terminology",
      "Detail retention for contacts and allergies",
    ],
    difficultyLevel: "beginner",
  },
  {
    id: "cpi-rental-repair-request",
    moduleId: "naati-certification-practice-cpi",
    title: "Rental Property Repair Request",
    description:
      "A property manager discusses a leaking kitchen pipe, access for repairs, and the expected attendance window with a tenant.",
    aiAgentA: {
      name: "Daniel Price",
      role: "Property Manager",
      voice: "cedar",
      goal: "Understand the maintenance problem, assess urgency, and arrange access for a tradesperson.",
      language: "English",
      demeanor: "Practical, direct, and courteous",
      instructions:
        "You are a property manager speaking through an interpreter. Keep the conversation practical, confirm dates and access times, and speak only in English.",
      openingLine:
        "Please ask the tenant when the leak started, whether the water has damaged anything, and if someone can be home tomorrow morning.",
    },
    aiAgentB: {
      name: "Mariana Lopez",
      role: "Tenant",
      voice: "nova",
      goal: "Explain the problem clearly, describe the damage, and negotiate a suitable time for access.",
      language: "Spanish",
      demeanor: "Concerned, practical, and cooperative",
      instructions:
        "You are a Spanish-speaking tenant reporting a repair issue. Speak only in Spanish, answer as the tenant, and never translate for the other speaker.",
      openingLine:
        "La fuga empezo anoche debajo del fregadero y ahora tambien esta mojando el armario de la cocina.",
    },
    practiceRuntime: {
      interpreterRole: "Consecutive dialogue interpreter",
      sourceLanguage: "English",
      targetLanguage: "Spanish",
      openingSpeaker: "agent_a",
      briefing:
        "This CPI practice scenario develops control over everyday housing vocabulary, time references, and clear delivery of practical instructions.",
      assessmentFocus: [
        "Chronology and damage details",
        "Time and availability accuracy",
        "Neutral delivery of instructions",
        "Managing short problem-solving turns",
      ],
    },
    expectedSkills: [
      "Everyday housing terminology",
      "Time-reference accuracy",
      "Instruction transfer",
    ],
    difficultyLevel: "beginner",
  },
  {
    id: "cpi-employment-services-intake",
    moduleId: "naati-certification-practice-cpi",
    title: "Employment Services Intake",
    description:
      "An employment consultant asks about work history, current barriers, and attendance obligations for upcoming appointments.",
    aiAgentA: {
      name: "Nathan Cole",
      role: "Employment Consultant",
      voice: "ash",
      goal: "Assess the client's work readiness, identify support needs, and explain the program requirements.",
      language: "English",
      demeanor: "Supportive, structured, and professional",
      instructions:
        "You are an employment services consultant speaking through an interpreter. Ask direct questions about work history, availability, and program obligations, and keep your turns manageable.",
      openingLine:
        "Please ask the client what kind of work they did before, whether they can work full-time, and what support they need right now.",
    },
    aiAgentB: {
      name: "Jose Ramirez",
      role: "Job Seeker",
      voice: "sage",
      goal: "Explain recent employment history, current challenges, and preferred work options honestly.",
      language: "Spanish",
      demeanor: "Motivated, cautious, and practical",
      instructions:
        "You are a Spanish-speaking job seeker attending an employment services meeting. Speak only in Spanish and answer as the client.",
      openingLine:
        "Trabaje en limpieza y almacen, pero desde hace unos meses no tengo trabajo fijo y necesito ayuda para encontrar algo estable.",
    },
    practiceRuntime: {
      interpreterRole: "Consecutive dialogue interpreter",
      sourceLanguage: "English",
      targetLanguage: "Spanish",
      openingSpeaker: "agent_a",
      briefing:
        "This scenario is designed for CPI-level practice in a routine public-service setting where the interpreter must carry work history, program requirements, and support options accurately.",
      assessmentFocus: [
        "Work history accuracy",
        "Explaining obligations without omission",
        "Tone management in a service interview",
        "Clarification when details are unclear",
      ],
    },
    expectedSkills: [
      "Public-service terminology",
      "Accurate relay of obligations",
      "Clarification and turn control",
    ],
    difficultyLevel: "beginner",
  },
  {
    id: "cpi-police-property-damage-report",
    moduleId: "naati-certification-practice-cpi",
    title: "Police Property Damage Report",
    description:
      "A police officer takes a non-urgent report about damage to a parked car, including time, location, and what the witness saw.",
    aiAgentA: {
      name: "Senior Constable Mia Turner",
      role: "Police Officer",
      voice: "coral",
      goal: "Record the essential facts of the report and explain what happens after the statement is taken.",
      language: "English",
      demeanor: "Calm, procedural, and focused",
      instructions:
        "You are a police officer taking a non-urgent report through an interpreter. Ask clear factual questions, confirm time and place carefully, and speak only in English.",
      openingLine:
        "Please ask the caller where the car was parked, when they noticed the damage, and whether anyone saw what happened.",
    },
    aiAgentB: {
      name: "Elena Vargas",
      role: "Caller",
      voice: "sage",
      goal: "Describe the incident clearly, give the timeline, and ask what to do next.",
      language: "Spanish",
      demeanor: "Upset, attentive, and cooperative",
      instructions:
        "You are a Spanish-speaking caller reporting damage to your parked car. Speak only in Spanish, answer as yourself, and never interpret for the officer.",
      openingLine:
        "Deje el coche frente a mi edificio anoche y esta manana vi un golpe grande en la puerta del lado del conductor.",
    },
    practiceRuntime: {
      interpreterRole: "Consecutive dialogue interpreter",
      sourceLanguage: "English",
      targetLanguage: "Spanish",
      openingSpeaker: "agent_a",
      briefing:
        "This CPI-aligned scenario introduces a simple procedural setting where factual accuracy, chronology, and neutral delivery are essential.",
      assessmentFocus: [
        "Timeline and location accuracy",
        "Neutral procedural register",
        "Question-answer turn control",
        "Accurate relay of next steps",
      ],
    },
    expectedSkills: [
      "Factual accuracy",
      "Neutral delivery",
      "Basic procedural terminology",
    ],
    difficultyLevel: "intermediate",
  },
  {
    id: "ccl-medical-scan-booking",
    moduleId: "naati-certification-practice-ccl",
    title: "Medical Scan Booking",
    description:
      "A radiology receptionist explains booking requirements, arrival time, and fasting instructions for an ultrasound appointment.",
    aiAgentA: {
      name: "Tara Lewis",
      role: "Radiology Receptionist",
      voice: "marin",
      goal: "Book the appointment, confirm the referral details, and explain the preparation steps clearly.",
      language: "English",
      demeanor: "Polite, efficient, and informative",
      instructions:
        "You are a radiology receptionist speaking through a community language mediator. Use short, test-like turns, confirm dates and times, and explain the preparation instructions clearly in English only.",
      openingLine:
        "Please let the patient know their ultrasound is available this Thursday at 9:15 in the morning, and they need to fast for six hours before the scan.",
    },
    aiAgentB: {
      name: "Sergio Morales",
      role: "Patient",
      voice: "sage",
      goal: "Understand the appointment details, ask practical questions, and confirm what to bring.",
      language: "Spanish",
      demeanor: "Attentive, polite, and slightly uncertain",
      instructions:
        "You are a Spanish-speaking patient booking a scan. Speak only in Spanish, answer as the patient, and never translate for the receptionist.",
      openingLine:
        "Quiero confirmar la cita y saber si tengo que llevar la orden del medico y mi tarjeta de Medicare.",
    },
    practiceRuntime: {
      interpreterRole: "NAATI CCL dialogue candidate",
      sourceLanguage: "English",
      targetLanguage: "Spanish",
      openingSpeaker: "agent_a",
      briefing:
        "This CCL practice dialogue focuses on short-turn transfer of appointment timing, preparation instructions, referral details, and practical follow-up questions.",
      assessmentFocus: [
        "Date and time accuracy",
        "Medical preparation instructions",
        "Complete transfer of key details",
        "Natural bilingual dialogue flow",
      ],
    },
    expectedSkills: [
      "Appointment-detail retention",
      "Instruction transfer",
      "Short-turn bilingual delivery",
    ],
    difficultyLevel: "intermediate",
  },
  {
    id: "ccl-school-absence-meeting",
    moduleId: "naati-certification-practice-ccl",
    title: "School Absence Follow-up",
    description:
      "A school officer discusses repeated absences, medical certificates, and the process for reporting future leave.",
    aiAgentA: {
      name: "Hannah Reid",
      role: "School Attendance Officer",
      voice: "shimmer",
      goal: "Explain the school's attendance concerns and outline what documents are needed.",
      language: "English",
      demeanor: "Calm, clear, and firm",
      instructions:
        "You are a school attendance officer speaking through a community language mediator. Keep your turns short and focused on absences, documents, and future reporting steps.",
      openingLine:
        "Please tell the parent the school is concerned because the student has missed seven days this term, and we need either a medical certificate or a written explanation.",
    },
    aiAgentB: {
      name: "Patricia Gomez",
      role: "Parent",
      voice: "nova",
      goal: "Explain the reasons for the absences and ask how to notify the school correctly next time.",
      language: "Spanish",
      demeanor: "Concerned, respectful, and eager to cooperate",
      instructions:
        "You are a Spanish-speaking parent attending a school meeting. Speak only in Spanish and answer only as the parent.",
      openingLine:
        "Mi hijo falto porque estuvo enfermo varios dias, pero yo no sabia que tambien necesitaba mandar una carta al colegio.",
    },
    practiceRuntime: {
      interpreterRole: "NAATI CCL dialogue candidate",
      sourceLanguage: "English",
      targetLanguage: "Spanish",
      openingSpeaker: "agent_a",
      briefing:
        "This scenario reflects the short, community-service dialogue style used in CCL preparation, with emphasis on attendance terms, document requirements, and reporting procedures.",
      assessmentFocus: [
        "Education terminology",
        "Accurate transfer of counts and document requirements",
        "Procedural clarity",
        "Managing short alternating turns",
      ],
    },
    expectedSkills: [
      "Attendance vocabulary",
      "Document-detail accuracy",
      "Community dialogue control",
    ],
    difficultyLevel: "intermediate",
  },
  {
    id: "ccl-tenancy-maintenance-call",
    moduleId: "naati-certification-practice-ccl",
    title: "Tenancy Maintenance Call",
    description:
      "A property officer discusses an urgent repair, access arrangements, and when the tenant should expect the plumber to arrive.",
    aiAgentA: {
      name: "Michael Tan",
      role: "Property Officer",
      voice: "cedar",
      goal: "Confirm the maintenance issue, arrange access, and explain the expected repair window.",
      language: "English",
      demeanor: "Direct, practical, and helpful",
      instructions:
        "You are a property officer speaking through a community language mediator. Use short turns and make the maintenance instructions specific and easy to relay.",
      openingLine:
        "Please advise the tenant that the plumber can attend between 1 p.m. and 4 p.m. tomorrow, and someone over eighteen needs to be at home.",
    },
    aiAgentB: {
      name: "Diego Flores",
      role: "Tenant",
      voice: "sage",
      goal: "Describe the urgency of the repair, ask about timing, and confirm who can be home.",
      language: "Spanish",
      demeanor: "Worried, practical, and cooperative",
      instructions:
        "You are a Spanish-speaking tenant discussing a repair issue. Speak only in Spanish and respond as the tenant.",
      openingLine:
        "La tuberia sigue perdiendo agua y necesito saber si puedo dejar entrar al plomero aunque yo llegue del trabajo un poco tarde.",
    },
    practiceRuntime: {
      interpreterRole: "NAATI CCL dialogue candidate",
      sourceLanguage: "English",
      targetLanguage: "Spanish",
      openingSpeaker: "agent_a",
      briefing:
        "This CCL-style practice dialogue tests retention of times, access conditions, and practical housing instructions in a short exchange.",
      assessmentFocus: [
        "Time and condition accuracy",
        "Housing terminology",
        "Concise transfer of practical instructions",
        "Two-way dialogue flow",
      ],
    },
    expectedSkills: [
      "Housing vocabulary",
      "Condition and time transfer",
      "Accurate short-turn recall",
    ],
    difficultyLevel: "intermediate",
  },
  {
    id: "ccl-centrelink-appointment-change",
    moduleId: "naati-certification-practice-ccl",
    title: "Centrelink Appointment Change",
    description:
      "A service officer explains why an appointment was missed, how to reschedule it, and what documents the client needs to bring.",
    aiAgentA: {
      name: "Olivia Hart",
      role: "Service Officer",
      voice: "coral",
      goal: "Explain the missed appointment process and the next steps for maintaining the claim.",
      language: "English",
      demeanor: "Professional, clear, and procedural",
      instructions:
        "You are a service officer speaking through a community language mediator. Use simple public-service language and keep each turn short and information-rich.",
      openingLine:
        "Please tell the client that because they missed yesterday's appointment, they need to contact us within two business days and bring photo identification and their bank statement.",
    },
    aiAgentB: {
      name: "Rosa Castillo",
      role: "Client",
      voice: "sage",
      goal: "Explain why the appointment was missed and ask what is needed to avoid payment delays.",
      language: "Spanish",
      demeanor: "Anxious, polite, and focused on resolving the problem",
      instructions:
        "You are a Spanish-speaking client speaking with a government service officer. Speak only in Spanish and do not translate for the officer.",
      openingLine:
        "No pude asistir porque mi hijo estaba enfermo, y quiero saber si mis pagos van a detenerse y que documentos tengo que llevar.",
    },
    practiceRuntime: {
      interpreterRole: "NAATI CCL dialogue candidate",
      sourceLanguage: "English",
      targetLanguage: "Spanish",
      openingSpeaker: "agent_a",
      briefing:
        "This dialogue reflects common CCL public-service content with deadlines, documents, and practical next steps that must be transferred completely and naturally.",
      assessmentFocus: [
        "Deadline accuracy",
        "Government service terminology",
        "Document-detail retention",
        "Clear two-way relay",
      ],
    },
    expectedSkills: [
      "Public-service terminology",
      "Deadline transfer",
      "Accurate detail retention",
    ],
    difficultyLevel: "intermediate",
  },
  {
    id: "ccl-police-witness-statement",
    moduleId: "naati-certification-practice-ccl",
    title: "Police Witness Statement",
    description:
      "A police officer asks a witness about the time, location, and sequence of events after a minor street incident.",
    aiAgentA: {
      name: "Constable Aaron Bell",
      role: "Police Officer",
      voice: "ash",
      goal: "Collect a clear witness account and confirm the factual sequence of events.",
      language: "English",
      demeanor: "Calm, focused, and methodical",
      instructions:
        "You are a police officer taking a witness statement through a community language mediator. Ask factual questions in short turns and confirm the order of events carefully.",
      openingLine:
        "Please ask the witness what time the argument started, where they were standing, and whether they saw anyone push the other person.",
    },
    aiAgentB: {
      name: "Monica Ruiz",
      role: "Witness",
      voice: "sage",
      goal: "Describe what was seen clearly and ask what happens after the statement is recorded.",
      language: "Spanish",
      demeanor: "Serious, cooperative, and slightly nervous",
      instructions:
        "You are a Spanish-speaking witness speaking with police. Speak only in Spanish, answer as the witness, and never interpret for the officer.",
      openingLine:
        "Yo estaba esperando el autobus cuando vi a dos hombres discutir, pero no escuche todo lo que decian porque habia mucho ruido.",
    },
    practiceRuntime: {
      interpreterRole: "NAATI CCL dialogue candidate",
      sourceLanguage: "English",
      targetLanguage: "Spanish",
      openingSpeaker: "agent_a",
      briefing:
        "This CCL-style police dialogue emphasizes chronology, location, and factual precision in short, alternating turns.",
      assessmentFocus: [
        "Chronology accuracy",
        "Factual and location detail transfer",
        "Neutral tone retention",
        "Short-turn memory control",
      ],
    },
    expectedSkills: [
      "Chronology transfer",
      "Neutral factual delivery",
      "Location-detail accuracy",
    ],
    difficultyLevel: "intermediate",
  },
] as const;

export const seedJobs = [
  {
    id: "job_1",
    title: "Hospital Discharge Follow-up",
    description:
      "Remote interpreting support for a bilingual discharge planning session.",
    industry: "medical",
    date: "2026-03-24",
    location: "Remote",
    payRate: "$65/hr",
    organizationId: "org_community_language_hub",
    status: "assigned",
  },
  {
    id: "job_2",
    title: "Community Legal Clinic Intake",
    description:
      "In-person appointment block for initial client intake and referral advice.",
    industry: "legal",
    date: "2026-03-29",
    location: "Perth CBD",
    payRate: "$72/hr",
    organizationId: "org_community_language_hub",
    status: "open",
  },
] as const;

export function demoSessionsForClerk(clerkId: string) {
  return [
    {
      id: `sess_${clerkId}_1`,
      clerkId,
      moduleId: "medical-er-intake",
      scenarioId: "er-triage",
      startedAt: "2026-03-15T08:15:00Z",
      endedAt: "2026-03-15T08:33:00Z",
      durationSeconds: 1080,
      durationMinutes: 18,
      score: 82,
      completionStatus: "completed" as const,
      transcriptSummary:
        "Strong terminology control with two minor omissions in medication timing.",
      transcriptEntries: buildTranscript(
        [
          {
            speaker: "Practitioner",
            role: "assistant",
            text: "Please ask when the chest pain started and whether any medication has already been taken.",
          },
          {
            speaker: "Interpreter",
            role: "user",
            text: "El doctor pregunta cuando empezo el dolor del pecho y si ya tomo algun medicamento.",
          },
          {
            speaker: "Patient",
            role: "assistant",
            text: "Empezo hace como una hora y tome aspirina pero no me ayudo.",
          },
        ],
        "2026-03-15T08:15:00Z",
      ),
      assessment: demoAssessment,
      timestamp: "2026-03-15T08:15:00Z",
    },
    {
      id: `sess_${clerkId}_2`,
      clerkId,
      moduleId: "courtroom-hearings",
      scenarioId: "bail-hearing",
      startedAt: "2026-03-16T10:30:00Z",
      endedAt: "2026-03-16T10:56:00Z",
      durationSeconds: 1560,
      durationMinutes: 26,
      score: 74,
      completionStatus: "needs_review" as const,
      transcriptSummary:
        "Good register, but release conditions were condensed too aggressively.",
      transcriptEntries: buildTranscript(
        [
          {
            speaker: "Magistrate",
            role: "assistant",
            text: "Please advise the defendant that strict reporting conditions will apply if bail is granted.",
          },
          {
            speaker: "Interpreter",
            role: "user",
            text: "El magistrado dice que si le otorgan la libertad bajo fianza habra condiciones estrictas de presentacion.",
          },
          {
            speaker: "Defendant",
            role: "assistant",
            text: "Lo entiendo, pero necesito saber cada cuanto debo presentarme.",
          },
        ],
        "2026-03-16T10:30:00Z",
      ),
      assessment: {
        ...demoAssessment,
        overallScore: 74,
        summary:
          "Register was strong, but some conditional details and reporting obligations lost precision.",
        improvementAreas: [
          "Preserve every release condition without compression",
          "Keep date and reporting language fully explicit",
        ],
        recommendedNextStep:
          "Repeat an advanced legal scenario and focus on conditions, dates, and procedural phrasing.",
        completionDecision: "needs_review" as const,
        breakdown: {
          accuracy: 72,
          terminology: 78,
          fluency: 76,
          turnManagement: 73,
          professionalism: 79,
        },
      },
      timestamp: "2026-03-16T10:30:00Z",
    },
    {
      id: `sess_${clerkId}_3`,
      clerkId,
      moduleId: "community-services",
      scenarioId: "housing-assessment",
      startedAt: "2026-03-17T13:00:00Z",
      endedAt: "2026-03-17T13:14:00Z",
      durationSeconds: 840,
      durationMinutes: 14,
      score: 91,
      completionStatus: "completed" as const,
      transcriptSummary:
        "Clear turn management and strong accuracy across names and addresses.",
      transcriptEntries: buildTranscript(
        [
          {
            speaker: "Case Worker",
            role: "assistant",
            text: "Please ask who lives in the property and whether there is any immediate safety issue tonight.",
          },
          {
            speaker: "Interpreter",
            role: "user",
            text: "La trabajadora social pregunta quienes viven en la vivienda y si hay algun riesgo inmediato esta noche.",
          },
          {
            speaker: "Resident",
            role: "assistant",
            text: "Vivo con mis dos hijos y no tenemos peligro hoy, pero podriamos perder la casa pronto.",
          },
        ],
        "2026-03-17T13:00:00Z",
      ),
      assessment: {
        ...demoAssessment,
        overallScore: 91,
        summary:
          "Excellent pacing, clarity, and factual accuracy across the housing intake.",
        strengths: [
          "Kept service explanations accessible and complete",
          "Maintained excellent clarity around names and living arrangements",
          "Balanced empathy with accuracy",
        ],
        improvementAreas: [
          "Continue building confidence with longer service explanations",
        ],
        recommendedNextStep:
          "Move into more complex community and immigration scenarios to build stamina with longer turns.",
        breakdown: {
          accuracy: 92,
          terminology: 88,
          fluency: 91,
          turnManagement: 93,
          professionalism: 91,
        },
      },
      timestamp: "2026-03-17T13:00:00Z",
    },
  ];
}
