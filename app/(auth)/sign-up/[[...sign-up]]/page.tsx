import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign up", robots: { index: false } };

/**
 * Restricts auth redirects to internal application paths.
 */
function getSafeRedirectTarget(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  const redirectTarget = getSafeRedirectTarget(redirect);

  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-12 sm:py-16">
      <h1 className="text-center text-3xl font-bold tracking-[-0.03em]">Create your XINGO account</h1>
      <p className="mt-2 text-center text-[15px] text-gray-500">Free practice minutes every month. No card needed.</p>
      <div className="mt-8 flex w-full justify-center">
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl={`/sign-in?redirect=${encodeURIComponent(redirectTarget)}`}
          fallbackRedirectUrl={redirectTarget}
        />
      </div>
      <p className="mt-6 max-w-sm text-center text-xs leading-5 text-gray-500">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="font-semibold text-ink underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="font-semibold text-ink underline">
          Privacy Policy
        </Link>
        . You&apos;ll confirm this in the next step.
      </p>
    </main>
  );
}
