import { overviewColumns } from "./content";

/**
 * Renders the test-overview style grid for the CCL landing page.
 */
export function NaatiCclOverviewSection() {
  return (
    <section className="space-y-6">
      <div className="max-w-2xl">
        <p className="eyebrow">Test overview</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight lg:text-4xl">
          Show learners what this practice path is actually training.
        </h2>
      </div>
      <div className="surface-card rounded-4xl p-6">
        <div className="grid gap-4 lg:grid-cols-4">
          {overviewColumns.map((column) => (
            <div key={column.heading} className="rounded-3xl border border-line bg-white p-4">
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
