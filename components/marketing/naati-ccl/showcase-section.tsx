import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { cclSignUpHref, scenarioCards } from "./content";

/**
 * Renders the product showcase section with an original dashboard-style mockup.
 */
export function NaatiCclShowcaseSection() {
  return (
    <section className="space-y-8">
      <div className="text-center">
        <p className="eyebrow">Practice makes progress</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight lg:text-[2.35rem]">
          Practice Makes Perfect
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-muted">
          Build confidence with a cleaner replay loop, progress visibility, and
          seeded scenarios that stay close to high-value CCL dialogue patterns.
        </p>
      </div>

      <div className="rounded-[2.5rem] border border-[#e9eaf2] bg-white p-5 shadow-[0_16px_44px_rgba(18,18,18,0.06)] lg:p-6">
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[1.75rem] border border-line bg-[#fbfbff] p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Attempt dashboard</div>
                <div className="text-xs text-muted">Recent mock-practice activity</div>
              </div>
              <div className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                Live module
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl bg-white p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-muted">
                  Attempts
                </div>
                <div className="mt-2 text-3xl font-semibold">12</div>
              </div>
              <div className="rounded-3xl bg-white p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-muted">
                  Best score
                </div>
                <div className="mt-2 text-3xl font-semibold">84%</div>
              </div>
              <div className="rounded-3xl bg-white p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-muted">
                  Focus area
                </div>
                <div className="mt-2 text-lg font-semibold">Dates and recall</div>
              </div>
            </div>
            <div className="mt-5 flex h-48 items-end gap-3 rounded-[1.75rem] bg-white p-4">
              {[42, 58, 36, 72, 61, 80, 74, 84].map((height, index) => (
                <div key={height} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-t-2xl ${index % 2 === 0 ? "bg-blue-500" : "bg-violet-500"}`}
                    style={{ height: `${height * 1.4}px` }}
                  />
                  <span className="text-[11px] text-muted">A{index + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-line bg-white p-5">
            <div className="text-sm font-semibold">Seeded scenario lineup</div>
            <div className="mt-4 space-y-3">
              {scenarioCards.map((scenario) => (
                <div
                  key={scenario.title}
                  className="rounded-3xl border border-line bg-[#fafafa] p-4"
                >
                  <div className="font-semibold">{scenario.title}</div>
                  <div className="mt-2 text-sm leading-6 text-muted">
                    {scenario.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-3 rounded-[1.75rem] bg-linear-to-r from-blue-600 via-violet-600 to-fuchsia-600 px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold">Go straight into the seeded CCL module.</div>
            <div className="mt-1 text-sm text-white/75">
              Keep the funnel focused on signup, module open, and scenario start.
            </div>
          </div>
          <Link
            href={cclSignUpHref}
            className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-violet-700 transition hover:bg-white/90"
          >
            Start CCL now
            <ArrowRightIcon className="ml-3 inline-block" size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
