import type { Metadata } from "next";
import { JsonLd } from "@/components/marketing/seo/json-ld";
import { GuideLinks } from "@/components/marketing/seo/guide-links";
import { MigrationGuidesCallout } from "@/components/marketing/migration-guides-callout";
import { NaatiCclFinalCtaSection } from "@/components/marketing/naati-ccl/final-cta-section";
import { NaatiCclHeroSection } from "@/components/marketing/naati-ccl/hero-section";
import { NaatiCclLanguagesSection } from "@/components/marketing/naati-ccl/languages-section";
import { NaatiCclOverviewSection } from "@/components/marketing/naati-ccl/overview-section";
import { NaatiCclPricingSection } from "@/components/marketing/naati-ccl/pricing-section";
import { NaatiCclShowcaseSection } from "@/components/marketing/naati-ccl/showcase-section";
import { NaatiCclStarterPackSection } from "@/components/marketing/naati-ccl/starter-pack-section";
import { NaatiCclWhySection } from "@/components/marketing/naati-ccl/why-section";
import { FaqSection } from "@/components/marketing/seo/faq-section";
import { NAATI_CCL_FEE, NAATI_CCL_SEGMENT_MAX_WORDS, NAATI_CCL_VALIDITY_YEARS, naatiCclLanguages } from "@/lib/naati-ccl";
import { COMMUNITY_LANGUAGE_POINTS } from "@/lib/points-test";
import { CCL_DIALOGUE_PASS_SCORE, CCL_MAX_SCORE, CCL_PASS_SCORE } from "@/lib/scoring";
import { pageMetadata } from "@/lib/seo-metadata";
import { breadcrumbJsonLd, courseJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = pageMetadata({
  title: "NAATI CCL Test Practice — Mock Dialogues Online",
  description:
    `Practise for the NAATI Credentialed Community Language (CCL) test: CCL-style dialogues with two AI speakers in your language, scored out of ${CCL_MAX_SCORE}. Try one free.`,
  path: "/naati/ccl",
});

const courseLd = courseJsonLd({
  name: "NAATI CCL practice",
  description:
    `Spoken CCL-style dialogues between an English-speaking professional and a community member, interpreted both ways and scored out of ${CCL_MAX_SCORE}. Independent of NAATI.`,
  path: "/naati/ccl",
  teaches: "Dialogue interpreting for the NAATI Credentialed Community Language test",
});

/** Facts from NAATI's CCL page (lib/naati-ccl.ts), hedged because NAATI changes them. */
const cclFaqs = [
  {
    q: "What is the NAATI CCL test?",
    a: "The Credentialed Community Language (CCL) test is NAATI's test of your ability to interpret short community conversations between English and another language. NAATI says it's generally taken by people applying for a points-based skilled visa. It isn't a professional certification: passing doesn't make you a certified interpreter or translator.",
  },
  {
    q: "What is the CCL exam format?",
    a: `Two pre-recorded dialogues between an English speaker and a speaker of your other language, each about a different topic. Dialogues are split into segments of up to ${NAATI_CCL_SEGMENT_MAX_WORDS} words, and you interpret each segment after it plays. NAATI says the test is held online only.`,
  },
  {
    q: "What is the CCL pass mark?",
    a: `Each dialogue is worth ${CCL_MAX_SCORE / 2} marks. You need ${CCL_PASS_SCORE} out of ${CCL_MAX_SCORE} overall and at least ${CCL_DIALOGUE_PASS_SCORE} in each dialogue.`,
  },
  {
    q: "How many PR points does the CCL give?",
    a: `A credentialled community language is worth ${COMMUNITY_LANGUAGE_POINTS} points in the points test for the 189, 190 and 491 visas at the time of writing. Home Affairs, not NAATI, decides whether you can claim them.`,
  },
  {
    q: "Which languages is the CCL test offered in?",
    a: `${naatiCclLanguages.length} at the time of writing, from Arabic to Yoruba. See our full list of NAATI CCL languages, and check NAATI's page before you book.`,
  },
  {
    q: "How much does the CCL test cost, and how long is it valid?",
    a: `NAATI lists the fee as ${NAATI_CCL_FEE}. Credentials issued from 9 August 2022 are valid for ${NAATI_CCL_VALIDITY_YEARS} years. Both can change, so check NAATI's website.`,
  },
];

export default function NaatiCclLandingPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 sm:gap-24 sm:px-6">
      <NaatiCclHeroSection />
      <NaatiCclWhySection />
      <NaatiCclLanguagesSection />
      <NaatiCclOverviewSection />
      <NaatiCclStarterPackSection />
      <NaatiCclShowcaseSection />
      <NaatiCclPricingSection />
      <GuideLinks
        title="CCL guides"
        extra={[
          {
            href: "/naati/ccl/vocabulary",
            title: "CCL vocabulary by domain",
            description: "English word lists for all 12 CCL domains, with notes on Australian terms.",
          },
        ]}
        slugs={["naati-ccl-test-format-and-marking", "naati-ccl-free-practice-resources", "naati-ccl-5-points-australian-pr"]}
      />
      <FaqSection title="About the CCL test" faqs={cclFaqs} />
      <MigrationGuidesCallout pagePath="/naati/ccl" />
      <NaatiCclFinalCtaSection />
      <JsonLd
        data={[
          courseLd,
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "NAATI CCL", path: "/naati/ccl" },
          ]),
        ]}
      />
    </main>
  );
}
