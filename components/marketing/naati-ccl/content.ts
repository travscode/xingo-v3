export const cclModuleId = "naati-certification-practice-ccl";
export const cclModuleHref = `/modules/${cclModuleId}`;
export const cclSignUpHref = `/sign-up?redirect=${encodeURIComponent(cclModuleHref)}`;
export const cclSignInHref = `/sign-in?redirect=${encodeURIComponent(cclModuleHref)}`;

export const trustItems = [
  "Focused on short-turn NAATI CCL-style dialogue practice",
  "Built around the seeded XINGO CCL module",
  "Direct signup flow into the module after authentication",
] as const;

export const outcomes = [
  {
    title: "Exam-style flow",
    description:
      "Practice compact bilingual exchanges that reward fast, complete transfer of meaning under pressure.",
  },
  {
    title: "Trackable repetition",
    description:
      "Repeat scenarios, compare attempts, and keep working on dates, instructions, and key detail retention.",
  },
  {
    title: "Module-first onboarding",
    description:
      "Send learners straight from signup to the seeded CCL module instead of a generic landing screen.",
  },
] as const;

export const languages = [
  "Arabic",
  "Bangla",
  "Cantonese",
  "Dari",
  "Filipino",
  "Hindi",
  "Indonesian",
  "Japanese",
  "Korean",
  "Mandarin",
  "Nepali",
  "Punjabi",
  "Spanish",
  "Tamil",
  "Thai",
  "Urdu",
] as const;

export const overviewColumns = [
  {
    heading: "Scenario Types",
    items: ["Health booking", "School meeting", "Housing repair", "Police statement"],
  },
  {
    heading: "Skills",
    items: ["Short-turn recall", "Instruction transfer", "Chronology control", "Natural delivery"],
  },
  {
    heading: "Practice Focus",
    items: ["Names and dates", "Deadlines", "Documents", "Service vocabulary"],
  },
  {
    heading: "Outcome",
    items: ["Faster recall", "Cleaner relay", "Better confidence", "Module readiness"],
  },
] as const;

export const featureStats = [
  { label: "Seeded scenarios", value: "5" },
  { label: "Primary module", value: "1" },
  { label: "Core language pair", value: "EN <> ES" },
] as const;

export const scenarioCards = [
  {
    title: "Medical Scan Booking",
    description:
      "Timing, fasting instructions, referrals, and practical follow-up questions.",
  },
  {
    title: "School Absence Follow-up",
    description:
      "Attendance counts, certificates, and future reporting steps in plain language.",
  },
  {
    title: "Tenancy Maintenance Call",
    description:
      "Repair windows, access conditions, and concise practical instructions.",
  },
  {
    title: "Centrelink Appointment Change",
    description:
      "Deadlines, identity documents, and next-step guidance in a public-service context.",
  },
  {
    title: "Police Witness Statement",
    description:
      "Chronology, location detail, and neutral factual transfer in short alternating turns.",
  },
] as const;

export const pricingReasons = [
  {
    title: "Exam relevance",
    description: "Structured around the kind of compact service dialogues learners actually need to rehearse.",
  },
  {
    title: "Unlimited replay",
    description: "Repeat the same scenario until dates, conditions, and instructions become automatic.",
  },
  {
    title: "Direct access",
    description: "Use a dedicated landing flow that pushes new learners straight into the CCL module.",
  },
] as const;

export const pricingPlans = [
  {
    name: "Starter CCL",
    price: "$19",
    detail: "Entry access for learners who want to open the module and begin with the core seeded scenarios.",
    features: [
      "Access the NAATI CCL landing flow",
      "Open the seeded CCL module",
      "Practice short community scenarios",
      "Track your recent attempts",
    ],
    tone: "border-line bg-white",
    ctaClass: "action-secondary",
  },
  {
    name: "Practice Plus",
    price: "$39",
    detail: "Best for learners who want repeat practice sessions and a stronger exam-prep routine.",
    features: [
      "Everything in Starter CCL",
      "Unlimited repeated attempts",
      "Faster exposure to high-value details",
      "Improved familiarity with service vocabulary",
    ],
    tone: "border-violet-200 bg-violet-50/70",
    ctaClass: "action-primary",
  },
  {
    name: "Exam Sprint",
    price: "$69",
    detail: "For learners who want a concentrated prep phase with consistent repetition before test day.",
    features: [
      "Everything in Practice Plus",
      "High-frequency scenario rehearsal",
      "Focused exam-style preparation flow",
      "Direct start into the CCL module after auth",
    ],
    tone: "border-blue-200 bg-blue-50/70",
    ctaClass: "action-secondary",
  },
] as const;
