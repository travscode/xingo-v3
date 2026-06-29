import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRightIcon } from "@/components/ui/icons";

const cclModuleId = "naati-certification-practice-ccl";
const cclModuleHref = `/modules/${cclModuleId}`;
const cclSignUpHref = `/sign-up?redirect=${encodeURIComponent(cclModuleHref)}`;
const cclSignInHref = `/sign-in?redirect=${encodeURIComponent(cclModuleHref)}`;

const benefits = [
  "Practice short community dialogues shaped around the NAATI CCL format.",
  "Build speed with dates, names, instructions, documents, and service language.",
  "Move from signup straight into the CCL module without extra setup steps.",
];

const scenarioHighlights = [
  {
    title: "Medical Scan Booking",
    copy: "Rehearse appointment timing, fasting instructions, referrals, and follow-up questions.",
  },
  {
    title: "School Absence Follow-up",
    copy: "Carry attendance counts, document requests, and reporting procedures clearly.",
  },
  {
    title: "Tenancy Maintenance Call",
    copy: "Practice access times, repair windows, and practical housing instructions.",
  },
  {
    title: "Centrelink Appointment Change",
    copy: "Retain deadlines, required documents, and next-step guidance in a public-service setting.",
  },
  {
    title: "Police Witness Statement",
    copy: "Strengthen factual chronology, location detail, and neutral delivery under pressure.",
  },
];

const practicePoints = [
  "Short-turn bilingual transfer",
  "Community-service vocabulary",
  "Dates, times, and document accuracy",
  "Natural delivery without dropping meaning",
];

const faqs = [
  {
    question: "Who is this page for?",
    answer:
      "It is for learners preparing for the NAATI CCL test and anyone who wants targeted community-language dialogue practice before exam day.",
  },
  {
    question: "What happens after signup?",
    answer:
      "The signup and sign-in links on this page send learners directly into the NAATI CCL module so they can start with the seeded scenarios straight away.",
  },
  {
    question: "Does this claim official NAATI accreditation?",
    answer:
      "No. This is practice content designed to support CCL preparation inside XINGO.",
  },
];

export const metadata: Metadata = {
  title: "NAATI CCL Practice",
  description:
    "Prepare for the NAATI CCL test with focused short-dialogue practice inside XINGO.",
};

export default function NaatiCclLandingPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 pb-10 pt-4 lg:px-10">
      <section className="grid gap-8 rounded-[2.5rem] border border-line bg-white/82 px-6 py-8 shadow-[0_16px_44px_rgba(18,18,18,0.06)] lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-12">
        <div className="max-w-3xl">
          <p className="eyebrow">NAATI CCL practice</p>
          <h1 className="display mt-4 text-5xl font-semibold text-balance lg:text-7xl">
            Train for the NAATI CCL test with short, focused dialogue practice.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
            This page is built for learners who want targeted community-language
            practice across health, housing, education, government services, and
            police-style conversations. The flow is simple: sign up, land in the
            CCL module, and start practicing.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={cclSignUpHref} className="action-primary">
              Start CCL practice
              <ArrowRightIcon className="ml-4 inline-block" size={14} />
            </Link>
            <Link href={cclSignInHref} className="action-secondary">
              I already have an account
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-3 text-sm text-muted">
            {benefits.map((benefit) => (
              <span
                key={benefit}
                className="mono-chip rounded-full border-0 bg-brand-green px-4 py-2 font-semibold text-black"
              >
                {benefit}
              </span>
            ))}
          </div>
        </div>

        <div className="surface-card rounded-4xl p-6 lg:p-8">
          <p className="eyebrow">Inside the module</p>
          <h2 className="mt-3 text-3xl font-semibold">
            One CCL-focused pathway, ready to open after auth.
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            The seeded module is tuned for short bilingual exchanges that test
            retention, accuracy, and natural community-language transfer.
          </p>
          <div className="mt-6 grid gap-3">
            {practicePoints.map((item) => (
              <div
                key={item}
                className="rounded-[1.25rem] border border-line bg-white p-4 text-sm"
              >
                {item}
              </div>
            ))}
          </div>
          <Link href={cclModuleHref} className="action-secondary mt-6">
            View seeded module
          </Link>
        </div>
      </section>

      <section className="section-frame rounded-[2.5rem] p-6 lg:p-10">
        <div className="max-w-3xl">
          <p className="eyebrow">Why this works</p>
          <h2 className="display mt-3 text-4xl font-semibold lg:text-5xl">
            Practice the kind of details that usually decide the score.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            CCL preparation is not just about knowing words. It is about
            carrying meaning quickly and cleanly when a speaker gives you a
            time, a condition, a deadline, or a set of instructions. This page
            funnels learners into a module built around exactly that kind of
            pressure.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <div className="max-w-2xl">
          <p className="eyebrow">Scenario set</p>
          <h2 className="display mt-3 text-4xl font-semibold">
            Five seeded CCL-style practice scenarios.
          </h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {scenarioHighlights.map((scenario) => (
            <article
              key={scenario.title}
              className="surface-card rounded-4xl p-6"
            >
              <h3 className="text-2xl font-semibold">{scenario.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">
                {scenario.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="surface-card rounded-4xl p-6">
          <p className="eyebrow">Step 1</p>
          <h3 className="mt-3 text-2xl font-semibold">Create your account</h3>
          <p className="mt-3 text-sm leading-7 text-muted">
            Use the CCL signup link on this page. It keeps the flow focused on
            the module instead of sending learners into a generic dashboard.
          </p>
        </article>
        <article className="surface-card rounded-4xl p-6">
          <p className="eyebrow">Step 2</p>
          <h3 className="mt-3 text-2xl font-semibold">Open the CCL module</h3>
          <p className="mt-3 text-sm leading-7 text-muted">
            After auth, users land directly on the seeded NAATI CCL module page
            and can choose a scenario immediately.
          </p>
        </article>
        <article className="surface-card rounded-4xl p-6">
          <p className="eyebrow">Step 3</p>
          <h3 className="mt-3 text-2xl font-semibold">
            Start short-turn practice
          </h3>
          <p className="mt-3 text-sm leading-7 text-muted">
            Focus on speed, completeness, and natural transfer across the
            scenarios that matter most for CCL preparation.
          </p>
        </article>
      </section>

      <section className="space-y-4">
        <div className="max-w-2xl">
          <p className="eyebrow">FAQ</p>
          <h2 className="display mt-3 text-4xl font-semibold">
            Common questions from CCL learners.
          </h2>
        </div>
        {faqs.map((item) => (
          <article
            key={item.question}
            className="surface-card rounded-4xl p-6 lg:p-8"
          >
            <h3 className="text-2xl font-semibold">{item.question}</h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              {item.answer}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-[2.25rem] border border-line bg-[#121212] px-6 py-8 text-white lg:px-10 lg:py-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
            Start now
          </p>
          <h2 className="display mt-3 text-4xl font-semibold">
            Sign up and go straight to the NAATI CCL module.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
            No extra onboarding detours. The CTA on this page takes learners
            into the CCL module path as soon as authentication is complete.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={cclSignUpHref}
              className="action-secondary bg-brand-green text-black hover:bg-white"
            >
              Create account for CCL
              <ArrowRightIcon className="ml-4 inline-block" size={14} />
            </Link>
            <Link
              href={cclSignInHref}
              className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Sign in and continue
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
