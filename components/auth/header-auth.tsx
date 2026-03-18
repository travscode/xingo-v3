"use client";

import Link from "next/link";
import { UserButton, useAuth } from "@clerk/nextjs";

export function HeaderAuth() {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded) {
    return <div className="h-11 w-28 rounded-full bg-white/40" />;
  }

  if (userId) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          prefetch={false}
          className="rounded-full border border-line px-5 py-3 text-sm font-semibold transition hover:bg-white/70"
        >
          Dashboard
        </Link>
        <UserButton />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/sign-in" className="text-sm font-medium text-muted transition hover:text-foreground">
        Log in
      </Link>
      <Link
        href="/sign-up"
        className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
      >
        Create account
      </Link>
    </div>
  );
}
