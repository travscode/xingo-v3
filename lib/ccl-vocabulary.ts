/**
 * English starter vocabulary for the 12 NAATI CCL domains, used by
 * /naati/ccl/vocabulary. Terms are everyday Australian community-services
 * English; notes explain the Australian meaning where it isn't obvious.
 * Domain names follow NAATI's CCL information. Not official NAATI material.
 *
 * `practice` lists XINGO CCL-style dialogues in that domain — only add a
 * dialogue that exists in the CCL course (convex/seedData.ts, convex/content/).
 */

export type CclVocabTerm = { term: string; note?: string };

export type CclVocabDomain = {
  slug: string;
  name: string;
  summary: string;
  terms: CclVocabTerm[];
  practice?: string[];
};

export const cclVocabularyDomains: CclVocabDomain[] = [
  {
    slug: "health",
    name: "Health",
    summary: "GP visits, hospitals, pharmacies, scans and referrals.",
    terms: [
      { term: "GP (general practitioner)", note: "Family doctor; usually the first point of contact." },
      { term: "referral", note: "A GP's letter sending you to a specialist or for tests." },
      { term: "bulk-billed", note: "Medicare pays the doctor directly; no out-of-pocket cost." },
      { term: "Medicare card" },
      { term: "prescription / repeat" },
      { term: "side effects" },
      { term: "fasting", note: "No food (sometimes no drink) before a test." },
      { term: "ultrasound / X-ray / CT scan" },
      { term: "emergency department (ED)" },
      { term: "blood pressure / blood test" },
      { term: "allergic reaction" },
      { term: "follow-up appointment" },
    ],
    practice: ["Medical scan booking"],
  },
  {
    slug: "social-services",
    name: "Social services",
    summary: "Centrelink, family support, aged care and disability services.",
    terms: [
      { term: "Centrelink", note: "Government agency for payments, part of Services Australia." },
      { term: "customer reference number (CRN)" },
      { term: "income support payment" },
      { term: "report your income", note: "Regularly telling Centrelink what you earned." },
      { term: "eligibility" },
      { term: "debt / overpayment" },
      { term: "concession card" },
      { term: "carer payment" },
      { term: "aged care assessment" },
      { term: "case worker" },
    ],
    practice: ["Centrelink appointment change"],
  },
  {
    slug: "insurance",
    name: "Insurance",
    summary: "Car, home, contents and health insurance claims.",
    terms: [
      { term: "policy / policyholder" },
      { term: "premium", note: "The regular amount you pay for cover." },
      { term: "excess", note: "The amount you pay towards a claim before the insurer pays." },
      { term: "comprehensive / third party" },
      { term: "lodge a claim" },
      { term: "assessor", note: "Person who inspects damage for the insurer." },
      { term: "at fault / not at fault" },
      { term: "write-off", note: "A vehicle not worth repairing." },
      { term: "quote" },
      { term: "cover / not covered" },
    ],
    practice: ["Car insurance claim"],
  },
  {
    slug: "employment",
    name: "Employment",
    summary: "Interviews, pay, workplace injuries and job services.",
    terms: [
      { term: "casual / part-time / full-time" },
      { term: "award rate", note: "Minimum pay and conditions for an industry." },
      { term: "payslip" },
      { term: "superannuation (super)", note: "Retirement savings your employer pays into." },
      { term: "workers' compensation" },
      { term: "incident report" },
      { term: "medical certificate" },
      { term: "return-to-work plan" },
      { term: "light duties" },
      { term: "unfair dismissal" },
    ],
    practice: ["Workplace injury claim"],
  },
  {
    slug: "financial",
    name: "Financial",
    summary: "Bank accounts, loans, debt and budgeting.",
    terms: [
      { term: "deposit" },
      { term: "home loan / mortgage" },
      { term: "interest rate (fixed / variable)" },
      { term: "repayments (weekly / fortnightly / monthly)" },
      { term: "pre-approval" },
      { term: "credit history / credit score" },
      { term: "statement" },
      { term: "direct debit" },
      { term: "hardship arrangement" },
      { term: "first home buyer" },
    ],
    practice: ["Bank home loan enquiry"],
  },
  {
    slug: "consumer-affairs",
    name: "Consumer affairs",
    summary: "Faulty products, refunds, contracts and scams.",
    terms: [
      { term: "receipt / proof of purchase" },
      { term: "refund / replacement / repair" },
      { term: "warranty" },
      { term: "consumer guarantee", note: "Rights under Australian Consumer Law that apply regardless of store policy." },
      { term: "faulty / defective" },
      { term: "store credit" },
      { term: "cooling-off period" },
      { term: "lodge a complaint" },
      { term: "scam" },
    ],
    practice: ["Faulty product refund"],
  },
  {
    slug: "business",
    name: "Business",
    summary: "Starting a business, permits, suppliers and compliance.",
    terms: [
      { term: "ABN (Australian Business Number)" },
      { term: "sole trader / partnership / company" },
      { term: "permit / licence / registration" },
      { term: "council approval" },
      { term: "food safety inspection" },
      { term: "lease (commercial)" },
      { term: "invoice" },
      { term: "GST (goods and services tax)" },
      { term: "compliance" },
    ],
    practice: ["Council food business permit"],
  },
  {
    slug: "immigration",
    name: "Immigration / settlement",
    summary: "Visas, documents and settlement services.",
    terms: [
      { term: "visa application / visa grant" },
      { term: "visa conditions" },
      { term: "bridging visa" },
      { term: "certified copy", note: "A copy signed by an authorised person as matching the original." },
      { term: "migration agent" },
      { term: "sponsor" },
      { term: "deadline / due date" },
      { term: "police check" },
      { term: "settlement services" },
    ],
    practice: ["Migration agent document check"],
  },
  {
    slug: "education",
    name: "Education",
    summary: "Enrolment, attendance, school meetings and TAFE.",
    terms: [
      { term: "enrolment" },
      { term: "catchment area / school zone" },
      { term: "year level / Year 7" },
      { term: "absence / unexplained absence" },
      { term: "parent–teacher interview" },
      { term: "report card" },
      { term: "learning support" },
      { term: "excursion / permission note" },
      { term: "TAFE", note: "Government vocational education and training providers." },
    ],
    practice: ["School absence follow-up"],
  },
  {
    slug: "housing",
    name: "Housing",
    summary: "Renting, repairs, bond and public housing.",
    terms: [
      { term: "lease / tenancy agreement" },
      { term: "bond", note: "Security deposit, usually lodged with a state authority." },
      { term: "landlord / property manager / real estate agent" },
      { term: "urgent repairs / routine repairs" },
      { term: "rent arrears" },
      { term: "notice to vacate" },
      { term: "routine inspection" },
      { term: "condition report" },
      { term: "public / social housing" },
    ],
  },
  {
    slug: "legal",
    name: "Legal",
    summary: "Police, fines, courts and legal aid.",
    terms: [
      { term: "statement" },
      { term: "witness" },
      { term: "charge / charged with" },
      { term: "bail / bail conditions" },
      { term: "plead guilty / not guilty" },
      { term: "hearing / court date" },
      { term: "infringement notice (fine)" },
      { term: "legal aid" },
      { term: "intervention order / AVO", note: "Name varies by state." },
    ],
  },
  {
    slug: "community",
    name: "Community",
    summary: "Council services, community centres and local issues.",
    terms: [
      { term: "local council" },
      { term: "rates", note: "Council property charges." },
      { term: "bin collection / hard rubbish" },
      { term: "parking permit" },
      { term: "community centre" },
      { term: "volunteer" },
      { term: "noise complaint" },
      { term: "library membership" },
    ],
  },
];
