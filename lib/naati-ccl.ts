/**
 * Public facts about NAATI's Credentialed Community Language (CCL) test, quoted on
 * marketing pages (docs/seo.md). Framework-free.
 *
 * Checked on NAATI_CCL_CHECKED against https://www.naati.com.au/migration-assessments/ccl/.
 * NAATI changes its language list and fee over time: re-check before editing copy,
 * and keep the hedge ("at the time of writing") wherever these are shown.
 */

export const NAATI_CCL_CHECKED = "2026-10-22";
export const NAATI_CCL_URL = "https://www.naati.com.au/migration-assessments/ccl/";

/** Test fee in AUD, as listed by NAATI. */
export const NAATI_CCL_FEE = "$814";
/** Approximate length of each recorded dialogue, in words. */
export const NAATI_CCL_DIALOGUE_WORDS = 300;
/** Each segment is this many words or fewer. */
export const NAATI_CCL_SEGMENT_MAX_WORDS = 35;
/** NAATI: a result of this or higher can apply for a review. */
export const NAATI_CCL_REVIEW_FROM = 58;
/** NAATI: credentials issued from 9 August 2022 are valid for five years. */
export const NAATI_CCL_VALIDITY_YEARS = 5;

/**
 * NAATI's CCL test languages, spelt as NAATI lists them. `pending` = NAATI marks it
 * "pending candidate demand".
 */
export const naatiCclLanguages: Array<{ name: string; pending?: boolean }> = [
  { name: "Afrikaans", pending: true },
  { name: "Arabic" },
  { name: "Bangla" },
  { name: "Bosnian" },
  { name: "Bulgarian" },
  { name: "Burmese" },
  { name: "Cantonese" },
  { name: "Croatian" },
  { name: "Czech" },
  { name: "Dari" },
  { name: "Dutch" },
  { name: "Dzongkha" },
  { name: "Filipino" },
  { name: "Finnish" },
  { name: "French" },
  { name: "German" },
  { name: "Greek" },
  { name: "Gujarati" },
  { name: "Hazaragi" },
  { name: "Hindi" },
  { name: "Hungarian" },
  { name: "Indonesian" },
  { name: "Igbo" },
  { name: "Italian" },
  { name: "Japanese" },
  { name: "Kannada" },
  { name: "Khmer" },
  { name: "Korean" },
  { name: "Macedonian" },
  { name: "Malay" },
  { name: "Malayalam" },
  { name: "Mandarin" },
  { name: "Marathi" },
  { name: "Nepali" },
  { name: "Odia" },
  { name: "Pashto" },
  { name: "Persian" },
  { name: "Polish" },
  { name: "Portuguese" },
  { name: "Punjabi" },
  { name: "Romanian" },
  { name: "Russian" },
  { name: "Serbian" },
  { name: "Sinhalese" },
  { name: "Somali" },
  { name: "Spanish" },
  { name: "Swahili" },
  { name: "Tamil" },
  { name: "Telugu" },
  { name: "Thai" },
  { name: "Turkish" },
  { name: "Ukrainian" },
  { name: "Urdu" },
  { name: "Vietnamese" },
  { name: "Yoruba" },
];
