import Link from "next/link";
import { Check } from "lucide-react";
import { cclSignUpHref, pricingPlans, pricingReasons } from "./content";

/**
 * Renders the value and pricing portion of the CCL landing page.
 */
export function NaatiCclPricingSection() {
  return (
    <section className="space-y-6">
      <div className="max-w-2xl">
        <p className="eyebrow">Credit packages</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight lg:text-[2rem]">
          Credit Packages
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Keep the familiar package rhythm from the screenshot, but position it
          around XINGO access, seeded practice, and repeatable module work.
        </p>
      </div>

      <div className="rounded-4xl border border-[#e9eaf2] bg-white p-6">
        <div className="mb-5 text-center text-lg font-semibold">
          Why Choose Our Credit System?
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {pricingReasons.map((reason) => (
            <div
              key={reason.title}
              className="rounded-3xl border border-[#ececf3] bg-[#fafafe] p-5 text-center"
            >
              <div className="text-lg font-semibold">{reason.title}</div>
              <p className="mt-3 text-sm leading-6 text-muted">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {pricingPlans.map((plan) => (
          <article
            key={plan.name}
            className={`rounded-4xl border p-6 shadow-[0_16px_44px_rgba(18,18,18,0.04)] ${plan.tone}`}
          >
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
              {plan.name}
            </div>
            <div className="mt-4 text-5xl font-semibold">{plan.price}</div>
            <p className="mt-3 text-sm leading-7 text-muted">{plan.detail}</p>
            <div className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-3 text-sm leading-6"
                >
                  <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check size={13} />
                  </span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <Link
              href={cclSignUpHref}
              className={`${plan.ctaClass} mt-8 w-full justify-center`}
            >
              Choose {plan.name}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
