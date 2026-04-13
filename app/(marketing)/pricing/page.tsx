import Link from "next/link";
import {
  corporatePricingTiers,
  futurePricing,
  individualPricing,
  pricingAddOns,
  pricingSummary,
} from "@/lib/mock-data";

export default function PricingPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 pb-10 pt-4 lg:px-10">
      <section className="rounded-[2.5rem] border border-line bg-white/82 px-6 py-8 shadow-[0_16px_44px_rgba(18,18,18,0.06)] lg:px-10 lg:py-12">
        <p className="eyebrow">Pricing</p>
        <h1 className="display mt-4 max-w-4xl text-5xl font-semibold lg:text-6xl">
          Two simple ways to buy.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          Join as an interpreter, or license XINGO for a cohort.
        </p>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {pricingSummary.map((item) => (
            <article key={item.audience} className="surface-card rounded-[2rem] p-6">
              <p className="eyebrow">{item.audience}</p>
              <div className="mt-3 text-4xl font-semibold">{item.price}</div>
              <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="max-w-2xl">
          <p className="eyebrow">Individuals</p>
          <h2 className="display mt-3 text-4xl font-semibold">Start with the monthly plan.</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            The subscription is the default path. Assessments and certification sit on top as milestones.
          </p>
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          {individualPricing.map((item) => (
            <article key={item.name} className="surface-card rounded-[2rem] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold">{item.name}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted">{item.description}</p>
                </div>
                <div className="score-pill rounded-full px-4 py-2 text-sm font-semibold">{item.price}</div>
              </div>
              <div className="mt-5 space-y-2">
                {item.features.slice(0, 3).map((feature) => (
                  <div key={feature} className="rounded-[1.25rem] border border-line bg-white px-4 py-3 text-sm text-muted">
                    {feature}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="max-w-2xl">
          <p className="eyebrow">Teams</p>
          <h2 className="display mt-3 text-4xl font-semibold">Pay per candidate.</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Pricing drops as your cohort grows. Usage, reporting, and support expand by tier.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {corporatePricingTiers.map((tier) => (
            <article key={tier.name} className="surface-card rounded-[2rem] p-6">
              <p className="eyebrow">{tier.name}</p>
              <div className="mt-3 text-4xl font-semibold">{tier.price}</div>
              <p className="mt-1 text-sm text-muted">per candidate / month</p>
              <div className="mt-5 space-y-3 text-sm text-muted">
                <div>{tier.candidateVolume}</div>
                <div>{tier.trainingMinutes}</div>
                <div>{tier.reporting}</div>
                <div>{tier.marketplace}</div>
                <div>{tier.support}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-card rounded-[2rem] p-6">
          <p className="eyebrow">Add-ons</p>
          <div className="mt-5 space-y-3">
            {pricingAddOns.map((item) => (
              <div key={item.name} className="rounded-[1.25rem] border border-line bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-base font-semibold">{item.name}</h3>
                  <span className="text-sm font-semibold">{item.price}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="section-frame rounded-[2rem] p-6">
          <p className="eyebrow">Later</p>
          <div className="mt-5 space-y-3">
            {futurePricing.map((item) => (
              <div key={`${item.phase}-${item.name}`} className="rounded-[1.25rem] border border-line bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-base font-semibold">{item.name}</h3>
                  <span className="text-sm text-muted">{item.price}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{item.audience}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2.25rem] border border-line bg-[#121212] px-6 py-8 text-white lg:px-10">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Next step</p>
          <h2 className="display mt-3 text-4xl font-semibold">Pick the path that matches how you train.</h2>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/sign-up" className="action-secondary bg-white text-black hover:bg-white">
              Start as an interpreter
            </Link>
            <Link href="/for-organizations" className="action-secondary border-white/20 bg-white/10 text-white hover:bg-white/15">
              Talk to the team
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
