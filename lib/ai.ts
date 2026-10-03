import type { Scenario, VoiceAgent } from "@/types/scenario";
import type { LanguagePair } from "@/lib/languages";

/**
 * Realtime agent prompts for the practice room.
 *
 * Language model (decision D-010, from Thomas's testing feedback):
 *   - The English-speaking participant (the professional) always speaks the
 *     pair's English side; the service user always speaks the learner's other
 *     language. There is no "flip".
 *   - Scenario text written for one language (e.g. a Spanish-speaking patient)
 *     is re-pointed to the learner's language at runtime.
 */

export type AgentLanguagePlan = {
  /** Which agent is the English-speaking professional. */
  professionalKey: "agent_a" | "agent_b";
  agentALanguage: string;
  agentBLanguage: string;
};

function isEnglish(language: string | undefined) {
  return (language ?? "").trim().toLowerCase().startsWith("english");
}

/**
 * Decides who speaks what. The agent the scenario authored as English keeps the
 * pair's source language; the other participant gets the target language.
 */
export function planAgentLanguages(scenario: Scenario, pair: LanguagePair): AgentLanguagePlan {
  const aIsEnglish = isEnglish(scenario.aiAgentA.language);
  const bIsEnglish = isEnglish(scenario.aiAgentB?.language);
  const professionalKey = !aIsEnglish && bIsEnglish ? "agent_b" : "agent_a";

  return professionalKey === "agent_a"
    ? {
        professionalKey,
        agentALanguage: pair.sourceLanguage,
        agentBLanguage: pair.targetLanguage,
      }
    : {
        professionalKey,
        agentALanguage: pair.targetLanguage,
        agentBLanguage: pair.sourceLanguage,
      };
}

/** Replaces the language a scenario was authored in with the learner's language. */
export function retargetLanguage(text: string | undefined, from: string | undefined, to: string) {
  if (!text || !from || from.trim().toLowerCase() === to.trim().toLowerCase()) {
    return text;
  }

  const escaped = from.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(`\\b${escaped}\\b`, "gi"), to);
}

export const END_CONVERSATION_TOOL = "end_conversation";

export function buildRealtimeAgentInstructions(args: {
  scenario: Scenario;
  agent: VoiceAgent;
  authoredLanguage: string | undefined;
  counterpart?: VoiceAgent;
  isProfessional: boolean;
  timeLimitMinutes?: number;
}) {
  const { scenario, agent, counterpart, isProfessional, authoredLanguage } = args;
  const language = agent.language;
  const timeLimitMinutes = args.timeLimitMinutes ?? 12;
  // English-only practice (or any pair where both speak the same language): authored
  // notes like "you do not speak English" would contradict the language rule.
  const sharedLanguage = Boolean(counterpart?.language && language && counterpart.language.toLowerCase() === language.toLowerCase());
  const endCondition = agent.endCondition?.trim() || agent.goal;

  return [
    retargetLanguage(agent.instructions, authoredLanguage, language),
    "",
    `Scenario: ${scenario.title}. ${scenario.description}`,
    `You are ${agent.name}, the ${agent.role}. Demeanor: ${agent.demeanor}.`,
    `IDENTITY (never break this): you are ${agent.name}, the ${agent.role}, and nothing else. You are NOT an interpreter. The human you are talking to is the interpreter. Never introduce yourself as an interpreter, never offer to interpret or translate, and never describe your job as helping anyone communicate.`,
    sharedLanguage
      ? `In this session you and ${counterpart?.name ?? "the other participant"} both speak ${language}. Ignore anything above that says you don't speak ${language}. You still only talk to the interpreter, who passes everything on between you.`
      : "",
    `Your goal: ${retargetLanguage(agent.goal, authoredLanguage, language)}`,
    counterpart
      ? `The other participant is ${counterpart.name}, the ${counterpart.role}. You cannot hear them directly; a human interpreter relays everything between you.`
      : "A human interpreter relays everything between you and the other party.",
    "",
    "How the conversation starts:",
    isProfessional
      ? "- The interpreter will first introduce themselves to the other party, then to you. When the interpreter introduces themselves to you, greet them briefly and begin with your first question or statement."
      : "- The interpreter will introduce themselves to you first and explain how they will help. Acknowledge them briefly and wait. Then respond to what the interpreter relays.",
    agent.openingLine
      ? `- Your first real line should carry this meaning (say it naturally in ${language}): ${agent.openingLine}`
      : "",
    "",
    "Rules:",
    "- Speak in short, natural turns of one to three sentences, then stop and wait for the interpreter.",
    "- Never interpret, translate or summarise for anyone. Never act as the interpreter.",
    "- If the interpreter is silent, stay silent.",
    "- Stay in character. Do not mention that this is a simulation or training.",
    isProfessional
      ? `- When you have what you need (${endCondition}) and the other party has no outstanding questions, give a brief closing line, then call the ${END_CONVERSATION_TOOL} tool with reason "objective_met". Do not prolong the conversation after that.`
      : "- If the other party says goodbye, say a short goodbye back.",
    isProfessional
      ? `- Keep the conversation focused: cover your goal in roughly ${Math.max(4, Math.round(timeLimitMinutes * 0.6))} minutes of talk. Don't introduce new topics once your goal is met.`
      : "",
    isProfessional
      ? `- If the interpreter clearly can't continue (several turns of silence, "I don't know", or relays that make no sense), close politely and call ${END_CONVERSATION_TOOL} with reason "learner_stuck".`
      : "",
    "",
    `LANGUAGE RULE (overrides everything above): speak only ${language}. Every word you say must be in ${language}, even if the interpreter or any text above uses another language.`,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

/**
 * ISO-639-1 codes for input transcription. Forcing the language stops the
 * transcriber guessing (e.g. Greek heard as a Slavic language, Hindi vs Punjabi).
 */
const transcriptionCodes: Record<string, string> = {
  arabic: "ar",
  bangla: "bn",
  bengali: "bn",
  cantonese: "zh",
  dari: "fa",
  english: "en",
  filipino: "tl",
  tagalog: "tl",
  french: "fr",
  german: "de",
  greek: "el",
  gujarati: "gu",
  "haitian creole": "ht",
  hindi: "hi",
  indonesian: "id",
  italian: "it",
  italiano: "it",
  japanese: "ja",
  korean: "ko",
  malay: "ms",
  malayalam: "ml",
  mandarin: "zh",
  nepali: "ne",
  persian: "fa",
  farsi: "fa",
  portuguese: "pt",
  punjabi: "pa",
  russian: "ru",
  sinhala: "si",
  spanish: "es",
  tamil: "ta",
  telugu: "te",
  thai: "th",
  turkish: "tr",
  urdu: "ur",
  vietnamese: "vi",
};

export function transcriptionLanguageCode(language: string) {
  return transcriptionCodes[language.trim().toLowerCase()];
}

/**
 * Instructions for English-only role-plays (OET, IELTS, OSCE/AMC stations).
 * The learner plays themselves (a nurse, doctor or test candidate); the AI plays
 * the patient, relative, colleague or examiner described by the scenario.
 */
export function buildRoleplayInstructions(args: { scenario: Scenario; agent: VoiceAgent }) {
  const { scenario, agent } = args;
  const runtime = scenario.practiceRuntime;
  const learner = runtime.learnerRole ?? "candidate";
  const endCondition = agent.endCondition?.trim();

  return [
    `You are ${agent.name}, ${agent.role}, in a spoken practice role-play. The person talking to you is a ${learner}.`,
    `You are only ${agent.name}. You are never an interpreter or an assistant, and you never step out of your role.`,
    `Scenario: ${scenario.title}. ${scenario.description}`,
    `Your manner: ${agent.demeanor}.`,
    `What you want from this conversation: ${agent.goal}`,
    agent.instructions ? `Your role card (follow it closely):\n${agent.instructions}` : "",
    "",
    "Rules:",
    "- Stay in character the whole time. Never mention that this is practice, an exam or AI.",
    "- Never coach, hint, praise or evaluate the learner, and never take over their task.",
    "- Speak naturally in short turns, then wait. If the learner is silent, stay silent.",
    "- Reveal details from your card only when the learner asks about them or it would be natural to mention them.",
    "- If the learner uses jargon you wouldn't understand, ask what it means.",
    runtime.learnerOpens === false
      ? `- You speak first. ${agent.openingLine ? `Open with: ${agent.openingLine}` : "Open the conversation as your role would."}`
      : `- The learner speaks first. ${agent.openingLine ? `Your first reply should carry this meaning: ${agent.openingLine}` : ""}`,
    endCondition
      ? `- When ${endCondition}, give a brief natural closing line, then call the ${END_CONVERSATION_TOOL} tool with reason "objective_met".`
      : `- When the learner closes the conversation, say a brief goodbye, then call the ${END_CONVERSATION_TOOL} tool with reason "objective_met".`,
    `- If the learner clearly can't continue (long silences, repeated "I don't know", or they keep going in circles), close the conversation naturally and call ${END_CONVERSATION_TOOL} with reason "learner_stuck".`,
    "",
    "LANGUAGE RULE (overrides everything above): speak only English, at a natural pace with everyday vocabulary that suits your character.",
  ]
    .filter((line) => line !== "")
    .join("\n");
}
