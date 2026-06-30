"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { dashboardNavigation } from "@/lib/navigation";
import { formatCredits } from "@/lib/usage-billing";
import { Logo } from "@/components/ui/logo";
import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import { ChevronUp, Shield } from "lucide-react";

/**
 * Renders a compact circular progress ring for account credit usage.
 */
function CreditUsageCircle({
  usedCredits,
  includedCredits,
  remainingCredits,
  isOverQuota,
}: {
  usedCredits: number;
  includedCredits: number;
  remainingCredits: number;
  isOverQuota: boolean;
}) {
  const size = 84;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const usedPercent =
    includedCredits > 0 ? (usedCredits / includedCredits) * 100 : 0;
  const visiblePercent = Math.max(0, Math.min(100, usedPercent));
  const dashOffset = circumference - (visiblePercent / 100) * circumference;
  const tooltipLabel = `${Math.round(usedPercent)}% of credits used. (${formatCredits(
    usedCredits,
  )} of ${formatCredits(includedCredits)} used)`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="relative inline-flex h-24 w-24 items-center justify-center"
          aria-label={tooltipLabel}
        >
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="-rotate-90"
            aria-hidden
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth={strokeWidth}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={isOverQuota ? "#f87171" : "#ffffff"}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-lg font-semibold leading-none text-white">
              {includedCredits > 0 ? Math.round(remainingCredits) : 0}
            </div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">
              left
            </div>
            <div className="mt-1 text-[10px] text-white/45">
              / {Math.round(includedCredits)}
            </div>
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{tooltipLabel}</TooltipContent>
    </Tooltip>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { isDesktop, setOpen } = useSidebar();
  const { user } = useUser();
  const currentUser = useQuery(api.users.current, {});
  const billingSummary = useQuery(
    api.usage.currentBillingSummaryForCurrentUser,
    {},
  );

  const displayName = user?.fullName ?? user?.firstName ?? "Interpreter";
  const subscriptionStatus = currentUser?.subscriptionStatus ?? "free";
  const includedCredits = billingSummary?.includedCreditsMonthly ?? 0;
  const remainingCredits = billingSummary?.remainingCredits ?? 0;
  const usedCredits = billingSummary?.usedCredits ?? 0;
  const isOverQuota = Boolean(billingSummary?.isOverQuota);
  const navigation =
    currentUser?.role === "platform_admin"
      ? [
          ...dashboardNavigation,
          { href: "/admin", label: "Admin", icon: Shield },
        ]
      : dashboardNavigation;
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <TooltipProvider delayDuration={120}>
      <Sidebar className="bg-white/90">
        <div className="px-4 py-5">
          <Logo />
        </div>

        <div className="flex-1 px-3">
          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (!isDesktop) {
                      setOpen(false);
                    }
                  }}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand text-white shadow-[0_10px_24px_rgba(18,18,18,0.12)]"
                      : "text-muted hover:bg-black/[0.04] hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-3">
          <div className="rounded-[1.5rem] border border-line bg-black p-4 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                  Credits
                </p>
                <p className="mt-2 text-xs text-white/55">
                  {billingSummary
                    ? `${Math.round(includedCredits)} total`
                    : "Loading..."}
                </p>
              </div>
              <CreditUsageCircle
                usedCredits={usedCredits}
                includedCredits={includedCredits}
                remainingCredits={remainingCredits}
                isOverQuota={isOverQuota}
              />
            </div>
          </div>
        </div>

        <div className="p-3 pt-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-[1.5rem] border border-line bg-white/80 px-4 py-3 text-left shadow-[0_12px_30px_rgba(18,18,18,0.04)] transition hover:bg-white"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.imageUrl} alt={displayName} />
                  <AvatarFallback>{initials || "U"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {displayName}
                  </div>
                  <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                    {subscriptionStatus === "free" ? "Free" : "Pro"}
                  </div>
                </div>
                <ChevronUp className="h-4 w-4 shrink-0 text-muted" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href="/account">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/billing">Billing</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/account?tab=settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <SignOutButton>
                  <button type="button" className="w-full text-left">
                    Log out
                  </button>
                </SignOutButton>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Sidebar>
    </TooltipProvider>
  );
}
