"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { Check, ImageUp, Plus, Send, Trash2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { friendlyError } from "@/lib/errors";
import { getGoal } from "@/lib/goals";
import { defaultHeroImages, emailTemplates, type EmailContent, type EmailTemplateId } from "@/lib/email/render";
import { cn } from "@/lib/utils";
import { Badge, Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Breadcrumbs, Field, FormSection, Select, TextArea, TextInput } from "@/components/admin/content/fields";
import { EmailPreview } from "@/components/admin/email/email-preview";

type Campaign = Doc<"emailCampaigns">;
type Draft = Pick<
  Campaign,
  "name" | "subject" | "preheader" | "fromName" | "templateId" | "content" | "audience" | "batchSize" | "batchIntervalMinutes"
>;
type Step = "content" | "audience" | "send";

const steps: Array<{ id: Step; label: string }> = [
  { id: "content", label: "1. Content" },
  { id: "audience", label: "2. Audience" },
  { id: "send", label: "3. Review & send" },
];

function draftFrom(campaign: Campaign): Draft {
  return {
    name: campaign.name,
    subject: campaign.subject,
    preheader: campaign.preheader,
    fromName: campaign.fromName,
    templateId: campaign.templateId,
    content: campaign.content,
    audience: campaign.audience,
    batchSize: campaign.batchSize,
    batchIntervalMinutes: campaign.batchIntervalMinutes,
  };
}

export function CampaignEditor({ campaign, adminName, adminEmail }: { campaign: Campaign; adminName: string; adminEmail: string }) {
  const router = useRouter();
  const updateDraft = useMutation(api.emails.updateDraft);
  const deleteDraft = useMutation(api.emails.deleteDraft);
  const [draft, setDraft] = useState<Draft>(() => draftFrom(campaign));
  const [step, setStep] = useState<Step>("content");
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(draftFrom(campaign)));
  const [saveError, setSaveError] = useState(false);
  const draftJson = JSON.stringify(draft);
  const saveState: "saved" | "saving" | "error" = saveError ? "error" : draftJson === savedJson ? "saved" : "saving";

  // Autosave drafts shortly after each change.
  useEffect(() => {
    if (draftJson === savedJson) {
      return;
    }

    const timeout = window.setTimeout(() => {
      updateDraft({ id: campaign._id, ...(JSON.parse(draftJson) as Draft) })
        .then(() => {
          setSaveError(false);
          setSavedJson(draftJson);
        })
        .catch(() => setSaveError(true));
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [campaign._id, draftJson, savedJson, updateDraft]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const setContent = (patch: Partial<EmailContent>) => setDraft((current) => ({ ...current, content: { ...current.content, ...patch } }));

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Email", href: "/admin?tab=email" }, { label: draft.name || "Untitled email" }]} />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-[-0.035em]">{draft.name || "Untitled email"}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Draft ·{" "}
            {saveState === "saving" ? "Saving…" : saveState === "error" ? "Couldn't save — check your connection" : "All changes saved"}
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            if (window.confirm("Delete this draft?")) {
              void deleteDraft({ id: campaign._id }).then(() => router.push("/admin?tab=email"));
            }
          }}
        >
          <Trash2 className="h-4 w-4" /> Delete draft
        </Button>
      </header>

      <div className="flex gap-1 border-b border-gray-200" role="tablist">
        {steps.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={step === item.id}
            onClick={() => setStep(item.id)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold",
              step === item.id ? "border-ink text-ink" : "border-transparent text-gray-500 hover:text-ink",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="min-w-0 space-y-5">
          {step === "content" ? <ContentStep draft={draft} set={set} setContent={setContent} onNext={() => setStep("audience")} /> : null}
          {step === "audience" ? <AudienceStep draft={draft} set={set} onNext={() => setStep("send")} /> : null}
          {step === "send" ? (
            <SendStep campaignId={campaign._id} draft={draft} set={set} adminEmail={adminEmail} saving={saveState !== "saved"} />
          ) : null}
        </div>
        <div className="min-w-0 xl:sticky xl:top-6 xl:h-fit">
          <EmailPreview
            templateId={draft.templateId}
            content={draft.content}
            subject={draft.subject}
            preheader={draft.preheader}
            fromName={draft.fromName}
            recipientName={adminName}
            recipientEmail={adminEmail}
          />
        </div>
      </div>
    </div>
  );
}

// ---- Step 1: content ----------------------------------------------------------------

function ContentStep({
  draft,
  set,
  setContent,
  onNext,
}: {
  draft: Draft;
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
  setContent: (patch: Partial<EmailContent>) => void;
  onNext: () => void;
}) {
  const template = emailTemplates.find((item) => item.id === draft.templateId) ?? emailTemplates[0];
  const has = (field: (typeof template.fields)[number]) => template.fields.includes(field);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const insertTag = (tag: string) => {
    const element = bodyRef.current;
    const body = draft.content.body;
    const at = element?.selectionStart ?? body.length;
    setContent({ body: `${body.slice(0, at)}${tag}${body.slice(at)}` });
  };

  return (
    <>
      <FormSection title="Inbox details">
        <Field label="Internal name" htmlFor="email-name" hint="Only you see this.">
          <TextInput id="email-name" value={draft.name} onChange={(event) => set("name", event.target.value)} />
        </Field>
        <Field
          label="Subject line"
          required
          htmlFor="email-subject"
          hint={`${draft.subject.length} characters — aim for under 50 so it isn't cut off on phones.`}
        >
          <TextInput id="email-subject" value={draft.subject} onChange={(event) => set("subject", event.target.value)} placeholder="e.g. New: OET Speaking practice is here" />
        </Field>
        <Field label="Preview text" htmlFor="email-preheader" hint="Shown after the subject in most inboxes. Add what the subject doesn't say.">
          <TextInput id="email-preheader" value={draft.preheader} onChange={(event) => set("preheader", event.target.value)} />
        </Field>
        <Field label="From name" htmlFor="email-from" hint="e.g. “XINGO” or “Travis from XINGO”.">
          <TextInput id="email-from" value={draft.fromName} onChange={(event) => set("fromName", event.target.value)} />
        </Field>
      </FormSection>

      <FormSection title="Template">
        <div className="grid gap-2 sm:grid-cols-2">
          {emailTemplates.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => set("templateId", item.id as EmailTemplateId)}
              aria-pressed={draft.templateId === item.id}
              className={cn(
                "rounded-xl border-2 p-4 text-left transition-colors",
                draft.templateId === item.id ? "border-ink" : "border-gray-200 hover:border-gray-300",
              )}
            >
              <span className="flex items-center justify-between font-bold">
                {item.name}
                {draft.templateId === item.id ? <Check className="h-4 w-4" /> : null}
              </span>
              <span className="mt-1 block text-xs leading-5 text-gray-500">{item.description}</span>
            </button>
          ))}
        </div>
      </FormSection>

      <FormSection title="Message">
        {has("kicker") ? (
          <Field label="Label" htmlFor="email-kicker" hint="Short lime label above the headline, e.g. “New”.">
            <TextInput id="email-kicker" value={draft.content.kicker ?? ""} onChange={(event) => setContent({ kicker: event.target.value })} />
          </Field>
        ) : null}
        {has("headline") ? (
          <Field label="Headline" htmlFor="email-headline">
            <TextInput id="email-headline" value={draft.content.headline ?? ""} onChange={(event) => setContent({ headline: event.target.value })} />
          </Field>
        ) : null}
        {has("heroImage") ? <HeroImagePicker value={draft.content.heroImageUrl} onChange={(heroImageUrl) => setContent({ heroImageUrl })} /> : null}
        <Field
          label="Body"
          required
          htmlFor="email-body"
          hint={
            <>
              Blank line = new paragraph · <code>- </code> bullet · <code>## </code> subheading · <code>**bold**</code> ·{" "}
              <code>[link text](https://…)</code>
            </>
          }
        >
          <div className="mb-1 flex flex-wrap gap-1">
            {["{{firstName}}", "{{name}}"].map((tag) => (
              <button key={tag} type="button" onClick={() => insertTag(tag)} className="rounded-md bg-gray-100 px-2 py-1 font-mono text-xs hover:bg-gray-200">
                + {tag}
              </button>
            ))}
          </div>
          <TextArea id="email-body" ref={bodyRef} rows={10} value={draft.content.body} onChange={(event) => setContent({ body: event.target.value })} />
        </Field>
        {has("cta") ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Button text" htmlFor="email-cta-label" hint="Leave empty for no button.">
              <TextInput id="email-cta-label" value={draft.content.ctaLabel ?? ""} onChange={(event) => setContent({ ctaLabel: event.target.value })} />
            </Field>
            <Field label="Button link" htmlFor="email-cta-url">
              <TextInput id="email-cta-url" value={draft.content.ctaUrl ?? ""} onChange={(event) => setContent({ ctaUrl: event.target.value })} placeholder="https://www.xingo.ai/…" />
            </Field>
          </div>
        ) : null}
        {has("signature") ? (
          <Field label="Sign-off" htmlFor="email-signature" hint="e.g. “Cheers,” then your name on the next line.">
            <TextArea id="email-signature" rows={2} value={draft.content.signature ?? ""} onChange={(event) => setContent({ signature: event.target.value })} />
          </Field>
        ) : null}
      </FormSection>

      {has("sections") ? <SectionsEditor sections={draft.content.sections ?? []} onChange={(sections) => setContent({ sections })} /> : null}

      <div className="flex justify-end">
        <Button variant="secondary" onClick={onNext}>
          Next: audience
        </Button>
      </div>
    </>
  );
}

function useImageUpload() {
  const generateUploadUrl = useMutation(api.emails.generateImageUploadUrl);
  const resolveImageUrl = useMutation(api.emails.resolveImageUrl);

  return async (file: File) => {
    const url = await generateUploadUrl({});
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
    const { storageId } = (await response.json()) as { storageId?: string };
    if (!response.ok || !storageId) throw new Error("upload failed");
    return resolveImageUrl({ storageId: storageId as Id<"_storage"> });
  };
}

function HeroImagePicker({ value, onChange }: { value?: string; onChange: (url: string | undefined) => void }) {
  const upload = useImageUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const options = [{ label: "None", url: undefined as string | undefined }, ...defaultHeroImages.map((image) => ({ label: image.label, url: image.path }))];
  const isCustom = Boolean(value) && !defaultHeroImages.some((image) => image.path === value);

  return (
    <Field label="Header image" hint={error ?? "1200 × 480 px works best (JPG or PNG)."}>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.url)}
            aria-pressed={value === option.url}
            className={cn(
              "overflow-hidden rounded-lg border-2 text-xs font-semibold",
              value === option.url ? "border-ink" : "border-gray-200 hover:border-gray-300",
            )}
          >
            {option.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={option.url} alt={option.label} className="h-14 w-36 object-cover" />
            ) : (
              <span className="flex h-14 w-24 items-center justify-center bg-gray-50">None</span>
            )}
          </button>
        ))}
        {isCustom ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Your image" className="h-[60px] w-36 rounded-lg border-2 border-ink object-cover" />
        ) : null}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-[60px] w-36 items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-xs font-semibold text-gray-500 hover:border-ink hover:text-ink"
        >
          <ImageUp className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            setUploading(true);
            setError(null);
            upload(file)
              .then(onChange)
              .catch(() => setError("Upload failed — try a JPG or PNG under 5 MB."))
              .finally(() => setUploading(false));
          }}
        />
      </div>
    </Field>
  );
}

function SectionsEditor({
  sections,
  onChange,
}: {
  sections: NonNullable<EmailContent["sections"]>;
  onChange: (sections: NonNullable<EmailContent["sections"]>) => void;
}) {
  const upload = useImageUpload();
  const update = (index: number, patch: Partial<(typeof sections)[number]>) =>
    onChange(sections.map((section, i) => (i === index ? { ...section, ...patch } : section)));

  return (
    <FormSection title="Sections" description="Up to three stories, each with an optional image and link.">
      {sections.map((section, index) => (
        <div key={index} className="space-y-4 rounded-xl bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">Section {index + 1}</p>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(sections.filter((_, i) => i !== index))}>
              <Trash2 className="h-4 w-4" /> Remove
            </Button>
          </div>
          <TextInput value={section.title} placeholder="Title" onChange={(event) => update(index, { title: event.target.value })} />
          <TextArea rows={3} value={section.body} placeholder="A few sentences…" onChange={(event) => update(index, { body: event.target.value })} />
          <div className="grid gap-2 sm:grid-cols-2">
            <TextInput value={section.linkLabel ?? ""} placeholder="Link text (optional)" onChange={(event) => update(index, { linkLabel: event.target.value })} />
            <TextInput value={section.linkUrl ?? ""} placeholder="https://…" onChange={(event) => update(index, { linkUrl: event.target.value })} />
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-gray-500 hover:text-ink">
            <ImageUp className="h-4 w-4" />
            {section.imageUrl ? "Replace image" : "Add image"}
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void upload(file).then((imageUrl) => update(index, { imageUrl }));
              }}
            />
          </label>
        </div>
      ))}
      {sections.length < 3 ? (
        <Button type="button" variant="secondary" onClick={() => onChange([...sections, { title: "", body: "" }])}>
          <Plus className="h-4 w-4" /> Add section
        </Button>
      ) : null}
    </FormSection>
  );
}

// ---- Step 2: audience ----------------------------------------------------------------

function AudienceStep({
  draft,
  set,
  onNext,
}: {
  draft: Draft;
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
  onNext: () => void;
}) {
  const people = useQuery(api.emails.audience, {});
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("all");
  const selected = useMemo(() => new Set(draft.audience.clerkIds), [draft.audience.clerkIds]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (people ?? []).filter(
      (person) =>
        (plan === "all" || person.plan === plan) &&
        (!term || person.name.toLowerCase().includes(term) || person.email.toLowerCase().includes(term)),
    );
  }, [people, plan, search]);

  if (!people) {
    return <Card className="h-64 animate-pulse">{null}</Card>;
  }

  const eligible = people.filter((person) => !person.optedOut);
  const toggle = (clerkId: string) => {
    const next = new Set(selected);
    if (next.has(clerkId)) next.delete(clerkId);
    else next.add(clerkId);
    set("audience", { mode: "selected", clerkIds: [...next] });
  };
  const selectFiltered = () =>
    set("audience", {
      mode: "selected",
      clerkIds: [...new Set([...selected, ...filtered.filter((p) => !p.optedOut).map((p) => p.clerkId)])],
    });
  const recipientCount =
    draft.audience.mode === "all" ? eligible.length : eligible.filter((person) => selected.has(person.clerkId)).length;

  return (
    <>
      <FormSection title="Who should get this?">
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              ["all", "Everyone", `${eligible.length} subscribed learners`],
              ["selected", "Choose people", `${eligible.filter((p) => selected.has(p.clerkId)).length} selected`],
            ] as const
          ).map(([mode, label, hint]) => (
            <button
              key={mode}
              type="button"
              aria-pressed={draft.audience.mode === mode}
              onClick={() => set("audience", { ...draft.audience, mode })}
              className={cn(
                "rounded-xl border-2 p-4 text-left",
                draft.audience.mode === mode ? "border-ink" : "border-gray-200 hover:border-gray-300",
              )}
            >
              <span className="block font-bold">{label}</span>
              <span className="mt-0.5 block text-xs text-gray-500">{hint}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          People who unsubscribed ({people.length - eligible.length}) are always excluded. Duplicate addresses get one copy.
        </p>
      </FormSection>

      {draft.audience.mode === "selected" ? (
        <FormSection title="Choose people">
          <div className="flex flex-wrap gap-2">
            <TextInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" className="max-w-xs" />
            <Select
              value={plan}
              onChange={(event) => setPlan(event.target.value)}
              className="max-w-[160px]"
              options={[
                { value: "all", label: "All plans" },
                { value: "free", label: "Free" },
                { value: "professional", label: "Pro" },
              ]}
            />
            <Button type="button" variant="secondary" onClick={selectFiltered}>
              Select all {filtered.length < people.length ? "shown" : ""}
            </Button>
            <Button type="button" variant="ghost" onClick={() => set("audience", { mode: "selected", clerkIds: [] })}>
              Clear
            </Button>
          </div>
          <div className="max-h-[420px] divide-y divide-gray-200 overflow-y-auto rounded-xl border border-gray-200">
            {filtered.map((person) => (
              <label
                key={person.clerkId}
                className={cn("flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-gray-50", person.optedOut && "cursor-not-allowed opacity-50")}
              >
                <input
                  type="checkbox"
                  disabled={person.optedOut}
                  checked={selected.has(person.clerkId) && !person.optedOut}
                  onChange={() => toggle(person.clerkId)}
                  className="h-4 w-4 accent-black"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{person.name}</span>
                  <span className="block truncate text-xs text-gray-500">
                    {person.email}
                    {person.practiceGoal ? ` · ${getGoal(person.practiceGoal)?.label ?? person.practiceGoal}` : ""}
                  </span>
                </span>
                {person.optedOut ? <Badge>Unsubscribed</Badge> : person.plan !== "free" ? <Badge tone="dark">Pro</Badge> : null}
              </label>
            ))}
          </div>
        </FormSection>
      ) : null}

      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{recipientCount} recipient{recipientCount === 1 ? "" : "s"}</p>
        <Button variant="secondary" onClick={onNext}>
          Next: review & send
        </Button>
      </div>
    </>
  );
}

// ---- Step 3: review & send ----------------------------------------------------------------

function SendStep({
  campaignId,
  draft,
  set,
  adminEmail,
  saving,
}: {
  campaignId: Id<"emailCampaigns">;
  draft: Draft;
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
  adminEmail: string;
  saving: boolean;
}) {
  const people = useQuery(api.emails.audience, {});
  const sendTest = useAction(api.emailActions.sendTest);
  const queueSend = useMutation(api.emails.queueSend);
  const [testTo, setTestTo] = useState(adminEmail);
  const [testState, setTestState] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inBatches = draft.batchIntervalMinutes > 0;

  const eligible = (people ?? []).filter((person) => !person.optedOut);
  const selected = new Set(draft.audience.clerkIds);
  const count = draft.audience.mode === "all" ? eligible.length : eligible.filter((p) => selected.has(p.clerkId)).length;
  const batches = Math.ceil(count / Math.max(1, draft.batchSize));
  const checks = [
    { ok: Boolean(draft.subject.trim()), label: "Subject line" },
    { ok: Boolean(draft.preheader.trim()), label: "Preview text", optional: true },
    { ok: Boolean(draft.content.body.trim()), label: "Body" },
    { ok: !draft.content.ctaLabel || /^https?:\/\//.test(draft.content.ctaUrl ?? ""), label: "Button link starts with https://" },
    { ok: count > 0, label: "At least one recipient" },
  ];
  const ready = checks.every((check) => check.ok || check.optional);

  const test = async () => {
    setTestState("Sending…");
    try {
      const result = await sendTest({ id: campaignId, to: testTo.split(/[,\s]+/).filter(Boolean) });
      setTestState(`Test sent to ${result.sent} address${result.sent === 1 ? "" : "es"}. Check your inbox (and spam).`);
    } catch (testError) {
      setTestState(friendlyError(testError));
    }
  };

  const send = async () => {
    if (!window.confirm(`Send "${draft.subject}" to ${count} ${count === 1 ? "person" : "people"}? This can't be undone.`)) return;
    setSending(true);
    setError(null);
    try {
      await queueSend({ id: campaignId });
    } catch (sendError) {
      setError(friendlyError(sendError));
      setSending(false);
    }
  };

  return (
    <>
      <FormSection title="Checklist">
        <ul className="space-y-2">
          {checks.map((check) => (
            <li key={check.label} className="flex items-center gap-2 text-sm">
              <span className={cn("flex h-5 w-5 items-center justify-center rounded-full", check.ok ? "bg-accent text-accent-ink" : "bg-gray-200")}>
                {check.ok ? <Check className="h-3 w-3" /> : null}
              </span>
              <span className={cn(!check.ok && !check.optional && "text-record")}>
                {check.label}
                {check.optional && !check.ok ? " (recommended)" : ""}
              </span>
            </li>
          ))}
        </ul>
      </FormSection>

      <FormSection title="Send a test" description="Test emails aren't tracked and have “[Test]” in the subject.">
        <div className="flex flex-wrap gap-2">
          <TextInput value={testTo} onChange={(event) => setTestTo(event.target.value)} placeholder="you@example.com, colleague@example.com" className="min-w-0 flex-1" />
          <Button type="button" variant="secondary" onClick={() => void test()} disabled={saving}>
            Send test
          </Button>
        </div>
        {testState ? <p className="text-sm">{testState}</p> : null}
      </FormSection>

      <FormSection title="Delivery">
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            aria-pressed={!inBatches}
            onClick={() => {
              set("batchIntervalMinutes", 0);
              set("batchSize", 50);
            }}
            className={cn("rounded-xl border-2 p-4 text-left", !inBatches ? "border-ink" : "border-gray-200")}
          >
            <span className="block font-bold">All now</span>
            <span className="block text-xs text-gray-500">Sent within a few minutes.</span>
          </button>
          <button
            type="button"
            aria-pressed={inBatches}
            onClick={() => set("batchIntervalMinutes", Math.max(draft.batchIntervalMinutes, 30))}
            className={cn("rounded-xl border-2 p-4 text-left", inBatches ? "border-ink" : "border-gray-200")}
          >
            <span className="block font-bold">In batches</span>
            <span className="block text-xs text-gray-500">Spread out to protect deliverability.</span>
          </button>
        </div>
        {inBatches ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Emails per batch" htmlFor="batch-size">
              <TextInput id="batch-size" type="number" min={1} max={100} value={draft.batchSize} onChange={(event) => set("batchSize", Number(event.target.value) || 1)} />
            </Field>
            <Field label="Minutes between batches" htmlFor="batch-interval">
              <TextInput
                id="batch-interval"
                type="number"
                min={1}
                max={1440}
                value={draft.batchIntervalMinutes}
                onChange={(event) => set("batchIntervalMinutes", Math.max(1, Number(event.target.value) || 1))}
              />
            </Field>
            <p className="text-xs text-gray-500 sm:col-span-2">
              {batches} batch{batches === 1 ? "" : "es"} · finishes in about {Math.max(0, (batches - 1) * draft.batchIntervalMinutes)} minutes.
            </p>
          </div>
        ) : null}
      </FormSection>

      <Card tone="inverse" className="p-5">
        <p className="text-sm text-paper/60">Ready to send</p>
        <p className="mt-1 text-lg font-bold">
          “{draft.subject || "No subject"}” to {count} {count === 1 ? "person" : "people"}
        </p>
        {error ? <p className="mt-2 text-sm text-accent">{error}</p> : null}
        <Button variant="accent" size="lg" className="mt-4" disabled={!ready || sending || saving} onClick={() => void send()}>
          <Send className="h-4 w-4" /> {sending ? "Starting…" : saving ? "Saving draft…" : "Send email"}
        </Button>
      </Card>
    </>
  );
}
