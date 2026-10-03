"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction, useMutation } from "convex/react";
import { RealtimeAgent, tool } from "@openai/agents/realtime";
import { ArrowLeft, Clock, Lock } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import {
  buildRealtimeAgentInstructions,
  buildRoleplayInstructions,
  END_CONVERSATION_TOOL,
  planAgentLanguages,
  retargetLanguage,
  transcriptionLanguageCode,
} from "@/lib/ai";
import { track } from "@/lib/analytics";
import { friendlyError, getErrorCode } from "@/lib/errors";
import { flagEmoji, isEnglishOnly } from "@/lib/languages";
import { isCommunityRoleplayId } from "@/lib/marketplace";
import { LanguagePairPicker } from "@/components/dashboard/language-pair-picker";
import { HEARTBEAT_INTERVAL_MS, scenarioTimeLimitMinutes, STALL_END_MS, STALL_WARNING_MS, formatMinuteCount } from "@/lib/plans";
import type { EndReason } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { useActiveLanguagePair } from "@/components/providers/language-pair-context";
import { useRealtimeVoiceSession } from "@/components/practice/use-realtime-voice-session";
import {
  CoachBar,
  formatClock,
  HeadphonesTip,
  MicButton,
  MicCheck,
  ParticipantTile,
  SelfView,
} from "@/components/practice/room-parts";
import { Badge, Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import type { Scenario, VoiceAgent } from "@/types/scenario";
import type { TranscriptEntry } from "@/types/session";
import { deriveInterpretingSteps, taskItems, type CoachResult, type Party } from "@/components/practice/session-guide";
import { StepGuide, TaskChecklist, TranscriptSection } from "@/components/practice/session-panel";

type AgentKey = "agent_a" | "agent_b";
type Phase = "setup" | "countdown" | "connecting" | "live" | "finishing";
type Mode = "assessed" | "practice";

export type PracticeRoomData = NonNullable<
  FunctionReturnType<typeof api.catalog.scenarioForPractice>
>;

/**
 * The practice room: setup (briefing, mic check, mode) -> live session -> results.
 *
 * Each AI participant runs in its own OpenAI Realtime session and only hears
 * what the learner says to it, so the learner is the only bridge between them.
 * Minutes are metered on the server (start -> heartbeat); this component only
 * reports liveness and reacts when the server says time is up.
 */
export function PracticeRoom({ data }: { data: PracticeRoomData }) {
  const router = useRouter();
  const { activePair } = useActiveLanguagePair();
  const scenario = data.scenario as unknown as Scenario;

  const startAttempt = useMutation(api.practice.startAttempt);
  const heartbeat = useMutation(api.practice.heartbeat);
  const cancelAttempt = useMutation(api.practice.cancelAttempt);
  const reportRealtimeUsage = useMutation(api.usage.reportRealtimeUsage);
  const createRealtimeSecret = useAction(api.practiceActions.createRealtimeSecret);
  const finishAttempt = useAction(api.practiceActions.finishAttempt);
  const translateLine = useAction(api.practiceActions.translateLine);
  const coachTurn = useAction(api.practiceActions.coachTurn);
  const switchToPractice = useMutation(api.practice.switchToPractice);

  const [phase, setPhase] = useState<Phase>("setup");
  const [mode, setMode] = useState<Mode>("assessed");
  const [countdown, setCountdown] = useState(3);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [startedAtMs, setStartedAtMs] = useState<number | null>(null);
  const [allowedMs, setAllowedMs] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [activeAgent, setActiveAgent] = useState<AgentKey | null>(null);
  /** Which participants are audibly speaking right now (measured from their audio). */
  const [audible, setAudible] = useState<Record<AgentKey, boolean>>({ agent_a: false, agent_b: false });
  const [isRecording, setIsRecording] = useState(false);
  const [turns, setTurns] = useState<Record<AgentKey, number>>({ agent_a: 0, agent_b: 0 });
  /** Set when the professional/role-player closes the conversation via the end tool. */
  const [conversationEnd, setConversationEnd] = useState<{
    reason: "objective_met" | "learner_stuck";
    at: number;
    turnsAtEnd: Record<AgentKey, number>;
  } | null>(null);
  const conversationEnded = conversationEnd !== null;
  /** Participants whose voice connection has finished (not just started). */
  const [ready, setReady] = useState<Record<AgentKey, boolean>>({ agent_a: false, agent_b: false });
  /** Ms since anyone (learner or AI) last spoke, and since an AI was last heard. Updated by the clock tick. */
  const [idleMs, setIdleMs] = useState(0);
  const [quietMs, setQuietMs] = useState(0);
  const [connectingNudge, setConnectingNudge] = useState(false);
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>([]);
  /** Entries whose speech-to-text is final (the guide only judges finished turns). */
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => new Set());
  const [coachResults, setCoachResults] = useState<Record<string, CoachResult | "pending" | undefined>>({});
  const [coveredTasks, setCoveredTasks] = useState<Set<number>>(() => new Set());
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translating, setTranslating] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [audioBlocked, setAudioBlocked] = useState(false);

  const attemptIdRef = useRef<string | null>(null);
  const finishingRef = useRef(false);
  const agentAAudioRef = useRef<HTMLAudioElement | null>(null);
  const agentBAudioRef = useRef<HTMLAudioElement | null>(null);
  const connectedAgentsRef = useRef<Set<AgentKey>>(new Set());
  const audioContextRef = useRef<AudioContext | null>(null);
  const metersRef = useRef<Map<AgentKey, { analyser: AnalyserNode; data: Uint8Array<ArrayBuffer>; audio: HTMLAudioElement }>>(new Map());
  const lastHeardRef = useRef<Record<AgentKey, number>>({ agent_a: 0, agent_b: 0 });
  const audibleRef = useRef<Record<AgentKey, boolean>>({ agent_a: false, agent_b: false });
  const meterFrameRef = useRef<number | null>(null);
  const spaceDownAtRef = useRef<number | null>(null);
  const spaceHoldTimeoutRef = useRef<number | null>(null);
  const spaceHoldActiveRef = useRef(false);
  const transcriptScrollRef = useRef<HTMLDivElement>(null);
  const turnsRef = useRef<Record<AgentKey, number>>({ agent_a: 0, agent_b: 0 });
  const readyRef = useRef<Record<AgentKey, boolean>>({ agent_a: false, agent_b: false });
  const activeAgentRef = useRef<AgentKey | null>(null);
  const recordingRef = useRef(false);
  const lastActivityRef = useRef(0);
  const lastAgentHeardRef = useRef(0);
  /** Silences a participant who starts talking over another (set once sessions exist). */
  const floorGuardRef = useRef<(key: AgentKey) => void>(() => undefined);

  // ---- Who speaks what -------------------------------------------------------

  const runtime = scenario.practiceRuntime;
  // English-only role-play (OET, IELTS, clinical stations): the learner speaks as themselves.
  const isRoleplay = runtime.practiceType === "roleplay";
  const timeLimitMs = scenarioTimeLimitMinutes(scenario) * 60_000;
  const hasSecondAgent = !isRoleplay && scenario.agentCount === 2 && Boolean(scenario.aiAgentB);
  const languagePlan = useMemo(
    () => planAgentLanguages(scenario, activePair),
    [scenario, activePair],
  );
  // One-on-one sessions are held in the language being practised (the pair's other
  // language); XINGO's English test role-plays (OET, IELTS, OSCE) always stay in English.
  const isEnglishTest = isRoleplay && !isCommunityRoleplayId(scenario.moduleId);
  const soloLanguage = isEnglishTest ? "English" : activePair.targetLanguage;
  const agentAConfig = useMemo<VoiceAgent>(
    () => ({ ...scenario.aiAgentA, language: hasSecondAgent ? languagePlan.agentALanguage : soloLanguage }),
    [hasSecondAgent, scenario.aiAgentA, languagePlan.agentALanguage, soloLanguage],
  );
  const agentBConfig = useMemo<VoiceAgent | null>(
    () =>
      hasSecondAgent && scenario.aiAgentB
        ? { ...scenario.aiAgentB, language: languagePlan.agentBLanguage }
        : null,
    [hasSecondAgent, scenario.aiAgentB, languagePlan.agentBLanguage],
  );
  const professionalKey: AgentKey = hasSecondAgent ? languagePlan.professionalKey : "agent_a";
  const clientKey: AgentKey = hasSecondAgent
    ? professionalKey === "agent_a"
      ? "agent_b"
      : "agent_a"
    : "agent_a";
  const configFor = useCallback(
    (key: AgentKey) => (key === "agent_a" || !agentBConfig ? agentAConfig : agentBConfig),
    [agentAConfig, agentBConfig],
  );
  const professional = configFor(professionalKey);
  const client = configFor(clientKey);

  // ---- Speaking state ----------------------------------------------------------

  /**
   * One animation-frame loop measures every connected participant's output level.
   * A participant counts as speaking only while their stream carries sound AND
   * their audio element is actually playing (not paused, muted or autoplay-blocked).
   */
  const runMeters = useCallback(() => {
    const now = performance.now();
    let changed = false;
    const next = { ...audibleRef.current };

    for (const [key, meter] of metersRef.current) {
      meter.analyser.getByteTimeDomainData(meter.data);
      let sum = 0;
      for (const sample of meter.data) {
        const value = (sample - 128) / 128;
        sum += value * value;
      }
      const rms = Math.sqrt(sum / meter.data.length);
      const playing = !meter.audio.paused && !meter.audio.muted && meter.audio.volume > 0;

      if (playing && rms > 0.015) {
        lastHeardRef.current[key] = now;
        lastAgentHeardRef.current = Date.now();
        lastActivityRef.current = Date.now();
      }

      const isAudible = playing && now - lastHeardRef.current[key] < 250;
      if (next[key] !== isAudible) {
        next[key] = isAudible;
        changed = true;
      }
    }

    // Hard rule: only one participant is ever heard. If both are audible, the one
    // the learner isn't addressing is cut off.
    if (next.agent_a && next.agent_b) {
      const intruder: AgentKey = activeAgentRef.current === "agent_a" ? "agent_b" : "agent_a";
      floorGuardRef.current(intruder);
      next[intruder] = false;
      lastHeardRef.current[intruder] = 0;
      changed = true;
    }

    if (changed) {
      audibleRef.current = next;
      setAudible(next);
    }

    meterFrameRef.current = window.requestAnimationFrame(runMeters);
  }, []);

  /** Starts metering a participant once their WebRTC audio stream is attached. */
  const attachLevelMeter = useCallback(
    (key: AgentKey, audio: HTMLAudioElement) => {
      if (metersRef.current.has(key)) {
        return;
      }

      let tries = 0;
      const tryAttach = () => {
        const stream = audio.srcObject;

        if (!(stream instanceof MediaStream) || stream.getAudioTracks().length === 0) {
          if (tries++ < 50) window.setTimeout(tryAttach, 200);
          return;
        }

        const context = audioContextRef.current ?? new AudioContext();
        audioContextRef.current = context;
        void context.resume().catch(() => undefined);
        const analyser = context.createAnalyser();
        analyser.fftSize = 512;
        // Analyse only; playback stays on the <audio> element (no double audio).
        context.createMediaStreamSource(stream).connect(analyser);
        metersRef.current.set(key, { analyser, data: new Uint8Array(new ArrayBuffer(analyser.fftSize)), audio });

        if (meterFrameRef.current === null) {
          meterFrameRef.current = window.requestAnimationFrame(runMeters);
        }
      };

      tryAttach();
    },
    [runMeters],
  );

  const stopMeters = useCallback(() => {
    if (meterFrameRef.current !== null) {
      window.cancelAnimationFrame(meterFrameRef.current);
      meterFrameRef.current = null;
    }

    metersRef.current.clear();
    audibleRef.current = { agent_a: false, agent_b: false };
    setAudible({ agent_a: false, agent_b: false });
    void audioContextRef.current?.close().catch(() => undefined);
    audioContextRef.current = null;
  }, []);

  useEffect(() => stopMeters, [stopMeters]);

  // ---- Transcript ---------------------------------------------------------------

  const addTranscriptEntry = useCallback(
    (entry: TranscriptEntry) => {
      setTranscriptEntries((current) => {
        const index = current.findIndex((item) => item.id === entry.id);

        if (index >= 0) {
          const next = [...current];
          next[index] = { ...next[index], ...entry };
          return next;
        }

        return [...current, entry].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      });

    },
    [],
  );

  const updateTranscriptEntry = useCallback((entryId: string, text: string, append: boolean) => {
    setTranscriptEntries((current) =>
      current.map((entry) =>
        entry.id === entryId ? { ...entry, text: append ? `${entry.text}${text}` : text } : entry,
      ),
    );
  }, []);

  const completeTranscriptEntry = useCallback((entryId: string, text?: string) => {
    if (!text) {
      return;
    }

    setCompletedIds((current) => (current.has(entryId) ? current : new Set(current).add(entryId)));
    setTranscriptEntries((current) =>
      current.map((entry) => (entry.id === entryId ? { ...entry, text } : entry)),
    );
  }, []);

  const onUsage = useCallback(
    (usage: { eventId: string; model: string; promptTokens: number; completionTokens: number; totalTokens: number }) => {
      const id = attemptIdRef.current;

      if (id) {
        void reportRealtimeUsage({ ...usage, attemptId: id }).catch(() => undefined);
      }
    },
    [reportRealtimeUsage],
  );

  const onRealtimeWarning = useCallback((message: string) => {
    console.warn("[PracticeRoom] realtime", message);
  }, []);

  const callbacks = useMemo(
    () => ({
      onTranscriptStart: addTranscriptEntry,
      onTranscriptUpdate: updateTranscriptEntry,
      onTranscriptComplete: completeTranscriptEntry,
      onUsage,
      onError: onRealtimeWarning,
    }),
    [addTranscriptEntry, completeTranscriptEntry, onRealtimeWarning, onUsage, updateTranscriptEntry],
  );

  const agentASession = useRealtimeVoiceSession(agentAConfig.name, `You → ${agentAConfig.name}`, callbacks);
  const agentBSession = useRealtimeVoiceSession(
    agentBConfig?.name ?? "Participant",
    `You → ${agentBConfig?.name ?? "Participant"}`,
    callbacks,
  );

  // ---- Realtime agents ----------------------------------------------------------

  const endConversationTool = useMemo(
    () =>
      tool({
        name: END_CONVERSATION_TOOL,
        description:
          "Ends the session. Call it right after your closing line: when your goal is met (objective_met), or when the other person clearly can't continue (learner_stuck).",
        parameters: {
          type: "object" as const,
          properties: { reason: { type: "string" as const, enum: ["objective_met", "learner_stuck"] } },
          required: ["reason" as const],
          additionalProperties: false as const,
        },
        strict: true,
        execute: async (input: unknown) => {
          const reason = (input as { reason?: string } | null)?.reason === "learner_stuck" ? "learner_stuck" : "objective_met";
          setConversationEnd((current) => current ?? { reason, at: Date.now(), turnsAtEnd: { ...turnsRef.current } });
          return "The session is over. Do not say anything else.";
        },
      }),
    [],
  );

  const buildAgent = useCallback(
    (key: AgentKey) => {
      const config = configFor(key);
      const authored = key === "agent_a" ? scenario.aiAgentA : scenario.aiAgentB;
      const counterpart = hasSecondAgent ? configFor(key === "agent_a" ? "agent_b" : "agent_a") : undefined;
      const isProfessional = key === professionalKey;

      if (isRoleplay) {
        return new RealtimeAgent({
          name: config.name,
          voice: config.voice,
          handoffs: [],
          tools: [endConversationTool],
          instructions: buildRoleplayInstructions({ scenario, agent: config }),
        });
      }

      return new RealtimeAgent({
        name: config.name,
        voice: config.voice,
        handoffs: [],
        tools: isProfessional ? [endConversationTool] : [],
        instructions: buildRealtimeAgentInstructions({
          scenario,
          agent: {
            ...config,
            openingLine: retargetLanguage(config.openingLine, authored?.language, config.language),
          },
          authoredLanguage: authored?.language,
          counterpart,
          isProfessional,
          timeLimitMinutes: timeLimitMs / 60_000,
        }),
      });
    },
    [configFor, endConversationTool, hasSecondAgent, isRoleplay, professionalKey, scenario, timeLimitMs],
  );

  const agentA = useMemo(() => buildAgent("agent_a"), [buildAgent]);
  const agentB = useMemo(() => (hasSecondAgent ? buildAgent("agent_b") : null), [buildAgent, hasSecondAgent]);

  const bundleFor = useCallback(
    (key: AgentKey) =>
      key === "agent_a" || !agentB
        ? { agent: agentA, session: agentASession, audio: agentAAudioRef.current, config: agentAConfig }
        : { agent: agentB, session: agentBSession, audio: agentBAudioRef.current, config: agentBConfig! },
    [agentA, agentAConfig, agentASession, agentB, agentBConfig, agentBSession],
  );

  const ensureAudioPlayback = useCallback(async (audio: HTMLAudioElement | null) => {
    if (!audio) {
      return;
    }

    audio.autoplay = true;
    audio.muted = false;

    try {
      await audio.play();
      setAudioBlocked(false);
    } catch {
      setAudioBlocked(true);
    }
  }, []);

  const connectAgent = useCallback(
    async (key: AgentKey) => {
      if (connectedAgentsRef.current.has(key)) {
        return;
      }

      const bundle = bundleFor(key);
      const id = attemptIdRef.current;

      if (!bundle.audio || !id) {
        throw new Error("Audio output is not ready yet.");
      }

      connectedAgentsRef.current.add(key);

      try {
        await bundle.session.connect({
          getEphemeralKey: () => createRealtimeSecret({ attemptId: id }),
          agent: bundle.agent,
          audioElement: bundle.audio,
          transcriptionLanguage: bundle.config.language,
          transcriptionLanguageCode: transcriptionLanguageCode(bundle.config.language),
        });
      } catch (connectError) {
        connectedAgentsRef.current.delete(key);
        throw connectError;
      }

      // Learner controls turns with push-to-talk; no automatic voice detection.
      bundle.session.setTurnDetectionEnabled(false);
      await ensureAudioPlayback(bundle.audio);
      attachLevelMeter(key, bundle.audio);
      readyRef.current = { ...readyRef.current, [key]: true };
      setReady(readyRef.current);
    },
    [attachLevelMeter, bundleFor, createRealtimeSecret, ensureAudioPlayback],
  );

  const selectAgent = useCallback(
    async (key: AgentKey) => {
      if (!hasSecondAgent && key === "agent_b") {
        return;
      }

      // Switching is only possible once both voices are ready (the room isn't live before then).
      if (connectedAgentsRef.current.has(key) && !readyRef.current[key]) {
        return;
      }

      setActiveAgent(key);
      activeAgentRef.current = key;
      const other: AgentKey = key === "agent_a" ? "agent_b" : "agent_a";

      if (readyRef.current[other]) {
        bundleFor(other).session.mute(true);
      }

      try {
        await connectAgent(key);
        setError(null);
        bundleFor(key).session.mute(false);
        void ensureAudioPlayback(bundleFor(key).audio);
      } catch (connectError) {
        console.error("[PracticeRoom] connect", key, connectError);
        setError(
          friendlyError(
            connectError,
            `Couldn't connect to ${configFor(key).name}. Check your connection and tap their card to retry.`,
          ),
        );
      }
    },
    [bundleFor, configFor, connectAgent, ensureAudioPlayback, hasSecondAgent],
  );

  /** Stops every participant except `keep` mid-sentence and silences their audio. */
  const silenceAgents = useCallback(
    (keep: AgentKey | null) => {
      for (const key of ["agent_a", "agent_b"] as const) {
        if (key === keep || !readyRef.current[key]) continue;
        const bundle = bundleFor(key);
        bundle.session.interrupt();
        if (bundle.audio) bundle.audio.muted = true;
      }
    },
    [bundleFor],
  );

  useEffect(() => {
    floorGuardRef.current = (key) => {
      if (!readyRef.current[key]) return;
      const bundle = bundleFor(key);
      bundle.session.interrupt();
      if (bundle.audio) bundle.audio.muted = true;
    };
  }, [bundleFor]);

  const disconnectAll = useCallback(() => {
    agentASession.disconnect();
    agentBSession.disconnect();
    connectedAgentsRef.current.clear();
    readyRef.current = { agent_a: false, agent_b: false };
    setReady(readyRef.current);
    setActiveAgent(null);
    activeAgentRef.current = null;
    setIsRecording(false);
    recordingRef.current = false;
    stopMeters();
  }, [agentASession, agentBSession, stopMeters]);

  // ---- Start / finish / leave ----------------------------------------------------

  const startSession = useCallback(async () => {
    setError(null);
    setPhase("connecting");
    setTranscriptEntries([]);
    setTranslations({});
    setCompletedIds(new Set());
    setCoachResults({});
    setCoveredTasks(new Set());
    setTranscriptOpen(false);
    setTurns({ agent_a: 0, agent_b: 0 });
    turnsRef.current = { agent_a: 0, agent_b: 0 };
    setConversationEnd(null);
    setConnectingNudge(false);

    try {
      // Fail fast on microphone problems, before an attempt exists.
      const probe = await navigator.mediaDevices.getUserMedia({ audio: true });
      probe.getTracks().forEach((track) => track.stop());

      const result = await startAttempt({
        scenarioId: scenario.id,
        sourceLanguage: activePair.sourceLanguage,
        targetLanguage: activePair.targetLanguage,
        spokenLanguage: hasSecondAgent ? undefined : soloLanguage,
        mode,
      });

      attemptIdRef.current = result.attemptId;
      setAttemptId(result.attemptId);
      setAllowedMs(result.allowedMs);
      setStartedAtMs(Date.now());
      track("practice_start", { scenario_id: scenario.id, module_id: scenario.moduleId, mode });

      // Connect everyone before going live, so the learner can't talk to or switch
      // to someone who isn't there yet. The interpreter opens with the client (Thomas, Aug 2026).
      await Promise.all(hasSecondAgent ? [connectAgent(clientKey), connectAgent(professionalKey)] : [connectAgent(clientKey)]);
      if (hasSecondAgent) bundleFor(professionalKey).session.mute(true);
      setActiveAgent(clientKey);
      activeAgentRef.current = clientKey;
      bundleFor(clientKey).session.mute(false);
      void ensureAudioPlayback(bundleFor(clientKey).audio);
      lastActivityRef.current = Date.now();
      setIdleMs(0);
      setPhase("live");

      if (isRoleplay && runtime.learnerOpens === false) {
        bundleFor(clientKey).session.sendHiddenInstruction("Begin the conversation now, in character.");
      }
    } catch (startError) {
      console.error("[PracticeRoom] start", startError);
      const code = getErrorCode(startError);
      setError(friendlyError(startError, "We couldn't start the session. Check your connection and try again."));
      setPhase("setup");

      // Nothing was spoken, so release the attempt (no voice connected = no charge).
      const id = attemptIdRef.current;
      if (id) {
        attemptIdRef.current = null;
        setAttemptId(null);
        void cancelAttempt({ attemptId: id }).catch(() => undefined);
      }

      if (code === "OUT_OF_MINUTES" || code === "PREMIUM_REQUIRED") {
        track("paywall_view", { reason: code, scenario_id: scenario.id });
      }

      disconnectAll();
    }
  }, [
    activePair.sourceLanguage,
    activePair.targetLanguage,
    bundleFor,
    cancelAttempt,
    clientKey,
    connectAgent,
    disconnectAll,
    ensureAudioPlayback,
    hasSecondAgent,
    isRoleplay,
    mode,
    professionalKey,
    runtime.learnerOpens,
    scenario.id,
    scenario.moduleId,
    soloLanguage,
    startAttempt,
  ]);

  const finishSession = useCallback(
    (reason: EndReason) => {
      const id = attemptIdRef.current;

      if (!id || finishingRef.current) {
        return;
      }

      finishingRef.current = true;
      setPhase("finishing");
      disconnectAll();

      const entries = transcriptEntries
        .filter((entry) => entry.text.trim())
        .map(({ id: entryId, role, speaker, text, createdAt }) => ({
          id: entryId,
          role,
          speaker,
          text,
          createdAt,
        }));

      track("practice_finish", { scenario_id: scenario.id, mode, reason, turns: turns.agent_a + turns.agent_b });
      // The action keeps running server-side; the results page updates live when grading lands.
      void finishAttempt({ attemptId: id, transcriptEntries: entries, endReason: reason }).catch((finishError) =>
        console.error("[PracticeRoom] finish", finishError),
      );
      attemptIdRef.current = null;
      router.push(`/results/${id}${reason === "learner_finished" ? "" : `?ended=${reason}`}`);
    },
    [disconnectAll, finishAttempt, mode, router, scenario.id, transcriptEntries, turns],
  );

  const leaveRoom = useCallback(() => {
    const id = attemptIdRef.current;

    if (id && phase === "live") {
      if (!window.confirm("Leave this session? It won't be scored, and minutes used so far still count.")) {
        return;
      }

      void cancelAttempt({ attemptId: id }).catch(() => undefined);
      attemptIdRef.current = null;
    }

    disconnectAll();
    router.push(`/courses/${scenario.moduleId}`);
  }, [cancelAttempt, disconnectAll, phase, router, scenario.moduleId]);

  // Cancel a live attempt if the learner navigates away inside the app.
  useEffect(() => {
    return () => {
      const id = attemptIdRef.current;

      if (id && !finishingRef.current) {
        void cancelAttempt({ attemptId: id }).catch(() => undefined);
      }
    };
  }, [cancelAttempt]);

  // Countdown before connecting.
  useEffect(() => {
    if (phase !== "countdown") {
      return;
    }

    if (countdown <= 0) {
      void startSession();
      return;
    }

    const timeout = window.setTimeout(() => setCountdown((value) => value - 1), 800);
    return () => window.clearTimeout(timeout);
  }, [countdown, phase, startSession]);

  // Latest finishSession for timers, so they aren't reset by every transcript update.
  const finishSessionRef = useRef(finishSession);
  useEffect(() => {
    finishSessionRef.current = finishSession;
  }, [finishSession]);

  // Server heartbeat: keeps the attempt alive and enforces the minute balance.
  useEffect(() => {
    if (phase !== "live" || !attemptId) {
      return;
    }

    const interval = window.setInterval(() => {
      void heartbeat({ attemptId })
        .then((result) => {
          setAllowedMs(result.allowedMs);

          if (result.shouldEnd) {
            finishSessionRef.current(result.endReason ?? "time_up");
          }
        })
        .catch(() => undefined);
    }, HEARTBEAT_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [attemptId, heartbeat, phase]);

  // Clock tick: timer, plus how long the room has been silent.
  useEffect(() => {
    if (phase !== "live") {
      return;
    }

    const interval = window.setInterval(() => {
      const now = Date.now();
      if (recordingRef.current) lastActivityRef.current = now;
      setNowMs(now);
      setIdleMs(now - lastActivityRef.current);
      setQuietMs(now - lastAgentHeardRef.current);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [phase]);

  // Every session has a time limit (lib/plans.ts): end it like the real test would.
  useEffect(() => {
    if (phase === "live" && startedAtMs !== null && nowMs - startedAtMs >= timeLimitMs) {
      finishSessionRef.current("time_up");
    }
  }, [nowMs, phase, startedAtMs, timeLimitMs]);

  // Nobody has spoken for a long time: the learner is stuck or has walked away.
  useEffect(() => {
    if (phase === "live" && !isRecording && idleMs >= STALL_END_MS) {
      finishSessionRef.current("stalled");
    }
  }, [idleMs, isRecording, phase]);

  // The AI closed the conversation: let the last words land, then wrap up automatically.
  const AFTER_CLOSE_QUIET_MS = 2_500;
  const LAST_RELAY_TIMEOUT_MS = 45_000;
  const awaitingLastRelay =
    conversationEnd !== null &&
    conversationEnd.reason === "objective_met" &&
    hasSecondAgent &&
    turns[clientKey] <= conversationEnd.turnsAtEnd[clientKey];

  useEffect(() => {
    if (phase !== "live" || !conversationEnd || isRecording) {
      return;
    }

    const sinceEnd = nowMs - conversationEnd.at;
    const someoneSpeaking = audible.agent_a || audible.agent_b;

    // Interpreting: the learner still has to relay the closing line to the other party.
    if (awaitingLastRelay && sinceEnd < LAST_RELAY_TIMEOUT_MS) {
      return;
    }

    if (!someoneSpeaking && sinceEnd >= AFTER_CLOSE_QUIET_MS && quietMs >= AFTER_CLOSE_QUIET_MS) {
      finishSessionRef.current(conversationEnd.reason === "learner_stuck" ? "stalled" : "objective_met");
    }
  }, [audible, awaitingLastRelay, conversationEnd, isRecording, nowMs, phase, quietMs]);

  // ---- Push-to-talk -----------------------------------------------------------

  const startTalking = useCallback(() => {
    if (!activeAgent || phase !== "live") {
      return;
    }

    if (!connectedAgentsRef.current.has(activeAgent) || bundleFor(activeAgent).session.status !== "CONNECTED") {
      setError(`Still connecting to ${configFor(activeAgent).name}… try again in a second.`);
      return;
    }

    // The learner takes the floor: everyone else stops talking.
    silenceAgents(activeAgent);
    bundleFor(activeAgent).session.startPushToTalk();
    setIsRecording(true);
    recordingRef.current = true;
    lastActivityRef.current = Date.now();
  }, [activeAgent, bundleFor, configFor, phase, silenceAgents]);

  const stopTalking = useCallback(() => {
    if (!activeAgent || !isRecording) {
      return;
    }

    const bundle = bundleFor(activeAgent);
    bundle.session.stopPushToTalk();
    setIsRecording(false);
    recordingRef.current = false;
    lastActivityRef.current = Date.now();
    turnsRef.current = { ...turnsRef.current, [activeAgent]: turnsRef.current[activeAgent] + 1 };
    setTurns(turnsRef.current);
    // Only the person just addressed may answer.
    silenceAgents(activeAgent);
    void ensureAudioPlayback(bundle.audio);
  }, [activeAgent, bundleFor, ensureAudioPlayback, isRecording, silenceAgents]);

  const toggleAgent = useCallback(() => {
    if (phase !== "live" || !hasSecondAgent) {
      return;
    }

    void selectAgent(activeAgent === "agent_a" ? "agent_b" : "agent_a");
  }, [activeAgent, hasSecondAgent, phase, selectAgent]);

  // Space: hold to talk, tap to switch participant.
  useEffect(() => {
    if (phase !== "live") {
      return;
    }

    const holdThresholdMs = 220;
    const isTyping = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat || isTyping(event.target)) return;
      event.preventDefault();
      if (spaceDownAtRef.current !== null) return;

      spaceDownAtRef.current = Date.now();
      spaceHoldActiveRef.current = false;
      spaceHoldTimeoutRef.current = window.setTimeout(() => {
        spaceHoldActiveRef.current = true;
        startTalking();
      }, holdThresholdMs);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code !== "Space" || isTyping(event.target)) return;
      event.preventDefault();

      const downAt = spaceDownAtRef.current;
      spaceDownAtRef.current = null;
      if (spaceHoldTimeoutRef.current) window.clearTimeout(spaceHoldTimeoutRef.current);

      if (spaceHoldActiveRef.current || (downAt && Date.now() - downAt >= holdThresholdMs)) {
        spaceHoldActiveRef.current = false;
        stopTalking();
      } else {
        toggleAgent();
      }
    };

    const onBlur = () => {
      spaceDownAtRef.current = null;
      if (spaceHoldTimeoutRef.current) window.clearTimeout(spaceHoldTimeoutRef.current);
      if (spaceHoldActiveRef.current) {
        spaceHoldActiveRef.current = false;
        stopTalking();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [phase, startTalking, stopTalking, toggleAgent]);

  // Space while still connecting: explain why nothing happens yet.
  useEffect(() => {
    if (phase !== "connecting") {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      event.preventDefault();
      setConnectingNudge(true);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase]);

  useEffect(() => {
    activeAgentRef.current = activeAgent;
  }, [activeAgent]);

  // ---- Practice-mode transcript --------------------------------------------------

  const visibleEntries = transcriptEntries.filter((entry) => entry.text.trim());

  useEffect(() => {
    const container = transcriptScrollRef.current;
    if (container) container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [visibleEntries.length, translations]);

  const translateEntry = useCallback(
    async (entryId: string, text: string) => {
      const id = attemptIdRef.current;
      if (!id || translating[entryId] || translations[entryId]) return;

      setTranslating((current) => ({ ...current, [entryId]: true }));

      try {
        const result = await translateLine({ attemptId: id, text });
        setTranslations((current) => ({ ...current, [entryId]: result.translation }));
      } catch {
        setTranslations((current) => ({ ...current, [entryId]: "Translation unavailable." }));
      } finally {
        setTranslating((current) => ({ ...current, [entryId]: false }));
      }
    },
    [translateLine, translating, translations],
  );

  // ---- Step guide (D-034) -----------------------------------------------------------

  const taskLine = isRoleplay
    ? `You're the ${runtime.learnerRole ?? "candidate"}. ${scenario.description}`
    : hasSecondAgent
      ? `Interpret between ${professional.name} (${professional.role}) and ${client.name} (${client.role}). ${scenario.description}`
      : `Interpret for ${client.name} (${client.role}). ${scenario.description}`;
  const roleplayTasks = useMemo(() => taskItems(runtime.taskCard), [runtime.taskCard]);

  const guideSteps = useMemo(() => {
    if (isRoleplay || !hasSecondAgent) return [];
    const party = (key: AgentKey): Party => {
      const config = configFor(key);
      return { key, name: config.name, language: config.language, role: config.role };
    };
    const names = { agent_a: configFor("agent_a").name, agent_b: configFor("agent_b").name };
    return deriveInterpretingSteps({
      entries: transcriptEntries,
      completed: completedIds,
      client: party(clientKey),
      professional: party(professionalKey),
      partyOf: (entry) => {
        for (const key of ["agent_a", "agent_b"] as const) {
          if (entry.role === "assistant" ? entry.speaker === names[key] : entry.speaker === `You → ${names[key]}`) return key;
        }
        return null;
      },
      results: Object.fromEntries(Object.entries(coachResults).map(([id, r]) => [id, r === "pending" ? undefined : r])),
      ended: conversationEnded,
    });
  }, [clientKey, coachResults, completedIds, configFor, conversationEnded, hasSecondAgent, isRoleplay, professionalKey, transcriptEntries]);

  // Practice mode: check each finished attempt once.
  useEffect(() => {
    const id = attemptIdRef.current;
    if (mode !== "practice" || !id || phase !== "live") return;
    const textOf = new Map(transcriptEntries.map((entry) => [entry.id, entry.text]));

    for (const step of guideSteps) {
      for (const attemptId of step.attemptIds) {
        if (coachResults[attemptId] !== undefined || !completedIds.has(attemptId)) continue;
        setCoachResults((current) => ({ ...current, [attemptId]: "pending" }));
        coachTurn({
          attemptId: id,
          kind: step.kind === "intro" ? "intro" : "segment",
          rendition: textOf.get(attemptId) ?? "",
          source: step.sourceText,
          sourceLanguage: step.sourceLanguage,
          targetLanguage: step.targetLanguage,
        })
          .then((result) => setCoachResults((current) => ({ ...current, [attemptId]: { verdict: result.verdict, tip: result.tip } })))
          .catch(() => setCoachResults((current) => ({ ...current, [attemptId]: undefined })));
      }
    }
  }, [coachResults, coachTurn, completedIds, guideSteps, mode, phase, transcriptEntries]);

  // Practice mode role-plays: tick task-card items as they're covered.
  const learnerTurnsDone = transcriptEntries.filter((entry) => entry.role === "user" && completedIds.has(entry.id)).length;
  useEffect(() => {
    const id = attemptIdRef.current;
    if (!isRoleplay || mode !== "practice" || !id || learnerTurnsDone === 0 || roleplayTasks.length === 0) return;
    const said = transcriptEntries
      .filter((entry) => entry.role === "user" && entry.text.trim())
      .map((entry) => entry.text)
      .join("\n");
    coachTurn({ attemptId: id, kind: "tasks", rendition: said, tasks: roleplayTasks })
      .then((result) => setCoveredTasks((current) => new Set([...current, ...result.covered])))
      .catch(() => undefined);
    // Only when a new learner turn finishes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learnerTurnsDone]);

  const toggleTranscript = useCallback(() => {
    if (transcriptOpen) {
      setTranscriptOpen(false);
      return;
    }

    const id = attemptIdRef.current;
    if (mode === "assessed" && id) {
      if (!window.confirm("Showing the transcript switches this session to Practice mode, so it won't be scored. Show it?")) return;
      void switchToPractice({ attemptId: id }).catch(() => undefined);
      setMode("practice");
    }

    setTranscriptOpen(true);
  }, [mode, switchToPractice, transcriptOpen]);

  // ---- Coaching -------------------------------------------------------------------

  const effectiveAllowedMs = allowedMs !== null ? Math.min(allowedMs, timeLimitMs) : timeLimitMs;
  const remainingMs =
    effectiveAllowedMs !== null && startedAtMs !== null ? effectiveAllowedMs - (nowMs - startedAtMs) : null;
  const totalTurns = turns.agent_a + turns.agent_b;

  const coach = useMemo(() => {
    if (phase === "connecting") {
      return {
        title: "Setting up your session…",
        detail: hasSecondAgent
          ? `Connecting to ${client.name} and ${professional.name}. You can talk once both show Ready.`
          : `Connecting to ${client.name}. You can talk once they show Ready.`,
      };
    }

    if (conversationEnd) {
      if (awaitingLastRelay) {
        return {
          tone: "done" as const,
          title: `${professional.name} has wrapped up. Interpret their last line for ${client.name}.`,
          detail: "The session ends automatically after that.",
        };
      }

      return {
        tone: "done" as const,
        title:
          conversationEnd.reason === "learner_stuck"
            ? "The conversation has stopped here."
            : `${professional.name} has wrapped up the conversation.`,
        detail: mode === "assessed" ? "Wrapping up and scoring your session…" : "Wrapping up…",
      };
    }

    if (idleMs >= STALL_WARNING_MS) {
      return {
        tone: "warning" as const,
        title: "Still there?",
        detail: `Nobody has spoken for a while. The session ends in ${Math.max(0, Math.ceil((STALL_END_MS - idleMs) / 1000))} seconds unless you keep going.`,
      };
    }

    if (remainingMs !== null && remainingMs < 60_000) {
      return {
        tone: "warning" as const,
        title: "Less than a minute left.",
        detail: "Finish your current turn. The session ends automatically when time runs out.",
      };
    }

    if (isRoleplay) {
      if (totalTurns === 0) {
        return runtime.learnerOpens === false
          ? { title: `Listen — ${client.name} will start.`, detail: "Hold Space (or the mic button) while you answer, then release." }
          : {
              title: `Start the conversation with ${client.name}.`,
              detail: "Introduce yourself and begin your first task. Hold Space (or the mic button) while you talk.",
            };
      }

      return {
        title: "Work through your task card.",
        detail: "Keep an eye on the timer — the session ends when the conversation wraps up or time runs out.",
      };
    }

    if (!hasSecondAgent) {
      return {
        title: totalTurns === 0 ? `Introduce yourself to ${client.name}` : "Interpret each turn",
        detail:
          totalTurns === 0
            ? `Speak ${client.language}. Hold Space or the mic button while you talk.`
            : "Hold to talk, release to send.",
      };
    }

    if (turns[clientKey] === 0) {
      return {
        step: 1,
        totalSteps: 3,
        title: `Introduce yourself to ${client.name} in ${client.language}.`,
        detail: "Say you're the interpreter and that you'll interpret everything said, in the first person. Hold Space (or the mic) while you talk.",
      };
    }

    if (turns[professionalKey] === 0) {
      return {
        step: 2,
        totalSteps: 3,
        title: `Now switch to ${professional.name} and introduce yourself in ${professional.language}.`,
        detail: "Tap Space or tap their card to switch. They'll start the conversation after your introduction.",
      };
    }

    return {
      step: 3,
      totalSteps: 3,
      title: "Interpret each turn.",
      detail: "When someone finishes speaking, switch to the other person and relay everything they said.",
    };
  }, [awaitingLastRelay, client, clientKey, conversationEnd, hasSecondAgent, idleMs, isRoleplay, mode, phase, professional, professionalKey, remainingMs, runtime.learnerOpens, totalTurns, turns]);

  const tileState = (key: AgentKey) => {
    if (!ready[key]) return "connecting" as const;
    if (audible[key]) return "speaking" as const;
    if (activeAgent === key && isRecording) return "listening" as const;
    if (activeAgent === key) return "selected" as const;
    return "idle" as const;
  };

  // ---- Render ---------------------------------------------------------------------

  if (!data.access.allowed) {
    return (
      <RoomFrame title={scenario.title} onExit={() => router.push(`/courses/${scenario.moduleId}`)}>
        <div className="mx-auto max-w-lg py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-[-0.03em]">Unlock {data.module.title}</h1>
          <p className="mt-2 text-gray-500">
            This dialogue is part of a premium course. Go Pro or buy a minute pack to practise every course.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Button asChild size="lg">
              <Link href="/billing" onClick={() => track("paywall_view", { reason: "locked", scenario_id: scenario.id })}>
                See plans
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href={`/courses/${scenario.moduleId}`}>Try the free dialogue</Link>
            </Button>
          </div>
        </div>
      </RoomFrame>
    );
  }

  const timer =
    phase === "live" && startedAtMs !== null ? (
      <div className="flex items-center gap-2 text-sm font-semibold tabular-nums">
        <Clock className="h-4 w-4 text-gray-500" />
        {formatClock(nowMs - startedAtMs)}
        {remainingMs !== null ? (
          <span className={cn("font-normal text-gray-500", remainingMs < 60_000 && "text-record")}>
            · {formatClock(remainingMs)} left
          </span>
        ) : null}
      </div>
    ) : null;

  return (
    <RoomFrame
      title={scenario.title}
      subtitle={data.module.title}
      onExit={leaveRoom}
      wide={phase !== "setup" && phase !== "countdown"}
      right={
        <div className="flex items-center gap-3">
          {timer}
          {phase !== "setup" ? (
            <Badge tone={mode === "assessed" ? "dark" : "neutral"}>
              {mode === "assessed" ? "Assessed" : "Practice · not scored"}
            </Badge>
          ) : null}
        </div>
      }
    >
      <audio ref={agentAAudioRef} autoPlay playsInline className="sr-only" />
      <audio ref={agentBAudioRef} autoPlay playsInline className="sr-only" />

      {phase === "setup" || phase === "countdown" ? (
        <SetupPanel
          data={data}
          isRoleplay={isRoleplay}
          client={client}
          professional={professional}
          hasSecondAgent={hasSecondAgent}
          isEnglishTest={isEnglishTest}
          mode={mode}
          onModeChange={setMode}
          countdown={phase === "countdown" ? countdown : null}
          error={error}
          onStart={() => {
            setError(null);
            setCountdown(3);
            setPhase("countdown");
          }}
        />
      ) : (
        <div className="flex flex-1 flex-col lg:flex-row">
          <section className="flex min-w-0 flex-1 flex-col items-center gap-6 px-4 py-6 sm:px-8 lg:py-10">
            <div className="w-full max-w-4xl">
              <CoachBar {...coach} />
            </div>

            <div className={cn("grid w-full max-w-4xl gap-4 lg:gap-6", hasSecondAgent ? "sm:grid-cols-2" : "max-w-md")}>
              {(hasSecondAgent ? [clientKey, professionalKey] : (["agent_a"] as AgentKey[])).map((key) => {
                const config = configFor(key);
                return (
                  <ParticipantTile
                    key={key}
                    size="lg"
                    name={config.name}
                    role={config.role}
                    language={config.language}
                    imageUrl={config.avatarImageUrl}
                    state={tileState(key)}
                    disabled={phase !== "live"}
                    onSelect={() => void selectAgent(key)}
                  />
                );
              })}
            </div>

            <div className="flex flex-col items-center gap-4 pb-4">
              <MicButton
                recording={isRecording}
                connecting={phase === "connecting"}
                disabled={phase !== "live" || !activeAgent}
                onStart={startTalking}
                onEnd={stopTalking}
                targetName={activeAgent ? configFor(activeAgent).name : undefined}
              />
              <SelfView />
            </div>

            {phase === "connecting" && connectingNudge ? (
              <p className="text-center text-sm text-gray-500" role="status">
                Hang on — still connecting. Talking and switching unlock when everyone shows Ready.
              </p>
            ) : null}
            {audioBlocked ? (
              <div className="w-full max-w-4xl rounded-xl bg-warning/30 px-4 py-3 text-sm">
                Your browser blocked audio.{" "}
                <button
                  type="button"
                  className="font-semibold underline"
                  onClick={() => void ensureAudioPlayback(activeAgent ? bundleFor(activeAgent).audio : null)}
                >
                  Turn sound on
                </button>
              </div>
            ) : null}
            {error ? <div className="w-full max-w-4xl rounded-xl bg-record/10 px-4 py-3 text-sm text-record">{error}</div> : null}
          </section>

          <aside className="flex w-full flex-col gap-4 border-t border-gray-200 bg-gray-50/70 p-4 sm:p-6 lg:sticky lg:top-16 lg:h-[calc(100dvh-4rem)] lg:w-[400px] lg:shrink-0 lg:border-l lg:border-t-0 xl:w-[460px]">
            <div className={cn("shrink-0 overflow-y-auto", transcriptOpen ? "max-h-[45%]" : "flex-1")}>
              {isRoleplay ? (
                roleplayTasks.length > 0 ? (
                  <TaskChecklist task={taskLine} items={roleplayTasks} covered={coveredTasks} live={mode === "practice"} />
                ) : runtime.taskCard ? (
                  <TaskCard text={runtime.taskCard} learnerRole={runtime.learnerRole} />
                ) : (
                  <TaskChecklist task={taskLine} items={[]} covered={coveredTasks} live={false} />
                )
              ) : hasSecondAgent ? (
                <StepGuide task={taskLine} steps={guideSteps} results={coachResults} live={mode === "practice"} />
              ) : (
                <TaskChecklist task={taskLine} items={[]} covered={coveredTasks} live={false} />
              )}
            </div>

            <TranscriptSection
              open={transcriptOpen}
              onToggle={toggleTranscript}
              assessed={mode === "assessed"}
              entries={visibleEntries}
              translations={translations}
              translating={translating}
              onTranslate={(id, text) => void translateEntry(id, text)}
              showTranslate={!isRoleplay && mode === "practice"}
              scrollRef={transcriptScrollRef}
            />

            <Button
              size="lg"
              variant={conversationEnded ? "accent" : "primary"}
              block
              className="mt-auto shrink-0"
              disabled={phase !== "live"}
              onClick={() => finishSession("learner_finished")}
            >
              {phase === "finishing" ? "Finishing…" : mode === "assessed" ? "Finish and get my score" : "Finish session"}
            </Button>
          </aside>
        </div>
      )}
    </RoomFrame>
  );
}

function RoomFrame({
  title,
  subtitle,
  onExit,
  right,
  wide = false,
  children,
}: {
  title: string;
  subtitle?: string;
  onExit: () => void;
  right?: React.ReactNode;
  /** Live session: use the full width (stage + docked side panel). */
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-gray-200 bg-paper/95 px-4 backdrop-blur sm:px-6">
        <Button variant="ghost" size="icon" onClick={onExit} aria-label="Leave session">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{title}</p>
          {subtitle ? <p className="truncate text-xs text-gray-500">{subtitle}</p> : null}
        </div>
        {right}
      </header>
      <main className={cn("flex w-full flex-1 flex-col", !wide && "mx-auto max-w-6xl px-4 py-6 sm:px-6")}>{children}</main>
    </div>
  );
}

function SetupPanel({
  data,
  isRoleplay,
  client,
  professional,
  hasSecondAgent,
  isEnglishTest,
  mode,
  onModeChange,
  countdown,
  error,
  onStart,
}: {
  data: PracticeRoomData;
  isRoleplay: boolean;
  client: VoiceAgent;
  professional: VoiceAgent;
  hasSecondAgent: boolean;
  isEnglishTest: boolean;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  countdown: number | null;
  error: string | null;
  onStart: () => void;
}) {
  const { scenario, access } = data;
  const { activePair } = useActiveLanguagePair();
  const outOfMinutes = access.remainingMinutes < 1;

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_1fr]">
      <section>
        <p className="eyebrow">Your briefing</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">{scenario.title}</h1>
        <p className="mt-3 text-[15px] leading-6 text-gray-500">{scenario.description}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {(hasSecondAgent ? [client, professional] : [professional]).map((agent) => (
            <div key={agent.name} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-sm font-bold">
                {agent.avatarImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={agent.avatarImageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  agent.name.slice(0, 1)
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{agent.name}</p>
                <p className="truncate text-xs text-gray-500">
                  {agent.role} · {flagEmoji(agent.language)} {agent.language}
                </p>
              </div>
            </div>
          ))}
        </div>

        {isRoleplay && scenario.practiceRuntime.taskCard ? (
          <div className="mt-6">
            <TaskCard text={scenario.practiceRuntime.taskCard} learnerRole={scenario.practiceRuntime.learnerRole} />
          </div>
        ) : null}

        <ol className="mt-8 space-y-4">
          {(isRoleplay
            ? [
                "Read your task card. It stays on screen during the session.",
                scenario.practiceRuntime.learnerOpens === false
                  ? `${professional.name} starts the conversation.`
                  : `Start by introducing yourself to ${professional.name}.`,
                "Hold Space (or the mic button) while you talk, then release.",
                `You have ${scenarioTimeLimitMinutes(scenario)} minutes. The session ends when the conversation wraps up or time runs out.`,
              ]
            : [
            hasSecondAgent
              ? `Introduce yourself to ${client.name} in ${client.language} and explain you'll interpret everything.`
              : `Introduce yourself to ${professional.name}.`,
            hasSecondAgent ? `Switch to ${professional.name} and introduce yourself in ${professional.language}.` : null,
            "Interpret every turn. Hold Space (or the mic button) to talk; tap Space to switch person.",
            `You have ${scenarioTimeLimitMinutes(scenario)} minutes. The session ends by itself when the conversation wraps up, time runs out, or nobody speaks for ${Math.round(STALL_END_MS / 1000)} seconds. Unfinished sessions score lower.`,
          ])
            .filter(Boolean)
            .map((text, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-paper">
                  {index + 1}
                </span>
                <span className="text-[15px] leading-6">{text}</span>
              </li>
            ))}
        </ol>
      </section>

      <Card className="h-fit p-6">
        <p className="text-lg font-bold">Before you start</p>
        <div className="mt-5 space-y-5">
          <HeadphonesTip />
          <MicCheck />
        </div>

        <p className="mt-7 text-sm font-bold">Session type</p>
        <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Session type">
          {(
            [
              ["assessed", "Assessed", "Scored. Transcript hidden, like the test."],
              ["practice", "Practice", "Live transcript. Not scored."],
            ] as const
          ).map(([value, label, hint]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={mode === value}
              onClick={() => onModeChange(value)}
              className={cn(
                "rounded-xl border-2 p-3 text-left transition-colors",
                mode === value ? "border-ink" : "border-gray-200 hover:border-gray-300",
              )}
            >
              <p className="text-sm font-bold">{label}</p>
              <p className="mt-0.5 text-xs text-gray-500">{hint}</p>
            </button>
          ))}
        </div>

        <p className="mt-7 text-sm font-bold">Language</p>
        {isEnglishTest ? (
          <p className="mt-2 text-sm text-gray-500">This is an English test, so the conversation is in English.</p>
        ) : (
          <>
            <div className="mt-2">
              <LanguagePairPicker variant={hasSecondAgent ? "pair" : "single"} />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {hasSecondAgent
                ? `${client.name} speaks ${client.language}; ${professional.name} speaks ${professional.language}. Scores are saved for this language pair.`
                : isEnglishOnly(activePair)
                  ? `${professional.name} will speak English. Pick another language to practise in it.`
                  : `${professional.name} will speak ${professional.language}. Your scores are saved for ${professional.language}.`}
            </p>
          </>
        )}

        {error ? <p className="mt-5 rounded-lg bg-record/10 px-3 py-2 text-sm text-record">{error}</p> : null}

        {outOfMinutes ? (
          <Button asChild size="lg" block className="mt-6">
            <Link href="/billing">Get more minutes</Link>
          </Button>
        ) : (
          <Button size="lg" block className="mt-6" onClick={onStart} disabled={countdown !== null}>
            {countdown !== null ? `Starting in ${countdown}…` : "Start session"}
          </Button>
        )}
        <p className="mt-3 text-center text-xs text-gray-500">
          {access.remainingMinutes > 10_000
            ? "Admin access · minutes aren't limited"
            : `${formatMinuteCount(access.remainingMinutes)} practice minutes left · time counts while the session is live`}
        </p>
      </Card>
    </div>
  );
}

/** The candidate card for role-play exams (OET, AMC, OSCE, IELTS). */
function TaskCard({ text, learnerRole }: { text: string; learnerRole?: string }) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="border-b border-gray-200 px-4 py-3">
        <p className="text-sm font-bold">Your task card</p>
        {learnerRole ? <p className="text-xs text-gray-500">You are: {learnerRole}</p> : null}
      </div>
      <div className="max-h-[50vh] overflow-y-auto whitespace-pre-line px-4 py-3 text-sm leading-6">{text}</div>
    </Card>
  );
}
