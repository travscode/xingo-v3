import { ClerkFailed, ClerkLoaded, SignIn } from "@clerk/nextjs";
import { AuthFormFailed, AuthFormLoading } from "@/components/auth/auth-form-states";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

/**
 * Restricts auth redirects to internal application paths.
 */
function getSafeRedirectTarget(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  const redirectTarget = getSafeRedirectTarget(redirect);

  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-12 sm:py-16">
      <h1 className="text-center text-3xl font-bold tracking-[-0.03em]">Log in to XINGO</h1>
      <p className="mt-2 text-center text-[15px] text-gray-500">Pick up where you left off.</p>
      {/* The loader stays until Clerk's form has actually rendered (see .auth-slot in globals.css). */}
      <div className="auth-slot mt-8 grid w-full justify-items-center">
        <div className="auth-loading [grid-area:1/1]">
          <AuthFormLoading label="Loading secure log-in…" />
        </div>
        <ClerkLoaded>
          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl={`/sign-up?redirect=${encodeURIComponent(redirectTarget)}`}
            fallbackRedirectUrl={redirectTarget}
          />
        </ClerkLoaded>
        <ClerkFailed>
          <AuthFormFailed />
        </ClerkFailed>
      </div>
    </main>
  );
}
