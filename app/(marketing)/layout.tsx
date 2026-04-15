import Link from "next/link";
import type { ReactNode } from "react";
import { HeaderAuth } from "@/components/auth/header-auth";
import { Logo } from "@/components/ui/logo";
import { marketingNavigation } from "@/lib/navigation";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grain min-h-screen">
      <header className="sticky top-0 z-30 px-4 py-4 sm:px-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-line bg-black/80 text-white px-4 py-3 shadow-[0_10px_30px_rgba(18,18,18,0.06)] backdrop-blur-xl">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm text-white md:flex">
            {marketingNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-brand-green hover:underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <HeaderAuth />
        </div>
      </header>

      {children}

      <footer className="mx-auto mt-16 w-full max-w-6xl px-6 pb-10 lg:px-10">
        <div className="flex flex-col gap-6 rounded-[2rem] border border-line bg-white/75 px-6 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <div className="text-black">
            <Logo />
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/how-it-works">How it works</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/dashboard">Dashboard</Link>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/for-interpreters">Interpreters</Link>
            <Link href="/for-organizations">Teams</Link>
            <p>Copyright © {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
