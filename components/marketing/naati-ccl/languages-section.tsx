import { languages } from "./content";

/**
 * Renders the supported-language style grid for the landing page.
 */
export function NaatiCclLanguagesSection() {
  return (
    <section className="space-y-6">
      <div className="max-w-2xl">
        <p className="eyebrow">Available languages</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight lg:text-[2rem]">
          Available Languages
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Pick a language direction and move into focused CCL practice. The
          layout here now mirrors the tighter card grid in the screenshot.
        </p>
      </div>
      <div className="rounded-4xl border border-[#eaebf2] bg-white p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {languages.map((language) => (
            <div
              key={language.target}
              className="rounded-[1.4rem] border border-[#ececf3] bg-[#fafafe] px-4 py-3"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {language.region}
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-sm font-semibold text-slate-900">
                <span>{language.english}</span>
                <span className="text-slate-400">/</span>
                <span>{language.target}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center text-xs text-muted">
          Explore more language pairs as the XINGO CCL catalog expands.
        </div>
      </div>
    </section>
  );
}
