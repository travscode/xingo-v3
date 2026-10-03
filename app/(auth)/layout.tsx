import type { ReactNode } from "react";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { AppProviders } from "@/components/providers/app-providers";

/** Sign-in and sign-up: the public frame, plus Clerk. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AppProviders>
      <MarketingShell>{children}</MarketingShell>
    </AppProviders>
  );
}
