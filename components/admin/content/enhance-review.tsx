"use client";

import { useEffect, useState } from "react";
import { WandSparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EnhanceChange } from "@/components/admin/content/model";

/**
 * Side-by-side review of what "Enhance with AI" suggested. Every change starts
 * ticked; applying only updates the form, the admin still saves as usual.
 */
export function EnhanceReview({
  changes,
  summary,
  onApply,
  onClose,
}: {
  changes: EnhanceChange[];
  summary: string;
  onApply: (selected: EnhanceChange[]) => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState(() => new Set(changes.map((change) => change.key)));
  const selected = changes.filter((change) => picked.has(change.key));
  const allPicked = picked.size === changes.length;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const toggle = (key: string) =>
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/60 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="enhance-title"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-t-2xl bg-paper shadow-2xl sm:rounded-2xl"
      >
        <header className="flex items-start gap-3 border-b border-gray-200 p-5 sm:p-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
            <WandSparkles className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="enhance-title" className="text-xl font-bold tracking-[-0.02em]">
              Review AI suggestions
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {changes.length === 0
                ? "The AI didn't suggest any changes. Your dialogue already looks complete."
                : summary || `${changes.length} field${changes.length === 1 ? "" : "s"} filled in or expanded.`}
            </p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </header>

        {changes.length > 0 ? (
          <>
            <div className="flex items-center justify-between gap-2 px-5 pt-4 text-sm sm:px-6">
              <span className="text-gray-500">
                {selected.length} of {changes.length} selected
              </span>
              <button
                type="button"
                className="font-semibold underline-offset-4 hover:underline"
                onClick={() => setPicked(allPicked ? new Set() : new Set(changes.map((change) => change.key)))}
              >
                {allPicked ? "Select none" : "Select all"}
              </button>
            </div>
            <ul className="flex-1 space-y-3 overflow-y-auto p-5 sm:p-6">
              {changes.map((change) => {
                const on = picked.has(change.key);
                return (
                  <li key={change.key}>
                    <label
                      className={cn(
                        "block cursor-pointer rounded-xl border p-4 transition-colors",
                        on ? "border-ink" : "border-gray-200 opacity-60 hover:opacity-100",
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <input type="checkbox" checked={on} onChange={() => toggle(change.key)} className="h-4 w-4 accent-ink" />
                        <span className="text-sm font-semibold">{change.label}</span>
                        {isEmpty(change.before) ? <span className="text-xs text-gray-500">New</span> : null}
                      </span>
                      <span className="mt-3 grid gap-3 sm:grid-cols-2">
                        <Value label="Before" value={change.before} muted />
                        <Value label="After" value={change.after} />
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}

        <footer className="flex flex-col-reverse gap-2 border-t border-gray-200 p-5 sm:flex-row sm:justify-end sm:p-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            {changes.length === 0 ? "Close" : "Discard suggestions"}
          </Button>
          {changes.length > 0 ? (
            <Button type="button" disabled={selected.length === 0} onClick={() => onApply(selected)}>
              Apply {selected.length} change{selected.length === 1 ? "" : "s"}
            </Button>
          ) : null}
        </footer>
      </div>
    </div>
  );
}

function isEmpty(value: string | string[]) {
  return Array.isArray(value) ? value.length === 0 : !value.trim();
}

function Value({ label, value, muted }: { label: string; value: string | string[]; muted?: boolean }) {
  return (
    <span className={cn("block rounded-lg p-3 text-sm", muted ? "bg-gray-50 text-gray-500" : "bg-gray-100 text-ink")}>
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      {isEmpty(value) ? (
        <span className="italic">Empty</span>
      ) : Array.isArray(value) ? (
        <span className="block space-y-0.5">
          {value.map((item, index) => (
            <span key={`${item}-${index}`} className="block">
              • {item}
            </span>
          ))}
        </span>
      ) : (
        <span className="block whitespace-pre-wrap">{value}</span>
      )}
    </span>
  );
}
