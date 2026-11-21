"use client";

import { useEffect, useState } from "react";
import { Check, Clock, Crown, Package, X } from "lucide-react";
import { useCheckout } from "@/components/billing/use-checkout";
import { Price } from "@/components/billing/price";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { CURRENCY_LABEL, packContextFor, packCopy, packList, plans, type PackId } from "@/lib/plans";
import { IELTS_COURSE_ID } from "@/lib/course-status";
import { cn } from "@/lib/utils";

type Tab = "packs" | "plans";
type Choice = PackId | "pro";

/**
 * Pick a pack or Pro and go straight to Stripe Checkout, without leaving the
 * course. Packs come first (D-051); backing out of Checkout returns to `returnPath`.
 */
export function UnlockDialog({
  open,
  onClose,
  returnPath,
  source,
  moduleId,
}: {
  open: boolean;
  onClose: () => void;
  returnPath: string;
  /** Analytics label for where the dialog was opened from. */
  source: string;
  /** The course it was opened from, for the title and "about N …" counts. */
  moduleId?: string;
}) {
  const { pending, error, buyPack, subscribe } = useCheckout({ cancelPath: returnPath });
  const [tab, setTab] = useState<Tab>("packs");
  const [choice, setChoice] = useState<Choice>("starter");

  useEffect(() => {
    if (!open) return;
    track("paywall_view", { reason: "unlock_dialog", source });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, source]);

  if (!open) return null;

  const switchTab = (next: Tab) => {
    setTab(next);
    setChoice(next === "packs" ? "starter" : "pro");
  };

  const pro = plans.professional;
  const context = packContextFor(moduleId);
  const selectedPack = packList.find((pack) => pack.id === choice);
  const payLabel = selectedPack ? selectedPack.priceLabel : pro.priceLabel;
  const busy = pending !== null;

  const pay = () => {
    if (choice === "pro") subscribe();
    else buyPack(choice);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/60 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="unlock-title"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl bg-paper shadow-2xl sm:rounded-2xl"
      >
        <header className="flex items-start gap-3 p-5 pb-0 sm:p-6 sm:pb-0">
          <div className="min-w-0 flex-1">
            <h2 id="unlock-title" className="text-xl font-bold tracking-[-0.02em]">
              {moduleId === IELTS_COURSE_ID ? "Unlock every IELTS mock test" : "Unlock every CCL dialogue"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">Any pack or plan opens every dialogue in every open course.</p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div role="tablist" aria-label="Packs or plans" className="mx-5 mt-5 grid grid-cols-2 rounded-xl bg-gray-100 p-1 sm:mx-6">
          {(
            [
              ["packs", "Minute packs"],
              ["plans", "Plans"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => switchTab(id)}
              className={cn(
                "rounded-lg py-2 text-sm font-semibold transition-colors",
                tab === id ? "bg-paper text-ink shadow-sm" : "text-gray-500 hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div role="radiogroup" aria-label={tab === "packs" ? "Minute packs" : "Plans"} className="flex-1 space-y-3 overflow-y-auto p-5 sm:p-6">
          {tab === "packs" ? (
            <>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-ink">{packCopy(packList[0], context).fit}.</span> One-off payment, no
                subscription. Minutes never expire.
              </p>
              {packList.map((pack) => {
                const copy = packCopy(pack, context);
                return (
                <Option key={pack.id} selected={choice === pack.id} onSelect={() => setChoice(pack.id)}>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 font-bold">
                      <Package className="h-4 w-4" aria-hidden /> {pack.label}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold">
                      <Clock className="h-3.5 w-3.5" aria-hidden /> {pack.minutes} min · {copy.sessions}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-500">{copy.description}</p>
                  </div>
                  <Price priceLabel={pack.priceLabel} regularPriceLabel={pack.regularPriceLabel} className="flex-col items-end gap-0 text-xl" />
                </Option>
                );
              })}
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500">Renews monthly. Cancel any time from Plan &amp; minutes.</p>
              <Option selected={choice === "pro"} onSelect={() => setChoice("pro")}>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 font-bold">
                    <Crown className="h-4 w-4" aria-hidden /> {pro.label}
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0" /> {pro.monthlyMinutes} practice minutes every month
                    </li>
                    <li className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0" /> Every NAATI CCL dialogue, plus every open course
                    </li>
                  </ul>
                </div>
                <Price priceLabel={pro.priceLabel} regularPriceLabel={pro.regularPriceLabel} className="flex-col items-end gap-0 text-xl" />
              </Option>
            </>
          )}
        </div>

        <footer className="border-t border-gray-200 p-5 sm:p-6">
          {error ? <p className="mb-3 rounded-lg bg-record/10 px-3 py-2 text-sm text-record">{error}</p> : null}
          <Button size="lg" block disabled={busy} onClick={pay}>
            {busy ? "Opening checkout…" : `Continue to payment · ${payLabel}`}
          </Button>
          <p className="mt-3 text-center text-xs text-gray-500">
            Prices in {CURRENCY_LABEL} incl. GST. Have a promo code? Add it at checkout.
          </p>
        </footer>
      </div>
    </div>
  );
}

function Option({ selected, onSelect, children }: { selected: boolean; onSelect: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors",
        selected ? "border-2 border-ink p-[15px]" : "border-gray-200 hover:border-gray-400",
      )}
    >
      {children}
    </button>
  );
}
