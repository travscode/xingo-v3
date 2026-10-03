import { practiceColumns, scenarioCards } from "./content";

/** What the CCL course covers. */
export function NaatiCclOverviewSection() {
  return (
    <section id="practice" className="scroll-mt-24">
      <p className="eyebrow">What you practise</p>
      <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
        Short community dialogues, the way the test runs them
      </h2>
      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {practiceColumns.map((column) => (
            <div key={column.heading} className="rounded-xl bg-gray-50 p-6">
              <h3 className="eyebrow">{column.heading}</h3>
              <ul className="mt-4 space-y-2 text-[15px]">
                {column.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-gray-200">
          <h3 className="border-b border-gray-200 px-6 py-4 text-base font-bold">Dialogues in the CCL course</h3>
          <ul className="divide-y divide-gray-200">
            {scenarioCards.map((scenario) => (
              <li key={scenario.title} className="px-6 py-4">
                <div className="font-semibold">{scenario.title}</div>
                <div className="mt-1 text-sm leading-6 text-gray-500">{scenario.description}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
