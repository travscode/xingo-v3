import { SignUp } from "@clerk/nextjs";

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
    </main>
  );
}
