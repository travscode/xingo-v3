const demoAssessment = {
  overallScore: 82,
  summary: "Strong command of the encounter with a few moments where terminology or pacing softened the original emphasis.",
  strengths: [
    "Preserved the core medical concern and timeline accurately",
    "Maintained calm turn-taking under pressure",
    "Handled clarification prompts cleanly",
  ],
  improvementAreas: [
    "Carry medication details with tighter precision",
    "Keep long explanations segmented into shorter relays",
  ],
  recommendedNextStep: "Repeat the scenario once more and focus on dosage, chronology, and escalation language.",
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
  lines: Array<{ speaker: string; text: string; role: "assistant" | "user" | "system" }>,
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
    expectedSkills: ["Medical terminology", "Clarification control", "Latency management"],
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
    expectedSkills: ["Medication accuracy", "Chronology tracking", "Family communication"],
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
    expectedSkills: ["Legal register", "Conditional phrasing", "Formal tone retention"],
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
    expectedSkills: ["Timeline fidelity", "Document terminology", "Neutral delivery"],
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
      voice: "cedar",
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
    expectedSkills: ["Plain-language delivery", "Address accuracy", "Empathy without drift"],
    difficultyLevel: "beginner",
  },
] as const;

export const seedJobs = [
  {
    id: "job_1",
    title: "Hospital Discharge Follow-up",
    description: "Remote interpreting support for a bilingual discharge planning session.",
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
    description: "In-person appointment block for initial client intake and referral advice.",
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
      transcriptSummary: "Strong terminology control with two minor omissions in medication timing.",
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
      transcriptSummary: "Good register, but release conditions were condensed too aggressively.",
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
        summary: "Register was strong, but some conditional details and reporting obligations lost precision.",
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
      transcriptSummary: "Clear turn management and strong accuracy across names and addresses.",
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
        summary: "Excellent pacing, clarity, and factual accuracy across the housing intake.",
        strengths: [
          "Kept service explanations accessible and complete",
          "Maintained excellent clarity around names and living arrangements",
          "Balanced empathy with accuracy",
        ],
        improvementAreas: ["Continue building confidence with longer service explanations"],
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
