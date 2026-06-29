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
        <h2 className="mt-3 text-3xl font-semibold tracking-tight lg:text-4xl">
          A CCL prep page built around direct action, not extra clicks.
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {outcomes.map((item, index) => {
          const Icon = icons[index];

          return (
            <article key={item.title} className="surface-card rounded-4xl p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                <Icon size={22} />
              </div>
              <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
