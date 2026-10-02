import { CCL_MAX_SCORE, CCL_PASS_SCORE, assessmentDimensions } from "@/lib/scoring";
import { Badge } from "@/components/ui/primitives";
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
            <li key={tip.title} className="rounded-xl border border-gray-200 p-6">
              <span className="text-sm font-semibold text-gray-500">0{index + 1}</span>
              <h3 className="mt-3 text-base font-bold">{tip.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">{tip.description}</p>
            </li>
          ))}
        </ol>

        <figure className="rounded-xl bg-gray-50 p-6">
          <div className="flex items-center justify-between gap-3">
            <figcaption className="text-sm font-semibold">What you see after an attempt</figcaption>
            <Badge>Example</Badge>
          </div>
          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-5xl font-bold tracking-[-0.04em]">66</span>
            <span className="text-lg text-gray-500">/ {CCL_MAX_SCORE}</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">Pass mark {CCL_PASS_SCORE}</p>
          <p className="mt-6 text-xs font-semibold text-gray-500">Scored on</p>
          <ul className="mt-2 space-y-2 text-sm">
            {assessmentDimensions.map((dimension) => (
              <li key={dimension.key} className="border-b border-gray-200 pb-2">
                {dimension.label}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-6 text-gray-500">
            Plus written feedback on what you missed or changed, and your full transcript.
          </p>
          <p className="mt-4 text-xs text-gray-500">Illustrative example, not a real candidate&apos;s result.</p>
        </figure>
      </div>
    </section>
  );
}
