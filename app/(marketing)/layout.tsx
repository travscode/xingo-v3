import Link from "next/link";
import type { ReactNode } from "react";
import { HeaderAuth } from "@/components/auth/header-auth";
import { Logo } from "@/components/ui/logo";
import { marketingNavigation } from "@/lib/navigation";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grain min-h-screen">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          {marketingNavigation.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <HeaderAuth />
      </header>
      {children}
      <footer className="mx-auto mt-20 w-full max-w-7xl px-6 pb-10 lg:px-10">
        <div className="section-frame rounded-[2rem] px-6 py-8 text-sm text-muted">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p>AI interpreter training, credential pathways, and cohort reporting in one platform.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/pricing">Pricing</Link>
              <Link href="/for-organizations">Organizations</Link>
              <Link href="/dashboard">Dashboard</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
