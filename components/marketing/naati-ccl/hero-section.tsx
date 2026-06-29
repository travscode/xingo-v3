import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import {
  cclModuleHref,
  cclSignInHref,
  cclSignUpHref,
  featureStats,
  trustItems,
} from "./content";

/**
 * Renders the hero section for the NAATI CCL landing page.
 */
export function NaatiCclHeroSection() {
  return (
    <section className="grid gap-8 rounded-[2.5rem] border border-line bg-white/88 px-6 py-8 shadow-[0_16px_44px_rgba(18,18,18,0.06)] lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-12">
      <div className="max-w-3xl">
        <p className="eyebrow">NAATI CCL mock test</p>
        <h1 className="display mt-4 text-5xl font-semibold tracking-tight text-balance lg:text-7xl">
          Practice short bilingual dialogues with a cleaner, faster CCL prep flow.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
          XINGO gives NAATI CCL learners a direct path from signup into a
          seeded practice module focused on short community-language exchanges,
          fast recall, and accurate transfer of meaning.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={cclSignUpHref} className="action-primary">
            Start mock practice
            <ArrowRightIcon className="ml-4 inline-block" size={14} />
          </Link>
          <Link href={cclSignInHref} className="action-secondary">
            Continue training
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          {trustItems.map((item) => (
            <span
              key={item}
              className="mono-chip rounded-full border-0 bg-brand-green px-4 py-2 font-semibold text-black"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="surface-card rounded-4xl p-6 lg:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Quick view</p>
            <h2 className="mt-3 text-3xl font-semibold">Module launch pad</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            <div className="rounded-3xl border border-line bg-white p-4">Phone</div>
            <div className="rounded-3xl border border-line bg-white p-4">Desktop</div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {featureStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-line bg-white p-4"
            >
              <div className="text-3xl font-semibold">{stat.value}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.16em] text-muted">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-[1.75rem] border border-line bg-[#f7f7ff] p-5">
          <p className="text-sm font-semibold">Direct module path</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Sign up from this page and land directly on the seeded CCL module
            instead of a generic dashboard entry point.
          </p>
          <Link
            href={cclModuleHref}
            className="action-secondary mt-5 inline-flex px-4 py-2 text-sm"
          >
            View module
          </Link>
        </div>
      </div>
    </section>
  );
}
