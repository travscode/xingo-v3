"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { languages } from "@/components/marketing/naati-ccl/content";
import type { LanguagePreference } from "@/types/user";

const LANGUAGE_PAIR_STORAGE_KEY = "xingo:active-language-pair";

export type LanguagePair = {
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
export function createLanguagePair(
  sourceLanguage: string,
  targetLanguage: string,
): LanguagePair {
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
 * Builds the full list of language pair options from saved preferences plus seeded CCL pairs.
 */
export function buildLanguagePairOptions(
  languagePreferences: LanguagePreference[] | undefined,
): LanguagePair[] {
  const savedOptions = (languagePreferences ?? [])
    .filter((pair) => pair.sourceLanguage.trim() && pair.targetLanguage.trim())
    .map((pair) =>
      createLanguagePair(pair.sourceLanguage, pair.targetLanguage),
    );

  const seededOptions = languages.map((language) =>
    createLanguagePair(language.english, language.target),
  );

  return [...savedOptions, ...seededOptions].filter((option, index, all) => {
    return all.findIndex((item) => item.key === option.key) === index;
  });
}

interface LanguagePairContextValue {
  activePair: LanguagePair;
  setActivePair: (pair: LanguagePair) => void;
  availablePairs: LanguagePair[];
}

const LanguagePairContext = createContext<LanguagePairContextValue | null>(null);

const DEFAULT_PAIR = createLanguagePair("English", "Spanish");

/**
 * Loads the persisted language pair key from localStorage (browser-only).
 */
function readStoredPairKey(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(LANGUAGE_PAIR_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Persists the selected language pair key to localStorage.
 */
function writeStoredPairKey(key: string) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(LANGUAGE_PAIR_STORAGE_KEY, key);
  } catch {
    // Ignore quota / private mode errors.
  }
}

/**
 * Provider that exposes the currently selected language pair across the dashboard.
 *
 * - Sources options from the user's saved preferences plus the default seeded CCL pairs.
 * - Persists the selection to localStorage so it survives page reloads.
 * - Falls back to the first available option (or a hardcoded default) when nothing is stored.
 */
export function LanguagePairProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = useQuery(api.users.current, {});
  const availablePairs = useMemo(
    () => buildLanguagePairOptions(currentUser?.languagePreferences),
    [currentUser?.languagePreferences],
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(() =>
    readStoredPairKey(),
  );

  useEffect(() => {
    if (selectedKey) {
      writeStoredPairKey(selectedKey);
    }
  }, [selectedKey]);

  const setActivePair = useCallback((pair: LanguagePair) => {
    setSelectedKey(pair.key);
  }, []);

  const activePair = useMemo<LanguagePair>(() => {
    const byKey = selectedKey
      ? availablePairs.find((option) => option.key === selectedKey)
      : undefined;
    return byKey ?? availablePairs[0] ?? DEFAULT_PAIR;
  }, [availablePairs, selectedKey]);

  const value = useMemo<LanguagePairContextValue>(
    () => ({
      activePair,
      setActivePair,
      availablePairs,
    }),
    [activePair, setActivePair, availablePairs],
  );

  return (
    <LanguagePairContext.Provider value={value}>
      {children}
    </LanguagePairContext.Provider>
  );
}

/**
 * Returns the active language pair and the setter to change it.
 * Must be used within a LanguagePairProvider.
 */
export function useActiveLanguagePair() {
  const context = useContext(LanguagePairContext);
  if (!context) {
    throw new Error(
      "useActiveLanguagePair must be used within a LanguagePairProvider",
    );
  }
  return context;
}

export { toFlagEmoji };
