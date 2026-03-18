"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNavigation } from "@/lib/navigation";
import { Logo } from "@/components/ui/logo";

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="section-frame sticky top-6 hidden h-[calc(100vh-3rem)] w-72 rounded-[2rem] p-6 lg:block">
      <div className="flex h-full flex-col">
        <Logo />
        <div className="mt-10 space-y-2">
          {dashboardNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand text-white"
                    : "text-muted hover:bg-white/70 hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="mt-auto rounded-[1.5rem] bg-brand-strong p-5 text-white">
          <p className="text-xs uppercase tracking-[0.24em] text-white/70">Live cohort</p>
          <p className="mt-3 text-2xl font-semibold">23 learners active</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Organization dashboards, assignments, and CSV enrollment all fit here.
          </p>
        </div>
      </div>
    </aside>
  );
}
