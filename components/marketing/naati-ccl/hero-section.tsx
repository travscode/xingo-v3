import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import {
  cclModuleHref,
  cclSignInHref,
  cclSignUpHref,
  featureStats,
  heroStats,
  heroTabs,
  trustItems,
} from "./content";

/**
 * Renders the hero section for the NAATI CCL landing page.
 */
export function NaatiCclHeroSection() {
  return (
    <section className="space-y-5">
      <div className="rounded-[2.5rem] border border-[#e6e7f0] bg-[#f7f7fb] px-6 py-6 shadow-[0_12px_34px_rgba(18,18,18,0.04)] lg:px-8">
        <div className="grid gap-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-700">
              NAATI CCL mock test
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 lg:text-[3.15rem] lg:leading-[1.05]">
              Don&apos;t walk into an $800 exam hoping for the best.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 lg:text-base">
              Xingo helps you practise realistic NAATI exam style conversations
              with AI voice, so you can practice and be prepared for the NAATI
              CCL exam.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-[#e6e7f0] bg-white px-4 py-3"
                >
                  <div className="text-2xl font-semibold text-slate-900">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href={cclSignUpHref} className="action-primary">
                Get started
                <ArrowRightIcon className="ml-4 inline-block" size={14} />
              </Link>
              <Link href={cclSignInHref} className="action-secondary">
                How to excel?
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-line pb-2">
        {heroTabs.map((item) => (
          <div
            key={item}
            className="rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-slate-600"
          >
            {item}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        {trustItems.map((item) => (
          <span
            key={item}
            className="mono-chip rounded-full border-0 bg-brand-green px-4 py-2 font-semibold text-black"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
