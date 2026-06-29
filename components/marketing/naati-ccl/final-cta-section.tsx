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
          Ready to start practicing for the CCL exam now?
        </h2>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={cclSignUpHref}
            className="action-secondary bg-brand-green text-black hover:bg-white"
          >
            Start practicing now
            <ArrowRightIcon className="ml-4 inline-block" size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
