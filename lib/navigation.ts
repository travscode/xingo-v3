import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  CircleHelp,
  CreditCard,
  LayoutDashboard,
  TrendingUp,
  UserRound,
} from "lucide-react";

export const marketingNavigation = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/for-interpreters", label: "Interpreters" },
  { href: "/for-organizations", label: "Teams" },
  { href: "/pricing", label: "Pricing" },
] as const;

export const dashboardNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/modules", label: "Modules", icon: BookOpen },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/credentials", label: "Credentials", icon: BadgeCheck },
  // { href: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/account", label: "Profile", icon: UserRound },
  { href: "/help", label: "Help", icon: CircleHelp },
] satisfies readonly { href: string; label: string; icon: LucideIcon }[];
