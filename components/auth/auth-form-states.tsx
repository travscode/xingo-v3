import { Loader2 } from "lucide-react";

/**
 * Shown while Clerk's sign-in/up form loads (it downloads from Clerk and can take a
 * few seconds on slow connections). Same footprint as the real form, so nothing jumps.
 */
export function AuthFormLoading({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="w-full max-w-[400px] rounded-2xl border border-gray-200 bg-paper p-8 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink" aria-hidden />
        <p className="mt-3 text-sm font-semibold">{label}</p>
        <p className="mt-1 text-xs text-gray-500">This only takes a moment.</p>
      </div>
      <div className="mt-8 space-y-3" aria-hidden>
        <div className="h-11 animate-pulse rounded-lg bg-gray-100" />
        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-gray-200" />
          <div className="h-3 w-6 rounded bg-gray-100" />
          <div className="h-px flex-1 bg-gray-200" />
        </div>
        <div className="h-3 w-24 rounded bg-gray-100" />
        <div className="h-11 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-11 rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}

/** Clerk couldn't load (blocked script, network issue): say so instead of showing nothing. */
export function AuthFormFailed() {
  return (
    <div role="alert" className="w-full max-w-[400px] rounded-2xl border border-gray-200 bg-paper p-8 text-center">
      <p className="font-semibold">We couldn&apos;t load the sign-in form.</p>
      <p className="mt-1 text-sm text-gray-500">
        Check your connection, turn off any ad or script blocker for xingo.ai, then refresh the page.
      </p>
    </div>
  );
}
