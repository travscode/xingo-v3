import type { LucideIcon } from "lucide-react";
import { CircleHelp, CreditCard, Home, Mic, TrendingUp, UserRound } from "lucide-react";

export const marketingNavigation = [
  { href: "/naati/ccl", label: "NAATI CCL" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/for-organizations", label: "For teams" },
  { href: "/pricing", label: "Pricing" },
] as const;

export type AppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Other path prefixes that should highlight this item. */
  matches?: string[];
};

export const dashboardNavigation: AppNavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/modules", label: "Practice", icon: Mic, matches: ["/practice", "/results"] },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/billing", label: "Plan & minutes", icon: CreditCard },
  { href: "/account", label: "Account", icon: UserRound },
  { href: "/help", label: "Help", icon: CircleHelp },
];

export function isNavItemActive(item: AppNavItem, pathname: string) {
  return [item.href, ...(item.matches ?? [])].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
