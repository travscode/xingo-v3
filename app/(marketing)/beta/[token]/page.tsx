import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BETA_PREVIEW_TOKEN } from "@/lib/beta";
import { BETA_MINUTES } from "@/lib/plans";

export const metadata: Metadata = { title: "XINGO private beta", robots: { index: false } };

const steps = [
  "Create your free account. No card needed.",
  "Choose your language.",
  "Complete at least two NAATI CCL dialogues out loud with AI.",
  "Tell us how it went, using the feedback button on any page.",
];

export default async function BetaInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const start = encodeURIComponent(`/beta/${token}/start`);

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 sm:py-24">
      {token === BETA_PREVIEW_TOKEN ? (
        <p className="mb-6 rounded-lg bg-gray-100 px-3 py-2 text-sm">This is a test link. It won&apos;t add anyone to the beta.</p>
      ) : null}
      <p className="eyebrow">Private beta</p>
      <h1 className="mt-3 text-4xl font-bold tracking-[-0.035em] sm:text-5xl">You&apos;re invited to try XINGO</h1>
      <p className="mt-4 text-lg leading-7 text-gray-500">
        You&apos;ll get the full NAATI CCL course and {BETA_MINUTES} practice minutes, free. Your feedback will shape what we
        build.
      </p>
      <ol className="mt-8 space-y-3">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3 text-[15px] leading-6">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-paper">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
      <Button asChild size="lg" block className="mt-10">
        <Link href={`/sign-up?redirect=${start}`}>Create your free account</Link>
      </Button>
      <p className="mt-4 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href={`/sign-in?redirect=${start}`} className="font-semibold text-ink underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </main>
  );
}
