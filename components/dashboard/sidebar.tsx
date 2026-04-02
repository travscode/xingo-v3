"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNavigation } from "@/lib/navigation";
import { Logo } from "@/components/ui/logo";

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="section-frame sticky top-6 hidden h-[calc(100vh-3rem)] w-64 rounded-[1.75rem] p-4 lg:block">
      <div className="flex h-full flex-col">
        <Logo />
        <div className="mt-8 space-y-1.5">
          {dashboardNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand text-white"
                    : "text-muted hover:bg-black/4 hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="mt-auto rounded-[1.25rem] border border-line bg-white/75 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Workspace</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Training, scoring, and progress in one place.
          </p>
        </div>
      </div>
    </aside>
  );
}
