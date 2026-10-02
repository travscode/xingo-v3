"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Check, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { practiceGoals } from "@/lib/goals";
import { createLanguagePair, flagEmoji, practiceLanguages } from "@/lib/languages";
import { useActiveLanguagePair } from "@/components/providers/language-pair-context";
import { Badge, Card, PageHeader, SectionTitle, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LiveAccount() {
  const me = useQuery(api.users.me, {});
  const completeOnboarding = useMutation(api.users.completeOnboarding);
  const updatePreferences = useMutation(api.users.updateLanguagePreferences);
  const { activePair, setActivePair } = useActiveLanguagePair();
  const clerk = useClerk();
  const [adding, setAdding] = useState("");

  if (!me) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  const { user } = me;
  const pairs = (user.languagePreferences ?? []).map((pair) =>
    createLanguagePair(pair.sourceLanguage, pair.targetLanguage),
  );

  const savePairs = (next: typeof pairs) =>
    updatePreferences({
      languagePreferences: next.map(({ sourceLanguage, targetLanguage }) => ({ sourceLanguage, targetLanguage })),
    });

  const setGoal = (goalId: string) => {
    const primary = pairs[0] ?? activePair;
    void completeOnboarding({
      practiceGoal: goalId,
      languagePair: { sourceLanguage: primary.sourceLanguage, targetLanguage: primary.targetLanguage },
    });
  };

  return (
    <div className="space-y-10">
      <PageHeader title="Account" />

      <section>
        <SectionTitle>Profile</SectionTitle>
        <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            {user.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.imageUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
            ) : null}
            <div>
              <p className="font-bold">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => clerk.openUserProfile()}>
            Edit name, email & password
          </Button>
        </Card>
      </section>

      <section>
        <SectionTitle>Preparing for</SectionTitle>
        <div className="grid gap-2 sm:grid-cols-2">
          {practiceGoals.map((goal) => (
            <button
              key={goal.id}
              type="button"
              onClick={() => setGoal(goal.id)}
              className={cn(
                "flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left",
                user.practiceGoal === goal.id ? "border-ink" : "border-transparent bg-gray-50 hover:bg-gray-100",
              )}
            >
              <span>
                <span className="block font-semibold">{goal.label}</span>
                <span className="block text-sm text-gray-500">{goal.description}</span>
              </span>
              {user.practiceGoal === goal.id ? <Check className="h-4 w-4" /> : null}
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Your languages</SectionTitle>
        <p className="-mt-1 mb-3 text-sm text-gray-500">
          The English-speaking professional always speaks English; the client speaks the language you choose.
        </p>
        <Card className="divide-y divide-gray-200">
          {pairs.map((pair, index) => (
            <div key={pair.key} className="flex items-center justify-between gap-3 px-5 py-3">
              <span className="font-semibold">
                {pair.sourceLanguage} ⇄ {flagEmoji(pair.targetLanguage)} {pair.targetLanguage}
              </span>
              <div className="flex items-center gap-2">
                {pair.key === activePair.key ? (
                  <Badge tone="dark">Active</Badge>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => setActivePair(pair)}>
                    Use
                  </Button>
                )}
                {index > 0 || pairs.length > 1 ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Remove ${pair.targetLanguage}`}
                    onClick={() => void savePairs(pairs.filter((other) => other.key !== pair.key))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
          <form
            className="flex gap-2 px-5 py-3"
            onSubmit={(event) => {
              event.preventDefault();
              const name = adding.trim();
              if (!name) return;
              const pair = createLanguagePair("English", name);
              void savePairs([...pairs.filter((p) => p.key !== pair.key), pair]);
              setAdding("");
            }}
          >
            <input
              list="xingo-languages"
              value={adding}
              onChange={(event) => setAdding(event.target.value)}
              placeholder="Add a language…"
              className="h-10 min-w-0 flex-1 rounded-lg bg-gray-100 px-3 text-sm outline-none focus:ring-2 focus:ring-live"
            />
            <datalist id="xingo-languages">
              {practiceLanguages.map((language) => (
                <option key={language.name} value={language.name} />
              ))}
            </datalist>
            <Button type="submit" variant="secondary">
              Add
            </Button>
          </form>
        </Card>
      </section>

      <section>
        <Button variant="ghost" onClick={() => void clerk.signOut({ redirectUrl: "/" })}>
          Sign out
        </Button>
      </section>
    </div>
  );
}
