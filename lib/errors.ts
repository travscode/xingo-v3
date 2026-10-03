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
  | "MIC_NOT_FOUND"
  | "EMAIL_NOT_CONFIGURED"
  | "COURSE_UNAVAILABLE"
  | "COURSE_INCOMPLETE"
  | "GUIDELINES_REQUIRED"
  | "PAYOUTS_NOT_CONFIGURED"
  | "ALREADY_REPORTED"
  | "TERMS_REQUIRED"
  | "RATING_NEEDS_PRACTICE"
  | "RATING_NOT_ALLOWED"
  | "ACCOUNT_PAUSED"
  | "ORG_NOT_FOUND"
  | "ORG_FORBIDDEN"
  | "ORG_LIMIT"
  | "ORG_LAST_OWNER"
  | "ORG_INVITE_INVALID"
  | "ORG_TOO_MANY_INVITES"
  | "ORG_MINUTES_INVALID"
  | "HANDLE_INVALID"
  | "HANDLE_TAKEN"
  | "FEATURE_INVALID";

const messages: Record<AppErrorCode, string> = {
  COURSE_UNAVAILABLE: "This course isn't available right now. It may have been unpublished by its creator.",
  COURSE_INCOMPLETE: "Add a title, a one-line summary and at least one scenario before publishing.",
  GUIDELINES_REQUIRED: "Please confirm the creator guidelines before publishing.",
  PAYOUTS_NOT_CONFIGURED: "Payouts aren't switched on yet. Your earnings are safe and will be paid once they are.",
  RATING_NEEDS_PRACTICE: "Finish a session in this course first, then you can rate it.",
  RATING_NOT_ALLOWED: "You can't rate your own course.",
  ORG_NOT_FOUND: "We couldn't find that organisation or collection.",
  ORG_FORBIDDEN: "You don't have permission to do that for this organisation.",
  ORG_LIMIT: "You can own up to 5 organisations. Email hello@xingo.ai if you need more.",
  ORG_LAST_OWNER: "An organisation needs at least one owner. Make someone else an owner first.",
  ORG_INVITE_INVALID: "This invitation is no longer valid. Ask the organisation to send a new one.",
  ORG_TOO_MANY_INVITES: "You can invite up to 200 people at a time.",
  ORG_MINUTES_INVALID: "Enter a monthly minute pool between 0 and 100,000.",
  HANDLE_INVALID: "Use 3–30 lowercase letters, numbers, dots, dashes or underscores, and a name.",
  HANDLE_TAKEN: "That handle is taken. Try another.",
  FEATURE_INVALID: "Add a title and a link that starts with / or https://.",
  ACCOUNT_PAUSED: "Practice is paused on your account. Email hello@xingo.ai and we'll sort it out.",
  TERMS_REQUIRED: "Please accept the Terms of Service and Privacy Policy to continue.",
  ALREADY_REPORTED: "Thanks, you've already reported this course. We'll review it.",
  PREMIUM_REQUIRED: "This dialogue is part of a premium course. Upgrade or buy a minute pack to unlock it.",
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
  EMAIL_NOT_CONFIGURED:
    "Email sending isn't set up yet: add RESEND_API_KEY and EMAIL_FROM_ADDRESS to Convex (see docs/runbooks/email-setup.md).",
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
