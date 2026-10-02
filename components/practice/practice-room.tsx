"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction, useMutation } from "convex/react";
import { RealtimeAgent, tool } from "@openai/agents/realtime";
import { ArrowLeft, Clock, Eye, EyeOff, Languages, Lock } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import {
  buildRealtimeAgentInstructions,
  END_CONVERSATION_TOOL,
  planAgentLanguages,
  retargetLanguage,
  transcriptionLanguageCode,
} from "@/lib/ai";
import { track } from "@/lib/analytics";
import { friendlyError, getErrorCode } from "@/lib/errors";
import { flagEmoji } from "@/lib/languages";
import { HEARTBEAT_INTERVAL_MS } from "@/lib/plans";
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

type AgentKey = "agent_a" | "agent_b";
type SpeakingKey = AgentKey | "interpreter" | null;
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

  const [phase, setPhase] = useState<Phase>("setup");
  const [mode, setMode] = useState<Mode>("assessed");
  const [countdown, setCountdown] = useState(3);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [startedAtMs, setStartedAtMs] = useState<number | null>(null);
  const [allowedMs, setAllowedMs] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [activeAgent, setActiveAgent] = useState<AgentKey | null>(null);
  const [speakingKey, setSpeakingKey] = useState<SpeakingKey>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [turns, setTurns] = useState<Record<AgentKey, number>>({ agent_a: 0, agent_b: 0 });
  const [conversationEnded, setConversationEnded] = useState(false);
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>([]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translating, setTranslating] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [audioBlocked, setAudioBlocked] = useState(false);

  const attemptIdRef = useRef<string | null>(null);
  const finishingRef = useRef(false);
  const agentAAudioRef = useRef<HTMLAudioElement | null>(null);
  const agentBAudioRef = useRef<HTMLAudioElement | null>(null);
  const connectedAgentsRef = useRef<Set<AgentKey>>(new Set());
  const listenersAttachedRef = useRef<Set<AgentKey>>(new Set());
  const speakingTimeoutRef = useRef<number | null>(null);
  const spaceDownAtRef = useRef<number | null>(null);
  const spaceHoldTimeoutRef = useRef<number | null>(null);
  const spaceHoldActiveRef = useRef(false);
  const transcriptScrollRef = useRef<HTMLDivElement>(null);

  // ---- Who speaks what -------------------------------------------------------

  const hasSecondAgent = scenario.agentCount === 2 && Boolean(scenario.aiAgentB);
  const languagePlan = useMemo(
    () => planAgentLanguages(scenario, activePair),
    [scenario, activePair],
  );
  const agentAConfig = useMemo<VoiceAgent>(
    () => ({ ...scenario.aiAgentA, language: languagePlan.agentALanguage }),
    [scenario.aiAgentA, languagePlan.agentALanguage],
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

  const markSpeaking = useCallback((key: SpeakingKey) => {
    if (speakingTimeoutRef.current) {
      window.clearTimeout(speakingTimeoutRef.current);
    }

    setSpeakingKey(key);

    if (key) {
      // Safety net if audio events never fire.
      speakingTimeoutRef.current = window.setTimeout(() => setSpeakingKey(null), 30_000);
    }
  }, []);

  const clearSpeaking = useCallback((key: AgentKey) => {
    setSpeakingKey((current) => (current === key ? null : current));
  }, []);

  const attachAudioListeners = useCallback(
    (key: AgentKey, audio: HTMLAudioElement) => {
      if (listenersAttachedRef.current.has(key)) {
        return;
      }

      const onPlay = () => markSpeaking(key);
      const onEnded = () => clearSpeaking(key);
      const onPause = () => {
        if (!Number.isFinite(audio.duration) || audio.currentTime >= audio.duration - 0.05) {
          clearSpeaking(key);
        }
      };

      audio.addEventListener("play", onPlay);
      audio.addEventListener("waiting", onPlay);
      audio.addEventListener("canplaythrough", onPlay);
      audio.addEventListener("ended", onEnded);
      audio.addEventListener("pause", onPause);
      listenersAttachedRef.current.add(key);
    },
    [clearSpeaking, markSpeaking],
  );

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

      if (entry.role === "assistant") {
        markSpeaking(entry.speaker === agentAConfig.name ? "agent_a" : "agent_b");
      }
    },
    [agentAConfig.name, markSpeaking],
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
          "Call this once you have everything you need and the other party has no outstanding questions, right after your closing line.",
        parameters: {
          type: "object" as const,
          properties: { reason: { type: "string" as const } },
          required: ["reason" as const],
          additionalProperties: false as const,
        },
        strict: true,
        execute: async () => {
          setConversationEnded(true);
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
        }),
      });
    },
    [configFor, endConversationTool, hasSecondAgent, professionalKey, scenario],
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

      attachAudioListeners(key, bundle.audio);
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
    },
    [attachAudioListeners, bundleFor, createRealtimeSecret, ensureAudioPlayback],
  );

  const selectAgent = useCallback(
    async (key: AgentKey) => {
      if (!hasSecondAgent && key === "agent_b") {
        return;
      }

      setActiveAgent(key);
      const other: AgentKey = key === "agent_a" ? "agent_b" : "agent_a";

      if (connectedAgentsRef.current.has(other)) {
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

  const disconnectAll = useCallback(() => {
    agentASession.disconnect();
    agentBSession.disconnect();
    connectedAgentsRef.current.clear();
    setActiveAgent(null);
    setIsRecording(false);
    setSpeakingKey(null);
  }, [agentASession, agentBSession]);

  // ---- Start / finish / leave ----------------------------------------------------

  const startSession = useCallback(async () => {
    setError(null);
    setPhase("connecting");
    setTranscriptEntries([]);
    setTranslations({});
    setTurns({ agent_a: 0, agent_b: 0 });
    setConversationEnded(false);

    try {
      // Fail fast on microphone problems, before an attempt exists.
      const probe = await navigator.mediaDevices.getUserMedia({ audio: true });
      probe.getTracks().forEach((track) => track.stop());

      const result = await startAttempt({
        scenarioId: scenario.id,
        sourceLanguage: activePair.sourceLanguage,
        targetLanguage: activePair.targetLanguage,
        mode,
      });

      attemptIdRef.current = result.attemptId;
      setAttemptId(result.attemptId);
      setAllowedMs(result.allowedMs);
      setStartedAtMs(Date.now());
      track("practice_start", { scenario_id: scenario.id, module_id: scenario.moduleId, mode });

      // The interpreter opens by introducing themselves to the client (Thomas, Aug 2026).
      // Only go live once that first voice is actually connected.
      setActiveAgent(clientKey);
      await connectAgent(clientKey);
      bundleFor(clientKey).session.mute(false);
      void ensureAudioPlayback(bundleFor(clientKey).audio);
      setPhase("live");

      if (hasSecondAgent) {
        void connectAgent(professionalKey)
          .then(() => bundleFor(professionalKey).session.mute(true))
          .catch(() => undefined);
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
    mode,
    professionalKey,
    scenario.id,
    scenario.moduleId,
    startAttempt,
  ]);

  const finishSession = useCallback(
    (reason: "user" | "time_up") => {
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
      void finishAttempt({ attemptId: id, transcriptEntries: entries }).catch((finishError) =>
        console.error("[PracticeRoom] finish", finishError),
      );
      attemptIdRef.current = null;
      router.push(`/results/${id}${reason === "time_up" ? "?ended=time" : ""}`);
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
    router.push(`/modules/${scenario.moduleId}`);
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
            finishSessionRef.current("time_up");
          }
        })
        .catch(() => undefined);
    }, HEARTBEAT_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [attemptId, heartbeat, phase]);

  // Clock tick for the timer.
  useEffect(() => {
    if (phase !== "live") {
      return;
    }

    const interval = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [phase]);

  // ---- Push-to-talk -----------------------------------------------------------

  const stopAllAgentPlayback = useCallback(() => {
    for (const audio of [agentAAudioRef.current, agentBAudioRef.current]) {
      if (audio && !audio.paused) {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch {
          // Streaming media may refuse currentTime; pausing is enough.
        }
      }
    }

    setSpeakingKey(null);
  }, []);

  const startTalking = useCallback(() => {
    if (!activeAgent || phase !== "live") {
      return;
    }

    if (!connectedAgentsRef.current.has(activeAgent) || bundleFor(activeAgent).session.status !== "CONNECTED") {
      setError(`Still connecting to ${configFor(activeAgent).name}… try again in a second.`);
      return;
    }

    stopAllAgentPlayback();
    bundleFor(activeAgent).session.startPushToTalk();
    setIsRecording(true);
    markSpeaking("interpreter");
  }, [activeAgent, bundleFor, configFor, markSpeaking, phase, stopAllAgentPlayback]);

  const stopTalking = useCallback(() => {
    if (!activeAgent || !isRecording) {
      return;
    }

    const bundle = bundleFor(activeAgent);
    bundle.session.stopPushToTalk();
    setIsRecording(false);
    setSpeakingKey(null);
    setTurns((current) => ({ ...current, [activeAgent]: current[activeAgent] + 1 }));
    void ensureAudioPlayback(bundle.audio);
  }, [activeAgent, bundleFor, ensureAudioPlayback, isRecording]);

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

      stopAllAgentPlayback();
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
  }, [phase, startTalking, stopAllAgentPlayback, stopTalking, toggleAgent]);

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

  // ---- Coaching -------------------------------------------------------------------

  const remainingMs =
    allowedMs !== null && startedAtMs !== null ? allowedMs - (nowMs - startedAtMs) : null;
  const totalTurns = turns.agent_a + turns.agent_b;

  const coach = useMemo(() => {
    if (conversationEnded) {
      return {
        tone: "done" as const,
        title: `${professional.name} has wrapped up the conversation.`,
        detail: mode === "assessed" ? "Press Finish to see your score." : "Press Finish to end the session.",
      };
    }

    if (remainingMs !== null && remainingMs < 60_000) {
      return {
        tone: "warning" as const,
        title: "Less than a minute left.",
        detail: "Finish your current turn. The session ends automatically when time runs out.",
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
  }, [client, clientKey, conversationEnded, hasSecondAgent, mode, professional, professionalKey, remainingMs, totalTurns, turns]);

  const tileState = (key: AgentKey) => {
    if (speakingKey === key) return "speaking" as const;
    if (activeAgent === key && isRecording) return "listening" as const;
    if (activeAgent === key) return "selected" as const;
    return "idle" as const;
  };

  // ---- Render ---------------------------------------------------------------------

  if (!data.access.allowed) {
    return (
      <RoomFrame title={scenario.title} onExit={() => router.push(`/modules/${scenario.moduleId}`)}>
        <div className="mx-auto max-w-lg py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-[-0.03em]">Unlock {data.module.title}</h1>
          <p className="mt-2 text-gray-500">
            This dialogue is part of a premium module. Go Pro or buy a minute pack to practise every module.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Button asChild size="lg">
              <Link href="/billing" onClick={() => track("paywall_view", { reason: "locked", scenario_id: scenario.id })}>
                See plans
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href={`/modules/${scenario.moduleId}`}>Try the free dialogue</Link>
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
          client={client}
          professional={professional}
          hasSecondAgent={hasSecondAgent}
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
        <div className="grid flex-1 gap-6 lg:grid-cols-[1fr_360px]">
          <section className="flex min-w-0 flex-col gap-6">
            <CoachBar {...coach} />

            <div className={cn("grid gap-4", hasSecondAgent && "sm:grid-cols-2")}>
              {(hasSecondAgent ? [clientKey, professionalKey] : (["agent_a"] as AgentKey[])).map((key) => {
                const config = configFor(key);
                return (
                  <ParticipantTile
                    key={key}
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
                disabled={phase !== "live" || !activeAgent}
                onStart={startTalking}
                onEnd={stopTalking}
                targetName={activeAgent ? configFor(activeAgent).name : undefined}
              />
              <SelfView />
            </div>

            {phase === "connecting" ? (
              <p className="text-center text-sm text-gray-500">Connecting to {client.name}…</p>
            ) : null}
            {audioBlocked ? (
              <div className="rounded-xl bg-warning/30 px-4 py-3 text-sm">
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
            {error ? <div className="rounded-xl bg-record/10 px-4 py-3 text-sm text-record">{error}</div> : null}
          </section>

          <aside className="flex min-h-0 flex-col gap-4 lg:sticky lg:top-6 lg:h-[calc(100dvh-8rem)]">
            {mode === "practice" ? (
              <Card className="flex min-h-[260px] flex-1 flex-col overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                  <p className="text-sm font-bold">Live transcript</p>
                  <Eye className="h-4 w-4 text-gray-500" />
                </div>
                <div ref={transcriptScrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                  {visibleEntries.length === 0 ? (
                    <p className="text-sm text-gray-500">The conversation will appear here.</p>
                  ) : null}
                  {visibleEntries.map((entry) => (
                    <div key={entry.id} className={cn("flex", entry.role === "user" && "justify-end")}>
                      <div
                        className={cn(
                          "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                          entry.role === "user" ? "bg-ink text-paper" : "bg-gray-100",
                        )}
                      >
                        <div className="mb-0.5 flex items-center justify-between gap-3 text-[11px] font-semibold opacity-60">
                          <span>{entry.speaker}</span>
                          {translations[entry.id] ? (
                            <span>English</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => void translateEntry(entry.id, entry.text)}
                              disabled={translating[entry.id]}
                              className="inline-flex items-center gap-1 hover:opacity-100"
                            >
                              <Languages className="h-3 w-3" />
                              {translating[entry.id] ? "…" : "Translate"}
                            </button>
                          )}
                        </div>
                        {translations[entry.id] ?? entry.text}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card tone="muted" className="flex flex-1 flex-col justify-center p-6 text-center">
                <EyeOff className="mx-auto h-6 w-6 text-gray-500" />
                <p className="mt-3 font-bold">Transcript hidden</p>
                <p className="mt-1 text-sm text-gray-500">
                  Like the real test, you work from listening alone. You&apos;ll see the full transcript with your results.
                </p>
                <p className="mt-6 text-sm">
                  <span className="text-3xl font-bold tabular-nums">{totalTurns}</span>
                  <span className="ml-2 text-gray-500">turns interpreted</span>
                </p>
              </Card>
            )}

            <Button
              size="lg"
              variant={conversationEnded ? "accent" : "primary"}
              block
              disabled={phase !== "live"}
              onClick={() => finishSession("user")}
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
  children,
}: {
  title: string;
  subtitle?: string;
  onExit: () => void;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-gray-200 bg-paper/95 px-4 py-3 backdrop-blur sm:px-6">
        <Button variant="ghost" size="icon" onClick={onExit} aria-label="Leave session">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{title}</p>
          {subtitle ? <p className="truncate text-xs text-gray-500">{subtitle}</p> : null}
        </div>
        {right}
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}

function SetupPanel({
  data,
  client,
  professional,
  hasSecondAgent,
  mode,
  onModeChange,
  countdown,
  error,
  onStart,
}: {
  data: PracticeRoomData;
  client: VoiceAgent;
  professional: VoiceAgent;
  hasSecondAgent: boolean;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  countdown: number | null;
  error: string | null;
  onStart: () => void;
}) {
  const { scenario, access } = data;
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

        <ol className="mt-8 space-y-4">
          {[
            hasSecondAgent
              ? `Introduce yourself to ${client.name} in ${client.language} and explain you'll interpret everything.`
              : `Introduce yourself to ${professional.name}.`,
            hasSecondAgent ? `Switch to ${professional.name} and introduce yourself in ${professional.language}.` : null,
            "Interpret every turn. Hold Space (or the mic button) to talk; tap Space to switch person.",
            "When the conversation wraps up, press Finish.",
          ]
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
          {Math.floor(access.remainingMinutes)} practice minutes left · time counts while the session is live
        </p>
      </Card>
    </div>
  );
}
