"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { friendlyError } from "@/lib/errors";
import {
  Field,
  FormSection,
  ListEditor,
  SaveBar,
  Select,
  Switch,
  TextArea,
  TextInput,
} from "@/components/admin/content/fields";
import {
  difficultyOptions,
  industryOptions,
  modulePayload,
  type ModuleForm,
} from "@/components/admin/content/model";

/** Module details. Creates a module when `moduleId` is absent. */
export function ModuleDetailsForm({ moduleId, initial }: { moduleId?: string; initial: ModuleForm }) {
  const router = useRouter();
  const createModule = useMutation(api.modules.createAdmin);
  const updateModule = useMutation(api.modules.updateAdmin);
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const isNew = !moduleId;

  const set = <K extends keyof ModuleForm>(key: K, value: ModuleForm[K]) => {
    setMessage(null);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const save = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setMessage("Add a title and description before saving.");
      return;
    }

    setSaving(true);

    try {
      if (isNew) {
        const result = await createModule(modulePayload(form));
        router.push(`/admin/content/${result.id}`);
        return;
      }

      await updateModule({ id: moduleId, ...modulePayload(form) });
      setSaved(form);
      setMessage("Saved");
      window.setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      setMessage(friendlyError(error, "Couldn't save the module."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <FormSection title="Basics" description="How the module appears in the learner's library.">
        <Field label="Title" required htmlFor="module-title">
          <TextInput id="module-title" value={form.title} onChange={(event) => set("title", event.target.value)} placeholder="e.g. NDIS & Disability Services" />
        </Field>
        <Field label="Description" required htmlFor="module-description" hint="One or two sentences on what learners will practise.">
          <TextArea id="module-description" rows={3} value={form.description} onChange={(event) => set("description", event.target.value)} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Category" htmlFor="module-category">
            <Select
              id="module-category"
              value={form.industryCategory}
              onChange={(event) => set("industryCategory", event.target.value as ModuleForm["industryCategory"])}
              options={industryOptions}
            />
          </Field>
          <Field label="Level" htmlFor="module-level">
            <Select
              id="module-level"
              value={form.difficultyLevel}
              onChange={(event) => set("difficultyLevel", event.target.value as ModuleForm["difficultyLevel"])}
              options={difficultyOptions}
            />
          </Field>
          <Field label="Typical length (min)" htmlFor="module-duration">
            <TextInput
              id="module-duration"
              type="number"
              min={1}
              value={form.durationMinutes}
              onChange={(event) => set("durationMinutes", Number(event.target.value))}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Learning objectives" description="Shown on the module page under “You'll practise”.">
        <ListEditor items={form.learningObjectives} onChange={(items) => set("learningObjectives", items)} placeholder="Add an objective and press Enter" />
      </FormSection>

      <FormSection title="Access">
        <Switch
          checked={form.isFree}
          onChange={(checked) => set("isFree", checked)}
          label="Free module"
          description="Every dialogue is playable on the Free plan. Premium modules can still mark individual dialogues as free previews."
        />
        <Switch
          checked={form.isAccredited}
          onChange={(checked) => set("isAccredited", checked)}
          label="Accredited"
          description="Only switch on if a real institution accredits this module."
        />
        {form.isAccredited ? (
          <Field label="Accrediting body" htmlFor="module-provider">
            <TextInput id="module-provider" value={form.accreditationProvider} onChange={(event) => set("accreditationProvider", event.target.value)} />
          </Field>
        ) : null}
      </FormSection>

      <SaveBar
        dirty={dirty || isNew}
        saving={saving}
        message={message}
        onSave={() => void save()}
        onDiscard={isNew ? undefined : () => setForm(saved)}
        saveLabel={isNew ? "Create module" : "Save changes"}
      />
    </div>
  );
}
