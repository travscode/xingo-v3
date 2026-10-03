import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { AppBootstrap } from "@/components/auth/app-bootstrap";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";

/**
 * Auth (Clerk) and live data (Convex) for the app, marketplace and sign-in pages.
 * Marketing pages deliberately don't load these (D-032): they're the heaviest
 * scripts on the site and anonymous visitors don't need them.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">
      <ConvexClientProvider>
        <AppBootstrap />
        {children}
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
