import { ConvexError } from "convex/values";

export type AppErrorCode =
  | "PREMIUM_REQUIRED"
  | "OUT_OF_MINUTES"
  | "BILLING_NOT_CONFIGURED"
  | "ALREADY_SUBSCRIBED"
  | "NO_BILLING_ACCOUNT"
  | "VOICE_NOT_CONFIGURED"
  | "VOICE_UNAVAILABLE"
  | "MIC_BLOCKED"
  | "MIC_NOT_FOUND";

const messages: Record<AppErrorCode, string> = {
  PREMIUM_REQUIRED: "This dialogue is part of a premium module. Upgrade or buy a minute pack to unlock it.",
  OUT_OF_MINUTES: "You've used all your practice minutes. Top up to keep going.",
  BILLING_NOT_CONFIGURED: "Payments aren't switched on yet. Please try again soon.",
  ALREADY_SUBSCRIBED: "You already have Pro. Manage it from Plan & billing.",
  NO_BILLING_ACCOUNT: "You don't have any purchases yet.",
  VOICE_NOT_CONFIGURED:
    "Voice practice is switched off on our side right now (server configuration). You haven't been charged — please try again a little later.",
  VOICE_UNAVAILABLE:
    "We couldn't reach the voice service. You haven't been charged. Check your connection and try again in a moment.",
  MIC_BLOCKED:
    "Your browser is blocking the microphone. Click the camera/mic icon in the address bar, allow the microphone, then start again.",
  MIC_NOT_FOUND: "We couldn't find a microphone. Plug in a headset or check your sound settings, then start again.",
};

export function getErrorCode(error: unknown): AppErrorCode | null {
  if (error instanceof DOMException || (error instanceof Error && /Permission|NotAllowed/i.test(error.name))) {
    if (error.name === "NotAllowedError" || error.name === "SecurityError") return "MIC_BLOCKED";
    if (error.name === "NotFoundError" || error.name === "NotReadableError") return "MIC_NOT_FOUND";
  }

  if (error instanceof ConvexError && typeof error.data === "string" && error.data in messages) {
    return error.data as AppErrorCode;
  }

  return null;
}

/** A sentence safe to show a learner. */
export function friendlyError(error: unknown, fallback = "Something went wrong. Please try again.") {
  const code = getErrorCode(error);

  if (code) {
    return messages[code];
  }

  if (error instanceof ConvexError && typeof error.data === "string") {
    return error.data;
  }

  return fallback;
}
