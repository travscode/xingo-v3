"use client";

import { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { Check, ChevronDown, PanelLeft } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { languages } from "@/components/marketing/naati-ccl/content";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { LanguagePreference } from "@/types/user";

type LanguagePairOption = {
  key: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceFlag: string;
  targetFlag: string;
  region: string;
};

const languageFlagByName = new Map<string, string>([
  ["english", "AU"],
  ...languages.flatMap<readonly [string, string]>((language) => [
    [language.english.toLowerCase(), language.englishFlag] as const,
    [language.target.toLowerCase(), language.targetFlag] as const,
  ]),
]);

/**
 * Converts a two-letter ISO country code into a flag emoji.
 */
function toFlagEmoji(countryCode: string) {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

/**
 * Normalizes one language pair into a stable comparison key.
 */
function toLanguagePairKey(sourceLanguage: string, targetLanguage: string) {
  return `${sourceLanguage.trim().toLowerCase()}::${targetLanguage
    .trim()
    .toLowerCase()}`;
}

/**
 * Resolves a display-ready language pair option with fallback flag handling.
 */
function createLanguagePairOption(
  sourceLanguage: string,
  targetLanguage: string,
): LanguagePairOption {
  const sourceFlag =
    languageFlagByName.get(sourceLanguage.trim().toLowerCase()) ?? "AU";
  const targetFlag =
    languageFlagByName.get(targetLanguage.trim().toLowerCase()) ?? "AU";

  return {
    key: toLanguagePairKey(sourceLanguage, targetLanguage),
    sourceLanguage: sourceLanguage.trim(),
    targetLanguage: targetLanguage.trim(),
    sourceFlag,
    targetFlag,
    region: `${sourceFlag} <> ${targetFlag}`,
  };
}

/**
 * Builds the dropdown options from saved preferences plus seeded CCL pairs.
 */
function buildLanguagePairOptions(
  languagePreferences: LanguagePreference[] | undefined,
) {
  const savedOptions = (languagePreferences ?? [])
    .filter((pair) => pair.sourceLanguage.trim() && pair.targetLanguage.trim())
    .map((pair) =>
      createLanguagePairOption(pair.sourceLanguage, pair.targetLanguage),
    );

  const seededOptions = languages.map((language) =>
    createLanguagePairOption(language.english, language.target),
  );

  return [...savedOptions, ...seededOptions].filter((option, index, all) => {
    return all.findIndex((item) => item.key === option.key) === index;
  });
}

export function DashboardTopbar() {
  const { user } = useUser();
  const currentUser = useQuery(api.users.current, {});
  const firstName = user?.firstName ?? user?.fullName ?? "Interpreter";
  const languagePairOptions = useMemo(
    () => buildLanguagePairOptions(currentUser?.languagePreferences),
    [currentUser?.languagePreferences],
  );
  const [selectedPairKey, setSelectedPairKey] = useState("");
  const activeLanguagePair =
    languagePairOptions.find((option) => option.key === selectedPairKey) ??
    languagePairOptions[0] ??
    createLanguagePairOption("English", "Spanish");

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
                        {toFlagEmoji(activeLanguagePair.sourceFlag)}
                      </span>
                      <span className="truncate">
                        {activeLanguagePair.sourceLanguage}
                      </span>
                    </span>
                    <span className="shrink-0 text-slate-400">/</span>
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate">
                        {activeLanguagePair.targetLanguage}
                      </span>
                      <span
                        aria-hidden="true"
                        className="text-base leading-none"
                      >
                        {toFlagEmoji(activeLanguagePair.targetFlag)}
                      </span>
                    </span>
                  </div>
                </div>
                <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[22rem] p-2">
            {languagePairOptions.map((option) => {
              const isActive = option.key === activeLanguagePair.key;

              return (
                <DropdownMenuItem
                  key={option.key}
                  onSelect={() => setSelectedPairKey(option.key)}
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
