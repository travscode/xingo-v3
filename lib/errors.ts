import { ConvexError } from "convex/values";

export type AppErrorCode =
  | "PREMIUM_REQUIRED"
  | "OUT_OF_MINUTES"
  | "BILLING_NOT_CONFIGURED"
  | "ALREADY_SUBSCRIBED"
  | "NO_BILLING_ACCOUNT";

const messages: Record<AppErrorCode, string> = {
  PREMIUM_REQUIRED: "This dialogue is part of a premium module. Upgrade or buy a minute pack to unlock it.",
  OUT_OF_MINUTES: "You've used all your practice minutes. Top up to keep going.",
  BILLING_NOT_CONFIGURED: "Payments aren't switched on yet. Please try again soon.",
  ALREADY_SUBSCRIBED: "You already have Pro. Manage it from Plan & billing.",
  NO_BILLING_ACCOUNT: "You don't have any purchases yet.",
};

export function getErrorCode(error: unknown): AppErrorCode | null {
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
