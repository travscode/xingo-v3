import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-10 lg:px-10">
      <section className="section-frame rounded-[2.5rem] px-4 py-8 sm:px-8 sm:py-12">
        <div className="mb-8 text-center">
          <p className="eyebrow">Authentication</p>
          <h1 className="display mt-4 text-5xl font-semibold tracking-tight">Sign in to XINGO</h1>
        </div>
        <div className="flex justify-center">
          <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" />
        </div>
      </section>
    </main>
  );
}
