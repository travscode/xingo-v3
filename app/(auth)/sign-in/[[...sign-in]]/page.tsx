import { SignIn } from "@clerk/nextjs";
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
      <div className="mt-8 flex w-full justify-center">
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl={`/sign-up?redirect=${encodeURIComponent(redirectTarget)}`}
          fallbackRedirectUrl={redirectTarget}
        />
      </div>
    </main>
  );
}
