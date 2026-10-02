"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Check, ChevronDown } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useActiveLanguagePair } from "@/components/providers/language-pair-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createLanguagePair, flagEmoji, practiceLanguages, type LanguagePair } from "@/lib/languages";

/**
 * "English ⇄ <your language>". The English-speaking participant always speaks
 * English, so there is no direction to flip (decision D-010). Choosing a pair
 * saves it to the account so it applies on every device.
 */
export function LanguagePairPicker() {
  const { activePair, setActivePair, savedPairs } = useActiveLanguagePair();
  const updatePreferences = useMutation(api.users.updateLanguagePreferences);
  const [custom, setCustom] = useState("");

  const choose = (pair: LanguagePair) => {
    setActivePair(pair);
    const rest = savedPairs.filter((saved) => saved.key !== pair.key);
    void updatePreferences({
      languagePreferences: [pair, ...rest].map(({ sourceLanguage, targetLanguage }) => ({
        sourceLanguage,
        targetLanguage,
      })),
    }).catch(() => undefined);
  };

  const options = practiceLanguages.map((language) => createLanguagePair("English", language.name));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-gray-100 px-3 text-sm font-semibold hover:bg-gray-200"
          aria-label="Change practice language"
        >
          <span className="text-gray-500">Practising</span>
          <span>
            {activePair.sourceLanguage} ⇄ {flagEmoji(activePair.targetLanguage)} {activePair.targetLanguage}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-[70vh] w-72 overflow-y-auto rounded-xl p-1.5">
        <p className="px-2 pb-1 pt-2 text-xs font-semibold text-gray-500">Your other language</p>
        {options.map((option) => (
          <DropdownMenuItem
            key={option.key}
            onSelect={() => choose(option)}
            className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm font-medium outline-none focus:bg-gray-100"
          >
            <span>
              {flagEmoji(option.targetLanguage)} {option.targetLanguage}
            </span>
            {option.key === activePair.key ? <Check className="h-4 w-4" /> : null}
          </DropdownMenuItem>
        ))}
        <form
          className="mt-1 flex gap-1 border-t border-gray-200 p-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (custom.trim()) {
              choose(createLanguagePair("English", custom.trim()));
              setCustom("");
            }
          }}
        >
          <input
            value={custom}
            onChange={(event) => setCustom(event.target.value)}
            onKeyDown={(event) => event.stopPropagation()}
            placeholder="Another language…"
            className="h-9 min-w-0 flex-1 rounded-lg bg-gray-100 px-2 text-sm outline-none focus:ring-2 focus:ring-live"
          />
          <button type="submit" className="rounded-lg bg-ink px-3 text-sm font-semibold text-paper">
            Use
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
