"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { ChevronDown, Pencil, Play, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { friendlyError } from "@/lib/errors";
import { creatorVoices, type CourseKind } from "@/lib/marketplace";
import { DEFAULT_TIME_LIMIT_MINUTES, MAX_ATTEMPT_MINUTES } from "@/lib/plans";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Field, Select, TextArea, TextInput } from "@/components/admin/content/fields";
import { ImageUpload } from "@/components/marketplace/image-upload";

type Person = {
  role: string;
  name: string;
  goal: string;
  demeanor: string;
  openingLine: string;
  endCondition: string;
  voice: string;
  avatarStorageId?: Id<"_storage">;
  avatarUrl: string | null;
};

export type ScenarioForm = {
  id?: string;
  title: string;
  description: string;
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  timeLimitMinutes: string;
  learnerRole: string;
  taskCard: string;
  learnerOpens: boolean;
  character: Person;
  client: Person;
};

export type ScenarioSummary = {
  id: string;
  title: string;
  description: string;
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  timeLimitMinutes: number | null;
  learnerRole: string;
  taskCard: string;
  learnerOpens: boolean;
  character: { name?: string; role: string; goal: string; demeanor?: string; openingLine?: string; endCondition?: string; voice: string; avatarStorageId?: Id<"_storage">; avatarUrl: string | null };
  client: ScenarioSummary["character"] | null;
};

const blankPerson = (voice: string): Person => ({ role: "", name: "", goal: "", demeanor: "", openingLine: "", endCondition: "", voice, avatarUrl: null });

function toForm(scenario: ScenarioSummary | null): ScenarioForm {
  const person = (p: ScenarioSummary["character"] | null, voice: string): Person =>
    p
      ? {
          role: p.role,
          name: p.name && p.name !== p.role ? p.name : "",
          goal: p.goal,
          demeanor: p.demeanor ?? "",
          openingLine: p.openingLine ?? "",
          endCondition: p.endCondition ?? "",
          voice: p.voice,
          avatarStorageId: p.avatarStorageId,
          avatarUrl: p.avatarUrl,
        }
      : blankPerson(voice);

  return {
    id: scenario?.id,
    title: scenario?.title ?? "",
    description: scenario?.description ?? "",
    difficultyLevel: scenario?.difficultyLevel ?? "intermediate",
    timeLimitMinutes: scenario?.timeLimitMinutes ? String(scenario.timeLimitMinutes) : "",
    learnerRole: scenario?.learnerRole ?? "",
    taskCard: scenario?.taskCard ?? "",
    learnerOpens: scenario?.learnerOpens ?? true,
    character: person(scenario?.character ?? null, "marin"),
    client: person(scenario?.client ?? null, "sage"),
  };
}

function PersonFields({ prefix, person, onChange, showEnd }: { prefix: string; person: Person; onChange: (p: Person) => void; showEnd: boolean }) {
  const set = (patch: Partial<Person>) => onChange({ ...person, ...patch });
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
        <ImageUpload
          label="photo"
          aspect="square"
          value={person.avatarStorageId}
          previewUrl={person.avatarUrl}
          onChange={(avatarStorageId, avatarUrl) => set({ avatarStorageId, avatarUrl })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Role" htmlFor={`${prefix}-role`} required>
            <TextInput id={`${prefix}-role`} maxLength={80} value={person.role} onChange={(e) => set({ role: e.target.value })} />
          </Field>
          <Field label="Name" htmlFor={`${prefix}-name`}>
            <TextInput id={`${prefix}-name`} maxLength={60} value={person.name} onChange={(e) => set({ name: e.target.value })} />
          </Field>
          <Field label="Voice" htmlFor={`${prefix}-voice`}>
            <Select
              id={`${prefix}-voice`}
              value={person.voice}
              onChange={(e) => set({ voice: e.target.value })}
              options={creatorVoices.map((voice) => ({ value: voice.value, label: `${voice.label} (${voice.gender})` }))}
            />
          </Field>
          <Field label="Manner" htmlFor={`${prefix}-manner`}>
            <TextInput id={`${prefix}-manner`} maxLength={200} value={person.demeanor} onChange={(e) => set({ demeanor: e.target.value })} placeholder="e.g. Friendly but busy" />
          </Field>
        </div>
      </div>
      <Field label="What they want" htmlFor={`${prefix}-goal`} required hint="Questions to ask, facts to reveal when asked, things to push back on.">
        <TextArea id={`${prefix}-goal`} rows={4} maxLength={600} value={person.goal} onChange={(e) => set({ goal: e.target.value })} />
      </Field>
      {showEnd ? (
        <>
          <Field label="It's finished when…" htmlFor={`${prefix}-end`} hint="The AI wraps up and the session ends when this happens.">
            <TextArea id={`${prefix}-end`} rows={2} maxLength={400} value={person.endCondition} onChange={(e) => set({ endCondition: e.target.value })} />
          </Field>
          <Field label="Opening line (optional)" htmlFor={`${prefix}-open`}>
            <TextInput id={`${prefix}-open`} maxLength={300} value={person.openingLine} onChange={(e) => set({ openingLine: e.target.value })} />
          </Field>
        </>
      ) : null}
    </div>
  );
}

function ScenarioFormPanel({
  moduleId,
  kind,
  initial,
  onDone,
}: {
  moduleId: string;
  kind: CourseKind;
  initial: ScenarioForm;
  onDone: () => void;
}) {
  const saveScenario = useMutation(api.marketplace.saveScenario);
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [more, setMore] = useState(Boolean(initial.id));
  const set = (patch: Partial<ScenarioForm>) => setForm((current) => ({ ...current, ...patch }));
  const roleplay = kind === "roleplay";
  const defaultLimit = roleplay ? DEFAULT_TIME_LIMIT_MINUTES.roleplay : DEFAULT_TIME_LIMIT_MINUTES.interpreting;

  const person = (p: Person) => ({
    role: p.role,
    name: p.name || undefined,
    goal: p.goal,
    demeanor: p.demeanor || undefined,
    openingLine: p.openingLine || undefined,
    endCondition: p.endCondition || undefined,
    voice: p.voice,
    avatarStorageId: p.avatarStorageId,
  });

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveScenario({
        moduleId,
        scenarioId: form.id,
        scenario: {
          title: form.title,
          description: form.description,
          difficultyLevel: form.difficultyLevel,
          timeLimitMinutes: form.timeLimitMinutes ? Number(form.timeLimitMinutes) : undefined,
          character: person(form.character),
          client: roleplay ? undefined : person(form.client),
          learnerRole: roleplay ? form.learnerRole || undefined : undefined,
          taskCard: roleplay ? form.taskCard || undefined : undefined,
          learnerOpens: roleplay ? form.learnerOpens : undefined,
        },
      });
      onDone();
    } catch (saveError) {
      setError(friendlyError(saveError, "Couldn't save the scenario. Check the required fields."));
      setSaving(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-6 rounded-2xl border border-gray-200 p-5 sm:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <Field label="Scenario title" htmlFor="s-title" required>
          <TextInput id="s-title" maxLength={80} value={form.title} onChange={(e) => set({ title: e.target.value })} />
        </Field>
        <Field label="Level" htmlFor="s-level">
          <Select
            id="s-level"
            value={form.difficultyLevel}
            onChange={(e) => set({ difficultyLevel: e.target.value as ScenarioForm["difficultyLevel"] })}
            options={[
              { value: "beginner", label: "Beginner" },
              { value: "intermediate", label: "Intermediate" },
              { value: "advanced", label: "Advanced" },
            ]}
          />
        </Field>
      </div>
      <Field label="Briefing" htmlFor="s-brief" hint="One or two sentences the learner reads before starting.">
        <TextArea id="s-brief" rows={2} maxLength={600} value={form.description} onChange={(e) => set({ description: e.target.value })} />
      </Field>

      <div>
        <p className="mb-3 font-bold">{roleplay ? "The AI character" : "The English-speaking professional"}</p>
        <PersonFields prefix="c" person={form.character} onChange={(character) => set({ character })} showEnd />
      </div>

      {roleplay ? (
        <div className="grid gap-4">
          <p className="font-bold">The learner</p>
          <Field label="The learner plays" htmlFor="s-learner">
            <TextInput id="s-learner" maxLength={80} value={form.learnerRole} onChange={(e) => set({ learnerRole: e.target.value })} placeholder="e.g. Job applicant" />
          </Field>
          <Field label="Task card" htmlFor="s-task" hint="Shown during practice. Bullet points work well.">
            <TextArea id="s-task" rows={4} maxLength={1500} value={form.taskCard} onChange={(e) => set({ taskCard: e.target.value })} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.learnerOpens} onChange={(e) => set({ learnerOpens: e.target.checked })} />
            The learner starts the conversation
          </label>
        </div>
      ) : (
        <div>
          <p className="mb-3 font-bold">The person who needs an interpreter</p>
          <p className="-mt-2 mb-3 text-sm text-gray-500">They speak whichever language the learner practises.</p>
          <PersonFields prefix="cl" person={form.client} onChange={(client) => set({ client })} showEnd={false} />
        </div>
      )}

      <div>
        <button type="button" onClick={() => setMore(!more)} className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-ink" aria-expanded={more}>
          <ChevronDown className={`h-4 w-4 transition-transform ${more ? "rotate-180" : ""}`} aria-hidden /> Timing
        </button>
        {more ? (
          <div className="mt-3 max-w-xs">
            <Field label="Time limit (minutes)" htmlFor="s-time" hint={`Empty uses ${defaultLimit} min. The session ends at this point.`}>
              <TextInput id="s-time" type="number" min={1} max={MAX_ATTEMPT_MINUTES} value={form.timeLimitMinutes} onChange={(e) => set({ timeLimitMinutes: e.target.value })} />
            </Field>
          </div>
        ) : null}
      </div>

      {error ? <p className="text-sm text-record">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : form.id ? "Save scenario" : "Add scenario"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function ScenarioEditor({ moduleId, kind, scenarios, published }: { moduleId: string; kind: CourseKind; scenarios: ScenarioSummary[]; published: boolean }) {
  const deleteScenario = useMutation(api.marketplace.deleteScenario);
  const [editing, setEditing] = useState<ScenarioForm | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (editing) {
    return <ScenarioFormPanel moduleId={moduleId} kind={kind} initial={editing} onDone={() => setEditing(null)} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">Order from easiest to hardest. Try each one yourself before publishing.</p>
        <Button onClick={() => setEditing(toForm(null))}>
          <Plus className="h-4 w-4" aria-hidden /> Add scenario
        </Button>
      </div>
      {error ? <p className="text-sm text-record">{error}</p> : null}
      {scenarios.length === 0 ? (
        <EmptyState title="No scenarios yet" description="Add at least one before publishing." />
      ) : (
        <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
          {scenarios.map((scenario) => (
            <li key={scenario.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                {scenario.character.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={scenario.character.avatarUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="h-10 w-10 shrink-0 rounded-full bg-gray-100" aria-hidden />
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold">{scenario.title}</p>
                  <p className="truncate text-sm text-gray-500">
                    With {scenario.character.name ?? scenario.character.role} · <Badge className="align-middle capitalize">{scenario.difficultyLevel}</Badge>
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/practice/${scenario.id}`}>
                    <Play className="h-4 w-4" aria-hidden /> Try it
                  </Link>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(toForm(scenario))}>
                  <Pencil className="h-4 w-4" aria-hidden /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Delete ${scenario.title}`}
                  disabled={published && scenarios.length <= 1}
                  onClick={() => {
                    if (!window.confirm(`Delete "${scenario.title}"? Learners' past results are kept.`)) return;
                    setError(null);
                    deleteScenario({ moduleId, scenarioId: scenario.id }).catch((deleteError) => setError(friendlyError(deleteError)));
                  }}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
