"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  COMMUNITY_LANGUAGE_POINTS,
  defaultSelection,
  estimatePoints,
  POINTS_PASS_MARK,
  POINTS_TABLE_SOURCE,
  pointsFactors,
  visaOptions,
  type PointsOption,
  type PointsSelection,
} from "@/lib/points-test";

const selectClass =
  "h-11 w-full rounded-lg bg-gray-100 px-3 text-[15px] font-semibold outline-none focus:ring-2 focus:ring-live";

/**
 * Rough points estimate from the Home Affairs table (lib/points-test.ts). Plain client
 * state only: nothing is saved or sent anywhere. Bridges to CCL practice, the
 * 5-point claim XINGO helps people prepare for.
 */
export function PointsEstimator({ cclHref }: { cclHref: string }) {
  const [selection, setSelection] = useState<PointsSelection>(defaultSelection);
  const total = estimatePoints(selection);
  const withCcl = selection.communityLanguage === "yes" ? total : estimatePoints({ ...selection, communityLanguage: "yes" });
  const meetsPassMark = total >= POINTS_PASS_MARK;

  const set = (id: string) => (event: React.ChangeEvent<HTMLSelectElement>) =>
    setSelection((current) => ({ ...current, [id]: event.target.value }));

  return (
    <section
      id="points-estimator"
      aria-labelledby="points-estimator-heading"
      className="mt-10 scroll-mt-24 rounded-2xl border border-gray-200 p-5 sm:p-7"
      data-analytics-location="points_estimator"
    >
      <h2 id="points-estimator-heading" className="text-2xl font-bold tracking-[-0.03em]">
        Estimate your points
      </h2>
      <p className="mt-2 text-[15px] leading-6 text-gray-500">
        Pick what applies to you. This is a rough guide built from the published points table, not an assessment. Nothing you
        choose is saved.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Visa" value={selection.visa} options={visaOptions} onChange={set("visa")} wide />
        {pointsFactors.map((factor) => (
          <Field
            key={factor.id}
            label={factor.label}
            hint={factor.hint}
            value={selection[factor.id]}
            options={factor.options}
            onChange={set(factor.id)}
          />
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-ink p-5 text-paper sm:p-6" aria-live="polite">
        <p className="text-sm text-gray-300">Estimated points</p>
        <p className="mt-1 text-5xl font-bold tracking-[-0.04em] tabular-nums">{total}</p>
        <p className="mt-2 text-[15px] leading-6 text-gray-300">
          {meetsPassMark
            ? `That meets the minimum of ${POINTS_PASS_MARK}. Many people are invited with more, depending on their occupation.`
            : `The minimum to be invited is ${POINTS_PASS_MARK}. You're ${POINTS_PASS_MARK - total} short on this estimate.`}
        </p>
        {selection.communityLanguage !== "yes" ? (
          <div className="mt-5 border-t border-white/15 pt-5">
            <p className="text-[15px] leading-6">
              Speak another language? Passing the NAATI CCL test can add <strong>{COMMUNITY_LANGUAGE_POINTS} points</strong>,
              taking this estimate to <strong className="tabular-nums">{withCcl}</strong>.
            </p>
            <Button asChild variant="accent" size="md" className="mt-4">
              <Link href={cclHref}>
                Practise for the CCL free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : null}
      </div>

      <p className="mt-4 text-xs leading-5 text-gray-500">
        Check every claim against the{" "}
        <a href={POINTS_TABLE_SOURCE} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          Home Affairs points table
        </a>{" "}
        and the rules for your visa. Points are assessed when you&apos;re invited, and only Home Affairs decides them.
      </p>
    </section>
  );
}

function Field({
  label,
  hint,
  value,
  options,
  onChange,
  wide,
}: {
  label: string;
  hint?: string;
  value: string;
  options: PointsOption[];
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  wide?: boolean;
}) {
  const id = useId();
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label htmlFor={id} className="block text-sm font-bold">
        {label}
      </label>
      {hint ? <p className="mt-0.5 text-xs text-gray-500">{hint}</p> : null}
      <select id={id} value={value} onChange={onChange} className={`${selectClass} mt-1.5`}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} ({option.points})
          </option>
        ))}
      </select>
    </div>
  );
}
