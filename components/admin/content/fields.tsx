"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputBase =
  "w-full rounded-lg border border-gray-200 bg-paper px-3 text-[15px] text-ink outline-none transition-colors placeholder:text-gray-500 focus:border-ink";

export function Field({
  label,
  hint,
  required,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: ReactNode;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
        {required ? <span className="text-record"> *</span> : null}
      </label>
      {children}
      {hint ? <p className="text-xs leading-5 text-gray-500">{hint}</p> : null}
    </div>
  );
}

export function TextInput(props: React.ComponentProps<"input">) {
  return <input {...props} className={cn(inputBase, "h-11", props.className)} />;
}

export function TextArea({ rows = 3, ...props }: React.ComponentProps<"textarea">) {
  return <textarea rows={rows} {...props} className={cn(inputBase, "py-2.5 leading-6", props.className)} />;
}

export function Select({
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { options: Array<{ value: string; label: string }> }) {
  return (
    <select {...props} className={cn(inputBase, "h-11 font-medium", props.className)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/** Two-state switch with a label and explanation. */
export function Switch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-start justify-between gap-4 rounded-xl border border-gray-200 p-4 text-left hover:bg-gray-50"
    >
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {description ? <span className="mt-0.5 block text-xs leading-5 text-gray-500">{description}</span> : null}
      </span>
      <span className={cn("relative mt-0.5 h-6 w-10 shrink-0 rounded-full transition-colors", checked ? "bg-ink" : "bg-gray-300")}>
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-paper transition-transform",
            checked ? "translate-x-[18px]" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}

/** Editable list of short items (objectives, skills, focus areas). */
export function ListEditor({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const value = draft.trim();
    if (!value) return;
    onChange([...items, value]);
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-2">
      {items.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="flex items-center gap-2 rounded-lg bg-gray-50 py-1.5 pl-3 pr-1.5 text-sm">
              <span className="flex-1">{item}</span>
              <button
                type="button"
                aria-label={`Remove ${item}`}
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                className="rounded-md p-1 text-gray-500 hover:bg-gray-200 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex gap-2">
        <TextInput
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="secondary" onClick={add} disabled={!draft.trim()}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
    </div>
  );
}

/** Card wrapping one section of a form. */
export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 p-5 sm:p-6">
      <h2 className="text-lg font-bold tracking-[-0.02em]">{title}</h2>
      {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </section>
  );
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-1">
          {index > 0 ? <ChevronRight className="h-4 w-4" /> : null}
          {item.href ? (
            <Link href={item.href} className="font-semibold hover:text-ink">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-ink">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/** Sticky bar that appears when a form has unsaved changes; also guards tab close. */
export function SaveBar({
  dirty,
  saving,
  message,
  onSave,
  onDiscard,
  saveLabel = "Save changes",
}: {
  dirty: boolean;
  saving: boolean;
  message?: string | null;
  onSave: () => void;
  onDiscard?: () => void;
  saveLabel?: string;
}) {
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!dirty && !message) {
    return null;
  }

  return (
    <div className="sticky bottom-4 z-20 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-ink px-5 py-3 text-paper shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
      <p className="text-sm font-semibold">{message ?? "You have unsaved changes"}</p>
      {dirty ? (
        <div className="flex gap-2">
          {onDiscard ? (
            <Button type="button" variant="ghost" className="text-paper hover:bg-gray-700" onClick={onDiscard} disabled={saving}>
              Discard
            </Button>
          ) : null}
          <Button type="button" variant="accent" onClick={onSave} disabled={saving}>
            {saving ? "Saving…" : saveLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/** Voices that work with OpenAI Realtime (see convex/model/scenario.ts). */
export const realtimeVoices = [
  { value: "cedar", label: "Cedar (male)" },
  { value: "ash", label: "Ash (male)" },
  { value: "ballad", label: "Ballad (male)" },
  { value: "echo", label: "Echo (male)" },
  { value: "verse", label: "Verse (male)" },
  { value: "marin", label: "Marin (female)" },
  { value: "coral", label: "Coral (female)" },
  { value: "sage", label: "Sage (female)" },
  { value: "shimmer", label: "Shimmer (female)" },
  { value: "alloy", label: "Alloy (neutral)" },
];
