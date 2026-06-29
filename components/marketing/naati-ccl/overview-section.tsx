import { overviewColumns } from "./content";

/**
 * Renders the test-overview style grid for the CCL landing page.
 */
export function NaatiCclOverviewSection() {
  return (
    <section className="space-y-6">
      <div className="max-w-2xl">
        <p className="eyebrow">Test overview</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight lg:text-[2rem]">
          Actual NAATI CCL Test Overview
        </h2>
      </div>
      <div className="rounded-4xl border border-[#eaebf2] bg-white p-5">
        <div className="mb-5 flex flex-wrap gap-2 border-b border-line pb-3 text-xs font-semibold text-slate-500">
          {["About CCL", "Topics", "Scoring", "Results"].map((tab) => (
            <span key={tab} className="rounded-full bg-[#f5f5fb] px-3 py-2">
              {tab}
            </span>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          {overviewColumns.map((column) => (
            <div
              key={column.heading}
              className="rounded-[1.4rem] border border-[#ececf3] bg-[#fafafe] p-4"
            >
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {column.heading}
              </h3>
              <div className="mt-4 space-y-2">
                {column.items.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-line bg-[#fafafa] px-3 py-2 text-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
