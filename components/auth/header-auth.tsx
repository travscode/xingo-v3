"use client";

import Link from "next/link";
import { useSignedInHint } from "@/components/auth/signed-in-hint";
import { Button } from "@/components/ui/button";

/** Header actions on public pages. Doesn't load Clerk; see signed-in-hint.ts. */
export function HeaderAuth() {
  const signedIn = useSignedInHint();

  if (signedIn === null) {
    return <div className="h-9 w-24 rounded-lg bg-gray-100" />;
  }

  if (signedIn) {
    return (
      <Button asChild size="sm" className="hidden sm:inline-flex">
        <Link href="/dashboard" prefetch={false}>
          Dashboard
        </Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
        <Link href="/sign-in">Log in</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
