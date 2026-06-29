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
    <main className="mx-auto max-w-3xl px-6 pb-10 lg:px-10">
      <section className="rounded-[2.5rem] px-4 py-8 sm:px-8 sm:py-12">
        <div className="mb-8 text-center">
          <p className="eyebrow">Create account</p>
          <h1 className="display mt-4 text-5xl font-semibold tracking-tight">
            Start training
          </h1>
        </div>
        <div className="flex justify-center">
          <SignUp
            path="/sign-up"
            routing="path"
            signInUrl={`/sign-in?redirect=${encodeURIComponent(redirectTarget)}`}
            fallbackRedirectUrl={redirectTarget}
          />
        </div>
      </section>
    </main>
  );
}
