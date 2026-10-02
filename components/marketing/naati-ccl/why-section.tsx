import { formatFacts } from "./content";

/** About the CCL test format. */
export function NaatiCclWhySection() {
  return (
    <section id="format" className="scroll-mt-24">
      <p className="eyebrow">Test format</p>
      <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.03em] sm:text-4xl">How the CCL test works</h2>
      <p className="mt-3 max-w-2xl text-[15px] leading-6 text-gray-500">
        The Credentialed Community Language (CCL) test checks that you can interpret everyday community conversations.
        Many people sit it for the points it can add to some Australian visa applications.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {formatFacts.map((fact, index) => (
          <article key={fact.title} className="rounded-xl border border-gray-200 p-6">
            <span className="text-sm font-semibold text-gray-500">0{index + 1}</span>
            <h3 className="mt-3 text-lg font-bold tracking-[-0.02em]">{fact.title}</h3>
            <p className="mt-2 text-[15px] leading-6 text-gray-500">{fact.description}</p>
          </article>
        ))}
      </div>
      <p className="mt-6 text-sm text-gray-500">
        Test rules can change. Always check the current details on the{" "}
        <a
          href="https://www.naati.com.au/"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-ink underline underline-offset-4"
        >
          NAATI website
        </a>
        . XINGO is independent and not affiliated with NAATI.
      </p>
    </section>
  );
}
