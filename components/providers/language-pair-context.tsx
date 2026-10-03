"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  createLanguagePair,
  DEFAULT_LANGUAGE_PAIR,
  type LanguagePair,
} from "@/lib/languages";

const STORAGE_KEY = "xingo:active-language-pair";

interface LanguagePairContextValue {
  activePair: LanguagePair;
  setActivePair: (pair: LanguagePair) => void;
  /** The user's saved pairs, most recent first. */
  savedPairs: LanguagePair[];
}

const LanguagePairContext = createContext<LanguagePairContextValue | null>(null);

const CHANGE_EVENT = "xingo:language-pair-change";

function readStoredRaw() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function parseStoredPair(raw: string | null): LanguagePair | null {
  try {
    const parsed = raw ? (JSON.parse(raw) as Partial<LanguagePair>) : null;

    if (parsed?.sourceLanguage && parsed?.targetLanguage) {
      return createLanguagePair(parsed.sourceLanguage, parsed.targetLanguage);
    }
  } catch {
    // Private mode or malformed value: fall back to saved preferences.
  }

  return null;
}

/**
 * The language pair the learner is practising right now.
 *
 * Defaults to the first pair saved on their profile (set during onboarding);
 * a quick switch in the top bar is remembered on this device only.
 */
export function LanguagePairProvider({ children }: { children: React.ReactNode }) {
  const currentUser = useQuery(api.users.current, {});
  const savedPairs = useMemo(
    () =>
      (currentUser?.languagePreferences ?? []).map((pair) =>
        createLanguagePair(pair.sourceLanguage, pair.targetLanguage),
      ),
    [currentUser?.languagePreferences],
  );
  // Device preference; the server snapshot is null so SSR and hydration match.
  const storedRaw = useSyncExternalStore(subscribe, readStoredRaw, () => null);
  const selectedPair = useMemo(() => parseStoredPair(storedRaw), [storedRaw]);

  const setActivePair = useCallback((pair: LanguagePair) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pair));
    } catch {
      // Ignore storage failures.
    }

    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const activePair = selectedPair ?? savedPairs[0] ?? DEFAULT_LANGUAGE_PAIR;

  const value = useMemo(
    () => ({ activePair, setActivePair, savedPairs }),
    [activePair, setActivePair, savedPairs],
  );

  return <LanguagePairContext.Provider value={value}>{children}</LanguagePairContext.Provider>;
}

export function useActiveLanguagePair() {
  const context = useContext(LanguagePairContext);

  if (!context) {
    throw new Error("useActiveLanguagePair must be used within a LanguagePairProvider");
  }

  return context;
}

/** The selected pair as a query argument: scores, history and progress follow it. */
export function useProgressPair() {
  const { activePair } = useActiveLanguagePair();
  return useMemo(
    () => ({ sourceLanguage: activePair.sourceLanguage, targetLanguage: activePair.targetLanguage }),
    [activePair.sourceLanguage, activePair.targetLanguage],
  );
}
