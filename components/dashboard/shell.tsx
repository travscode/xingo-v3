"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { UserButton } from "@clerk/nextjs";
import { Menu, Shield, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { dashboardNavigation, isNavItemActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { LanguagePairProvider } from "@/components/providers/language-pair-context";
import { LanguagePairPicker } from "@/components/dashboard/language-pair-picker";
import { MinutesMeter } from "@/components/dashboard/minutes-meter";
import { XingoMark } from "@/components/ui/logo";

/** Routes that render full-screen, without app chrome. */
function isFocusRoute(pathname: string) {
  return pathname.startsWith("/practice/") || pathname === "/welcome";
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const me = useQuery(api.users.me, {});
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerPath, setDrawerPath] = useState(pathname);

  // Close the mobile drawer after navigation (render-time reset, no effect needed).
  if (drawerPath !== pathname) {
    setDrawerPath(pathname);
    setMobileOpen(false);
  }

  // First-run: everyone goes through the welcome flow once.
  useEffect(() => {
    if (me?.user && !me.user.onboardedAt && pathname !== "/welcome") {
      router.replace(`/welcome?next=${encodeURIComponent(pathname)}`);
    }
  }, [me, pathname, router]);

  if (isFocusRoute(pathname)) {
    return <LanguagePairProvider>{children}</LanguagePairProvider>;
  }

  const isAdmin = me?.user.role === "platform_admin";

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {dashboardNavigation.map((item) => {
        const active = isNavItemActive(item, pathname);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-semibold transition-colors",
              active ? "bg-ink text-paper" : "text-gray-700 hover:bg-gray-100",
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        );
      })}
      {isAdmin ? (
        <Link
          href="/admin"
          aria-current={pathname.startsWith("/admin") ? "page" : undefined}
          className={cn(
            "mt-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-semibold transition-colors",
            pathname.startsWith("/admin") ? "bg-ink text-paper" : "text-gray-700 hover:bg-gray-100",
          )}
        >
          <Shield className="h-[18px] w-[18px]" />
          Admin
        </Link>
      ) : null}
    </nav>
  );

  return (
    <LanguagePairProvider>
      <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[256px_1fr]">
        {/* Desktop sidebar: always rendered by CSS, so there is no layout flash. */}
        <aside className="sticky top-0 hidden h-dvh flex-col border-r border-gray-200 px-4 py-5 lg:flex">
          <Brand />
          <div className="mt-8 flex flex-1 flex-col">{nav}</div>
          <MinutesMeter />
        </aside>

        {/* Mobile top bar + drawer */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-paper px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="-ml-2 rounded-lg p-2 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Brand />
          <UserButton />
        </div>
        {mobileOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-ink/40"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-paper px-4 py-5">
              <div className="flex items-center justify-between">
                <Brand />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-2 hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-8 flex flex-1 flex-col">{nav}</div>
              <MinutesMeter />
            </aside>
          </div>
        ) : null}

        <div className="min-w-0">
          <div className="hidden items-center justify-end gap-3 px-8 pt-5 lg:flex">
            <LanguagePairPicker />
            <UserButton />
          </div>
          <div className="px-4 pt-4 lg:hidden">
            <LanguagePairPicker />
          </div>
          <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </LanguagePairProvider>
  );
}

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 px-1" aria-label="XINGO home">
      <XingoMark className="h-7 w-auto" />
      <span className="text-lg font-bold tracking-[-0.03em]">XINGO</span>
    </Link>
  );
}
