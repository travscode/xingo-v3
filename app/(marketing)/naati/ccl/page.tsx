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
    "Prepare for the NAATI CCL test with focused short-dialogue practice inside XINGO.",
};

/**
 * Renders the NAATI CCL landing page using imported section components.
 */
export default function NaatiCclLandingPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 pb-10 pt-4 lg:px-10">
      <NaatiCclHeroSection />
      <NaatiCclWhySection />
      <NaatiCclLanguagesSection />
      <NaatiCclStarterPackSection />
      <NaatiCclOverviewSection />
      <NaatiCclShowcaseSection />
      <NaatiCclPricingSection />
      <NaatiCclFinalCtaSection />
    </main>
  );
}
