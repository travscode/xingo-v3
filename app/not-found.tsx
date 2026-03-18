import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 text-center">
      <p className="eyebrow">Not found</p>
      <h1 className="display mt-4 text-5xl font-semibold tracking-tight">This route does not exist.</h1>
      <Link href="/" className="mt-8 inline-flex rounded-full bg-brand px-6 py-4 text-sm font-semibold text-white">
        Return home
      </Link>
    </main>
  );
}
