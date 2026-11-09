"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { BETA_COURSE_ID, BETA_PREVIEW_TOKEN } from "@/lib/beta";
import { friendlyError } from "@/lib/errors";

/** Joins the beta after sign-up, then hands over to onboarding or the CCL course. */
export function BetaStart({ token }: { token: string }) {
  const router = useRouter();
  const me = useQuery(api.users.me, {});
  const claim = useMutation(api.beta.claim);
  const [error, setError] = useState<string | null>(null);
  const claimedRef = useRef(false);
  const isPreview = token === BETA_PREVIEW_TOKEN;

  useEffect(() => {
    // The profile is created just after sign-up, so wait for it.
    if (isPreview || !me?.user || claimedRef.current) return;
    claimedRef.current = true;
    claim({ token })
      .then(({ onboarded }) => router.replace(onboarded ? `/courses/${BETA_COURSE_ID}` : "/welcome?goal=naati_ccl&beta=1"))
      .catch((claimError: unknown) => setError(friendlyError(claimError)));
  }, [claim, isPreview, me, router, token]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 text-center">
      <h1 className="text-2xl font-bold tracking-[-0.03em]">
        {isPreview ? "This was a test invite" : error ? "We couldn't add you to the beta" : "Setting up your beta access…"}
      </h1>
      {isPreview || error ? (
        <>
          <p className="mt-2 text-gray-500">{isPreview ? "Nothing on your account has changed." : error}</p>
          <Button asChild className="mx-auto mt-6">
            <Link href="/dashboard">Go to XINGO</Link>
          </Button>
        </>
      ) : null}
    </main>
  );
}
