import Link from "next/link";
import { Download, FileText, ListChecks } from "lucide-react";
import { cclSignUpHref } from "./content";

/**
 * Renders the download-style CTA block without copying external assets or copy.
 */
export function NaatiCclStarterPackSection() {
  return (
    <section className="grid gap-4 lg:grid-cols-[0.68fr_0.32fr]">
      <div className="rounded-4xl bg-[#2b7fff] px-6 py-7 text-white shadow-[0_18px_50px_rgba(43,127,255,0.2)] lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
          Download
        </p>
        <h2 className="mt-3 text-4xl font-semibold">Open the CCL prep path.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
          Use this block like the screenshot&apos;s download call-to-action:
          create an account, unlock the route, and move directly into the seeded
          module.
        </p>
        <Link
          href={cclSignUpHref}
          className="mt-6 inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#2b7fff] transition hover:bg-white/90"
        >
          <Download size={16} />
          Unlock starter access
        </Link>
      </div>
      <div className="rounded-4xl border border-[#eaebf2] bg-white p-6">
        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 text-violet-600" size={18} />
            <div>
              <div className="font-semibold">What you get</div>
              <div className="mt-1 leading-6 text-muted">
                A cleaner first step into the NAATI CCL module and its seeded
                practice scenarios.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ListChecks className="mt-0.5 text-violet-600" size={18} />
            <div>
              <div className="font-semibold">Best used for</div>
              <div className="mt-1 leading-6 text-muted">
                Learners who want to reduce friction and start practicing the
                highest-value dialogue types immediately.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
