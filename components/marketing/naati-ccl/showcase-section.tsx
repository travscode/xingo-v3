import { ScoreMock } from "@/components/marketing/practice-mock";
import { prepTips } from "./content";

/** Preparation advice, plus an illustrative example of an attempt result. */
export function NaatiCclShowcaseSection() {
  return (
    <section id="prepare" className="scroll-mt-24">
      <p className="eyebrow">How to prepare</p>
      <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
        Practise the way you&apos;ll be tested
      </h2>
      <div className="mt-8 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <ol className="grid gap-4 sm:grid-cols-2">
          {prepTips.map((tip, index) => (
            <li key={tip.title} className="mk-lift rounded-xl border border-gray-200 p-6 hover:border-ink">
              <span className="text-sm font-semibold text-gray-500">0{index + 1}</span>
              <h3 className="mt-3 text-base font-bold">{tip.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">{tip.description}</p>
            </li>
          ))}
        </ol>

        <ScoreMock scale="ccl" className="w-full lg:self-start" />
      </div>
    </section>
  );
}
