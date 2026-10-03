import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center px-4 py-20 sm:px-6">
      <p className="eyebrow">Page not found</p>
      <h1 className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">We couldn&apos;t find that page.</h1>
      <p className="mt-3 text-[15px] leading-6 text-gray-500">
        The link may be old or mistyped. Try one of these instead.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/">Go to the home page</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/exams">Browse exams</Link>
        </Button>
      </div>
      <p className="mt-6 text-sm text-gray-500">
        Or read our <Link href="/blog" className="font-semibold text-ink underline underline-offset-2">test guides</Link>.
      </p>
    </main>
  );
}
