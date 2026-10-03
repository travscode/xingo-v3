import type { TranscriptEntry } from "@/types/session";

/**
 * Step-by-step guide for the practice room's side panel (D-034).
 *
 * Interpreting: introduce yourself to each party, then one step per speaker turn
 * ("Interpret Olivia's turn for Elena"). In practice mode each attempt is checked
 * live; a missed turn can be retried by asking the speaker to repeat, up to
 * MAX_TRIES, then the step closes and the next one appears.
 *
 * Role-play: the task card's items, ticked as they're covered (practice mode).
 *
 * Pure derivation from the transcript, so it can't disturb push-to-talk.
 */

export const MAX_TRIES = 3;

export type Verdict = "good" | "partial" | "missed";
export type CoachResult = { verdict: Verdict; tip: string };

export type GuideStep = {
  id: string;
  kind: "intro" | "segment" | "wrap";
  title: string;
  detail: string;
  /** Learner entries addressed to the right person for this step. */
  attemptIds: string[];
  /** Where to check the attempt: who spoke, what they said, which language each way. */
  sourceText?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  /** Segment steps: who spoke and who must hear the rendition. */
  sourceKey?: "agent_a" | "agent_b";
  targetKey?: "agent_a" | "agent_b";
  closed: boolean;
  repeatRequested?: boolean;
};

export type Party = { key: "agent_a" | "agent_b"; name: string; language: string; role: string };

const rank: Record<Verdict, number> = { missed: 0, partial: 1, good: 2 };

export function bestVerdict(step: GuideStep, results: Record<string, CoachResult | undefined>): Verdict | null {
  let best: Verdict | null = null;
  for (const id of step.attemptIds) {
    const verdict = results[id]?.verdict;
    if (verdict && (best === null || rank[verdict] > rank[best])) best = verdict;
  }
  return best;
}

/**
 * Builds the interpreting steps from the transcript. `speakerOf` maps an entry to
 * the party who spoke it (assistant) or was addressed (user).
 */
export function deriveInterpretingSteps(args: {
  entries: TranscriptEntry[];
  completed: Set<string>;
  client: Party;
  professional: Party;
  partyOf: (entry: TranscriptEntry) => Party["key"] | null;
  results: Record<string, CoachResult | undefined>;
  ended: boolean;
}): GuideStep[] {
  const { client, professional, results } = args;
  const other = (key: Party["key"]) => (key === client.key ? professional : client);
  const party = (key: Party["key"]) => (key === client.key ? client : professional);

  const introClient: GuideStep = {
    id: "intro-client",
    kind: "intro",
    title: `Introduce yourself to ${client.name}`,
    detail: `In ${client.language}: you're the interpreter, you'll interpret everything in the first person, and it's confidential.`,
    attemptIds: [],
    targetLanguage: client.language,
    closed: false,
  };
  const introProfessional: GuideStep = {
    id: "intro-professional",
    kind: "intro",
    title: `Introduce yourself to ${professional.name}`,
    detail: `Switch to ${professional.name} and introduce yourself in ${professional.language}. They'll start once you have.`,
    attemptIds: [],
    targetLanguage: professional.language,
    closed: false,
  };
  const steps: GuideStep[] = [introClient, introProfessional];
  let open: GuideStep | null = null;

  const closeOpen = () => {
    if (open) open.closed = true;
    open = null;
  };

  for (const entry of args.entries) {
    if (!entry.text.trim()) continue;
    const key = args.partyOf(entry);
    if (!key) continue;

    if (entry.role === "user") {
      // Introductions come first.
      if (key === client.key && !introClient.closed && introProfessional.attemptIds.length === 0) {
        introClient.attemptIds.push(entry.id);
        continue;
      }
      if (key === professional.key && !introProfessional.closed && introProfessional.attemptIds.length === 0) {
        introClient.closed = true;
        introProfessional.attemptIds.push(entry.id);
        continue;
      }
      if (open) {
        const segment: GuideStep = open;
        if (key === segment.targetKey) {
          segment.attemptIds.push(entry.id);
        } else {
          // Spoke to the original speaker: asking them to repeat or clarify.
          segment.repeatRequested = true;
        }
      }
      continue;
    }

    // Assistant turns. Wait for the professional's first real turn after the introductions.
    if (!args.completed.has(entry.id)) continue;
    if (introProfessional.attemptIds.length === 0) continue;
    introClient.closed = true;
    introProfessional.closed = true;

    if (open) {
      const segment: GuideStep = open;
      const sourceKey = segment.sourceKey;
      const tries = segment.attemptIds.length;
      const lastVerdict = tries > 0 ? results[segment.attemptIds[tries - 1]]?.verdict : undefined;

      if (key === sourceKey && (segment.repeatRequested || tries === 0 || (lastVerdict && lastVerdict !== "good" && tries < MAX_TRIES))) {
        // The same speaker again: more of their turn, or a repeat the learner asked for.
        segment.sourceText = segment.repeatRequested ? entry.text : `${segment.sourceText ?? ""} ${entry.text}`.trim();
        segment.repeatRequested = false;
        continue;
      }
      closeOpen();
    }

    const speaker = party(key);
    const listener = other(key);
    open = {
      id: `segment-${entry.id}`,
      kind: "segment",
      title: `Interpret ${speaker.name}'s turn for ${listener.name}`,
      detail: `Switch to ${listener.name} and relay everything ${speaker.name} said, in ${listener.language}.`,
      attemptIds: [],
      sourceText: entry.text,
      sourceKey: speaker.key,
      targetKey: listener.key,
      sourceLanguage: speaker.language,
      targetLanguage: listener.language,
      closed: false,
    };
    steps.push(open);
  }

  if (args.ended) {
    steps.push({
      id: "wrap",
      kind: "wrap",
      title: "Wrapping up",
      detail: "The conversation has reached its end. Relay any last line, then the session finishes by itself.",
      attemptIds: [],
      closed: false,
    });
  }

  return steps;
}

/** Splits a task card into short items (lines, bullets or numbered points). */
export function taskItems(taskCard: string | undefined) {
  if (!taskCard) return [];
  return taskCard
    .split(/\n+/)
    .map((line) => line.replace(/^\s*(?:[-•*]|\d+[.)])\s*/, "").trim())
    .filter((line) => line.length > 3)
    .slice(0, 10);
}
