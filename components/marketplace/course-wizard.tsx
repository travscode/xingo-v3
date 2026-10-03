"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, ArrowRight, Check, Languages, MessagesSquare } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { friendlyError } from "@/lib/errors";
import { courseKinds, type CourseKind } from "@/lib/marketplace";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/primitives";
import { Field, TextArea, TextInput } from "@/components/admin/content/fields";

type Draft = {
  kind: CourseKind | null;
  title: string;
  tagline: string;
  creatorName: string;
  scenarioTitle: string;
  characterRole: string;
  characterName: string;
  characterGoal: string;
  learnerRole: string;
  taskCard: string;
  clientRole: string;
  clientGoal: string;
  endCondition: string;
};

const empty: Draft = {
  kind: null,
  title: "",
  tagline: "",
  creatorName: "",
  scenarioTitle: "",
  characterRole: "",
  characterName: "",
  characterGoal: "",
  learnerRole: "",
  taskCard: "",
  clientRole: "",
  clientGoal: "",
  endCondition: "",
};

type Step = { id: string; title: string; hint: string; valid: (draft: Draft) => boolean };

const steps: Step[] = [
  { id: "kind", title: "Who's in the conversation?", hint: "Pick the format for this course. You can add more scenarios later.", valid: (d) => d.kind !== null },
  {
    id: "name",
    title: "Name your course",
    hint: "This is what people see in the marketplace.",
    valid: (d) => d.title.trim().length > 2 && d.tagline.trim().length > 5,
  },
  {
    id: "character",
    title: "Who will the learner talk to?",
    hint: "The AI plays this person. Describe them like you'd brief an actor.",
    valid: (d) => d.scenarioTitle.trim().length > 2 && d.characterRole.trim().length > 1 && d.characterGoal.trim().length > 5,
  },
  {
    id: "learner",
    title: "",
    hint: "",
    valid: (d) => (d.kind === "interpreting" ? d.clientRole.trim().length > 1 && d.clientGoal.trim().length > 5 : true),
  },
  {
    id: "finish",
    title: "When is the conversation finished?",
    hint: "The AI wraps up when this happens, and the session ends. Unfinished sessions score lower.",
    valid: (d) => d.endCondition.trim().length > 5,
  },
];

function KindChoice({ value, onChange }: { value: CourseKind | null; onChange: (kind: CourseKind) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {courseKinds.map((kind) => {
        const Icon = kind.id === "roleplay" ? MessagesSquare : Languages;
        const selected = value === kind.id;
        return (
          <button
            key={kind.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(kind.id)}
            className={cn(
              "flex flex-col rounded-2xl border-2 p-5 text-left transition-colors",
              selected ? "border-ink" : "border-gray-200 hover:border-gray-400",
            )}
          >
            <span className="flex items-center justify-between">
              <Icon className="h-6 w-6" aria-hidden />
              {selected ? <Check className="h-5 w-5" aria-hidden /> : null}
            </span>
            <span className="mt-4 font-bold">{kind.label}</span>
            <span className="mt-1 text-sm text-gray-500">{kind.description}</span>
            <span className="mt-3 text-xs text-gray-500">e.g. {kind.example}</span>
          </button>
        );
      })}
    </div>
  );
}

export function CourseWizard() {
  const router = useRouter();
  const me = useQuery(api.users.me, {});
  const createCourse = useMutation(api.marketplace.createCourse);
  const [draft, setDraft] = useState<Draft>(empty);
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<Draft>) => setDraft((current) => ({ ...current, ...patch }));

  const step = steps[index];
  const isRoleplay = draft.kind === "roleplay";
  const last = index === steps.length - 1;
  const creatorName = draft.creatorName || me?.user.name || "";

  const learnerStep = isRoleplay
    ? { title: "What's the learner's part?", hint: "Optional, but it makes the practice sharper." }
    : { title: "Who needs an interpreter?", hint: "This person speaks the learner's other language. The learner interprets between the two." };
  const title = step.id === "learner" ? learnerStep.title : step.title;
  const hint = step.id === "learner" ? learnerStep.hint : step.hint;

  const submit = async () => {
    if (!draft.kind) return;
    setSaving(true);
    setError(null);
    try {
      const result = await createCourse({
        kind: draft.kind,
        title: draft.title,
        tagline: draft.tagline,
        creatorName: creatorName || undefined,
        scenario: {
          title: draft.scenarioTitle,
          description: draft.tagline,
          character: {
            role: draft.characterRole,
            name: draft.characterName || undefined,
            goal: draft.characterGoal,
            endCondition: draft.endCondition,
          },
          client: isRoleplay ? undefined : { role: draft.clientRole, goal: draft.clientGoal },
          learnerRole: isRoleplay ? draft.learnerRole || undefined : undefined,
          taskCard: isRoleplay ? draft.taskCard || undefined : undefined,
        },
      });
      router.push(`/marketplace/manage/${result.moduleId}?created=1`);
    } catch (createError) {
      setError(friendlyError(createError));
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Link href="/marketplace?tab=yours" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Cancel
        </Link>
        <span className="text-sm tabular-nums text-gray-500">
          Step {index + 1} of {steps.length}
        </span>
      </div>
      <ProgressBar value={(index + 1) / steps.length} tone="accent" />

      <div>
        <h1 className="text-3xl font-bold tracking-[-0.035em]">{title}</h1>
        <p className="mt-2 text-gray-500">{hint}</p>
      </div>

      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (!step.valid(draft)) return;
          if (last) void submit();
          else setIndex(index + 1);
        }}
      >
        {step.id === "kind" ? <KindChoice value={draft.kind} onChange={(kind) => set({ kind })} /> : null}

        {step.id === "name" ? (
          <>
            <Field label="Course title" htmlFor="wiz-title" hint={isRoleplay ? "e.g. Nail your retail job interview" : "e.g. Pharmacy interpreting essentials"}>
              <TextInput id="wiz-title" autoFocus maxLength={80} value={draft.title} onChange={(e) => set({ title: e.target.value })} />
            </Field>
            <Field label="One-line summary" htmlFor="wiz-tagline" hint="What will someone be able to do after practising?">
              <TextInput id="wiz-tagline" maxLength={140} value={draft.tagline} onChange={(e) => set({ tagline: e.target.value })} />
            </Field>
            <Field label="Shown as" htmlFor="wiz-creator" hint="Your name or your organisation's.">
              <TextInput id="wiz-creator" maxLength={80} value={creatorName} onChange={(e) => set({ creatorName: e.target.value })} />
            </Field>
          </>
        ) : null}

        {step.id === "character" ? (
          <>
            <Field label="First scenario" htmlFor="wiz-scenario" hint="e.g. First-round interview, Angry customer refund call">
              <TextInput id="wiz-scenario" autoFocus maxLength={80} value={draft.scenarioTitle} onChange={(e) => set({ scenarioTitle: e.target.value })} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Their role" htmlFor="wiz-role" hint="e.g. Hiring manager, Pharmacist">
                <TextInput id="wiz-role" maxLength={80} value={draft.characterRole} onChange={(e) => set({ characterRole: e.target.value })} />
              </Field>
              <Field label="Their name (optional)" htmlFor="wiz-name">
                <TextInput id="wiz-name" maxLength={60} value={draft.characterName} onChange={(e) => set({ characterName: e.target.value })} />
              </Field>
            </div>
            <Field label="What do they want from the conversation?" htmlFor="wiz-goal" hint="Include anything they should ask, push back on or reveal.">
              <TextArea id="wiz-goal" rows={4} maxLength={600} value={draft.characterGoal} onChange={(e) => set({ characterGoal: e.target.value })} />
            </Field>
          </>
        ) : null}

        {step.id === "learner" && isRoleplay ? (
          <>
            <Field label="The learner plays" htmlFor="wiz-learner" hint="e.g. Job applicant, Customer service agent">
              <TextInput id="wiz-learner" autoFocus maxLength={80} value={draft.learnerRole} onChange={(e) => set({ learnerRole: e.target.value })} />
            </Field>
            <Field label="Instructions for the learner" htmlFor="wiz-task" hint="Shown on screen during practice, like an exam task card.">
              <TextArea id="wiz-task" rows={4} maxLength={1500} value={draft.taskCard} onChange={(e) => set({ taskCard: e.target.value })} />
            </Field>
          </>
        ) : null}

        {step.id === "learner" && !isRoleplay ? (
          <>
            <Field label="Their role" htmlFor="wiz-client" hint="e.g. Patient, Tenant, Parent">
              <TextInput id="wiz-client" autoFocus maxLength={80} value={draft.clientRole} onChange={(e) => set({ clientRole: e.target.value })} />
            </Field>
            <Field label="What do they need?" htmlFor="wiz-client-goal" hint="Their situation, worries and questions.">
              <TextArea id="wiz-client-goal" rows={4} maxLength={600} value={draft.clientGoal} onChange={(e) => set({ clientGoal: e.target.value })} />
            </Field>
          </>
        ) : null}

        {step.id === "finish" ? (
          <Field
            label="It's finished when…"
            htmlFor="wiz-end"
            hint={isRoleplay ? "e.g. the candidate has answered all five questions and asked one of their own" : "e.g. the patient understands the dose and when to come back"}
          >
            <TextArea id="wiz-end" autoFocus rows={3} maxLength={400} value={draft.endCondition} onChange={(e) => set({ endCondition: e.target.value })} />
          </Field>
        ) : null}

        {error ? <p className="text-sm text-record">{error}</p> : null}

        <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-5">
          <Button type="button" variant="ghost" onClick={() => setIndex(index - 1)} disabled={index === 0 || saving}>
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back
          </Button>
          <Button type="submit" disabled={!step.valid(draft) || saving}>
            {last ? (saving ? "Creating…" : "Create course") : "Continue"}
            {last ? null : <ArrowRight className="h-4 w-4" aria-hidden />}
          </Button>
        </div>
      </form>
      {last ? (
        <p className="text-sm text-gray-500">
          Your course starts as a draft. Next you can try it yourself, add more scenarios and dress up its page before publishing.
        </p>
      ) : null}
    </div>
  );
}
