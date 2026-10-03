/**
 * Languages offered in the pair picker. English is the default "other side";
 * learners can still type any language not listed here.
 *
 * `flag` is an ISO 3166 country code used only for a decorative emoji.
 */
export const practiceLanguages = [
  { name: "Arabic", flag: "SA" },
  { name: "Bangla", flag: "BD" },
  { name: "Cantonese", flag: "HK" },
  { name: "Dari", flag: "AF" },
  { name: "Filipino", flag: "PH" },
  { name: "French", flag: "FR" },
  { name: "Greek", flag: "GR" },
  { name: "Gujarati", flag: "IN" },
  { name: "Haitian Creole", flag: "HT" },
  { name: "Hindi", flag: "IN" },
  { name: "Indonesian", flag: "ID" },
  { name: "Italian", flag: "IT" },
  { name: "Japanese", flag: "JP" },
  { name: "Korean", flag: "KR" },
  { name: "Malay", flag: "MY" },
  { name: "Malayalam", flag: "IN" },
  { name: "Mandarin", flag: "CN" },
  { name: "Nepali", flag: "NP" },
  { name: "Persian", flag: "IR" },
  { name: "Portuguese", flag: "BR" },
  { name: "Punjabi", flag: "IN" },
  { name: "Russian", flag: "RU" },
  { name: "Sinhala", flag: "LK" },
  { name: "Spanish", flag: "ES" },
  { name: "Tamil", flag: "IN" },
  { name: "Telugu", flag: "IN" },
  { name: "Thai", flag: "TH" },
  { name: "Turkish", flag: "TR" },
  { name: "Urdu", flag: "PK" },
  { name: "Vietnamese", flag: "VN" },
] as const;

const flagByName = new Map<string, string>([
  ["english", "AU"],
  ...practiceLanguages.map((language) => [language.name.toLowerCase(), language.flag] as [string, string]),
]);

export function flagEmoji(languageName: string) {
  const code = flagByName.get(languageName.trim().toLowerCase());

  if (!code) {
    return "";
  }

  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

/**
 * A practice language pair. `sourceLanguage` is the language of participant A
 * (usually the English-speaking professional); `targetLanguage` is the
 * language of participant B (the client). The interpreter works both ways.
 */
export type LanguagePair = {
  key: string;
  sourceLanguage: string;
  targetLanguage: string;
};

export function createLanguagePair(sourceLanguage: string, targetLanguage: string): LanguagePair {
  const source = sourceLanguage.trim();
  const target = targetLanguage.trim();

  return {
    key: `${source.toLowerCase()}::${target.toLowerCase()}`,
    sourceLanguage: source,
    targetLanguage: target,
  };
}

/** English ⇄ English: everyone speaks English (role-plays, English-only practice). */
export const ENGLISH_ONLY_PAIR = createLanguagePair("English", "English");

export function isEnglishOnly(pair: Pick<LanguagePair, "sourceLanguage" | "targetLanguage">) {
  return pair.sourceLanguage.trim().toLowerCase() === "english" && pair.targetLanguage.trim().toLowerCase() === "english";
}

/** "English only" or "English ⇄ 🇪🇸 Spanish". */
export function pairLabel(pair: Pick<LanguagePair, "sourceLanguage" | "targetLanguage">) {
  if (isEnglishOnly(pair)) return "English only";
  const flag = flagEmoji(pair.targetLanguage);
  return `${pair.sourceLanguage} ⇄ ${flag ? `${flag} ` : ""}${pair.targetLanguage}`;
}

export const DEFAULT_LANGUAGE_PAIR = createLanguagePair("English", "Spanish");
