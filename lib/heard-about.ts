/**
 * "How did you hear about XINGO?" — asked once on the setting-up screen after
 * onboarding so we know where signups come from (D-051, D-055). Optional. Framework-free: Convex validates
 * against this list and the UI renders it.
 */
export const heardAboutOptions = [
  { id: "google", label: "Google search" },
  { id: "ai_assistant", label: "ChatGPT or another AI" },
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
  { id: "whatsapp", label: "WhatsApp or WeChat group" },
  { id: "friend", label: "A friend or classmate" },
  { id: "teacher", label: "A teacher or migration agent" },
  { id: "other", label: "Somewhere else" },
] as const;

export type HeardAboutId = (typeof heardAboutOptions)[number]["id"];

export function isHeardAboutId(value: string): value is HeardAboutId {
  return heardAboutOptions.some((option) => option.id === value);
}

export function heardAboutLabel(value: string) {
  return heardAboutOptions.find((option) => option.id === value)?.label ?? value;
}

/**
 * Where a visitor first arrived from, remembered in the browser on their first page
 * view (components/providers/first-touch.tsx) so the welcome flow can suggest an
 * answer (D-055).
 */
export type FirstTouch = {
  utmSource?: string;
  utmMedium?: string;
  gclid?: boolean;
  fbclid?: boolean;
  /** Host of document.referrer, e.g. "www.google.com". */
  referrer?: string;
};

export function firstTouchFrom(search: URLSearchParams, referrer: string): FirstTouch {
  let referrerHost: string | undefined;
  try {
    referrerHost = referrer ? new URL(referrer).hostname.toLowerCase() : undefined;
  } catch {
    referrerHost = undefined;
  }
  return {
    utmSource: search.get("utm_source")?.toLowerCase().slice(0, 60) || undefined,
    utmMedium: search.get("utm_medium")?.toLowerCase().slice(0, 60) || undefined,
    gclid: search.has("gclid") || undefined,
    fbclid: search.has("fbclid") || undefined,
    referrer: referrerHost,
  };
}

const sourcePatterns: Array<[HeardAboutId, RegExp]> = [
  ["ai_assistant", /chatgpt|openai|perplexity|gemini|claude|copilot/],
  ["instagram", /instagram|^ig$/],
  ["facebook", /facebook|^fb$|^meta$/],
  ["tiktok", /tiktok/],
  ["youtube", /youtube|youtu\.be/],
  ["whatsapp", /whatsapp|wechat/],
  ["google", /google/],
];

/**
 * Best guess at the answer from campaign tags, ad click ids or the referring site.
 * Only a pre-selection: the learner can pick something else. Null when unsure.
 */
export function guessHeardAbout(touch: FirstTouch | null | undefined): HeardAboutId | null {
  if (!touch) return null;
  for (const value of [touch.utmSource, touch.referrer]) {
    if (!value) continue;
    // Our own site isn't a source.
    if (/(^|\.)xingo\.ai$|localhost/.test(value)) continue;
    const match = sourcePatterns.find(([, pattern]) => pattern.test(value));
    if (match) return match[0];
  }
  if (touch.gclid) return "google";
  if (touch.fbclid) return "facebook";
  return null;
}
