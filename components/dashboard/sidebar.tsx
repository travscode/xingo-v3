"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNavigation } from "@/lib/navigation";
import { Logo } from "@/components/ui/logo";

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-60 rounded-[2rem] border border-line bg-white/84 p-4 shadow-[0_16px_40px_rgba(18,18,18,0.05)] lg:block">
      <div className="flex h-full flex-col">
        <Logo />
        <div className="mt-8 space-y-1.5">
          {dashboardNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand text-white shadow-[0_10px_24px_rgba(18,18,18,0.12)]"
                    : "text-muted hover:bg-black/[0.04] hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="mt-auto rounded-[1.5rem] border border-line bg-[#121212] p-4 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">Focus</p>
          <p className="mt-2 text-sm leading-6 text-white/75">Open a module. Run a scenario. Save the score.</p>
        </div>
      </div>
    </aside>
  );
}
