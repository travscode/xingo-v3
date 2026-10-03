import type { Metadata } from "next";
import { JsonLd } from "@/components/marketing/seo/json-ld";
import { GuideLinks } from "@/components/marketing/seo/guide-links";
import { NaatiCclFinalCtaSection } from "@/components/marketing/naati-ccl/final-cta-section";
import { NaatiCclHeroSection } from "@/components/marketing/naati-ccl/hero-section";
import { NaatiCclLanguagesSection } from "@/components/marketing/naati-ccl/languages-section";
import { NaatiCclOverviewSection } from "@/components/marketing/naati-ccl/overview-section";
import { NaatiCclPricingSection } from "@/components/marketing/naati-ccl/pricing-section";
import { NaatiCclShowcaseSection } from "@/components/marketing/naati-ccl/showcase-section";
import { NaatiCclStarterPackSection } from "@/components/marketing/naati-ccl/starter-pack-section";
import { NaatiCclWhySection } from "@/components/marketing/naati-ccl/why-section";
import { CCL_MAX_SCORE } from "@/lib/scoring";
import { pageMetadata } from "@/lib/seo-metadata";
import { breadcrumbJsonLd, courseJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = pageMetadata({
  title: "NAATI CCL Practice Online — Scored Mock Dialogues",
  description:
    `Practise NAATI CCL-style dialogues out loud with two AI speakers in your language pair. Scored out of ${CCL_MAX_SCORE} with feedback after every attempt. First dialogue free.`,
  path: "/naati/ccl",
});

const courseLd = courseJsonLd({
  name: "NAATI CCL practice",
  description:
    `Spoken CCL-style dialogues between an English-speaking professional and a community member, interpreted both ways and scored out of ${CCL_MAX_SCORE}. Independent of NAATI.`,
  path: "/naati/ccl",
  teaches: "Dialogue interpreting for the NAATI Credentialed Community Language test",
});

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
