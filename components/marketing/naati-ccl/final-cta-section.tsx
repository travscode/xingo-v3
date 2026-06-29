import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { cclSignInHref, cclSignUpHref } from "./content";

/**
 * Renders the closing CTA for the CCL landing page.
 */
export function NaatiCclFinalCtaSection() {
  return (
    <section className="rounded-[2.25rem] border border-line bg-[#121212] px-6 py-8 text-white lg:px-10 lg:py-10">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
          Ready to start
        </p>
        <h2 className="display mt-3 text-4xl font-semibold">
          Open the CCL path and send learners straight into the module.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
          The auth flow on this page keeps the journey tight: signup, land on
          the NAATI CCL module, then begin practice from the seeded scenarios.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={cclSignUpHref}
            className="action-secondary bg-brand-green text-black hover:bg-white"
          >
            Create account for CCL
            <ArrowRightIcon className="ml-4 inline-block" size={14} />
          </Link>
          <Link
            href={cclSignInHref}
            className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Sign in and continue
          </Link>
        </div>
      </div>
    </section>
  );
}
