"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ScrollText } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { friendlyError } from "@/lib/errors";
import { LEGAL_VERSION } from "@/lib/legal";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

/**
 * Blocks the app until the signed-in user has accepted the current Terms of
 * Service and Privacy Policy. New users see it straight after sign-up; existing
 * users see it once whenever LEGAL_VERSION changes. The server enforces the same
 * rule (practice and checkout refuse with TERMS_REQUIRED), so this is the friendly part.
 */
export function TermsGate() {
  const me = useQuery(api.users.me, {});
  const acceptTerms = useMutation(api.users.acceptTerms);
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!me?.user || me.user.termsVersion === LEGAL_VERSION) return null;

  const updated = Boolean(me.user.termsVersion);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="terms-title" className="w-full max-w-md rounded-2xl bg-paper p-6 shadow-2xl sm:p-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
          <ScrollText className="h-5 w-5" aria-hidden />
        </span>
        <h2 id="terms-title" className="mt-4 text-2xl font-bold tracking-[-0.03em]">
          {updated ? "We've updated our terms" : "One last step"}
        </h2>
        <p className="mt-2 text-[15px] leading-6 text-gray-500">
          {updated
            ? "Please read and accept the latest Terms of Service and Privacy Policy to keep practising."
            : "Before you start practising, please read and accept how XINGO works and how we handle your information."}
        </p>
        <ul className="mt-4 space-y-1 text-sm">
          <li>
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold underline">
              Terms of Service
            </a>{" "}
            <span className="text-gray-500">(opens in a new tab)</span>
          </li>
          <li>
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold underline">
              Privacy Policy
            </a>{" "}
            <span className="text-gray-500">(opens in a new tab)</span>
          </li>
        </ul>
        <label className="mt-5 flex items-start gap-3 rounded-xl border border-gray-200 p-4 text-sm">
          <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-ink)]" checked={checked} onChange={(event) => setChecked(event.target.checked)} />
          <span>
            I have read and agree to the <strong>Terms of Service</strong> and <strong>Privacy Policy</strong>, and I&apos;m 16 or over
            (or have a parent or guardian&apos;s permission).
          </span>
        </label>
        {error ? <p className="mt-3 text-sm text-record">{error}</p> : null}
        <Button
          block
          size="lg"
          className="mt-5"
          disabled={!checked || saving}
          onClick={() => {
            setSaving(true);
            setError(null);
            acceptTerms({ version: LEGAL_VERSION })
              .then(() => track("terms_accept", { version: LEGAL_VERSION, updated }))
              .catch((acceptError) => setError(friendlyError(acceptError)))
              .finally(() => setSaving(false));
          }}
        >
          {saving ? "Saving…" : "Agree and continue"}
        </Button>
      </div>
    </div>
  );
}
