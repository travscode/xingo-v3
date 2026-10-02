"use client";

import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { ImageUp, Trash2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Field, FormSection, Select, TextArea, TextInput, realtimeVoices } from "@/components/admin/content/fields";
import type { ParticipantForm } from "@/components/admin/content/model";

export function ParticipantSection({
  kind,
  value,
  onChange,
}: {
  kind: "professional" | "client";
  value: ParticipantForm;
  onChange: (next: ParticipantForm) => void;
}) {
  const set = <K extends keyof ParticipantForm>(key: K, next: ParticipantForm[K]) => onChange({ ...value, [key]: next });
  const isProfessional = kind === "professional";
  const id = (field: string) => `${kind}-${field}`;

  return (
    <div className="flex flex-col gap-5">
      <FormSection
        title={isProfessional ? "The professional" : "The client"}
        description={
          isProfessional
            ? "Always speaks English. Leads the conversation and decides when it's finished."
            : "Speaks the learner's chosen language — write everything here in English; it's delivered in the learner's language at runtime."
        }
      >
        <AvatarField value={value} onChange={onChange} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" htmlFor={id("name")} hint="Shown on the participant's card.">
            <TextInput id={id("name")} value={value.name} onChange={(event) => set("name", event.target.value)} placeholder={isProfessional ? "e.g. Rebecca Taylor" : "e.g. Daniel"} />
          </Field>
          <Field
            label={isProfessional ? "Role or title" : "Role"}
            required
            htmlFor={id("role")}
            hint={isProfessional ? "Be specific: Doctor, NDIA Planner, Duty Lawyer — not “Practitioner”." : "e.g. Patient, Parent, Tenant."}
          >
            <TextInput id={id("role")} value={value.role} onChange={(event) => set("role", event.target.value)} />
          </Field>
          <Field label="Voice" htmlFor={id("voice")}>
            <Select id={id("voice")} value={value.voice} onChange={(event) => set("voice", event.target.value)} options={realtimeVoices} />
          </Field>
          <Field label="Manner" htmlFor={id("demeanor")} hint="How they come across, e.g. “Anxious, polite, speaks quickly”.">
            <TextInput id={id("demeanor")} value={value.demeanor} onChange={(event) => set("demeanor", event.target.value)} />
          </Field>
        </div>
      </FormSection>

      <FormSection title="What they want" description="This drives the conversation. Keep it concrete.">
        <Field label="Goal" required htmlFor={id("goal")} hint={isProfessional ? "What they need to achieve in this conversation." : "What they want out of the conversation."}>
          <TextArea id={id("goal")} rows={2} value={value.goal} onChange={(event) => set("goal", event.target.value)} />
        </Field>
        <Field
          label="First real line"
          htmlFor={id("opening")}
          hint="What they say once the interpreter has introduced themselves. Learners interpret this first."
        >
          <TextArea id={id("opening")} rows={2} value={value.openingLine} onChange={(event) => set("openingLine", event.target.value)} />
        </Field>
        {isProfessional ? (
          <Field
            label="Finish when they have…"
            htmlFor={id("end")}
            hint="The information they must collect. Once they have it and nothing is pending, they wrap up and end the session."
          >
            <TextArea
              id={id("end")}
              rows={2}
              value={value.endCondition}
              onChange={(event) => set("endCondition", event.target.value)}
              placeholder="e.g. symptoms and when they started, current medications, allergies"
            />
          </Field>
        ) : null}
      </FormSection>

      <details className="group rounded-xl border border-gray-200 p-5 sm:p-6">
        <summary className="cursor-pointer list-none text-lg font-bold tracking-[-0.02em]">
          Extra instructions <span className="text-sm font-normal text-gray-500">(optional)</span>
        </summary>
        <div className="mt-4">
          <Field
            label="Character notes"
            htmlFor={id("instructions")}
            hint="Background facts and behaviour, e.g. reference numbers, family situation, what worries them. Language rules are added automatically."
          >
            <TextArea id={id("instructions")} rows={5} value={value.instructions} onChange={(event) => set("instructions", event.target.value)} />
          </Field>
        </div>
      </details>
    </div>
  );
}

function AvatarField({ value, onChange }: { value: ParticipantForm; onChange: (next: ParticipantForm) => void }) {
  const generateUploadUrl = useMutation(api.scenarios.generateAvatarUploadUrlAdmin);
  const resolveUrl = useMutation(api.scenarios.resolveAvatarStorageUrlAdmin);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setError(null);
    setUploading(true);

    try {
      const url = await generateUploadUrl({});
      const response = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      const { storageId } = (await response.json()) as { storageId?: string };
      if (!response.ok || !storageId) throw new Error("upload failed");
      const publicUrl = await resolveUrl({ storageId: storageId as Id<"_storage"> });
      onChange({ ...value, avatarStorageId: storageId, avatarImageUrl: publicUrl });
    } catch {
      setError("Couldn't upload that image. Try a JPG or PNG under 5 MB.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-2xl font-bold text-gray-500">
        {value.avatarImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.avatarImageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          (value.name || value.role || "?").slice(0, 1)
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
            <ImageUp className="h-4 w-4" />
            {uploading ? "Uploading…" : value.avatarImageUrl ? "Replace photo" : "Upload photo"}
          </Button>
          {value.avatarImageUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange({ ...value, avatarImageUrl: "", avatarStorageId: "" })}
            >
              <Trash2 className="h-4 w-4" /> Remove
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-gray-500">{error ?? "Square photo, face centred. Shown in the practice room."}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void upload(file);
          }}
        />
      </div>
    </div>
  );
}
