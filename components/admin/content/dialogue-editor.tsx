"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { ExternalLink } from "lucide-react";
import { DEFAULT_TIME_LIMIT_MINUTES, MAX_ATTEMPT_MINUTES } from "@/lib/plans";
import { api } from "@/convex/_generated/api";
import type { Scenario } from "@/types/scenario";
import { friendlyError } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { EmptyState, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import {
  Breadcrumbs,
  Field,
  FormSection,
  ListEditor,
  SaveBar,
  Select,
  Switch,
  TextArea,
  TextInput,
} from "@/components/admin/content/fields";
import { ParticipantSection } from "@/components/admin/content/participant-section";
import {
  dialogueFormFromRecord,
  dialogueIssues,
  dialoguePayload,
  difficultyOptions,
  emptyDialogueForm,
  type DialogueForm,
  type DialogueSectionId,
} from "@/components/admin/content/model";

const sections: Array<{ id: DialogueSectionId; label: string; hint: string }> = [
  { id: "overview", label: "Overview", hint: "Title, level, access" },
  { id: "professional", label: "Professional", hint: "English speaker" },
  { id: "client", label: "Client", hint: "Learner's language" },
  { id: "assessment", label: "Briefing & scoring", hint: "What learners see and are marked on" },
];

/** Loads a dialogue (or starts a new one) and renders the editor. */
export function DialogueEditorPage({ moduleId, scenarioId }: { moduleId: string; scenarioId?: string }) {
  const learningModule = useQuery(api.modules.getById, { id: moduleId });
  const scenario = useQuery(api.scenarios.getById, scenarioId ? { id: scenarioId } : "skip");

  if (learningModule === undefined || (scenarioId && scenario === undefined)) {
    return <Skeleton className="h-96" />;
  }

  if (!learningModule || (scenarioId && !scenario)) {
    return (
      <EmptyState
        title="Not found"
        action={
          <Button asChild>
            <Link href="/admin?tab=content">Back to content</Link>
          </Button>
        }
      />
    );
  }

  const initial = scenario ? dialogueFormFromRecord(scenario as unknown as Scenario) : emptyDialogueForm;

  return (
    <DialogueEditor
      key={scenarioId ?? "new"}
      moduleId={moduleId}
      moduleTitle={learningModule.title}
      scenarioId={scenarioId}
      initial={initial}
    />
  );
}

function DialogueEditor({
  moduleId,
  moduleTitle,
  scenarioId,
  initial,
}: {
  moduleId: string;
  moduleTitle: string;
  scenarioId?: string;
  initial: DialogueForm;
}) {
  const router = useRouter();
  const createScenario = useMutation(api.scenarios.createAdmin);
  const updateScenario = useMutation(api.scenarios.updateAdmin);
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState(initial);
  const [section, setSection] = useState<DialogueSectionId>("overview");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const isNew = !scenarioId;
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const issues = dialogueIssues(form);
  const issueCount = Object.values(issues).flat().length;
  const visibleSections = sections.filter((item) => item.id !== "client" || form.hasClient);

  const update = (next: Partial<DialogueForm>) => {
    setMessage(null);
    setForm((current) => ({ ...current, ...next }));
  };

  const save = async () => {
    if (issueCount > 0) {
      const first = visibleSections.find((item) => issues[item.id].length > 0);
      if (first) setSection(first.id);
      setMessage(`Fill in the required fields first (${issueCount} missing).`);
      return;
    }

    setSaving(true);

    try {
      const payload = dialoguePayload(moduleId, form);

      if (isNew) {
        const result = await createScenario(payload);
        router.push(`/admin/content/${moduleId}/${result.id}`);
        return;
      }

      await updateScenario({ id: scenarioId, ...payload });
      setSaved(form);
      setMessage("Saved");
      window.setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      setMessage(friendlyError(error, "Couldn't save the dialogue."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Content", href: "/admin?tab=content" },
          { label: moduleTitle, href: `/admin/content/${moduleId}` },
          { label: isNew ? "New dialogue" : saved.title || "Dialogue" },
        ]}
      />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-[-0.035em]">{isNew ? "New dialogue" : form.title || "Untitled dialogue"}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {issueCount > 0 ? `${issueCount} required field${issueCount === 1 ? "" : "s"} missing` : "Ready to practise"}
            {form.isFreePreview ? " · Free preview" : ""}
          </p>
        </div>
        {!isNew ? (
          <Button asChild variant="outline">
            <Link href={`/practice/${scenarioId}`} target="_blank">
              Try it <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        ) : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Dialogue sections" className="flex gap-1 overflow-x-auto lg:sticky lg:top-6 lg:h-fit lg:flex-col">
          {visibleSections.map((item, index) => {
            const missing = issues[item.id].length;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                aria-current={section === item.id ? "step" : undefined}
                className={cn(
                  "flex shrink-0 items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                  section === item.id ? "bg-ink text-paper" : "hover:bg-gray-100",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                    section === item.id ? "bg-paper text-ink" : "bg-gray-200",
                  )}
                >
                  {index + 1}
                </span>
                <span>
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {item.label}
                    {missing > 0 ? <span className="h-2 w-2 rounded-full bg-record" aria-label={`${missing} missing`} /> : null}
                  </span>
                  <span className={cn("hidden text-xs lg:block", section === item.id ? "text-paper/70" : "text-gray-500")}>
                    {item.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="min-w-0">
          {section === "overview" ? (
            <div className="flex flex-col gap-5">
              <FormSection title="Overview" description="How the dialogue appears in the library and the practice room briefing.">
                <Field label="Title" required htmlFor="dialogue-title">
                  <TextInput id="dialogue-title" value={form.title} onChange={(event) => update({ title: event.target.value })} placeholder="e.g. NDIS Planning Meeting" />
                </Field>
                <Field label="Description" required htmlFor="dialogue-description" hint="One sentence that sets the scene for learners.">
                  <TextArea id="dialogue-description" rows={3} value={form.description} onChange={(event) => update({ description: event.target.value })} />
                </Field>
                <Field label="Level" htmlFor="dialogue-level">
                  <Select
                    id="dialogue-level"
                    value={form.difficultyLevel}
                    onChange={(event) => update({ difficultyLevel: event.target.value as DialogueForm["difficultyLevel"] })}
                    options={difficultyOptions}
                    className="sm:max-w-xs"
                  />
                </Field>
              </FormSection>
              <FormSection title="Access & format">
                <Switch
                  checked={form.isFreePreview}
                  onChange={(checked) => update({ isFreePreview: checked })}
                  label="Free preview"
                  description="Free-plan learners can play this dialogue even if the course is premium. Aim for one per premium course."
                />
                <Switch
                  checked={form.hasClient}
                  onChange={(checked) => update({ hasClient: checked })}
                  label="Two participants"
                  description="A professional and a client. Turn off only for one-sided practice (the learner interprets for the professional alone)."
                />
              </FormSection>
              <SectionFooter next={() => setSection("professional")} nextLabel="Next: the professional" />
            </div>
          ) : null}

          {section === "professional" ? (
            <>
              <ParticipantSection kind="professional" value={form.professional} onChange={(professional) => update({ professional })} />
              <SectionFooter
                back={() => setSection("overview")}
                next={() => setSection(form.hasClient ? "client" : "assessment")}
                nextLabel={form.hasClient ? "Next: the client" : "Next: briefing & scoring"}
              />
            </>
          ) : null}

          {section === "client" && form.hasClient ? (
            <>
              <ParticipantSection kind="client" value={form.client} onChange={(client) => update({ client })} />
              <SectionFooter back={() => setSection("professional")} next={() => setSection("assessment")} nextLabel="Next: briefing & scoring" />
            </>
          ) : null}

          {section === "assessment" ? (
            <div className="flex flex-col gap-5">
              <FormSection title="Learner briefing" description="Shown before the session starts and used to guide scoring.">
                <Field label="Briefing" required htmlFor="dialogue-briefing" hint="What the learner should pay attention to, in one or two sentences.">
                  <TextArea id="dialogue-briefing" rows={3} value={form.briefing} onChange={(event) => update({ briefing: event.target.value })} />
                </Field>
                <Field
                  label="Time limit (minutes)"
                  htmlFor="dialogue-time-limit"
                  hint={`The session ends automatically at this point and unfinished sessions score lower. Leave empty for the default (${form.roleplay?.practiceType === "roleplay" ? DEFAULT_TIME_LIMIT_MINUTES.roleplay : form.hasClient ? DEFAULT_TIME_LIMIT_MINUTES.interpreting : DEFAULT_TIME_LIMIT_MINUTES.interpretingSingle} min, about twice a typical run).`}
                >
                  <TextInput
                    id="dialogue-time-limit"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={MAX_ATTEMPT_MINUTES}
                    placeholder="Default"
                    value={form.timeLimitMinutes}
                    onChange={(event) => update({ timeLimitMinutes: event.target.value })}
                  />
                </Field>
                <Field label="Interpreter role" htmlFor="dialogue-role" hint="e.g. Healthcare interpreter, Telephone interpreter, NAATI CCL dialogue candidate.">
                  <TextInput id="dialogue-role" value={form.interpreterRole} onChange={(event) => update({ interpreterRole: event.target.value })} />
                </Field>
              </FormSection>
              <FormSection title="Scoring focus" description="The examiner gives these extra weight when scoring.">
                <ListEditor items={form.assessmentFocus} onChange={(assessmentFocus) => update({ assessmentFocus })} placeholder="e.g. Medication names and doses" />
              </FormSection>
              <FormSection title="Skills practised" description="Listed for learners and used in progress tracking.">
                <ListEditor items={form.expectedSkills} onChange={(expectedSkills) => update({ expectedSkills })} placeholder="e.g. Number retention" />
              </FormSection>
              <SectionFooter back={() => setSection(form.hasClient ? "client" : "professional")} />
            </div>
          ) : null}

          <SaveBar
            dirty={dirty || isNew}
            saving={saving}
            message={message}
            onSave={() => void save()}
            onDiscard={isNew ? undefined : () => setForm(saved)}
            saveLabel={isNew ? "Create dialogue" : "Save changes"}
          />
        </div>
      </div>
    </div>
  );
}

function SectionFooter({ back, next, nextLabel }: { back?: () => void; next?: () => void; nextLabel?: string }) {
  return (
    <div className="mt-5 flex justify-between gap-2">
      {back ? (
        <Button type="button" variant="ghost" onClick={back}>
          Back
        </Button>
      ) : (
        <span />
      )}
      {next ? (
        <Button type="button" variant="secondary" onClick={next}>
          {nextLabel}
        </Button>
      ) : null}
    </div>
  );
}

