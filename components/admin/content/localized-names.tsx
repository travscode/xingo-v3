"use client";

import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/admin/content/fields";
import {
  NAME_BANK_LANGUAGES,
  genderForVoice,
  languagesNameSuits,
  suggestLocalizedNames,
  type LocalizedName,
} from "@/lib/agent-names";

function slotFor(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

/**
 * Name per practice language (D-045). In a session held in that language the character
 * uses this name, and the scenario text follows; blank means the main name is used.
 */
export function LocalizedNamesField({
  idPrefix,
  name,
  voice,
  value,
  onChange,
}: {
  idPrefix: string;
  name: string;
  voice: string;
  value: LocalizedName[];
  onChange: (next: LocalizedName[]) => void;
}) {
  const byLanguage = new Map(value.map((entry) => [entry.language.toLowerCase(), entry.name]));
  // Bank languages first, then any extra language already saved on the character.
  const languages = [
    ...NAME_BANK_LANGUAGES,
    ...value.map((entry) => entry.language).filter((language) => !NAME_BANK_LANGUAGES.some((known) => known.toLowerCase() === language.toLowerCase())),
  ];
  const filled = languages.filter((language) => byLanguage.get(language.toLowerCase())?.trim()).length;
  const gender = genderForVoice(voice);

  const setName = (language: string, next: string) => {
    const rest = value.filter((entry) => entry.language.toLowerCase() !== language.toLowerCase());
    onChange(next ? [...rest, { language, name: next }] : rest);
  };

  const fillSuggestions = () => {
    if (!gender) return;
    const suggestions = suggestLocalizedNames(gender, slotFor(name), name ? { name, languages: languagesNameSuits(name) } : undefined);
    onChange([
      ...value,
      ...suggestions.filter((suggestion) => !byLanguage.get(suggestion.language.toLowerCase())?.trim()),
    ]);
  };

  return (
    <details className="group rounded-xl border border-gray-200 p-5 sm:p-6">
      <summary className="cursor-pointer list-none text-lg font-bold tracking-[-0.02em]">
        Name in each language{" "}
        <span className="text-sm font-normal text-gray-500">
          ({filled} of {languages.length} set)
        </span>
      </summary>
      <p className="mt-2 text-sm leading-6 text-gray-500">
        When a learner practises in that language, this character uses the name below, and the dialogue&apos;s text
        follows. Leave a language blank to use “{name || "the main name"}”.
      </p>
      <div className="mt-4">
        <Button type="button" variant="outline" size="sm" onClick={fillSuggestions} disabled={!gender}>
          <Wand2 className="h-4 w-4" aria-hidden /> Fill blanks with suggested names
        </Button>
        {!gender ? <p className="mt-2 text-xs text-gray-500">Pick a female or male voice to get suggestions.</p> : null}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {languages.map((language) => {
          const inputId = `${idPrefix}-name-${language.toLowerCase().replace(/[^a-z]+/g, "-")}`;
          return (
            <label key={language} htmlFor={inputId} className="flex flex-col gap-1 text-sm">
              <span className="font-semibold">{language}</span>
              <TextInput
                id={inputId}
                value={byLanguage.get(language.toLowerCase()) ?? ""}
                onChange={(event) => setName(language, event.target.value)}
                placeholder={name || "Main name"}
              />
            </label>
          );
        })}
      </div>
    </details>
  );
}
