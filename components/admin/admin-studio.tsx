"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type {
  LearningModule,
  DifficultyLevel,
  IndustryCategory,
} from "@/types/module";
import type { Scenario } from "@/types/scenario";

type ModuleRecord = Pick<
  LearningModule,
  | "title"
  | "description"
  | "industryCategory"
  | "durationMinutes"
  | "difficultyLevel"
  | "learningObjectives"
  | "isFree"
  | "isAccredited"
  | "accreditationProvider"
  | "badgeIcon"
>;

type ModuleFormState = {
  title: string;
  description: string;
  industryCategory: IndustryCategory;
  durationMinutes: string;
  difficultyLevel: DifficultyLevel;
  learningObjectives: string;
  isFree: boolean;
  isAccredited: boolean;
  accreditationProvider: string;
  badgeIcon: string;
};

type ScenarioFormState = {
  title: string;
  description: string;
  difficultyLevel: DifficultyLevel;
  expectedSkills: string;
  interpreterRole: string;
  sourceLanguage: string;
  targetLanguage: string;
  openingSpeaker: "agent_a" | "agent_b";
  briefing: string;
  assessmentFocus: string;
  agentAName: string;
  agentARole: string;
  agentALanguage: string;
  agentAVoice: string;
  agentAAvatarImageUrl: string;
  agentAGoal: string;
  agentADemeanor: string;
  agentAOpeningLine: string;
  agentAInstructions: string;
  agentBName: string;
  agentBRole: string;
  agentBLanguage: string;
  agentBVoice: string;
  agentBAvatarImageUrl: string;
  agentBGoal: string;
  agentBDemeanor: string;
  agentBOpeningLine: string;
  agentBInstructions: string;
};

const industryOptions: IndustryCategory[] = [
  "medical",
  "legal",
  "immigration",
  "community",
  "business",
];
const difficultyOptions: DifficultyLevel[] = [
  "beginner",
  "intermediate",
  "advanced",
];
const voiceOptions = [
  "alloy",
  "ash",
  "ballad",
  "cedar",
  "coral",
  "echo",
  "marin",
  "sage",
  "shimmer",
  "verse",
];

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinLines(items: string[]) {
  return items.join("\n");
}

function createEmptyModuleForm(): ModuleFormState {
  return {
    title: "",
    description: "",
    industryCategory: "medical",
    durationMinutes: "25",
    difficultyLevel: "beginner",
    learningObjectives: "",
    isFree: true,
    isAccredited: false,
    accreditationProvider: "",
    badgeIcon: "New Pathway",
  };
}

function createModuleFormFromRecord(module: ModuleRecord): ModuleFormState {
  return {
    title: module.title,
    description: module.description,
    industryCategory: module.industryCategory,
    durationMinutes: String(module.durationMinutes),
    difficultyLevel: module.difficultyLevel,
    learningObjectives: joinLines(module.learningObjectives),
    isFree: module.isFree,
    isAccredited: module.isAccredited,
    accreditationProvider: module.accreditationProvider ?? "",
    badgeIcon: module.badgeIcon,
  };
}

function createEmptyScenarioForm(): ScenarioFormState {
  return {
    title: "",
    description: "",
    difficultyLevel: "beginner",
    expectedSkills: "",
    interpreterRole: "Consecutive interpreter",
    sourceLanguage: "English",
    targetLanguage: "Spanish",
    openingSpeaker: "agent_a",
    briefing: "",
    assessmentFocus: "",
    agentAName: "",
    agentARole: "Practitioner",
    agentALanguage: "English",
    agentAVoice: "cedar",
    agentAAvatarImageUrl: "",
    agentAGoal: "",
    agentADemeanor: "",
    agentAOpeningLine: "",
    agentAInstructions: "",
    agentBName: "",
    agentBRole: "Patient",
    agentBLanguage: "Spanish",
    agentBVoice: "sage",
    agentBAvatarImageUrl: "",
    agentBGoal: "",
    agentBDemeanor: "",
    agentBOpeningLine: "",
    agentBInstructions: "",
  };
}

function createScenarioFormFromRecord(scenario: Scenario): ScenarioFormState {
  return {
    title: scenario.title,
    description: scenario.description,
    difficultyLevel: scenario.difficultyLevel,
    expectedSkills: joinLines(scenario.expectedSkills),
    interpreterRole: scenario.practiceRuntime.interpreterRole,
    sourceLanguage: scenario.practiceRuntime.sourceLanguage,
    targetLanguage: scenario.practiceRuntime.targetLanguage,
    openingSpeaker: scenario.practiceRuntime.openingSpeaker,
    briefing: scenario.practiceRuntime.briefing,
    assessmentFocus: joinLines(scenario.practiceRuntime.assessmentFocus),
    agentAName: scenario.aiAgentA.name,
    agentARole: scenario.aiAgentA.role,
    agentALanguage: scenario.aiAgentA.language,
    agentAVoice: scenario.aiAgentA.voice,
    agentAAvatarImageUrl: scenario.aiAgentA.avatarImageUrl ?? "",
    agentAGoal: scenario.aiAgentA.goal,
    agentADemeanor: scenario.aiAgentA.demeanor,
    agentAOpeningLine: scenario.aiAgentA.openingLine ?? "",
    agentAInstructions: scenario.aiAgentA.instructions,
    agentBName: scenario.aiAgentB.name,
    agentBRole: scenario.aiAgentB.role,
    agentBLanguage: scenario.aiAgentB.language,
    agentBVoice: scenario.aiAgentB.voice,
    agentBAvatarImageUrl: scenario.aiAgentB.avatarImageUrl ?? "",
    agentBGoal: scenario.aiAgentB.goal,
    agentBDemeanor: scenario.aiAgentB.demeanor,
    agentBOpeningLine: scenario.aiAgentB.openingLine ?? "",
    agentBInstructions: scenario.aiAgentB.instructions,
  };
}

/**
 * Reads a Clerk role value from public metadata when it is a valid string.
 */
function getClerkRoleFromMetadata(value: unknown) {
  return typeof value === "string" ? value : null;
}

export function AdminStudio() {
  const { isLoaded: isClerkLoaded, user: clerkUser } = useUser();
  const currentUser = useQuery(api.users.current, {});
  const modules = useQuery(api.modules.list, {});
  const scenarios = useQuery(api.scenarios.list, {});
  const createModule = useMutation(api.modules.createAdmin);
  const updateModule = useMutation(api.modules.updateAdmin);
  const createScenario = useMutation(api.scenarios.createAdmin);
  const updateScenario = useMutation(api.scenarios.updateAdmin);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedScenarioId, setSelectedScenarioId] = useState("");
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [isCreatingScenario, setIsCreatingScenario] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const lastDebugSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isClerkLoaded || currentUser === undefined) {
      return;
    }

    const clerkRole = getClerkRoleFromMetadata(clerkUser?.publicMetadata?.role);
    const debugSignature = `${clerkUser?.id ?? "none"}|${clerkRole ?? "none"}|${currentUser?.clerkId ?? "none"}|${currentUser?.role ?? "none"}`;

    if (lastDebugSignatureRef.current === debugSignature) {
      return;
    }

    lastDebugSignatureRef.current = debugSignature;
    console.info("[AdminStudio] Auth debug snapshot", {
      clerkIdFromClerk: clerkUser?.id ?? null,
      clerkPublicMetadata: clerkUser?.publicMetadata ?? null,
      clerkRoleFromMetadata: clerkRole,
      convexClerkId: currentUser?.clerkId ?? null,
      convexRole: currentUser?.role ?? null,
      convexEmail: currentUser?.email ?? null,
    });
  }, [clerkUser, currentUser, isClerkLoaded]);

  const resolvedModuleId = useMemo(() => {
    if (isCreatingModule || !modules || modules.length === 0) {
      return "";
    }

    return modules.some((module) => module.id === selectedModuleId)
      ? selectedModuleId
      : modules[0].id;
  }, [isCreatingModule, modules, selectedModuleId]);

  const selectedModule = useMemo(
    () =>
      (modules ?? []).find((module) => module.id === resolvedModuleId) ?? null,
    [modules, resolvedModuleId],
  );

  const visibleScenarios = useMemo(
    () =>
      (scenarios ?? []).filter(
        (scenario) => scenario.moduleId === resolvedModuleId,
      ),
    [resolvedModuleId, scenarios],
  );

  const resolvedScenarioId = useMemo(() => {
    if (isCreatingScenario || visibleScenarios.length === 0) {
      return "";
    }

    return visibleScenarios.some(
      (scenario) => scenario.id === selectedScenarioId,
    )
      ? selectedScenarioId
      : visibleScenarios[0].id;
  }, [isCreatingScenario, selectedScenarioId, visibleScenarios]);

  const selectedScenario = useMemo(
    () =>
      visibleScenarios.find((scenario) => scenario.id === resolvedScenarioId) ??
      null,
    [resolvedScenarioId, visibleScenarios],
  );

  if (
    currentUser === undefined ||
    modules === undefined ||
    scenarios === undefined
  ) {
    return <div className="surface-card h-80 rounded-[2rem] animate-pulse" />;
  }

  if (!currentUser || currentUser.role !== "platform_admin") {
    return (
      <section className="section-frame rounded-[2.25rem] p-6 lg:p-8">
        <p className="eyebrow">Admin</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">
          You do not have access to the admin studio.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          Set the Clerk user&apos;s `publicMetadata.role` to `platform_admin`,
          then sign out and back in.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="section-frame rounded-[2.25rem] p-6 lg:p-8">
        <p className="eyebrow">Admin studio</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">
          Create modules and shape the practice flow.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          Modules define the training path. Scenarios define the live
          conversation, voices, prompts, and assessment focus.
        </p>
        {statusMessage ? (
          <p className="mt-4 text-sm font-medium">{statusMessage}</p>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <div className="space-y-6">
          <div className="surface-card rounded-[2rem] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Modules</p>
                <div className="mt-2 text-lg font-semibold">
                  {modules.length}
                </div>
              </div>
              <button
                type="button"
                className="action-secondary px-4 py-2 text-sm"
                onClick={() => {
                  setIsCreatingModule(true);
                  setIsCreatingScenario(true);
                  setSelectedScenarioId("");
                  setStatusMessage("");
                }}
              >
                New
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {modules.map((module) => (
                <button
                  key={module._id}
                  type="button"
                  onClick={() => {
                    setIsCreatingModule(false);
                    setSelectedModuleId(module.id);
                    setIsCreatingScenario(false);
                    setSelectedScenarioId("");
                    setStatusMessage("");
                  }}
                  className={`w-full rounded-[1.25rem] border px-4 py-3 text-left transition ${
                    !isCreatingModule && resolvedModuleId === module.id
                      ? "border-black bg-black text-white"
                      : "border-line bg-white text-foreground"
                  }`}
                >
                  <div className="text-sm font-semibold">{module.title}</div>
                  <div
                    className={`mt-1 text-xs ${!isCreatingModule && resolvedModuleId === module.id ? "text-white/70" : "text-muted"}`}
                  >
                    {module.industryCategory}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="surface-card rounded-[2rem] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Scenarios</p>
                <div className="mt-2 text-lg font-semibold">
                  {visibleScenarios.length}
                </div>
              </div>
              <button
                type="button"
                className="action-secondary px-4 py-2 text-sm"
                onClick={() => {
                  setIsCreatingScenario(true);
                  setSelectedScenarioId("");
                  setStatusMessage("");
                }}
                disabled={!selectedModule}
              >
                New
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {visibleScenarios.map((scenario) => (
                <button
                  key={scenario._id}
                  type="button"
                  onClick={() => {
                    setIsCreatingScenario(false);
                    setSelectedScenarioId(scenario.id);
                    setStatusMessage("");
                  }}
                  className={`w-full rounded-[1.25rem] border px-4 py-3 text-left transition ${
                    !isCreatingScenario && resolvedScenarioId === scenario.id
                      ? "border-black bg-black text-white"
                      : "border-line bg-white text-foreground"
                  }`}
                >
                  <div className="text-sm font-semibold">{scenario.title}</div>
                  <div
                    className={`mt-1 text-xs ${!isCreatingScenario && resolvedScenarioId === scenario.id ? "text-white/70" : "text-muted"}`}
                  >
                    {scenario.difficultyLevel}
                  </div>
                </button>
              ))}
              {selectedModule && visibleScenarios.length === 0 ? (
                <div className="rounded-[1.25rem] border border-line bg-white px-4 py-3 text-sm text-muted">
                  No scenarios for this module yet.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <ModuleEditor
            key={
              isCreatingModule
                ? "new-module"
                : (selectedModule?.id ?? "module-empty")
            }
            initialState={
              selectedModule
                ? createModuleFormFromRecord(selectedModule)
                : createEmptyModuleForm()
            }
            isCreating={isCreatingModule || !selectedModule}
            isPending={isPending}
            onSubmit={(form) => {
              startTransition(async () => {
                try {
                  if (!isCreatingModule && selectedModule) {
                    await updateModule({
                      id: selectedModule.id,
                      title: form.title.trim(),
                      description: form.description.trim(),
                      industryCategory: form.industryCategory,
                      durationMinutes: Number(form.durationMinutes),
                      difficultyLevel: form.difficultyLevel,
                      learningObjectives: splitLines(form.learningObjectives),
                      isFree: form.isFree,
                      isAccredited: form.isAccredited,
                      accreditationProvider:
                        form.accreditationProvider.trim() || undefined,
                      badgeIcon: form.badgeIcon.trim(),
                    });
                    setStatusMessage("Module updated.");
                    return;
                  }

                  const result = await createModule({
                    title: form.title.trim(),
                    description: form.description.trim(),
                    industryCategory: form.industryCategory,
                    durationMinutes: Number(form.durationMinutes),
                    difficultyLevel: form.difficultyLevel,
                    learningObjectives: splitLines(form.learningObjectives),
                    isFree: form.isFree,
                    isAccredited: form.isAccredited,
                    accreditationProvider:
                      form.accreditationProvider.trim() || undefined,
                    badgeIcon: form.badgeIcon.trim(),
                  });
                  setIsCreatingModule(false);
                  setSelectedModuleId(result.id);
                  setStatusMessage("Module created.");
                } catch (error) {
                  setStatusMessage(
                    error instanceof Error
                      ? error.message
                      : "Could not save module.",
                  );
                }
              });
            }}
          />

          <ScenarioEditor
            key={
              isCreatingScenario
                ? `new-scenario-${selectedModule?.id ?? "none"}`
                : (selectedScenario?.id ??
                  `scenario-empty-${selectedModule?.id ?? "none"}`)
            }
            initialState={
              selectedScenario
                ? createScenarioFormFromRecord(selectedScenario)
                : createEmptyScenarioForm()
            }
            isCreating={isCreatingScenario || !selectedScenario}
            isPending={isPending}
            disabled={!selectedModule}
            onSubmit={(form) => {
              if (!selectedModule) {
                setStatusMessage("Choose a module first.");
                return;
              }

              startTransition(async () => {
                const payload = {
                  moduleId: selectedModule.id,
                  title: form.title.trim(),
                  description: form.description.trim(),
                  difficultyLevel: form.difficultyLevel,
                  expectedSkills: splitLines(form.expectedSkills),
                  practiceRuntime: {
                    interpreterRole: form.interpreterRole.trim(),
                    sourceLanguage: form.sourceLanguage.trim(),
                    targetLanguage: form.targetLanguage.trim(),
                    openingSpeaker: form.openingSpeaker,
                    briefing: form.briefing.trim(),
                    assessmentFocus: splitLines(form.assessmentFocus),
                  },
                  aiAgentA: {
                    name: form.agentAName.trim() || undefined,
                    role: form.agentARole.trim(),
                    voice: form.agentAVoice,
                    avatarImageUrl: form.agentAAvatarImageUrl.trim() || undefined,
                    goal: form.agentAGoal.trim(),
                    language: form.agentALanguage.trim(),
                    demeanor: form.agentADemeanor.trim() || undefined,
                    openingLine: form.agentAOpeningLine.trim() || undefined,
                    instructions: form.agentAInstructions.trim() || undefined,
                  },
                  aiAgentB: {
                    name: form.agentBName.trim() || undefined,
                    role: form.agentBRole.trim(),
                    voice: form.agentBVoice,
                    avatarImageUrl: form.agentBAvatarImageUrl.trim() || undefined,
                    goal: form.agentBGoal.trim(),
                    language: form.agentBLanguage.trim(),
                    demeanor: form.agentBDemeanor.trim() || undefined,
                    openingLine: form.agentBOpeningLine.trim() || undefined,
                    instructions: form.agentBInstructions.trim() || undefined,
                  },
                } as const;

                try {
                  if (!isCreatingScenario && selectedScenario) {
                    await updateScenario({
                      id: selectedScenario.id,
                      ...payload,
                    });
                    setStatusMessage("Scenario updated.");
                    return;
                  }

                  const result = await createScenario(payload);
                  setIsCreatingScenario(false);
                  setSelectedScenarioId(result.id);
                  setStatusMessage("Scenario created.");
                } catch (error) {
                  setStatusMessage(
                    error instanceof Error
                      ? error.message
                      : "Could not save scenario.",
                  );
                }
              });
            }}
          />
        </div>
      </section>
    </div>
  );
}

function ModuleEditor({
  initialState,
  isCreating,
  isPending,
  onSubmit,
}: {
  initialState: ModuleFormState;
  isCreating: boolean;
  isPending: boolean;
  onSubmit: (state: ModuleFormState) => void;
}) {
  const [form, setForm] = useState(initialState);

  return (
    <section className="surface-card rounded-[2rem] p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Module editor</p>
          <h2 className="mt-2 text-2xl font-semibold">
            {isCreating ? "New module" : "Edit module"}
          </h2>
        </div>
        <button
          type="button"
          className="action-primary"
          onClick={() => onSubmit(form)}
          disabled={isPending}
        >
          {isCreating ? "Create module" : "Save module"}
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Title">
          <input
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            className="w-full rounded-[1rem] border border-line bg-white px-4 py-3"
          />
        </Field>
        <Field label="Badge">
          <input
            value={form.badgeIcon}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                badgeIcon: event.target.value,
              }))
            }
            className="w-full rounded-[1rem] border border-line bg-white px-4 py-3"
          />
        </Field>
        <Field label="Industry">
          <select
            value={form.industryCategory}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                industryCategory: event.target.value as IndustryCategory,
              }))
            }
            className="w-full rounded-[1rem] border border-line bg-white px-4 py-3"
          >
            {industryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Difficulty">
          <select
            value={form.difficultyLevel}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                difficultyLevel: event.target.value as DifficultyLevel,
              }))
            }
            className="w-full rounded-[1rem] border border-line bg-white px-4 py-3"
          >
            {difficultyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Duration (minutes)">
          <input
            type="number"
            min="1"
            value={form.durationMinutes}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                durationMinutes: event.target.value,
              }))
            }
            className="w-full rounded-[1rem] border border-line bg-white px-4 py-3"
          />
        </Field>
        <Field label="Accreditation provider">
          <input
            value={form.accreditationProvider}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                accreditationProvider: event.target.value,
              }))
            }
            className="w-full rounded-[1rem] border border-line bg-white px-4 py-3"
            disabled={!form.isAccredited}
          />
        </Field>
      </div>

      <Field label="Description" className="mt-4">
        <textarea
          value={form.description}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          className="min-h-28 w-full rounded-[1rem] border border-line bg-white px-4 py-3"
        />
      </Field>

      <Field label="Learning objectives" hint="One per line" className="mt-4">
        <textarea
          value={form.learningObjectives}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              learningObjectives: event.target.value,
            }))
          }
          className="min-h-28 w-full rounded-[1rem] border border-line bg-white px-4 py-3"
        />
      </Field>

      <div className="mt-4 flex flex-wrap gap-4">
        <Toggle
          label="Free module"
          checked={form.isFree}
          onChange={(checked) =>
            setForm((current) => ({ ...current, isFree: checked }))
          }
        />
        <Toggle
          label="Accredited"
          checked={form.isAccredited}
          onChange={(checked) =>
            setForm((current) => ({ ...current, isAccredited: checked }))
          }
        />
      </div>
    </section>
  );
}

function ScenarioEditor({
  initialState,
  isCreating,
  isPending,
  disabled,
  onSubmit,
}: {
  initialState: ScenarioFormState;
  isCreating: boolean;
  isPending: boolean;
  disabled: boolean;
  onSubmit: (state: ScenarioFormState) => void;
}) {
  const [form, setForm] = useState(initialState);

  return (
    <section className="surface-card rounded-[2rem] p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Scenario editor</p>
          <h2 className="mt-2 text-2xl font-semibold">
            {isCreating ? "New scenario" : "Edit scenario"}
          </h2>
        </div>
        <button
          type="button"
          className="action-primary"
          onClick={() => onSubmit(form)}
          disabled={isPending || disabled}
        >
          {isCreating ? "Create scenario" : "Save scenario"}
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Title">
          <input
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            className="w-full rounded-[1rem] border border-line bg-white px-4 py-3"
          />
        </Field>
        <Field label="Difficulty">
          <select
            value={form.difficultyLevel}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                difficultyLevel: event.target.value as DifficultyLevel,
              }))
            }
            className="w-full rounded-[1rem] border border-line bg-white px-4 py-3"
          >
            {difficultyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Description" className="mt-4">
        <textarea
          value={form.description}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          className="min-h-24 w-full rounded-[1rem] border border-line bg-white px-4 py-3"
        />
      </Field>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field label="Interpreter role">
          <input
            value={form.interpreterRole}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                interpreterRole: event.target.value,
              }))
            }
            className="w-full rounded-[1rem] border border-line bg-white px-4 py-3"
          />
        </Field>
        <Field label="Opening speaker">
          <select
            value={form.openingSpeaker}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                openingSpeaker: event.target.value as "agent_a" | "agent_b",
              }))
            }
            className="w-full rounded-[1rem] border border-line bg-white px-4 py-3"
          >
            <option value="agent_a">Agent A</option>
            <option value="agent_b">Agent B</option>
          </select>
        </Field>
        <Field label="Source language">
          <input
            value={form.sourceLanguage}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                sourceLanguage: event.target.value,
              }))
            }
            className="w-full rounded-[1rem] border border-line bg-white px-4 py-3"
          />
        </Field>
        <Field label="Target language">
          <input
            value={form.targetLanguage}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                targetLanguage: event.target.value,
              }))
            }
            className="w-full rounded-[1rem] border border-line bg-white px-4 py-3"
          />
        </Field>
      </div>

      <Field label="Briefing" className="mt-4">
        <textarea
          value={form.briefing}
          onChange={(event) =>
            setForm((current) => ({ ...current, briefing: event.target.value }))
          }
          className="min-h-24 w-full rounded-[1rem] border border-line bg-white px-4 py-3"
        />
      </Field>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field label="Expected skills" hint="One per line">
          <textarea
            value={form.expectedSkills}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                expectedSkills: event.target.value,
              }))
            }
            className="min-h-24 w-full rounded-[1rem] border border-line bg-white px-4 py-3"
          />
        </Field>
        <Field label="Assessment focus" hint="One per line">
          <textarea
            value={form.assessmentFocus}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                assessmentFocus: event.target.value,
              }))
            }
            className="min-h-24 w-full rounded-[1rem] border border-line bg-white px-4 py-3"
          />
        </Field>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <AgentForm
          title="Agent A"
          name={form.agentAName}
          role={form.agentARole}
          language={form.agentALanguage}
          voice={form.agentAVoice}
          avatarImageUrl={form.agentAAvatarImageUrl}
          goal={form.agentAGoal}
          demeanor={form.agentADemeanor}
          openingLine={form.agentAOpeningLine}
          instructions={form.agentAInstructions}
          voices={voiceOptions}
          onChange={(field, value) =>
            setForm((current) => ({ ...current, [field]: value }))
          }
        />
        <AgentForm
          title="Agent B"
          name={form.agentBName}
          role={form.agentBRole}
          language={form.agentBLanguage}
          voice={form.agentBVoice}
          avatarImageUrl={form.agentBAvatarImageUrl}
          goal={form.agentBGoal}
          demeanor={form.agentBDemeanor}
          openingLine={form.agentBOpeningLine}
          instructions={form.agentBInstructions}
          voices={voiceOptions}
          onChange={(field, value) =>
            setForm((current) => ({ ...current, [field]: value }))
          }
        />
      </div>
    </section>
  );
}

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`grid gap-2 ${className ?? ""}`}>
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-full border border-line bg-white px-4 py-3 text-sm font-medium">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

function AgentForm({
  title,
  name,
  role,
  language,
  voice,
  avatarImageUrl,
  goal,
  demeanor,
  openingLine,
  instructions,
  voices,
  onChange,
}: {
  title: string;
  name: string;
  role: string;
  language: string;
  voice: string;
  avatarImageUrl: string;
  goal: string;
  demeanor: string;
  openingLine: string;
  instructions: string;
  voices: string[];
  onChange: (field: keyof ScenarioFormState, value: string) => void;
}) {
  const prefix = title === "Agent A" ? "agentA" : "agentB";

  return (
    <div className="rounded-[1.5rem] border border-line bg-white p-5">
      <p className="eyebrow">{title}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field label="Name">
          <input
            value={name}
            onChange={(event) =>
              onChange(
                `${prefix}Name` as keyof ScenarioFormState,
                event.target.value,
              )
            }
            className="w-full rounded-[1rem] border border-line bg-white px-4 py-3"
          />
        </Field>
        <Field label="Role">
          <input
            value={role}
            onChange={(event) =>
              onChange(
                `${prefix}Role` as keyof ScenarioFormState,
                event.target.value,
              )
            }
            className="w-full rounded-[1rem] border border-line bg-white px-4 py-3"
          />
        </Field>
        <Field label="Language">
          <input
            value={language}
            onChange={(event) =>
              onChange(
                `${prefix}Language` as keyof ScenarioFormState,
                event.target.value,
              )
            }
            className="w-full rounded-[1rem] border border-line bg-white px-4 py-3"
          />
        </Field>
        <Field label="Voice">
          <select
            value={voice}
            onChange={(event) =>
              onChange(
                `${prefix}Voice` as keyof ScenarioFormState,
                event.target.value,
              )
            }
            className="w-full rounded-[1rem] border border-line bg-white px-4 py-3"
          >
            {voices.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Avatar image URL" className="md:col-span-2">
          <input
            value={avatarImageUrl}
            onChange={(event) =>
              onChange(
                `${prefix}AvatarImageUrl` as keyof ScenarioFormState,
                event.target.value,
              )
            }
            placeholder="https://..."
            className="w-full rounded-[1rem] border border-line bg-white px-4 py-3"
          />
        </Field>
      </div>
      <Field label="Goal" className="mt-4">
        <textarea
          value={goal}
          onChange={(event) =>
            onChange(
              `${prefix}Goal` as keyof ScenarioFormState,
              event.target.value,
            )
          }
          className="min-h-20 w-full rounded-[1rem] border border-line bg-white px-4 py-3"
        />
      </Field>
      <Field label="Demeanor" className="mt-4">
        <input
          value={demeanor}
          onChange={(event) =>
            onChange(
              `${prefix}Demeanor` as keyof ScenarioFormState,
              event.target.value,
            )
          }
          className="w-full rounded-[1rem] border border-line bg-white px-4 py-3"
        />
      </Field>
      <Field label="Opening line" className="mt-4">
        <textarea
          value={openingLine}
          onChange={(event) =>
            onChange(
              `${prefix}OpeningLine` as keyof ScenarioFormState,
              event.target.value,
            )
          }
          className="min-h-20 w-full rounded-[1rem] border border-line bg-white px-4 py-3"
        />
      </Field>
      <Field label="Instructions" className="mt-4">
        <textarea
          value={instructions}
          onChange={(event) =>
            onChange(
              `${prefix}Instructions` as keyof ScenarioFormState,
              event.target.value,
            )
          }
          className="min-h-28 w-full rounded-[1rem] border border-line bg-white px-4 py-3"
        />
      </Field>
    </div>
  );
}
