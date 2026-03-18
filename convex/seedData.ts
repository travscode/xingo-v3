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
      "A doctor assesses chest pain, prior medication use, and symptom onset while the patient is distressed.",
    aiAgentA: {
      role: "Doctor",
      voice: "Analytical and calm",
      goal: "Extract symptom details and determine urgency",
    },
    aiAgentB: {
      role: "Patient",
      voice: "Short breaths, anxious, fragmented",
      goal: "Describe symptoms while under stress",
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
      role: "Pediatrician",
      voice: "Warm and structured",
      goal: "Confirm dosing, allergy triggers, and escalation signs",
    },
    aiAgentB: {
      role: "Parent",
      voice: "Protective and detail-heavy",
      goal: "Explain sequence of symptoms and prior actions",
    },
    expectedSkills: ["Medication accuracy", "Chronology tracking", "Family communication"],
    difficultyLevel: "beginner",
  },
  {
    id: "bail-hearing",
    moduleId: "courtroom-hearings",
    title: "Bail Hearing",
    description:
      "A magistrate, prosecutor, and defendant review prior appearances, risks, and release conditions.",
    aiAgentA: {
      role: "Magistrate",
      voice: "Direct and procedural",
      goal: "Issue a ruling with explicit conditions",
    },
    aiAgentB: {
      role: "Defendant",
      voice: "Guarded and reactive",
      goal: "Respond to allegations and confirm understanding",
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
      role: "Case Officer",
      voice: "Measured and skeptical",
      goal: "Test credibility through detailed questioning",
    },
    aiAgentB: {
      role: "Applicant",
      voice: "Respectful but tense",
      goal: "Explain purpose, supporting evidence, and chronology",
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
      role: "Case Worker",
      voice: "Empathetic and methodical",
      goal: "Collect facts and explain service pathways",
    },
    aiAgentB: {
      role: "Resident",
      voice: "Tired but cooperative",
      goal: "Share current circumstances and urgent needs",
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
      durationMinutes: 18,
      score: 82,
      completionStatus: "completed" as const,
      transcriptSummary: "Strong terminology control with two minor omissions in medication timing.",
      timestamp: "2026-03-15T08:15:00Z",
    },
    {
      id: `sess_${clerkId}_2`,
      clerkId,
      moduleId: "courtroom-hearings",
      scenarioId: "bail-hearing",
      durationMinutes: 26,
      score: 74,
      completionStatus: "needs_review" as const,
      transcriptSummary: "Good register, but release conditions were condensed too aggressively.",
      timestamp: "2026-03-16T10:30:00Z",
    },
    {
      id: `sess_${clerkId}_3`,
      clerkId,
      moduleId: "community-services",
      scenarioId: "housing-assessment",
      durationMinutes: 14,
      score: 91,
      completionStatus: "completed" as const,
      transcriptSummary: "Clear turn management and strong accuracy across names and addresses.",
      timestamp: "2026-03-17T13:00:00Z",
    },
  ];
}
