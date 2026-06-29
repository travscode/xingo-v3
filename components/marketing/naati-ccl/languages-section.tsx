import { languages } from "./content";

/**
 * Renders the supported-language style grid for the landing page.
 */
export function NaatiCclLanguagesSection() {
  return (
    <section className="space-y-6">
      <div className="max-w-2xl">
        <p className="eyebrow">Popular languages</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight lg:text-4xl">
          Build the page around the language demand learners actually search for.
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          This section mirrors the screenshot structure, but the language list
          and presentation are original to XINGO.
        </p>
      </div>
      <div className="surface-card rounded-4xl p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {languages.map((language) => (
            <div
              key={language}
              className="rounded-3xl border border-line bg-white px-4 py-3 text-sm font-medium"
            >
              {language}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
