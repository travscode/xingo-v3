"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useConvexAuth, useMutation } from "convex/react";
import { RealtimeAgent } from "@openai/agents/realtime";
import { Lottie } from "lottie-react";
import { api } from "@/convex/_generated/api";
import { buildRealtimeAgentInstructions } from "@/lib/ai";
import { useRealtimeVoiceSession } from "@/components/practice/use-realtime-voice-session";
import { useActiveLanguagePair } from "@/components/providers/language-pair-context";
import type { Scenario, VoiceAgent } from "@/types/scenario";
import type { TranscriptEntry } from "@/types/session";
import soundWavesAnimation from "@/public/animations/sound-waves.json";
import { cn } from "@/lib/utils";

type AgentKey = "agent_a" | "agent_b";
type SpeakingKey = AgentKey | "interpreter" | null;

const notStartedLabel = "Not started";
interface PracticeRoomRunnerProps {
  scenario: Scenario & { _id: string };
}

/**
 * Returns a safe initials label for avatar placeholders.
 */
function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.trim().charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Returns duration in minutes for persisted session records.
 */
function formatMinutes(seconds: number) {
  return Math.max(1, Math.round(seconds / 60));
}

/**
 * Generates a short text summary from recent transcript entries.
 */
function summarizeTranscript(entries: TranscriptEntry[]) {
  const lastSpeakerTurns = entries
    .filter((entry) => entry.role !== "system" && entry.text.trim())
    .slice(-4)
    .map((entry) => `${entry.speaker}: ${entry.text}`)
    .join(" ");

  return lastSpeakerTurns || "Practice session completed.";
}

/**
 * Renders one participant avatar tile and speaking state.
 */
function ParticipantAvatar({
  label,
  subLabel,
  imageUrl,
  initials,
  isSpeaking,
  isActive,
  onSelect,
}: {
  label: string;
  subLabel: string;
  imageUrl?: string;
  initials: string;
  isSpeaking: boolean;
  isActive?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full max-w-[300px] flex-col items-center gap-4 text-center"
    >
      <div className="relative">
        {isSpeaking || isActive ? (
          <span className="avatar-speaking-ring" aria-hidden />
        ) : null}
        <div
          className={cn(
            "relative z-10 flex h-[190px] w-[190px] items-center justify-center overflow-hidden rounded-full bg-[#f0f0f0] text-4xl font-semibold text-black border border-4 border-transparent",
            isActive && "bg-[#001EFF] text-white border-[#001EFFAA]",
          )}
        >
          {imageUrl ? (
            // Uses a native image element to avoid Next.js optimizer issues with signed Convex URLs.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={label}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <span>{isSpeaking ? "" : initials}</span>
          )}
          {isSpeaking ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-[2px]">
              <div className="h-[110px] w-[110px]">
                <Lottie
                  src={soundWavesAnimation as object}
                  loop={true}
                  autoplay={true}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div>
        <div className="text-[32px] font-semibold leading-none tracking-[-0.03em] text-black">
          {label}
        </div>
        <div className="mt-2 text-base text-[#8b8b8b]">{subLabel}</div>
      </div>
    </button>
  );
}

export function PracticeRoomRunner({ scenario }: PracticeRoomRunnerProps) {
  const router = useRouter();
  const { isLoaded: isClerkLoaded, isSignedIn } = useAuth();
  const {
    isAuthenticated: isConvexAuthenticated,
    isLoading: isConvexAuthLoading,
  } = useConvexAuth();
  const { activePair } = useActiveLanguagePair();
  const startAttempt = useMutation(api.sessions.startAttempt);
  const completeAttempt = useMutation(api.sessions.completeAttempt);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [activeAgent, setActiveAgent] = useState<AgentKey | null>(null);
  const [speakingKey, setSpeakingKey] = useState<SpeakingKey>(null);
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>(
    [],
  );
  const [translatedTranscriptTextById, setTranslatedTranscriptTextById] =
    useState<Record<string, string>>({});
  const [translatingEntryIds, setTranslatingEntryIds] = useState<
    Record<string, boolean>
  >({});
  const [translationErrorsById, setTranslationErrorsById] = useState<
    Record<string, string>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [audioNotice, setAudioNotice] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isAssessing, setIsAssessing] = useState(false);
  const [isPushToTalkActive, setIsPushToTalkActive] = useState(false);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const spaceKeyDownAtRef = useRef<number | null>(null);
  const attemptIdRef = useRef<string | null>(null);
  const spaceHoldTimeoutRef = useRef<number | null>(null);
  const spaceHoldActiveRef = useRef(false);
  const countdownTimeoutRef = useRef<number | null>(null);
  const speakingTimeoutRef = useRef<number | null>(null);
  const agentAAudioRef = useRef<HTMLAudioElement | null>(null);
  const agentBAudioRef = useRef<HTMLAudioElement | null>(null);
  const connectedAgentsRef = useRef<Set<AgentKey>>(new Set());
  const transcriptScrollContainerRef = useRef<HTMLDivElement>(null);
  const agentASpeakingActiveRef = useRef(false);
  const agentBSpeakingActiveRef = useRef(false);
  const audioEventListenersAttachedRef = useRef<Set<AgentKey>>(new Set());
  const canStartPractice =
    isClerkLoaded &&
    isSignedIn &&
    isConvexAuthenticated &&
    !isConvexAuthLoading;

  const effectiveAgentA = useMemo<VoiceAgent>(
    () => ({
      ...scenario.aiAgentA,
      language: activePair.targetLanguage,
    }),
    [scenario.aiAgentA, activePair.targetLanguage],
  );

  const hasSecondAgent =
    scenario.agentCount === 2 && Boolean(scenario.aiAgentB);

  const agentBConfig = useMemo<VoiceAgent>(
    () =>
      scenario.aiAgentB
        ? { ...scenario.aiAgentB, language: activePair.sourceLanguage }
        : {
            name: "Participant",
            role: "Participant",
            voice: "sage",
            goal: "Respond naturally to the interpreter.",
            language: activePair.sourceLanguage,
            demeanor: "Natural and concise",
            instructions:
              "You are a placeholder participant and should never be selected in a one-agent scenario.",
            openingLine: "",
          },
    [scenario.aiAgentB, activePair.sourceLanguage],
  );

  const effectiveScenario = useMemo<Scenario & { _id: string }>(
    () => ({
      ...scenario,
      practiceRuntime: {
        ...scenario.practiceRuntime,
        sourceLanguage: activePair.sourceLanguage,
        targetLanguage: activePair.targetLanguage,
      },
      aiAgentA: effectiveAgentA,
      aiAgentB: hasSecondAgent ? agentBConfig : scenario.aiAgentB,
    }),
    [scenario, activePair, effectiveAgentA, hasSecondAgent, agentBConfig],
  );

  /**
   * Handles non-fatal realtime transport warnings without showing a blocking UI error.
   */
  const handleRealtimeWarning = useCallback((message: string) => {
    console.warn("[PracticeRoomRunner] Realtime warning", message);
  }, []);

  /**
   * Marks a speaker as active and schedules a safety timeout to clear the
   * speaking state if audio events fail to fire. Uses 30-second fallback since
   * actual audio duration is variable; ended/pause events are the primary signal.
   */
  const markSpeaking = useCallback((key: SpeakingKey) => {
    if (speakingTimeoutRef.current) {
      window.clearTimeout(speakingTimeoutRef.current);
      speakingTimeoutRef.current = null;
    }
    setSpeakingKey(key);
    if (key === "agent_a") {
      agentASpeakingActiveRef.current = true;
    } else if (key === "agent_b") {
      agentBSpeakingActiveRef.current = true;
    }
    if (key) {
      speakingTimeoutRef.current = window.setTimeout(() => {
        agentASpeakingActiveRef.current = false;
        agentBSpeakingActiveRef.current = false;
        setSpeakingKey(null);
      }, 30000);
    }
  }, []);

  /**
   * Clears the speaking state for a specific agent when audio playback finishes.
   * Uses both ref and state to ensure consistency between renders.
   */
  const clearSpeakingForAgent = useCallback((agentKey: AgentKey) => {
    if (agentKey === "agent_a") {
      agentASpeakingActiveRef.current = false;
    } else if (agentKey === "agent_b") {
      agentBSpeakingActiveRef.current = false;
    }
    setSpeakingKey((current) => (current === agentKey ? null : current));
  }, []);

  /**
   * Attaches play/pause/ended listeners to an agent's audio element so the
   * speaking animation stays in sync with real audio output instead of a fixed timer.
   */
  const setupAgentAudioEventListeners = useCallback(
    (agentKey: AgentKey, audioElement: HTMLAudioElement) => {
      if (audioEventListenersAttachedRef.current.has(agentKey)) {
        return;
      }

      const handlePlay = () => {
        markSpeaking(agentKey);
      };

      const handleEnded = () => {
        clearSpeakingForAgent(agentKey);
      };

      const handlePause = () => {
        if (
          !Number.isFinite(audioElement.duration) ||
          audioElement.currentTime >= audioElement.duration - 0.05
        ) {
          clearSpeakingForAgent(agentKey);
        }
      };

      const handleWaiting = () => {
        markSpeaking(agentKey);
      };

      audioElement.addEventListener("play", handlePlay);
      audioElement.addEventListener("ended", handleEnded);
      audioElement.addEventListener("pause", handlePause);
      audioElement.addEventListener("waiting", handleWaiting);
      audioElement.addEventListener("canplaythrough", handlePlay);

      audioEventListenersAttachedRef.current.add(agentKey);
    },
    [clearSpeakingForAgent, markSpeaking],
  );

  const addTranscriptEntry = useCallback(
    (entry: TranscriptEntry) => {
      setTranscriptEntries((current) => {
        const existingIndex = current.findIndex((item) => item.id === entry.id);

        if (existingIndex >= 0) {
          const next = [...current];
          next[existingIndex] = { ...next[existingIndex], ...entry };
          return next;
        }

        return [...current, entry].sort((a, b) =>
          a.createdAt.localeCompare(b.createdAt),
        );
      });

      if (entry.role === "assistant") {
        if (entry.speaker === effectiveAgentA.role) {
          markSpeaking("agent_a");
        } else if (entry.speaker === agentBConfig.role) {
          markSpeaking("agent_b");
        }
      }
    },
    [agentBConfig.role, markSpeaking, effectiveAgentA.role],
  );

  const updateTranscriptEntry = useCallback(
    (entryId: string, text: string, append: boolean) => {
      setTranslatedTranscriptTextById((current) => {
        if (!(entryId in current)) {
          return current;
        }

        const next = { ...current };
        delete next[entryId];
        return next;
      });
      setTranslationErrorsById((current) => {
        if (!(entryId in current)) {
          return current;
        }

        const next = { ...current };
        delete next[entryId];
        return next;
      });
      setTranscriptEntries((current) =>
        current.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                text: append ? `${entry.text}${text}` : text,
              }
            : entry,
        ),
      );
    },
    [],
  );

  const completeTranscriptEntry = useCallback(
    (entryId: string, text?: string) => {
      if (!text) {
        return;
      }

      setTranslatedTranscriptTextById((current) => {
        if (!(entryId in current)) {
          return current;
        }

        const next = { ...current };
        delete next[entryId];
        return next;
      });
      setTranslationErrorsById((current) => {
        if (!(entryId in current)) {
          return current;
        }

        const next = { ...current };
        delete next[entryId];
        return next;
      });
      setTranscriptEntries((current) =>
        current.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                text,
              }
            : entry,
        ),
      );
    },
    [],
  );

  const agentA = useMemo(
    () =>
      new RealtimeAgent({
        name: effectiveAgentA.name,
        voice: effectiveAgentA.voice,
        handoffs: [],
        tools: [],
        handoffDescription: `${effectiveAgentA.role} in ${effectiveScenario.title}`,
        instructions: buildRealtimeAgentInstructions(
          effectiveScenario,
          effectiveAgentA,
          hasSecondAgent ? agentBConfig : undefined,
        ),
      }),
    [agentBConfig, hasSecondAgent, effectiveAgentA, effectiveScenario],
  );

  const agentB = useMemo(
    () =>
      new RealtimeAgent({
        name: agentBConfig.name,
        voice: agentBConfig.voice,
        handoffs: [],
        tools: [],
        handoffDescription: `${agentBConfig.role} in ${effectiveScenario.title}`,
        instructions: buildRealtimeAgentInstructions(
          effectiveScenario,
          agentBConfig,
          effectiveAgentA,
        ),
      }),
    [agentBConfig, effectiveScenario, effectiveAgentA],
  );

  /**
   * Records realtime token usage for the current room attempt without blocking practice.
   */
  const reportRealtimeUsage = useCallback(
    async (usage: {
      eventId: string;
      model: string;
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    }) => {
      await fetch("/api/openai/usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...usage,
          source: "realtime",
          moduleId: scenario.moduleId,
          scenarioId: scenario.id,
          attemptId: attemptIdRef.current ?? undefined,
        }),
      }).catch(() => undefined);
    },
    [scenario.id, scenario.moduleId],
  );

  const agentASession = useRealtimeVoiceSession(
    effectiveAgentA.role,
    `Interpreter -> ${effectiveAgentA.role}`,
    {
      onTranscriptStart: addTranscriptEntry,
      onTranscriptUpdate: updateTranscriptEntry,
      onTranscriptComplete: completeTranscriptEntry,
      onUsage: (usage) => {
        void reportRealtimeUsage(usage);
      },
      onError: handleRealtimeWarning,
    },
  );

  const agentBSession = useRealtimeVoiceSession(
    agentBConfig.role,
    `Interpreter -> ${agentBConfig.role}`,
    {
      onTranscriptStart: addTranscriptEntry,
      onTranscriptUpdate: updateTranscriptEntry,
      onTranscriptComplete: completeTranscriptEntry,
      onUsage: (usage) => {
        void reportRealtimeUsage(usage);
      },
      onError: handleRealtimeWarning,
    },
  );

  const fetchEphemeralKey = useCallback(async () => {
    const response = await fetch("/api/openai/realtime-session");

    if (!response.ok) {
      const body = await response.text();
      throw new Error(body || "Failed to create realtime session.");
    }

    const data = await response.json();

    if (!data?.value) {
      throw new Error("No OpenAI realtime client secret was returned.");
    }

    return data.value as string;
  }, []);

  const getSessionBundle = useCallback(
    (agentKey: AgentKey) => {
      if (agentKey === "agent_a") {
        return {
          agent: agentA,
          session: agentASession,
          audioElement: agentAAudioRef.current,
        };
      }

      return {
        agent: agentB,
        session: agentBSession,
        audioElement: agentBAudioRef.current,
      };
    },
    [agentA, agentASession, agentB, agentBSession],
  );

  const ensureAudioPlayback = useCallback(
    async (audioElement: HTMLAudioElement | null) => {
      if (!audioElement) {
        return;
      }

      audioElement.autoplay = true;
      audioElement.setAttribute("playsinline", "true");
      audioElement.muted = false;
      audioElement.volume = 1;

      try {
        await audioElement.play();
        setAudioNotice(null);
      } catch {
        setAudioNotice(
          "Browser audio playback is blocked. Press Enable audio and try again.",
        );
      }
    },
    [],
  );

  const connectAgentIfNeeded = useCallback(
    async (agentKey: AgentKey) => {
      if (connectedAgentsRef.current.has(agentKey)) {
        return;
      }

      const bundle = getSessionBundle(agentKey);

      if (!bundle.audioElement) {
        throw new Error("Audio output is not ready yet.");
      }

      setupAgentAudioEventListeners(agentKey, bundle.audioElement);

      await bundle.session.connect({
        getEphemeralKey: fetchEphemeralKey,
        agent: bundle.agent,
        audioElement: bundle.audioElement,
      });

      bundle.session.setTurnDetectionEnabled(false);
      await ensureAudioPlayback(bundle.audioElement);
      connectedAgentsRef.current.add(agentKey);
    },
    [
      ensureAudioPlayback,
      fetchEphemeralKey,
      getSessionBundle,
      setupAgentAudioEventListeners,
    ],
  );

  const switchActiveAgent = useCallback(
    async (agentKey: AgentKey) => {
      const currentKey = activeAgent;

      if (currentKey !== agentKey) {
        setActiveAgent(agentKey);
      }

      if (
        currentKey &&
        currentKey !== agentKey &&
        connectedAgentsRef.current.has(currentKey)
      ) {
        const currentBundle = getSessionBundle(currentKey);
        currentBundle.session.mute(true);
      }

      if (!connectedAgentsRef.current.has(agentKey)) {
        try {
          await connectAgentIfNeeded(agentKey);
        } catch (connectErr) {
          console.error(
            "[PracticeRoomRunner] Failed to connect agent on switch",
            agentKey,
            connectErr,
          );
          setError(
            connectErr instanceof Error
              ? connectErr.message
              : "Failed to connect the selected participant.",
          );
          return;
        }
      }

      const nextBundle = getSessionBundle(agentKey);
      nextBundle.session.mute(false);
      void ensureAudioPlayback(nextBundle.audioElement);
    },
    [activeAgent, connectAgentIfNeeded, ensureAudioPlayback, getSessionBundle],
  );

  const disconnectAll = useCallback(() => {
    agentASession.disconnect();
    agentBSession.disconnect();
    connectedAgentsRef.current.clear();
    setActiveAgent(null);
    setIsPushToTalkActive(false);
    setSpeakingKey(null);
  }, [agentASession, agentBSession]);

  useEffect(() => {
    if (agentAAudioRef.current) {
      setupAgentAudioEventListeners("agent_a", agentAAudioRef.current);
    }
    if (agentBAudioRef.current) {
      setupAgentAudioEventListeners("agent_b", agentBAudioRef.current);
    }
  }, [setupAgentAudioEventListeners]);

  const handleStartPractice = useCallback(async () => {
    if (isStarting) {
      return;
    }

    if (
      !isClerkLoaded ||
      !isSignedIn ||
      isConvexAuthLoading ||
      !isConvexAuthenticated
    ) {
      setError(
        isClerkLoaded && isSignedIn
          ? "You are signed into Clerk, but Convex is not authenticated. Check Clerk Convex JWT template configuration."
          : "You need to sign in before starting practice.",
      );
      return;
    }

    setError(null);
    setAudioNotice(null);
    setTranscriptEntries([]);
    setTranslatedTranscriptTextById({});
    setTranslatingEntryIds({});
    setTranslationErrorsById({});
    setIsStarting(true);

    try {
      const nextAttemptId = crypto.randomUUID();
      await startAttempt({
        id: nextAttemptId,
        moduleId: scenario.moduleId,
        scenarioId: scenario.id,
      });

      attemptIdRef.current = nextAttemptId;
      setAttemptId(nextAttemptId);
      setSessionStartedAt(Date.now());

      const openingSpeaker = effectiveScenario.practiceRuntime.openingSpeaker;
      await switchActiveAgent(openingSpeaker);

      const openingSession =
        openingSpeaker === "agent_a" ? agentASession : agentBSession;
      const openingAgent =
        openingSpeaker === "agent_a" || !hasSecondAgent
          ? effectiveAgentA
          : agentBConfig;

      openingSession.sendHiddenInstruction(
        `Begin the interpreter role-play now. Address the interpreter and open with this line or its natural equivalent: ${
          openingAgent.openingLine ??
          "Introduce the scenario and ask your first question."
        }`,
      );
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to start practice.";
      setError(message);
      disconnectAll();
    } finally {
      setIsStarting(false);
    }
  }, [
    agentASession,
    agentBSession,
    disconnectAll,
    isClerkLoaded,
    isConvexAuthenticated,
    isConvexAuthLoading,
    isSignedIn,
    isStarting,
    agentBConfig,
    hasSecondAgent,
    effectiveScenario,
    effectiveAgentA,
    scenario.moduleId,
    scenario.id,
    startAttempt,
    switchActiveAgent,
  ]);

  /**
   * Stops all agent audio playback immediately and clears speaking state.
   * Called when the interpreter starts recording so the microphone does not
   * pick up any agent speech mid-phrase.
   */
  const stopAllAgentPlayback = useCallback(() => {
    const audioA = agentAAudioRef.current;
    if (audioA && !audioA.paused) {
      try {
        audioA.pause();
        audioA.currentTime = 0;
      } catch {
        // Some browsers throw on currentTime assignment for streaming media; ignore.
      }
    }
    clearSpeakingForAgent("agent_a");

    const audioB = agentBAudioRef.current;
    if (audioB && !audioB.paused) {
      try {
        audioB.pause();
        audioB.currentTime = 0;
      } catch {
        // Some browsers throw on currentTime assignment for streaming media; ignore.
      }
    }
    clearSpeakingForAgent("agent_b");
  }, [clearSpeakingForAgent]);

  const handlePushToTalkStart = useCallback(() => {
    if (!activeAgent) {
      return;
    }

    stopAllAgentPlayback();
    const bundle = getSessionBundle(activeAgent);
    bundle.session.startPushToTalk();
    setIsPushToTalkActive(true);
    markSpeaking("interpreter");
  }, [activeAgent, getSessionBundle, markSpeaking, stopAllAgentPlayback]);

  const handlePushToTalkEnd = useCallback(() => {
    if (!activeAgent || !isPushToTalkActive) {
      return;
    }

    const bundle = getSessionBundle(activeAgent);
    bundle.session.stopPushToTalk();
    setIsPushToTalkActive(false);
    void ensureAudioPlayback(bundle.audioElement);
  }, [activeAgent, ensureAudioPlayback, getSessionBundle, isPushToTalkActive]);

  const sessionIsLive = Boolean(attemptId);

  /**
   * Selects the next active target participant in a stable A/B loop.
   */
  const toggleActiveAgent = useCallback(() => {
    if (!sessionIsLive) {
      return;
    }

    if (!hasSecondAgent) {
      void switchActiveAgent("agent_a");
      return;
    }

    const nextAgent: AgentKey =
      activeAgent === "agent_a"
        ? "agent_b"
        : activeAgent === "agent_b"
          ? "agent_a"
          : "agent_a";
    void switchActiveAgent(nextAgent);
  }, [activeAgent, hasSecondAgent, sessionIsLive, switchActiveAgent]);

  useEffect(() => {
    if (!sessionIsLive) {
      spaceKeyDownAtRef.current = null;
      spaceHoldActiveRef.current = false;
      if (spaceHoldTimeoutRef.current) {
        window.clearTimeout(spaceHoldTimeoutRef.current);
      }
      return;
    }

    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) {
        return false;
      }

      const tagName = target.tagName.toLowerCase();
      return (
        tagName === "input" ||
        tagName === "textarea" ||
        target.isContentEditable
      );
    };

    const holdThresholdMs = 220;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.code !== "Space" ||
        event.repeat ||
        isTypingTarget(event.target)
      ) {
        return;
      }

      event.preventDefault();

      if (spaceKeyDownAtRef.current !== null) {
        return;
      }

      stopAllAgentPlayback();

      spaceKeyDownAtRef.current = Date.now();
      spaceHoldActiveRef.current = false;
      spaceHoldTimeoutRef.current = window.setTimeout(() => {
        spaceHoldActiveRef.current = true;
        handlePushToTalkStart();
      }, holdThresholdMs);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code !== "Space" || isTypingTarget(event.target)) {
        return;
      }

      event.preventDefault();

      const keyDownAt = spaceKeyDownAtRef.current;
      spaceKeyDownAtRef.current = null;
      if (spaceHoldTimeoutRef.current) {
        window.clearTimeout(spaceHoldTimeoutRef.current);
      }

      const elapsed = keyDownAt ? Date.now() - keyDownAt : 0;
      if (spaceHoldActiveRef.current || elapsed >= holdThresholdMs) {
        spaceHoldActiveRef.current = false;
        handlePushToTalkEnd();
      } else {
        toggleActiveAgent();
      }
    };

    const handleWindowBlur = () => {
      spaceKeyDownAtRef.current = null;
      if (spaceHoldTimeoutRef.current) {
        window.clearTimeout(spaceHoldTimeoutRef.current);
      }

      if (spaceHoldActiveRef.current) {
        spaceHoldActiveRef.current = false;
        handlePushToTalkEnd();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [
    handlePushToTalkEnd,
    handlePushToTalkStart,
    sessionIsLive,
    stopAllAgentPlayback,
    toggleActiveAgent,
  ]);

  useEffect(() => {
    return () => {
      if (countdownTimeoutRef.current) {
        window.clearTimeout(countdownTimeoutRef.current);
      }
      if (spaceHoldTimeoutRef.current) {
        window.clearTimeout(spaceHoldTimeoutRef.current);
      }
      if (speakingTimeoutRef.current) {
        window.clearTimeout(speakingTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Starts a visible countdown before opening the realtime session.
   */
  const beginStartCountdown = useCallback(() => {
    if (
      sessionIsLive ||
      isStarting ||
      countdownValue !== null ||
      !canStartPractice
    ) {
      return;
    }

    setError(null);
    setCountdownValue(5);
  }, [canStartPractice, countdownValue, isStarting, sessionIsLive]);

  useEffect(() => {
    if (countdownValue === null) {
      return;
    }

    if (countdownValue <= 1) {
      setCountdownValue(null);
      void handleStartPractice();
      return;
    }

    countdownTimeoutRef.current = window.setTimeout(() => {
      setCountdownValue((current) => (current !== null ? current - 1 : null));
    }, 1000);

    return () => {
      if (countdownTimeoutRef.current) {
        window.clearTimeout(countdownTimeoutRef.current);
      }
    };
  }, [countdownValue, handleStartPractice]);

  const handleFinishPractice = useCallback(async () => {
    if (
      !attemptId ||
      !sessionStartedAt ||
      transcriptEntries.length === 0 ||
      isAssessing
    ) {
      return;
    }

    setIsAssessing(true);
    setError(null);

    try {
      disconnectAll();

      const response = await fetch("/api/practice/assess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenario: effectiveScenario,
          transcriptEntries,
          attemptId,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || "Assessment failed.");
      }

      const nextAssessment = await response.json();
      const endedAt = new Date().toISOString();
      const durationSeconds = Math.max(
        30,
        Math.round((Date.now() - sessionStartedAt) / 1000),
      );
      const durationMinutes = formatMinutes(durationSeconds);
      const transcriptSummary = summarizeTranscript(transcriptEntries);

      await completeAttempt({
        id: attemptId,
        endedAt,
        durationSeconds,
        durationMinutes,
        score: Math.round(nextAssessment.overallScore),
        completionStatus: nextAssessment.completionDecision,
        transcriptSummary,
        transcriptEntries,
        assessment: {
          ...nextAssessment,
          overallScore: Math.round(nextAssessment.overallScore),
        },
      });

      attemptIdRef.current = null;
      setAttemptId(null);
      setSessionStartedAt(null);
      router.push(`/practice/${scenario.id}?attemptId=${attemptId}&fromRoom=1`);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to complete practice.";
      setError(message);
    } finally {
      setIsAssessing(false);
    }
  }, [
    attemptId,
    completeAttempt,
    disconnectAll,
    effectiveScenario,
    isAssessing,
    router,
    scenario.id,
    sessionStartedAt,
    transcriptEntries,
  ]);

  /**
   * Translates a single transcript entry into English without mutating the source transcript.
   */
  const handleTranslateTranscriptEntry = useCallback(
    async (entryId: string, text: string) => {
      const trimmedText = text.trim();

      if (
        !trimmedText ||
        translatingEntryIds[entryId] ||
        translatedTranscriptTextById[entryId]
      ) {
        return;
      }

      setTranslationErrorsById((current) => {
        if (!(entryId in current)) {
          return current;
        }

        const next = { ...current };
        delete next[entryId];
        return next;
      });
      setTranslatingEntryIds((current) => ({
        ...current,
        [entryId]: true,
      }));

      try {
        const response = await fetch("/api/practice/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: trimmedText,
            moduleId: scenario.moduleId,
            scenarioId: scenario.id,
            attemptId: attemptIdRef.current ?? undefined,
          }),
        });

        if (!response.ok) {
          const body = await response.text();
          throw new Error(body || "Translation failed.");
        }

        const data = (await response.json()) as { translation?: string };
        const translation =
          typeof data.translation === "string" ? data.translation.trim() : "";

        if (!translation) {
          throw new Error("Translation failed.");
        }

        setTranslatedTranscriptTextById((current) => ({
          ...current,
          [entryId]: translation,
        }));
      } catch (caughtError) {
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "Translation failed.";
        setTranslationErrorsById((current) => ({
          ...current,
          [entryId]: message,
        }));
      } finally {
        setTranslatingEntryIds((current) => {
          const next = { ...current };
          delete next[entryId];
          return next;
        });
      }
    },
    [
      scenario.id,
      scenario.moduleId,
      translatedTranscriptTextById,
      translatingEntryIds,
    ],
  );

  const visibleTranscriptEntries = transcriptEntries.filter((entry) =>
    entry.text.trim(),
  );

  /**
   * Smoothly scrolls the transcript container to its bottom with an ease-in-out curve.
   * Uses requestAnimationFrame for a buttery animation over 400ms.
   */
  const scrollTranscriptToBottom = useCallback(() => {
    const container = transcriptScrollContainerRef.current;
    if (!container) return;

    const startScrollTop = container.scrollTop;
    const endScrollTop = container.scrollHeight - container.clientHeight;
    const distance = endScrollTop - startScrollTop;

    if (Math.abs(distance) < 1) return;

    const duration = 400;
    let startTime: number | null = null;

    /**
     * Per-frame animation step applying cubic ease-in-out interpolation.
     */
    const animateStep = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      container.scrollTop = startScrollTop + distance * eased;
      if (progress < 1) {
        window.requestAnimationFrame(animateStep);
      }
    };

    window.requestAnimationFrame(animateStep);
  }, []);

  useEffect(() => {
    scrollTranscriptToBottom();
  }, [
    visibleTranscriptEntries,
    translatedTranscriptTextById,
    translatingEntryIds,
    translationErrorsById,
    scrollTranscriptToBottom,
  ]);

  const locationLine = `You are at ${scenario.title}`;

  /**
   * Returns a human-readable participant label for the currently active relay target.
   */
  const activeConversationLabel = useMemo(() => {
    if (activeAgent === "agent_a") {
      return `${effectiveAgentA.name} (${effectiveAgentA.role})`;
    }
    if (activeAgent === "agent_b") {
      return `${agentBConfig.name} (${agentBConfig.role})`;
    }
    return notStartedLabel;
  }, [
    activeAgent,
    effectiveAgentA.name,
    effectiveAgentA.role,
    agentBConfig.name,
    agentBConfig.role,
  ]);

  /**
   * Returns the active AI speaking label for transcript status text.
   */
  const speakingAgentLabel = useMemo(() => {
    if (speakingKey === "agent_a") {
      return `${effectiveAgentA.name} speaking...`;
    }

    if (speakingKey === "agent_b") {
      return `${agentBConfig.name} speaking...`;
    }

    return null;
  }, [agentBConfig.name, effectiveAgentA.name, speakingKey]);

  /**
   * Resolves avatar artwork for transcript entries from speaker names.
   */
  function getAvatarForSpeaker(speaker: string) {
    if (speaker === effectiveAgentA.role || speaker === effectiveAgentA.name) {
      return effectiveAgentA.avatarImageUrl;
    }
    if (speaker === agentBConfig.role || speaker === agentBConfig.name) {
      return agentBConfig.avatarImageUrl;
    }
    return undefined;
  }

  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-line bg-white">
      <audio ref={agentAAudioRef} autoPlay playsInline className="sr-only" />
      <audio ref={agentBAudioRef} autoPlay playsInline className="sr-only" />

      <section className="grid h-auto xl:grid-cols-[1fr_360px]">
        <section className="relative min-h-0 overflow-y-auto p-8 sm:p-12">
          <p className="text-xl font-semibold text-[#8e8e8e]">{locationLine}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
            {hasSecondAgent
              ? `Help ${effectiveAgentA.name} with ${agentBConfig.name}`
              : `Interpret for ${effectiveAgentA.name}`}
          </h1>

          {countdownValue !== null ? (
            <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
              <div className="rounded-full bg-black/85 px-12 py-8 text-8xl font-semibold text-white">
                {countdownValue}
              </div>
            </div>
          ) : null}

          {activeConversationLabel !== notStartedLabel && (
            <div className="mt-4 inline-flex rounded-full border border-line bg-white/90 px-4 py-2 text-sm font-semibold text-black">
              You are currently talking to {activeConversationLabel}
            </div>
          )}

          <div
            className={`mt-14 grid gap-8 items-center justify-center justify-items-center ${
              hasSecondAgent ? "md:grid-cols-2" : "md:grid-cols-1"
            }`}
          >
            {hasSecondAgent ? (
              <ParticipantAvatar
                label={agentBConfig.name}
                subLabel={agentBConfig.role + " ● " + agentBConfig.language}
                imageUrl={agentBConfig.avatarImageUrl}
                initials={getInitials(agentBConfig.name || agentBConfig.role)}
                isSpeaking={speakingKey === "agent_b"}
                isActive={activeAgent === "agent_b"}
                onSelect={() => void switchActiveAgent("agent_b")}
              />
            ) : null}
            <ParticipantAvatar
              label={effectiveAgentA.name}
              subLabel={effectiveAgentA.role + " ● " + effectiveAgentA.language}
              imageUrl={effectiveAgentA.avatarImageUrl}
              initials={getInitials(
                effectiveAgentA.name || effectiveAgentA.role,
              )}
              isSpeaking={speakingKey === "agent_a"}
              isActive={activeAgent === "agent_a"}
              onSelect={() => void switchActiveAgent("agent_a")}
            />
          </div>

          <div className="mt-10 flex flex-col items-center">
            <button
              type="button"
              onMouseDown={handlePushToTalkStart}
              onMouseUp={handlePushToTalkEnd}
              onMouseLeave={handlePushToTalkEnd}
              onTouchStart={handlePushToTalkStart}
              onTouchEnd={handlePushToTalkEnd}
              disabled={!sessionIsLive || !activeAgent}
              className={`flex h-[220px] w-[220px] items-center justify-center rounded-full ${
                isPushToTalkActive ? "bg-[#001EFF]" : "bg-black"
              } text-white disabled:opacity-60`}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden
                className="h-16 w-16"
                fill="currentColor"
              >
                <rect x="3" y="10" width="3" height="4" rx="1.5" />
                <rect x="8" y="8" width="3" height="8" rx="1.5" />
                <rect x="13" y="6" width="3" height="12" rx="1.5" />
                <rect x="18" y="9" width="3" height="6" rx="1.5" />
              </svg>
            </button>
            <div className="mt-4 text-[32px] font-semibold leading-none tracking-[-0.03em] text-black">
              You
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between text-xl font-semibold text-[#8d8d8d]">
            <div>
              {hasSecondAgent
                ? "Press Spacebar to change participant"
                : "Single-agent scenario"}
            </div>
            <div>Hold Spacebar to talk</div>
          </div>

          {!sessionIsLive ? (
            <div className="mt-6">
              <button
                type="button"
                onClick={beginStartCountdown}
                disabled={isStarting || !canStartPractice}
                className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isStarting ? "Starting..." : "Start practice"}
              </button>
              <p className="mt-3 text-sm text-[#6d6d6d]">
                Start to hear the opening line, then hold the mic button (or
                hold Spacebar) to interpret.
              </p>
            </div>
          ) : null}

          {audioNotice ? (
            <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {audioNotice}
              <button
                type="button"
                onClick={() =>
                  void ensureAudioPlayback(
                    activeAgent === "agent_a"
                      ? agentAAudioRef.current
                      : activeAgent === "agent_b"
                        ? agentBAudioRef.current
                        : null,
                  )
                }
                className="ml-3 underline"
              >
                Enable audio
              </button>
            </div>
          ) : null}
          {error ? (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
              <button
                type="button"
                onClick={() => {
                  beginStartCountdown();
                }}
                className="ml-3 underline"
              >
                Retry
              </button>
            </div>
          ) : null}
        </section>

        <aside className="relative flex h-full min-h-0 flex-col bg-black px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-[40px] font-semibold leading-none tracking-[-0.03em]">
              Transcript
            </h2>
            <button
              type="button"
              className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/75"
            >
              Language
            </button>
          </div>
          {speakingAgentLabel ? (
            <div className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#7aa2ff]">
              {speakingAgentLabel}
            </div>
          ) : null}

          <div
            ref={transcriptScrollContainerRef}
            className="mt-6 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 max-h-[70vh]"
          >
            {visibleTranscriptEntries.map((entry) =>
              (() => {
                const displayedText =
                  translatedTranscriptTextById[entry.id] ?? entry.text;
                const isTranslating = Boolean(translatingEntryIds[entry.id]);
                const translationError = translationErrorsById[entry.id];
                const hasTranslation = Boolean(
                  translatedTranscriptTextById[entry.id],
                );

                return (
                  <div
                    key={entry.id}
                    className={`flex items-start gap-3 ${
                      entry.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {entry.role !== "user" ? (
                      <div className="mt-1 h-10 w-10 overflow-hidden rounded-full bg-[#adadad]">
                        {getAvatarForSpeaker(entry.speaker) ? (
                          // Uses a native image element to avoid Next.js optimizer issues with signed Convex URLs.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={getAvatarForSpeaker(entry.speaker)!}
                            alt={entry.speaker}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : null}
                      </div>
                    ) : null}
                    <div
                      className={`max-w-[78%] rounded-[20px] px-4 py-3 text-sm leading-5 ${
                        entry.role === "user"
                          ? "bg-white text-black"
                          : "bg-[#2f2f2f] text-white"
                      }`}
                    >
                      <div className="mb-1 flex items-start justify-between gap-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] opacity-70">
                          {entry.speaker}
                        </div>
                        {!hasTranslation ? (
                          <button
                            type="button"
                            onClick={() =>
                              void handleTranslateTranscriptEntry(
                                entry.id,
                                entry.text,
                              )
                            }
                            disabled={isTranslating}
                            className={`shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                              entry.role === "user"
                                ? "text-black/60"
                                : "text-white/70"
                            } disabled:opacity-50`}
                          >
                            Translate
                          </button>
                        ) : (
                          <div
                            className={`shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                              entry.role === "user"
                                ? "text-black/55"
                                : "text-white/60"
                            }`}
                          >
                            English
                          </div>
                        )}
                      </div>
                      {displayedText}
                      {translationError ? (
                        <div className="mt-2 text-[11px] text-[#ff8f8f]">
                          {translationError}
                        </div>
                      ) : null}
                    </div>
                    {isTranslating ? (
                      <div
                        className="mt-3 h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-[#7aa2ff]"
                        aria-label="Translating"
                        role="status"
                      />
                    ) : null}
                    {entry.role === "user" ? (
                      <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xs font-semibold text-black">
                        You
                      </div>
                    ) : null}
                  </div>
                );
              })(),
            )}
            {visibleTranscriptEntries.length === 0 ? (
              <p className="text-sm text-white/65">
                Transcript appears here once the conversation starts.
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={sessionIsLive ? handleFinishPractice : beginStartCountdown}
            disabled={
              (sessionIsLive && isAssessing) ||
              (!sessionIsLive && (isStarting || countdownValue !== null))
            }
            className={`mt-4 flex h-[60px] items-center justify-between rounded-[20px] px-7 text-3xl font-medium  disabled:opacity-60 ${
              sessionIsLive
                ? "bg-[#001EFF] text-white"
                : "bg-brand-green text-black"
            }`}
          >
            <span>
              {sessionIsLive
                ? isAssessing
                  ? "Finishing..."
                  : "Finish"
                : countdownValue !== null
                  ? `Start in ${countdownValue}`
                  : "Start"}
            </span>
            <span className="inline-flex h-8 w-8 items-center justify-center text-[#001EFF]">
              {sessionIsLive ? "→" : "▶"}
            </span>
          </button>
        </aside>
      </section>
    </div>
  );
}
