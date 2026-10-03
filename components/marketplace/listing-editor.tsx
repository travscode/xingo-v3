"use client";

import { useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { Check, Circle, Plus, Trash2, X } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { friendlyError } from "@/lib/errors";
import { LISTING_LIMITS } from "@/lib/marketplace";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/primitives";
import { Field, FormSection, ListEditor, SaveBar, TextArea, TextInput } from "@/components/admin/content/fields";
import { ImageUpload } from "@/components/marketplace/image-upload";

type Cert = { name: string; issuer?: string; url?: string; logoStorageId?: Id<"_storage">; logoUrl?: string | null };

export type ListingForm = {
  title: string;
  tagline: string;
  description: string;
  keywords: string[];
  whatYouGet: string[];
  audience: string;
  creatorName: string;
  bannerStorageId?: Id<"_storage">;
  bannerUrl: string | null;
  logoStorageId?: Id<"_storage">;
  logoUrl: string | null;
  certifications: Cert[];
};

function KeywordInput({ value, onChange }: { value: string[]; onChange: (keywords: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const keyword = draft.trim().toLowerCase();
    if (keyword && !value.includes(keyword) && value.length < LISTING_LIMITS.keywords) onChange([...value, keyword]);
    setDraft("");
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-gray-200 p-2">
      {value.map((keyword) => (
        <span key={keyword} className="inline-flex items-center gap-1 rounded-md bg-gray-100 py-1 pl-2 pr-1 text-sm">
          {keyword}
          <button type="button" aria-label={`Remove ${keyword}`} onClick={() => onChange(value.filter((k) => k !== keyword))} className="rounded p-0.5 hover:bg-gray-200">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder={value.length < LISTING_LIMITS.keywords ? "Type and press Enter" : "Limit reached"}
        disabled={value.length >= LISTING_LIMITS.keywords}
        className="h-8 min-w-[10rem] flex-1 bg-transparent px-1 text-sm outline-none"
      />
    </div>
  );
}

/** How complete the page is, with a nudge for each missing piece. */
export function listingChecklist(form: ListingForm, scenarioCount: number) {
  return [
    { done: form.tagline.trim().length >= 20, label: "A one-line summary that says what learners practise" },
    { done: Boolean(form.bannerStorageId || form.bannerUrl), label: "A banner image (wide, at least 1200 × 400)" },
    { done: Boolean(form.logoStorageId || form.logoUrl), label: "Your logo" },
    { done: form.description.trim().length >= 200, label: "An 'About' section of a few sentences" },
    { done: form.whatYouGet.length >= 3, label: "Three or more things learners will get" },
    { done: form.keywords.length >= 3, label: "Three or more search keywords" },
    { done: scenarioCount >= 3, label: "Three or more scenarios" },
  ];
}

export function ListingEditor({
  moduleId,
  initial,
  scenarioCount,
}: {
  moduleId: string;
  initial: ListingForm;
  scenarioCount: number;
}) {
  const save = useMutation(api.marketplace.updateListing);
  const [form, setForm] = useState<ListingForm>(initial);
  const [baseline, setBaseline] = useState(JSON.stringify(initial));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const dirty = JSON.stringify(form) !== baseline;
  const set = (patch: Partial<ListingForm>) => {
    setMessage(null);
    setForm((current) => ({ ...current, ...patch }));
  };
  const checklist = useMemo(() => listingChecklist(form, scenarioCount), [form, scenarioCount]);
  const score = checklist.filter((item) => item.done).length;

  const onSave = async () => {
    setSaving(true);
    try {
      await save({
        moduleId,
        title: form.title,
        tagline: form.tagline,
        description: form.description,
        keywords: form.keywords,
        whatYouGet: form.whatYouGet,
        audience: form.audience || undefined,
        creatorName: form.creatorName,
        bannerStorageId: form.bannerStorageId,
        logoStorageId: form.logoStorageId,
        certifications: form.certifications.map(({ name, issuer, url, logoStorageId }) => ({
          name,
          issuer: issuer || undefined,
          url: url || undefined,
          logoStorageId,
        })),
      });
      setBaseline(JSON.stringify(form));
      setMessage("Saved");
    } catch (saveError) {
      setMessage(friendlyError(saveError, "Couldn't save. Try again."));
    } finally {
      setSaving(false);
    }
  };

  const setCert = (index: number, patch: Partial<Cert>) =>
    set({ certifications: form.certifications.map((cert, i) => (i === index ? { ...cert, ...patch } : cert)) });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="flex flex-col gap-5">
        <FormSection title="The basics" description="What people see first in search and on your course card.">
          <Field label="Title" htmlFor="l-title" required>
            <TextInput id="l-title" maxLength={LISTING_LIMITS.title} value={form.title} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <Field label="One-line summary" htmlFor="l-tagline" required hint={`${form.tagline.length}/${LISTING_LIMITS.tagline}`}>
            <TextInput id="l-tagline" maxLength={LISTING_LIMITS.tagline} value={form.tagline} onChange={(e) => set({ tagline: e.target.value })} />
          </Field>
          <Field label="Shown as" htmlFor="l-creator" hint="Your name or organisation.">
            <TextInput id="l-creator" maxLength={80} value={form.creatorName} onChange={(e) => set({ creatorName: e.target.value })} />
          </Field>
        </FormSection>

        <FormSection title="Look" description="Courses with a banner and logo get noticed. Use images you own.">
          <Field label="Banner">
            <ImageUpload
              label="banner"
              value={form.bannerStorageId}
              previewUrl={form.bannerUrl}
              onChange={(bannerStorageId, preview) => set({ bannerStorageId, bannerUrl: preview })}
            />
          </Field>
          <Field label="Logo">
            <ImageUpload
              label="logo"
              aspect="square"
              value={form.logoStorageId}
              previewUrl={form.logoUrl}
              onChange={(logoStorageId, preview) => set({ logoStorageId, logoUrl: preview })}
            />
          </Field>
        </FormSection>

        <FormSection title="Details" description="Help people decide this course is for them.">
          <Field label="About this course" htmlFor="l-about" hint="Who made it, what it covers, how to get the most from it.">
            <TextArea id="l-about" rows={6} maxLength={LISTING_LIMITS.description} value={form.description} onChange={(e) => set({ description: e.target.value })} />
          </Field>
          <Field label="What you'll get">
            <ListEditor items={form.whatYouGet} onChange={(whatYouGet) => set({ whatYouGet: whatYouGet.slice(0, LISTING_LIMITS.whatYouGet) })} placeholder="e.g. Confidence answering behavioural questions" />
          </Field>
          <Field label="Who it's for" htmlFor="l-audience">
            <TextInput id="l-audience" maxLength={200} value={form.audience} onChange={(e) => set({ audience: e.target.value })} placeholder="e.g. Graduates applying for their first retail role" />
          </Field>
          <Field label="Search keywords" hint="Words people would type to find this: job titles, test names, skills. Up to 10.">
            <KeywordInput value={form.keywords} onChange={(keywords) => set({ keywords })} />
          </Field>
        </FormSection>

        <FormSection title="Related certifications" description="Only list a certification your course genuinely prepares people for. Don't imply endorsement you don't have.">
          {form.certifications.map((cert, index) => (
            <div key={index} className="grid gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-[auto_1fr]">
              <ImageUpload
                label="certification logo"
                aspect="square"
                value={cert.logoStorageId}
                previewUrl={cert.logoUrl}
                onChange={(logoStorageId, preview) => setCert(index, { logoStorageId, logoUrl: preview })}
              />
              <div className="flex flex-col gap-3">
                <TextInput aria-label="Certification name" placeholder="Name, e.g. Certificate III in Retail" value={cert.name} onChange={(e) => setCert(index, { name: e.target.value })} />
                <TextInput aria-label="Issued by" placeholder="Issued by (optional)" value={cert.issuer ?? ""} onChange={(e) => setCert(index, { issuer: e.target.value })} />
                <TextInput aria-label="Link" placeholder="https://… (optional)" value={cert.url ?? ""} onChange={(e) => setCert(index, { url: e.target.value })} />
                <Button type="button" size="sm" variant="ghost" className="self-start" onClick={() => set({ certifications: form.certifications.filter((_, i) => i !== index) })}>
                  <Trash2 className="h-4 w-4" aria-hidden /> Remove
                </Button>
              </div>
            </div>
          ))}
          {form.certifications.length < LISTING_LIMITS.certifications ? (
            <Button type="button" variant="secondary" className="self-start" onClick={() => set({ certifications: [...form.certifications, { name: "" }] })}>
              <Plus className="h-4 w-4" aria-hidden /> Add a certification
            </Button>
          ) : null}
        </FormSection>

        <SaveBar dirty={dirty} saving={saving} message={message} onSave={() => void onSave()} onDiscard={() => setForm(JSON.parse(baseline) as ListingForm)} />
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <Card className="p-5">
          <p className="text-sm font-bold">Page strength</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {score}/{checklist.length}
          </p>
          <ul className="mt-4 space-y-2.5">
            {checklist.map((item) => (
              <li key={item.label} className="flex gap-2 text-sm">
                {item.done ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-ink" aria-hidden /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" aria-hidden />}
                <span className={item.done ? "text-gray-500 line-through" : undefined}>{item.label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-5 text-gray-500">
            A complete page helps people decide to add your course, and keywords help them find it. Share your course link with your students, team or followers.
          </p>
        </Card>
      </aside>
    </div>
  );
}
