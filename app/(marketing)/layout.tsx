import Link from "next/link";
import type { ReactNode } from "react";
import { HeaderAuth } from "@/components/auth/header-auth";
import { Logo } from "@/components/ui/logo";
import { marketingNavigation } from "@/lib/navigation";
import { XingoMark } from "@/components/ui/logo";

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
          <p className="max-w-md text-black flex gap-4 items-center justify-center">
            <XingoMark size={40} />
            <div className="display text-lg font-semibold tracking-tight">
              <svg
                width={468 * 0.2}
                height={180 * 0.2}
                viewBox="0 0 468 180"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M50.4248 108.351H49.1745L25.8375 145.857H0L36.4642 93.765L0 41.6734H25.8375L49.1745 79.1794H50.4248L73.7618 41.6734H99.5993L63.1351 93.765L99.5993 145.857H73.7618L50.4248 108.351Z"
                  fill="currentColor"
                />
                <path
                  d="M114.309 0H135.145V20.8367H114.309V0ZM114.309 41.6734H135.145V145.857H114.309V41.6734Z"
                  fill="currentColor"
                />
                <path
                  d="M220.673 60.4264H174.833V145.857H153.996V41.6734H241.51V145.857H220.673V60.4264Z"
                  fill="currentColor"
                />
                <path
                  d="M332.832 41.6734H353.668V179.195H274.489V160.442H332.832V127.104C326.581 133.98 316.371 139.606 301.785 139.606C268.03 139.606 256.153 116.06 256.153 89.5977C256.153 63.1351 268.03 39.5897 301.785 39.5897C316.371 39.5897 326.581 45.2156 332.832 54.1754V41.6734ZM304.911 120.853C325.33 120.853 332.832 112.518 332.832 89.5977C332.832 68.761 325.33 58.3427 304.911 58.3427C284.491 58.3427 276.989 68.761 276.989 89.5977C276.989 110.434 284.491 120.853 304.911 120.853Z"
                  fill="currentColor"
                />
                <path
                  d="M418.129 147.94C386.457 147.94 368.329 126.479 368.329 93.765C368.329 61.0515 386.457 39.5897 418.129 39.5897C449.8 39.5897 467.928 61.0515 467.928 93.765C467.928 126.479 449.8 147.94 418.129 147.94ZM418.129 129.187C439.59 129.187 447.092 120.853 447.092 93.765C447.092 66.6774 439.59 58.3427 418.129 58.3427C396.667 58.3427 389.166 66.6774 389.166 93.765C389.166 120.853 396.667 129.187 418.129 129.187Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </p>
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
