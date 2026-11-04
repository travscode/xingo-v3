/**
 * Languages offered in the pair picker. English is the default "other side";
 * learners can still type any language not listed here.
 *
 * `nativeName` is the language's name in its own script. `flag` is an ISO 3166
 * country code used only for a decorative emoji; the pair picker shows no flags,
 * because a flag can misrepresent the people who speak a language.
 */
export const practiceLanguages = [
  { name: "Arabic", nativeName: "العربية", flag: "SA" },
  { name: "Bangla", nativeName: "বাংলা", flag: "BD" },
  { name: "Cantonese", nativeName: "粵語", flag: "HK" },
  { name: "Dari", nativeName: "دری", flag: "AF" },
  { name: "Filipino", nativeName: "Wikang Filipino", flag: "PH" },
  { name: "French", nativeName: "Français", flag: "FR" },
  { name: "Greek", nativeName: "Ελληνικά", flag: "GR" },
  { name: "Gujarati", nativeName: "ગુજરાતી", flag: "IN" },
  { name: "Haitian Creole", nativeName: "Kreyòl ayisyen", flag: "HT" },
  { name: "Hindi", nativeName: "हिन्दी", flag: "IN" },
  { name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "ID" },
  { name: "Italian", nativeName: "Italiano", flag: "IT" },
  { name: "Japanese", nativeName: "日本語", flag: "JP" },
  { name: "Korean", nativeName: "한국어", flag: "KR" },
  { name: "Malay", nativeName: "Bahasa Melayu", flag: "MY" },
  { name: "Malayalam", nativeName: "മലയാളം", flag: "IN" },
  { name: "Mandarin", nativeName: "中文", flag: "CN" },
  { name: "Nepali", nativeName: "नेपाली", flag: "NP" },
  { name: "Persian", nativeName: "فارسی", flag: "IR" },
  { name: "Portuguese", nativeName: "Português", flag: "BR" },
  { name: "Punjabi", nativeName: "ਪੰਜਾਬੀ / پنجابی", flag: "IN" },
  { name: "Russian", nativeName: "Русский", flag: "RU" },
  { name: "Sinhala", nativeName: "සිංහල", flag: "LK" },
  { name: "Spanish", nativeName: "Español", flag: "ES" },
  { name: "Tamil", nativeName: "தமிழ்", flag: "IN" },
  { name: "Telugu", nativeName: "తెలుగు", flag: "IN" },
  { name: "Thai", nativeName: "ไทย", flag: "TH" },
  { name: "Turkish", nativeName: "Türkçe", flag: "TR" },
  { name: "Urdu", nativeName: "اردو", flag: "PK" },
  { name: "Vietnamese", nativeName: "Tiếng Việt", flag: "VN" },
] as const;

const canonicalNames = new Map<string, string>([
  ["english", "English"],
  ...practiceLanguages.map((language) => [language.name.toLowerCase(), language.name] as [string, string]),
]);

/**
 * English names of languages take a capital, however the learner typed them:
 * "german" and "GERMAN" become "German", "haitian creole" becomes "Haitian Creole".
 * Deliberate mixed case in a language we don't list ("isiZulu") is left alone.
 * Only letter case changes, so pair keys and saved progress are unaffected.
 */
export function formatLanguageName(languageName: string) {
  const name = languageName.trim();
  const canonical = canonicalNames.get(name.toLowerCase());
  if (canonical) return canonical;
  if (name !== name.toLowerCase() && name !== name.toUpperCase()) return name;
  return name.toLowerCase().replace(/(^|[\s\-(/])(\p{L})/gu, (_, before: string, letter: string) => before + letter.toUpperCase());
}

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

const nativeNameByName = new Map<string, string>(
  practiceLanguages.map((language) => [language.name.toLowerCase(), language.nativeName]),
);

/** "Spanish · Español". Languages typed in by the learner keep just their name. */
export function languageLabel(languageName: string) {
  const name = formatLanguageName(languageName);
  const nativeName = nativeNameByName.get(name.toLowerCase());
  return nativeName ? `${name} · ${nativeName}` : name;
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
  const source = formatLanguageName(sourceLanguage);
  const target = formatLanguageName(targetLanguage);

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
  return `${formatLanguageName(pair.sourceLanguage)} ⇄ ${flag ? `${flag} ` : ""}${formatLanguageName(pair.targetLanguage)}`;
}

export const DEFAULT_LANGUAGE_PAIR = createLanguagePair("English", "Spanish");

/** Names Whisper may report for a practice language (it reports e.g. "chinese" for Mandarin). */
const detectedAliases: Record<string, string[]> = {
  mandarin: ["chinese", "mandarin"],
  cantonese: ["chinese", "cantonese", "yue"],
  filipino: ["tagalog", "filipino"],
  tagalog: ["tagalog", "filipino"],
  dari: ["persian", "farsi", "dari"],
  persian: ["persian", "farsi"],
  farsi: ["persian", "farsi"],
  bangla: ["bengali", "bangla"],
  bengali: ["bengali", "bangla"],
};

/** True when a detected language name matches a practice language name. */
export function languageMatches(detected: string, practiceLanguage: string) {
  const target = practiceLanguage.trim().toLowerCase();
  const heard = detected.trim().toLowerCase();
  return heard === target || (detectedAliases[target] ?? []).includes(heard);
}

export type PairInput = Pick<LanguagePair, "sourceLanguage" | "targetLanguage">;

/** Stable key for grouping progress by pair ("english::spanish"). */
export function pairKey(pair: PairInput) {
  return createLanguagePair(pair.sourceLanguage, pair.targetLanguage).key;
}

/**
 * The pair a session counts towards. Sessions from before pairs were recorded
 * count towards the learner's main (first saved) pair.
 */
export function sessionPairKey(
  session: { sourceLanguage?: string; targetLanguage?: string },
  fallback: PairInput,
) {
  return session.sourceLanguage && session.targetLanguage
    ? pairKey({ sourceLanguage: session.sourceLanguage, targetLanguage: session.targetLanguage })
    : pairKey(fallback);
}

/** Keeps only the sessions for one pair; with no pair given, keeps everything. */
export function sessionsForPair<T extends { sourceLanguage?: string; targetLanguage?: string }>(
  sessions: T[],
  pair: PairInput | undefined,
  fallback: PairInput,
) {
  if (!pair) return sessions;
  const key = pairKey(pair);
  return sessions.filter((session) => sessionPairKey(session, fallback) === key);
}
