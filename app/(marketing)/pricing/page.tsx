import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { CtaBand, MarketingIntro } from "@/components/marketing/cta-band";
import { SALES_EMAIL, SUPPORT_EMAIL } from "@/components/marketing/catalogue";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { CURRENCY_LABEL, MAX_ATTEMPT_MINUTES, packList, plans } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free practice every month, a Pro plan, or one-off minute packs. Prices in AUD.",
};

const freeFeatures = [
  `${plans.free.monthlyMinutes} practice minutes every month`,
  "Full access to the free modules",
  "One free preview dialogue in every premium module",
  "Scoring and feedback included",
];

const proFeatures = [
  `${plans.professional.monthlyMinutes} practice minutes every month`,
  "Every module, including NAATI CCL and CPI practice",
  "Scoring and feedback included",
  "Cancel any time",
];

const faqs = [
  {
    question: "What counts as a practice minute?",
    answer: `Wall-clock time while a practice session is live, from when it starts until it ends. Each session is rounded up to the next whole minute and capped at ${MAX_ATTEMPT_MINUTES} minutes.`,
  },
  {
    question: "Is scoring extra?",
    answer: "No. Scoring, feedback and transcripts are included in the minute price.",
  },
  {
    question: "Do monthly minutes roll over?",
    answer: "No. Free and Pro minutes reset at the start of each calendar month. Pack minutes are different: they never expire.",
  },
  {
    question: "Do packs unlock premium modules?",
    answer: "Yes. While you have pack minutes, every module is open to you, not just the CCL module.",
  },
  {
    question: "How do I cancel Pro?",
    answer:
      "Any time. Go to Plan & minutes in your account and open the billing portal, which is run by Stripe. No emails or phone calls needed.",
  },
  {
    question: "What currency are prices in?",
    answer: `All prices are in Australian dollars (${CURRENCY_LABEL}).`,
  },
];

export default function PricingPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 sm:px-6">
      <MarketingIntro
        eyebrow="Pricing"
        title="Pay for practice time. Scoring is included."
        description={`Start free. Upgrade to Pro for every module, or buy a one-off pack before your test. Prices in ${CURRENCY_LABEL}.`}
      />

      {/* Plans */}
      <section className="grid gap-4 md:grid-cols-2">
        <PlanCard
          name={plans.free.label}
          price={plans.free.priceLabel}
          tagline={plans.free.tagline}
          features={freeFeatures}
          cta={
            <Button asChild variant="outline" block size="lg">
              <Link href="/sign-up">Start free</Link>
            </Button>
          }
        />
        <PlanCard
          name={plans.professional.label}
          price={plans.professional.priceLabel}
          tagline={plans.professional.tagline}
          features={proFeatures}
          highlight
          cta={
            <Button asChild variant="accent" block size="lg">
              <Link href="/sign-up?redirect=%2Fbilling">Get Pro</Link>
            </Button>
          }
        />
      </section>

      {/* Packs */}
      <section id="packs" className="scroll-mt-24">
        <p className="eyebrow">Minute packs</p>
        <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">Preparing for a test date?</h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-6 text-gray-500">
          One-off payment, no subscription. Pack minutes never expire, and every module is unlocked while you have
          them.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {packList.map((pack) => (
            <article key={pack.id} className="flex flex-col rounded-xl border border-gray-200 p-6">
              <h3 className="text-base font-bold">{pack.label}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-[-0.03em]">{pack.priceLabel}</span>
              </div>
              <div className="mt-1 text-sm font-semibold">{pack.minutes} practice minutes</div>
              <p className="mt-3 flex-1 text-sm leading-6 text-gray-500">{pack.description}</p>
              <Button asChild variant="secondary" block className="mt-6">
                <Link href="/sign-up?redirect=%2Fbilling">Buy {pack.label}</Link>
              </Button>
            </article>
          ))}
        </div>
      </section>

      {/* Teams */}
      <section className="flex flex-col gap-6 rounded-xl bg-gray-50 p-6 sm:p-10 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="eyebrow">{plans.organization.label}</p>
          <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
            Training providers and interpreting teams
          </h2>
          <p className="mt-3 text-[15px] leading-6 text-gray-500">
            Need access for a cohort of students or staff? Tell us how many people and what you&apos;re preparing
            for, and we&apos;ll set it up with you.
          </p>
        </div>
        <Button asChild size="lg">
          <a href={`mailto:${SALES_EMAIL}?subject=XINGO%20for%20teams`}>Contact us</a>
        </Button>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-3xl font-bold tracking-[-0.03em] sm:text-4xl">Questions</h2>
        <dl className="mt-8 divide-y divide-gray-200 border-y border-gray-200">
          {faqs.map((faq) => (
            <div key={faq.question} className="grid gap-2 py-6 md:grid-cols-[1fr_1.4fr] md:gap-10">
              <dt className="font-semibold">{faq.question}</dt>
              <dd className="text-[15px] leading-6 text-gray-500">{faq.answer}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm text-gray-500">
          Something else? Email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-ink underline underline-offset-4">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </section>

      <CtaBand
        title="Try it before you pay."
        description={`${plans.free.monthlyMinutes} free practice minutes every month, plus a free preview dialogue in every premium module.`}
      />
    </main>
  );
}

function PlanCard({
  name,
  price,
  tagline,
  features,
  cta,
  highlight,
}: {
  name: string;
  price: string;
  tagline: string;
  features: string[];
  cta: ReactNode;
  highlight?: boolean;
}) {
  return (
    <article
      className={
        highlight
          ? "flex flex-col rounded-xl bg-ink p-6 text-paper sm:p-8"
          : "flex flex-col rounded-xl border border-gray-200 p-6 sm:p-8"
      }
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{name}</h2>
        {highlight ? <Badge tone="accent">Every module</Badge> : null}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-4xl font-bold tracking-[-0.03em]">{price}</span>
      </div>
      <p className={highlight ? "mt-2 text-sm text-gray-300" : "mt-2 text-sm text-gray-500"}>{tagline}</p>
      <ul className="mt-6 flex-1 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-[15px]">
            <Check size={18} className="mt-0.5 shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8">{cta}</div>
    </article>
  );
}
