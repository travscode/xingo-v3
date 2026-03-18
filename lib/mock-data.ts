import type { JobAssignment } from "@/types/job";
import type { LearningModule } from "@/types/module";
import type { Scenario } from "@/types/scenario";
import type { PracticeSession } from "@/types/session";

export const learningModules: LearningModule[] = [
  {
    id: "medical-er-intake",
    title: "Medical ER Intake",
    description:
      "Practice triage conversations with urgent symptoms, medication checks, and family context.",
    industryCategory: "medical",
    durationMinutes: 28,
    difficultyLevel: "intermediate",
    scenarios: ["er-triage", "pediatric-consult"],
    learningObjectives: [
      "Interpret symptom descriptions with precision",
      "Preserve clinical urgency and medication details",
      "Handle rapid turn-taking under stress",
    ],
    isFree: true,
    isAccredited: true,
    accreditationProvider: "Community Health Language Network",
    badgeIcon: "Medical Distinction",
    createdAt: "2026-03-01",
  },
  {
    id: "courtroom-hearings",
    title: "Courtroom Hearings",
    description:
      "Run through bail hearings, judicial instructions, and procedural terminology.",
    industryCategory: "legal",
    durationMinutes: 34,
    difficultyLevel: "advanced",
    scenarios: ["bail-hearing", "sentencing-review"],
    learningObjectives: [
      "Maintain register in formal legal settings",
      "Handle interruptions and clarifications cleanly",
      "Track dates, obligations, and legal outcomes",
    ],
    isFree: false,
    isAccredited: true,
    accreditationProvider: "National Interpreter Accreditation Board",
    badgeIcon: "Court Certified",
    createdAt: "2026-03-04",
  },
  {
    id: "immigration-interviews",
    title: "Immigration Interviews",
    description:
      "Navigate high-stakes interviews involving timelines, documents, and trauma-aware questioning.",
    industryCategory: "immigration",
    durationMinutes: 31,
    difficultyLevel: "advanced",
    scenarios: ["visa-interview", "asylum-screening"],
    learningObjectives: [
      "Protect meaning in long narrative answers",
      "Maintain consistency across dates and locations",
      "Use neutral delivery in emotionally loaded exchanges",
    ],
    isFree: false,
    isAccredited: false,
    badgeIcon: "Casework Ready",
    createdAt: "2026-03-08",
  },
  {
    id: "community-services",
    title: "Community Services Intake",
    description:
      "Train for housing, benefits, and social support appointments with diverse speaker styles.",
    industryCategory: "community",
    durationMinutes: 24,
    difficultyLevel: "beginner",
    scenarios: ["housing-assessment", "benefits-renewal"],
    learningObjectives: [
      "Control pacing for first-time learners",
      "Clarify names, addresses, and references",
      "Build confidence in public service settings",
    ],
    isFree: true,
    isAccredited: false,
    badgeIcon: "Starter Pathway",
    createdAt: "2026-03-10",
  },
];

export const scenarios: Scenario[] = [
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
];

export const sessions: PracticeSession[] = [
  {
    id: "sess_1",
    userId: "user_1",
    moduleId: "medical-er-intake",
    scenarioId: "er-triage",
    durationMinutes: 18,
    score: 82,
    completionStatus: "completed",
    transcriptSummary: "Strong terminology control with two minor omissions in medication timing.",
    timestamp: "2026-03-15T08:15:00Z",
  },
  {
    id: "sess_2",
    userId: "user_1",
    moduleId: "courtroom-hearings",
    scenarioId: "bail-hearing",
    durationMinutes: 26,
    score: 74,
    completionStatus: "needs_review",
    transcriptSummary: "Good register, but release conditions were condensed too aggressively.",
    timestamp: "2026-03-16T10:30:00Z",
  },
  {
    id: "sess_3",
    userId: "user_1",
    moduleId: "community-services",
    scenarioId: "housing-assessment",
    durationMinutes: 14,
    score: 91,
    completionStatus: "completed",
    transcriptSummary: "Clear turn management and strong accuracy across names and addresses.",
    timestamp: "2026-03-17T13:00:00Z",
  },
];

export const jobs: JobAssignment[] = [
  {
    id: "job_1",
    title: "Hospital Discharge Follow-up",
    description: "Remote interpreting support for a bilingual discharge planning session.",
    industry: "medical",
    date: "2026-03-24",
    location: "Remote",
    payRate: "$65/hr",
    organizationId: "org_1",
    assignedInterpreterId: "user_1",
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
    organizationId: "org_1",
    status: "open",
  },
];

export const pricingSummary = [
  {
    audience: "Individuals",
    price: "From $10/mo",
    description:
      "One monthly membership for ongoing training, with one-off readiness checks and assessment add-ons when needed.",
  },
  {
    audience: "Organizations",
    price: "$3-$5 / candidate / month",
    description:
      "Per-candidate licensing for LSPs and training providers, with volume discounts and extra usage layered on top.",
  },
] as const;

export const individualPricing = [
  {
    name: "Xingo Subscription",
    price: "$10/mo",
    description:
      "Core monthly membership for interpreters who want repeated practice across multiple scenarios and a NAATI-style practice assessment.",
    features: [
      "Access to a block of 7-10 training modules",
      "NAATI practice assessment with assessment result",
      "Optional opt-in to the Xingo Marketplace",
    ],
    note: "Additional practice minutes or extra role-plays are paid separately.",
  },
  {
    name: "NAATI Readiness Role-Play",
    price: "$50 one-off",
    description:
      "Single pre-assessment practice role-play for candidates who want a quick readiness signal before booking the real assessment.",
    features: [
      "One-off assessment preparation role-play",
      "Readiness insight stored on the user profile",
      "Optional marketplace visibility after completion",
    ],
    note: "Subsequent attempts can be discounted later if you want to introduce retake pricing.",
  },
  {
    name: "Human-Led Assessment",
    price: "$50 / assessment",
    description:
      "Human assessor review for candidates who want a qualified evaluator rather than AI-only scoring.",
    features: [
      "Reviewed by a qualified assessor",
      "Human-assessed check mark on profile",
      "Commercial split noted as $30 assessor / $20 XINGO",
    ],
    note: "Useful as a premium feedback layer after automated practice.",
  },
  {
    name: "International Certification",
    price: "£600",
    description:
      "Full certification-style pathway that mirrors regional certification flows, including modules and a formal assessment stage.",
    features: [
      "Structured module path",
      "Certification assessment",
      "Available to self-funded individuals or sponsored candidates",
    ],
    note: "Same price point applies whether paid by the candidate or a corporate sponsor.",
  },
] as const;

export const corporatePricingTiers = [
  {
    name: "Basic",
    price: "$5",
    candidateVolume: "1-99 candidates",
    trainingMinutes: "Base allowance",
    extraUsage: "Additional minutes and role-plays paid individually",
    customModules: "Pay per module",
    scenarioUploads: "No",
    reporting: "Standard reporting",
    marketplace: "No",
    support: "Standard support",
  },
  {
    name: "Professional",
    price: "$4",
    candidateVolume: "100-499 candidates",
    trainingMinutes: "Increased cap",
    extraUsage: "Discounted minutes and role-plays",
    customModules: "Discounted pay per module",
    scenarioUploads: "Yes",
    reporting: "Advanced analytics",
    marketplace: "Marketplace access included",
    support: "Priority support",
  },
  {
    name: "Enterprise",
    price: "$3",
    candidateVolume: "500+ candidates",
    trainingMinutes: "Highest cap",
    extraUsage: "Discounted rates with bundled minutes",
    customModules: "Included or discounted",
    scenarioUploads: "Yes",
    reporting: "Full analytics dashboard",
    marketplace: "Premium marketplace access",
    support: "Dedicated account manager",
  },
] as const;

export const pricingAddOns = [
  {
    name: "Additional Minutes & Role-Plays",
    description:
      "Individuals can buy more practice time, and organizations can either fund it centrally or leave it as a candidate-paid add-on.",
    price: "Usage-based",
  },
  {
    name: "Custom Training Modules",
    description:
      "Organizations can assign extra upskilling content, either as pay-per-module work or folded into higher licensing tiers.",
    price: "Custom / pay per module",
  },
  {
    name: "Self-Built Modules",
    description:
      "Phase 3 self-built scenarios for companies or individuals that need training content tailored to their exact operating context.",
    price: "Custom quote",
  },
] as const;

export const marketplaceRules = [
  "Individuals can opt into the Xingo Marketplace once they hold an active subscription and complete practice or assessment work.",
  "Corporate customers on Professional and Enterprise tiers can access the marketplace for recruitment and workforce discovery.",
  "One-off NAATI readiness users can keep assessment results on their profile, but recurring marketplace visibility should stay tied to the monthly membership.",
] as const;

export const futurePricing = [
  {
    phase: "Phase 2",
    audience: "Corporate",
    name: "Certification Integration",
    price: "% of certifier cost",
    description:
      "Licensing or revenue-share model for certifying bodies such as NAATI using XINGO as part of formal training delivery.",
  },
  {
    phase: "Phase 2",
    audience: "Corporate",
    name: "Education Providers",
    price: "TBD",
    description:
      "University and training-provider licensing for students who need structured practice during interpreter qualifications.",
  },
  {
    phase: "Phase 3",
    audience: "Corporate",
    name: "Automated Quality Assurance",
    price: "TBD subscription or API pricing",
    description:
      "AI-driven evaluation of uploaded interpreting recordings for tenders, QA workflows, and ongoing workforce measurement.",
  },
  {
    phase: "Phase 3",
    audience: "Individual",
    name: "Advanced Assessor Marketplace",
    price: "Extends $50 human assessment model",
    description:
      "Broader pool of qualified assessors, more feedback products, and profile badges tied to verified reviews.",
  },
] as const;

export const helpArticles = [
  "Getting Started",
  "How Practice Works",
  "Understanding Scores",
  "Billing Questions",
  "Contact Support",
] as const;

export const dashboardMetrics = [
  { label: "Average score", value: "82%" },
  { label: "Modules completed", value: "9" },
  { label: "Practice time", value: "18.4h" },
  { label: "Credentials earned", value: "3" },
] as const;

export const credentials = [
  {
    title: "Medical Distinction",
    issuer: "Community Health Language Network",
    status: "Awarded",
  },
  {
    title: "Court Certified",
    issuer: "National Interpreter Accreditation Board",
    status: "In progress",
  },
] as const;

export function getModuleById(moduleId: string) {
  return learningModules.find((module) => module.id === moduleId);
}

export function getScenarioById(scenarioId: string) {
  return scenarios.find((scenario) => scenario.id === scenarioId);
}

export function getScenariosForModule(moduleId: string) {
  return scenarios.filter((scenario) => scenario.moduleId === moduleId);
}

export function getSessionsForModule(moduleId: string) {
  return sessions.filter((session) => session.moduleId === moduleId);
}
