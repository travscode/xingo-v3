"use client";

import Link from "next/link";
import { UserButton, useAuth } from "@clerk/nextjs";

export function HeaderAuth() {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded) {
    return <div className="h-11 w-28 rounded-full bg-white/10" />;
  }

  if (userId) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          prefetch={false}
          className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.16]"
        >
          Dashboard
        </Link>
        <UserButton />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/sign-in"
        className="text-sm font-medium text-white transition hover:text-white/70"
      >
        Log in
      </Link>
      <Link
        href="/sign-up"
        className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
      >
        Create account
      </Link>
    </div>
  );
}
