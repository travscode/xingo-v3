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
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-700">
              NAATI CCL mock test
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 lg:text-[3.15rem] lg:leading-[1.05]">
              Start practicing real-life community dialogues with a cleaner CCL
              prep flow.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 lg:text-base">
              Choose your target language, create an account, and go straight
              into the XINGO CCL module built for short-turn recall, instruction
              transfer, and exam-style repetition.
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-4xl border border-[#e6e7f0] bg-white p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Scan to begin
              </div>
              <div className="mt-4 aspect-square rounded-3xl border border-dashed border-slate-300 bg-[linear-gradient(135deg,#f5f3ff,#ffffff,#ede9fe)] p-4">
                <div className="grid h-full grid-cols-6 gap-1">
                  {Array.from({ length: 36 }).map((_, index) => (
                    <div
                      key={index}
                      className={`rounded-sm ${index % 3 === 0 || index % 5 === 0 ? "bg-slate-900" : "bg-transparent"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-xs leading-6 text-slate-500">
                Placeholder QR-style visual to echo the screenshot structure.
              </p>
            </div>

            <div className="rounded-4xl border border-[#e6e7f0] bg-white p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Quick module view
              </div>
              <div className="mt-4 space-y-3">
                {featureStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-3xl border border-[#ececf3] bg-[#fafafe] px-4 py-3"
                  >
                    <div className="text-lg font-semibold text-slate-900">
                      {stat.value}
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href={cclModuleHref}
                className="action-secondary mt-4 inline-flex px-4 py-2 text-sm"
              >
                View module
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
