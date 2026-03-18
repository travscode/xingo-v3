import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-10 lg:px-10">
      <section className="section-frame rounded-[2.5rem] px-4 py-8 sm:px-8 sm:py-12">
        <div className="mb-8 text-center">
          <p className="eyebrow">Create account</p>
          <h1 className="display mt-4 text-5xl font-semibold tracking-tight">Start training</h1>
        </div>
        <div className="flex justify-center">
          <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" fallbackRedirectUrl="/dashboard" />
        </div>
      </section>
    </main>
  );
}
