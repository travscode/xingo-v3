import { pricingPlans } from "@/lib/mock-data";

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 pb-10 lg:px-10">
      <section className="section-frame rounded-[2.5rem] px-8 py-12 lg:px-12">
        <p className="eyebrow">Pricing</p>
        <h1 className="display mt-4 text-5xl font-semibold tracking-tight">Plans built around access and oversight.</h1>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <article key={plan.name} className="surface-card rounded-[2rem] p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">{plan.name}</div>
              <div className="mt-4 text-4xl font-semibold tracking-tight">{plan.price}</div>
              <p className="mt-4 text-sm leading-7 text-muted">{plan.description}</p>
              <ul className="mt-6 space-y-3 text-sm text-muted">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
