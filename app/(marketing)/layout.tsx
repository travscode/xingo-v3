import Link from "next/link";
import type { ReactNode } from "react";
import { HeaderAuth } from "@/components/auth/header-auth";
import { MarketingMobileNav } from "@/components/marketing/mobile-nav";
import { Logo } from "@/components/ui/logo";
import { marketingNavigation } from "@/lib/navigation";

const footerLinks = [
  { href: "/naati/ccl", label: "NAATI CCL practice" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/for-interpreters", label: "For interpreters" },
  { href: "/for-organizations", label: "For teams" },
  { href: "/pricing", label: "Pricing" },
] as const;

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-paper">
        <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden items-center gap-1 md:flex">
              {marketingNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-gray-100"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <HeaderAuth />
            <MarketingMobileNav />
          </div>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="mt-20 bg-ink text-paper">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1fr_auto]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-6 text-gray-300">
              Spoken role-play practice for interpreters, with instant scoring.
            </p>
            <p className="mt-2 text-xs leading-5 text-gray-500">
              XINGO is independent and not affiliated with NAATI.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
            {footerLinks.map((item) => (
              <Link key={item.href} href={item.href} className="text-gray-300 hover:text-paper">
                {item.label}
              </Link>
            ))}
            <a href="mailto:hello@xingo.ai" className="text-gray-300 hover:text-paper">
              Contact
            </a>
          </nav>
        </div>
        <div className="mx-auto w-full max-w-6xl border-t border-gray-700 px-4 py-6 text-xs text-gray-500 sm:px-6">
          © {new Date().getFullYear()} XINGO
        </div>
      </footer>
    </div>
  );
}
