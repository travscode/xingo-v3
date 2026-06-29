import { BadgeCheck, ChartNoAxesCombined, Sparkles } from "lucide-react";
import { outcomes } from "./content";

const icons = [BadgeCheck, ChartNoAxesCombined, Sparkles] as const;

/**
 * Renders the why-this-page-exists section for CCL learners.
 */
export function NaatiCclWhySection() {
  return (
    <section className="space-y-6">
      <div className="max-w-2xl">
        <p className="eyebrow">Why XINGO</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight lg:text-[2rem]">
          Why NAATI CCL?
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Present the same kind of explainer section visible in the screenshot,
          but with original XINGO framing around visa goals, accessibility, and
          practical dialogue skills.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {outcomes.map((item, index) => {
          const Icon = icons[index];

          return (
            <article
              key={item.title}
              className="rounded-[1.75rem] border border-[#e9eaf2] bg-white p-6 shadow-[0_10px_24px_rgba(18,18,18,0.03)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                <Icon size={22} />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
            </article>
          );
        })}
      </div>
      <p className="mx-auto max-w-3xl text-center text-xs leading-6 text-muted">
        This practice path supports community-language exam preparation only. It
        does not replace formal certification or professional credentialing.
      </p>
    </section>
  );
}
