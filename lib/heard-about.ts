/**
 * "How did you hear about XINGO?" — asked once at the end of onboarding so we know
 * where signups come from (D-051). Optional. Framework-free: Convex validates
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
