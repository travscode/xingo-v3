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

const LanguagePairContext = createContext<LanguagePairContextValue | null>(
  null,
);

const DEFAULT_PAIR = createLanguagePair("English", "Spanish");

/**
 * Loads the persisted language pair from localStorage (browser-only).
 * The stored value is the full JSON representation so flipped / ad-hoc pairs
 * that are not present in the seed list still survive page reloads.
 */
function readStoredPair(): LanguagePair | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(LANGUAGE_PAIR_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof (parsed as LanguagePair).sourceLanguage === "string" &&
      typeof (parsed as LanguagePair).targetLanguage === "string"
    ) {
      return createLanguagePair(
        (parsed as LanguagePair).sourceLanguage,
        (parsed as LanguagePair).targetLanguage,
      );
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Persists a language pair to localStorage as JSON so flipped / ad-hoc pairs
 * (not present in the seed list) are preserved across page reloads.
 */
function writeStoredPair(pair: LanguagePair) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(
      LANGUAGE_PAIR_STORAGE_KEY,
      JSON.stringify(pair),
    );
  } catch {
    // Ignore quota / private mode errors.
  }
}

/**
 * Provider that exposes the currently selected language pair across the dashboard.
 *
 * - Sources options from the user's saved preferences plus the default seeded CCL pairs.
 * - Persists the full pair (not only the key) to localStorage so flipped / ad-hoc
 *   combinations that are not part of the option list still survive page reloads.
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
  const [selectedPair, setSelectedPair] = useState<LanguagePair | null>(() =>
    readStoredPair(),
  );

  useEffect(() => {
    if (selectedPair) {
      writeStoredPair(selectedPair);
    }
  }, [selectedPair]);

  const setActivePair = useCallback((pair: LanguagePair) => {
    setSelectedPair(pair);
  }, []);

  const activePair = useMemo<LanguagePair>(() => {
    if (selectedPair) {
      const matchingOption = availablePairs.find(
        (option) => option.key === selectedPair.key,
      );
      return matchingOption ?? selectedPair;
    }
    return availablePairs[0] ?? DEFAULT_PAIR;
  }, [availablePairs, selectedPair]);

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
