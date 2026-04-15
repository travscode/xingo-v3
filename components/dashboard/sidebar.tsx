"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { dashboardNavigation } from "@/lib/navigation";
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
import { api } from "@/convex/_generated/api";
import { ChevronUp, Shield } from "lucide-react";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { isDesktop, setOpen } = useSidebar();
  const { user } = useUser();
  const currentUser = useQuery(api.users.current, {});

  const displayName = user?.fullName ?? user?.firstName ?? "Interpreter";
  const subscriptionStatus = currentUser?.subscriptionStatus ?? "free";
  const navigation =
    currentUser?.role === "platform_admin"
      ? [...dashboardNavigation, { href: "/admin", label: "Admin", icon: Shield }]
      : dashboardNavigation;
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
            Focus
          </p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Open a module. Run a scenario. Save the score.
          </p>
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
  );
}
