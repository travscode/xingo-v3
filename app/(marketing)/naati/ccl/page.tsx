import type { Metadata } from "next";
import { NaatiCclFinalCtaSection } from "@/components/marketing/naati-ccl/final-cta-section";
import { NaatiCclHeroSection } from "@/components/marketing/naati-ccl/hero-section";
import { NaatiCclLanguagesSection } from "@/components/marketing/naati-ccl/languages-section";
import { NaatiCclOverviewSection } from "@/components/marketing/naati-ccl/overview-section";
import { NaatiCclPricingSection } from "@/components/marketing/naati-ccl/pricing-section";
import { NaatiCclShowcaseSection } from "@/components/marketing/naati-ccl/showcase-section";
import { NaatiCclStarterPackSection } from "@/components/marketing/naati-ccl/starter-pack-section";
import { NaatiCclWhySection } from "@/components/marketing/naati-ccl/why-section";

export const metadata: Metadata = {
  title: "NAATI CCL Practice",
  description:
    "Practise NAATI CCL-style dialogues out loud with AI speakers. Scored out of 90 with feedback after every attempt. Independent of NAATI.",
};

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
      <NaatiCclFinalCtaSection />
    </main>
  );
}
