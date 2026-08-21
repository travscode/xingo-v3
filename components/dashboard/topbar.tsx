"use client";

import { Check, ChevronDown, PanelLeft } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import {
  useActiveLanguagePair,
  toFlagEmoji,
} from "@/components/providers/language-pair-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function DashboardTopbar() {
  const { user } = useUser();
  const firstName = user?.firstName ?? user?.fullName ?? "Interpreter";
  const { activePair, setActivePair, availablePairs } = useActiveLanguagePair();

  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border border-line bg-white/84 px-5 py-4 shadow-[0_12px_30px_rgba(18,18,18,0.04)] lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="shrink-0">
          <PanelLeft className="h-4 w-4" />
        </SidebarTrigger>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            Workspace
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
            Welcome back, {firstName}
          </h1>
        </div>
      </div>
      <div className="w-full lg:max-w-[23rem]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-full rounded-[1.4rem] border border-[#ececf3] bg-[#fafafe] px-4 py-3 text-left transition hover:border-line hover:bg-white"
              aria-label="Choose language pair"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Language pair
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-sm font-semibold text-slate-900">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="text-base leading-none"
                      >
                        {toFlagEmoji(activePair.sourceFlag)}
                      </span>
                      <span className="truncate">
                        {activePair.sourceLanguage}
                      </span>
                    </span>
                    <span className="shrink-0 text-slate-400">/</span>
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate">
                        {activePair.targetLanguage}
                      </span>
                      <span
                        aria-hidden="true"
                        className="text-base leading-none"
                      >
                        {toFlagEmoji(activePair.targetFlag)}
                      </span>
                    </span>
                  </div>
                </div>
                <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[22rem] p-2">
            {availablePairs.map((option) => {
              const isActive = option.key === activePair.key;

              return (
                <DropdownMenuItem
                  key={option.key}
                  onSelect={() => setActivePair(option)}
                  className="rounded-[1.4rem] border border-[#ececf3] bg-[#fafafe] px-4 py-3 focus:bg-[#f4f6ff]"
                >
                  <div className="flex w-full items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {option.region}
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-3 text-sm font-semibold text-slate-900">
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="text-base leading-none"
                          >
                            {toFlagEmoji(option.sourceFlag)}
                          </span>
                          <span className="truncate">
                            {option.sourceLanguage}
                          </span>
                        </span>
                        <span className="shrink-0 text-slate-400">/</span>
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="truncate">
                            {option.targetLanguage}
                          </span>
                          <span
                            aria-hidden="true"
                            className="text-base leading-none"
                          >
                            {toFlagEmoji(option.targetFlag)}
                          </span>
                        </span>
                      </div>
                    </div>
                    {isActive ? (
                      <Check className="mt-1 h-4 w-4 shrink-0 text-brand" />
                    ) : null}
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
