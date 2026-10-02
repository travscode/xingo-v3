import { flagEmoji, practiceLanguages } from "@/lib/languages";

export function NaatiCclLanguagesSection() {
  return (
    <section id="languages" className="scroll-mt-24">
      <p className="eyebrow">Languages</p>
      <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">Practise in your language pair</h2>
      <p className="mt-3 max-w-2xl text-[15px] leading-6 text-gray-500">
        Every dialogue pairs English with your other language. Pick one of these, or type in a language that
        isn&apos;t listed.
      </p>
      <ul className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {practiceLanguages.map((language) => (
          <li
            key={language.name}
            className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-sm font-medium"
          >
            <span aria-hidden="true">{flagEmoji(language.name)}</span>
            {language.name}
          </li>
        ))}
      </ul>
    </section>
  );
}
