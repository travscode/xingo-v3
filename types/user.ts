export type PlatformRole =
  | "interpreter"
  | "student"
  | "organization_admin"
  | "platform_admin";

export type SubscriptionStatus = "free" | "professional" | "organization";

export interface LanguagePreference {
  sourceLanguage: string;
  targetLanguage: string;
}

export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  role: PlatformRole;
  organizationId?: string;
  subscriptionStatus: SubscriptionStatus;
  languagePreferences?: LanguagePreference[];
  createdAt: string;
}
