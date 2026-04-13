"use client";

import Link from "next/link";
import { UserButton, useAuth } from "@clerk/nextjs";

export function HeaderAuth() {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded) {
    return <div className="h-11 w-28 rounded-full bg-white" />;
  }

  if (userId) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          prefetch={false}
          className="action-secondary px-5 py-3 text-sm bg-white! text-black! hover:bg-brand-green!"
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
        className="text-sm font-medium text-white transition hover:text-brand-green"
      >
        Log in
      </Link>
      <Link
        href="/sign-up"
        className="action-primary px-5 py-3 text-sm bg-white! text-black! hover:bg-brand-green!"
      >
        Create account
      </Link>
    </div>
  );
}
