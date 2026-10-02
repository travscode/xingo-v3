import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { CURRENCY_LABEL, packList, plans } from "@/lib/plans";
import { cclSignUpHref } from "./content";

export function NaatiCclPricingSection() {
  return (
    <section id="pricing" className="scroll-mt-24">
      <p className="eyebrow">Pricing</p>
      <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">Minute packs for test prep</h2>
      <p className="mt-3 max-w-2xl text-[15px] leading-6 text-gray-500">
        Pay once. Pack minutes never expire, and they unlock every module while you have them. Scoring and feedback
        are included. Prices in {CURRENCY_LABEL}.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {packList.map((pack) => {
          const featured = pack.id === "sprint";

          return (
            <article
              key={pack.id}
              className={
                featured
                  ? "flex flex-col rounded-xl bg-ink p-6 text-paper"
                  : "flex flex-col rounded-xl border border-gray-200 p-6"
              }
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-bold">{pack.label}</h3>
                {featured ? <Badge tone="accent">Most minutes</Badge> : null}
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-[-0.03em]">{pack.priceLabel}</span>
              </div>
              <div className="mt-1 text-sm font-semibold">{pack.minutes} practice minutes</div>
              <p className={featured ? "mt-3 flex-1 text-sm leading-6 text-gray-300" : "mt-3 flex-1 text-sm leading-6 text-gray-500"}>
                {pack.description}
              </p>
              <Button asChild variant={featured ? "accent" : "secondary"} block className="mt-6">
                <Link href={cclSignUpHref}>Start with {pack.label}</Link>
              </Button>
            </article>
          );
        })}
      </div>
      <p className="mt-6 text-sm text-gray-500">
        Practising for longer? {plans.professional.label} is {plans.professional.priceLabel} for{" "}
        {plans.professional.monthlyMinutes} minutes a month.{" "}
        <Link href="/pricing" className="font-semibold text-ink underline underline-offset-4">
          Compare all plans
        </Link>
      </p>
    </section>
  );
}
