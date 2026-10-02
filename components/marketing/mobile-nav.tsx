"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { marketingNavigation } from "@/lib/navigation";

/** Hamburger disclosure for the marketing header below the md breakpoint. */
export function MarketingMobileNav() {
  const [open, setOpen] = useState(false);
  const { userId } = useAuth();
  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="marketing-mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-gray-100"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open ? (
        <div
          id="marketing-mobile-menu"
          className="absolute inset-x-0 top-full border-b border-gray-200 bg-paper px-4 pb-6 pt-2"
        >
          <nav className="flex flex-col">
            {marketingNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="border-b border-gray-100 py-3 text-base font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {!userId ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button asChild variant="secondary" onClick={close}>
                <Link href="/sign-in">Log in</Link>
              </Button>
              <Button asChild onClick={close}>
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </div>
          ) : null}
          {userId ? (
            <Button asChild block className="mt-4" onClick={close}>
              <Link href="/dashboard" prefetch={false}>
                Go to dashboard
              </Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
