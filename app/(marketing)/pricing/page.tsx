import { SectionHeading } from "@/components/ui/section-heading";
import {
  corporatePricingTiers,
  futurePricing,
  individualPricing,
  marketplaceRules,
  pricingAddOns,
  pricingSummary,
} from "@/lib/mock-data";

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-7xl space-y-10 px-6 pb-10 lg:px-10">
      <section className="section-frame rounded-[2.5rem] px-8 py-12 lg:px-12">
        <p className="eyebrow">Pricing</p>
        <h1 className="display mt-4 max-w-4xl text-5xl font-semibold tracking-tight">
          Simplified into two buying paths: one for interpreters, one for organizations.
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-muted">
          The spreadsheet had a lot of overlapping monetization ideas. This page reduces that to a
          clear commercial structure: a monthly membership and targeted assessments for individuals,
          then a per-candidate licensing model for LSPs, certifiers, and training providers.
        </p>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {pricingSummary.map((item) => (
            <article key={item.audience} className="surface-card rounded-[2rem] p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                {item.audience}
              </div>
              <div className="mt-4 text-4xl font-semibold tracking-tight">{item.price}</div>
              <p className="mt-4 text-sm leading-7 text-muted">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Individuals"
          title="Subscription first, with one-off assessments layered on top."
          description="This keeps the offer easy to understand: most interpreters join on the monthly plan, while readiness checks, human reviews, and certification are separate paid milestones."
        />
        <div className="grid gap-6 xl:grid-cols-2">
          {individualPricing.map((item) => (
            <article key={item.name} className="surface-card rounded-[2rem] p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">{item.name}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{item.description}</p>
                </div>
                <div className="rounded-[1.5rem] bg-brand px-4 py-3 text-right text-white">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/70">Price</div>
                  <div className="mt-1 text-2xl font-semibold">{item.price}</div>
                </div>
              </div>
              <div className="mt-6 grid gap-3 text-sm text-muted">
                {item.features.map((feature) => (
                  <div key={feature} className="rounded-[1.25rem] border border-line bg-white/70 px-4 py-3">
                    {feature}
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm leading-7 text-muted">{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Corporate"
          title="Per-candidate licensing with volume discounts."
          description="The spreadsheet already points toward a clean LSP model. Keep the entry point simple: charge per candidate per month, then differentiate by usage cap, reporting depth, marketplace access, and support."
        />
        <div className="overflow-hidden rounded-[2rem] border border-line bg-white/70">
          <div className="grid grid-cols-4 border-b border-line bg-surface-strong/70 text-sm font-semibold">
            <div className="px-4 py-4">Tier</div>
            <div className="px-4 py-4">Basic</div>
            <div className="px-4 py-4">Professional</div>
            <div className="px-4 py-4">Enterprise</div>
          </div>
          {[
            {
              label: "Price",
              values: corporatePricingTiers.map((tier) => `${tier.price} / candidate / month`),
            },
            {
              label: "Candidate volume",
              values: corporatePricingTiers.map((tier) => tier.candidateVolume),
            },
            {
              label: "Training minutes",
              values: corporatePricingTiers.map((tier) => tier.trainingMinutes),
            },
            {
              label: "Extra usage",
              values: corporatePricingTiers.map((tier) => tier.extraUsage),
            },
            {
              label: "Custom modules",
              values: corporatePricingTiers.map((tier) => tier.customModules),
            },
            {
              label: "Scenario uploads",
              values: corporatePricingTiers.map((tier) => tier.scenarioUploads),
            },
            {
              label: "Reporting",
              values: corporatePricingTiers.map((tier) => tier.reporting),
            },
            {
              label: "Marketplace access",
              values: corporatePricingTiers.map((tier) => tier.marketplace),
            },
            {
              label: "Support",
              values: corporatePricingTiers.map((tier) => tier.support),
            },
          ].map((row) => (
            <div key={row.label} className="grid grid-cols-4 border-b border-line last:border-b-0">
              <div className="px-4 py-4 text-sm font-semibold">{row.label}</div>
              {row.values.map((value) => (
                <div key={`${row.label}-${value}`} className="px-4 py-4 text-sm leading-6 text-muted">
                  {value}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="section-frame rounded-[2rem] p-6">
          <p className="eyebrow">Marketplace rules</p>
          <div className="mt-5 space-y-4">
            {marketplaceRules.map((rule) => (
              <div key={rule} className="rounded-[1.5rem] border border-line bg-white/70 p-4 text-sm leading-7 text-muted">
                {rule}
              </div>
            ))}
          </div>
        </div>
        <div className="surface-card rounded-[2rem] p-6">
          <p className="eyebrow">Add-ons</p>
          <div className="mt-5 space-y-4">
            {pricingAddOns.map((item) => (
              <div key={item.name} className="rounded-[1.5rem] border border-line bg-white/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold tracking-tight">{item.name}</h2>
                  <span className="text-sm font-semibold text-brand">{item.price}</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-frame rounded-[2rem] p-6">
        <p className="eyebrow">Later phases</p>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {futurePricing.map((item) => (
            <article key={`${item.phase}-${item.name}`} className="surface-card rounded-[2rem] p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full border border-line px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  {item.phase}
                </span>
                <span className="text-sm font-semibold text-brand">{item.price}</span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight">{item.name}</h2>
              <p className="mt-2 text-sm font-medium text-muted">{item.audience}</p>
              <p className="mt-4 text-sm leading-7 text-muted">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
