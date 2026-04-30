"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useConvexAuth, useMutation } from "convex/react";
import { RealtimeAgent } from "@openai/agents/realtime";
import { api } from "@/convex/_generated/api";
import { buildRealtimeAgentInstructions } from "@/lib/ai";
import { useRealtimeVoiceSession } from "@/components/practice/use-realtime-voice-session";
import type { Scenario } from "@/types/scenario";
import type { TranscriptEntry } from "@/types/session";

type AgentKey = "agent_a" | "agent_b";
type SpeakingKey = AgentKey | "interpreter" | null;

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
}: {
  label: string;
  subLabel: string;
  imageUrl?: string;
  initials: string;
  isSpeaking: boolean;
}) {
  return (
    <div className="flex w-full max-w-[220px] flex-col items-center gap-3">
      <div className="relative">
        {isSpeaking ? (
          <span className="avatar-speaking-ring" aria-hidden />
        ) : null}
        <div className="relative z-10 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-line bg-white text-xl font-semibold">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={label}
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-muted">{subLabel}</div>
      </div>
    </div>
  );
}

export function PracticeRoomRunner({ scenario }: PracticeRoomRunnerProps) {
  const router = useRouter();
  const { isLoaded: isClerkLoaded, isSignedIn } = useAuth();
  const {
    isAuthenticated: isConvexAuthenticated,
    isLoading: isConvexAuthLoading,
  } = useConvexAuth();
  const startAttempt = useMutation(api.sessions.startAttempt);
  const completeAttempt = useMutation(api.sessions.completeAttempt);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [activeAgent, setActiveAgent] = useState<AgentKey | null>(null);
  const [speakingKey, setSpeakingKey] = useState<SpeakingKey>(null);
  const [textRelay, setTextRelay] = useState("");
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const [audioNotice, setAudioNotice] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isAssessing, setIsAssessing] = useState(false);
  const [isPushToTalkActive, setIsPushToTalkActive] = useState(false);
  const isSpaceTalkingRef = useRef(false);
  const speakingTimeoutRef = useRef<number | null>(null);
  const agentAAudioRef = useRef<HTMLAudioElement | null>(null);
  const agentBAudioRef = useRef<HTMLAudioElement | null>(null);
  const connectedAgentsRef = useRef<Set<AgentKey>>(new Set());

  const markSpeaking = useCallback((key: SpeakingKey) => {
    if (speakingTimeoutRef.current) {
      window.clearTimeout(speakingTimeoutRef.current);
      speakingTimeoutRef.current = null;
    }
    setSpeakingKey(key);
    if (key) {
      speakingTimeoutRef.current = window.setTimeout(() => {
        setSpeakingKey(null);
      }, 1100);
    }
  }, []);

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
        if (entry.speaker === scenario.aiAgentA.role) {
          markSpeaking("agent_a");
        } else if (entry.speaker === scenario.aiAgentB.role) {
          markSpeaking("agent_b");
        }
      }
    },
    [markSpeaking, scenario.aiAgentA.role, scenario.aiAgentB.role],
  );

  const updateTranscriptEntry = useCallback(
    (entryId: string, text: string, append: boolean) => {
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
        name: scenario.aiAgentA.name,
        voice: scenario.aiAgentA.voice,
        handoffs: [],
        tools: [],
        handoffDescription: `${scenario.aiAgentA.role} in ${scenario.title}`,
        instructions: buildRealtimeAgentInstructions(
          scenario,
          scenario.aiAgentA,
          scenario.aiAgentB,
        ),
      }),
    [scenario],
  );

  const agentB = useMemo(
    () =>
      new RealtimeAgent({
        name: scenario.aiAgentB.name,
        voice: scenario.aiAgentB.voice,
        handoffs: [],
        tools: [],
        handoffDescription: `${scenario.aiAgentB.role} in ${scenario.title}`,
        instructions: buildRealtimeAgentInstructions(
          scenario,
          scenario.aiAgentB,
          scenario.aiAgentA,
        ),
      }),
    [scenario],
  );

  const agentASession = useRealtimeVoiceSession(
    scenario.aiAgentA.role,
    `Interpreter -> ${scenario.aiAgentA.role}`,
    {
      onTranscriptStart: addTranscriptEntry,
      onTranscriptUpdate: updateTranscriptEntry,
      onTranscriptComplete: completeTranscriptEntry,
      onError: setError,
    },
  );

  const agentBSession = useRealtimeVoiceSession(
    scenario.aiAgentB.role,
    `Interpreter -> ${scenario.aiAgentB.role}`,
    {
      onTranscriptStart: addTranscriptEntry,
      onTranscriptUpdate: updateTranscriptEntry,
      onTranscriptComplete: completeTranscriptEntry,
      onError: setError,
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

      await bundle.session.connect({
        getEphemeralKey: fetchEphemeralKey,
        agent: bundle.agent,
        audioElement: bundle.audioElement,
      });

      bundle.session.setTurnDetectionEnabled(false);
      await ensureAudioPlayback(bundle.audioElement);
      connectedAgentsRef.current.add(agentKey);
    },
    [ensureAudioPlayback, fetchEphemeralKey, getSessionBundle],
  );

  const switchActiveAgent = useCallback(
    async (agentKey: AgentKey) => {
      await connectAgentIfNeeded(agentKey);

      const currentKey = activeAgent;
      const nextBundle = getSessionBundle(agentKey);

      if (
        currentKey &&
        currentKey !== agentKey &&
        connectedAgentsRef.current.has(currentKey)
      ) {
        const currentBundle = getSessionBundle(currentKey);
        currentBundle.session.mute(true);
      }

      nextBundle.session.mute(false);
      void ensureAudioPlayback(nextBundle.audioElement);
      setActiveAgent(agentKey);
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
    setIsStarting(true);

    try {
      const nextAttemptId = crypto.randomUUID();
      await startAttempt({
        id: nextAttemptId,
        moduleId: scenario.moduleId,
        scenarioId: scenario.id,
      });

      setAttemptId(nextAttemptId);
      setSessionStartedAt(Date.now());

      const openingSpeaker = scenario.practiceRuntime.openingSpeaker;
      await switchActiveAgent(openingSpeaker);

      const openingSession =
        openingSpeaker === "agent_a" ? agentASession : agentBSession;
      const openingAgent =
        openingSpeaker === "agent_a" ? scenario.aiAgentA : scenario.aiAgentB;

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
    scenario,
    startAttempt,
    switchActiveAgent,
  ]);

  const handleSendRelay = useCallback(() => {
    if (!textRelay.trim() || !activeAgent) {
      return;
    }

    const bundle = getSessionBundle(activeAgent);
    bundle.session.interrupt();
    bundle.session.sendInterpreterText(textRelay.trim());
    setTextRelay("");
  }, [activeAgent, getSessionBundle, textRelay]);

  const handlePushToTalkStart = useCallback(() => {
    if (!activeAgent) {
      return;
    }

    const bundle = getSessionBundle(activeAgent);
    bundle.session.startPushToTalk();
    setIsPushToTalkActive(true);
    markSpeaking("interpreter");
  }, [activeAgent, getSessionBundle, markSpeaking]);

  const handlePushToTalkEnd = useCallback(() => {
    if (!activeAgent || !isPushToTalkActive) {
      return;
    }

    const bundle = getSessionBundle(activeAgent);
    bundle.session.stopPushToTalk();
    setIsPushToTalkActive(false);
  }, [activeAgent, getSessionBundle, isPushToTalkActive]);

  const sessionIsLive = Boolean(attemptId);

  useEffect(() => {
    if (!sessionIsLive) {
      isSpaceTalkingRef.current = false;
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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.code !== "Space" ||
        event.repeat ||
        isTypingTarget(event.target)
      ) {
        return;
      }

      event.preventDefault();

      if (!isSpaceTalkingRef.current) {
        isSpaceTalkingRef.current = true;
        handlePushToTalkStart();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code !== "Space" || isTypingTarget(event.target)) {
        return;
      }

      event.preventDefault();

      if (isSpaceTalkingRef.current) {
        isSpaceTalkingRef.current = false;
        handlePushToTalkEnd();
      }
    };

    const handleWindowBlur = () => {
      if (isSpaceTalkingRef.current) {
        isSpaceTalkingRef.current = false;
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
  }, [handlePushToTalkEnd, handlePushToTalkStart, sessionIsLive]);

  useEffect(() => {
    return () => {
      if (speakingTimeoutRef.current) {
        window.clearTimeout(speakingTimeoutRef.current);
      }
    };
  }, []);

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
          scenario,
          transcriptEntries,
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
    isAssessing,
    router,
    scenario,
    sessionStartedAt,
    transcriptEntries,
  ]);

  const canStartPractice =
    isClerkLoaded &&
    isSignedIn &&
    isConvexAuthenticated &&
    !isConvexAuthLoading;
  const activeTargetName =
    activeAgent === "agent_a"
      ? scenario.aiAgentA.role
      : activeAgent === "agent_b"
        ? scenario.aiAgentB.role
        : null;

  const visibleTranscriptEntries = transcriptEntries.filter((entry) =>
    entry.text.trim(),
  );

  return (
    <div className="space-y-6">
      <audio ref={agentAAudioRef} autoPlay playsInline className="sr-only" />
      <audio ref={agentBAudioRef} autoPlay playsInline className="sr-only" />

      <section className="section-frame rounded-[2.25rem] p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Practice room</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em]">
              {scenario.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
              {scenario.description}
            </p>
          </div>
          <Link
            href={`/modules/${scenario.moduleId}`}
            className="action-secondary px-4 py-2 text-sm"
          >
            Exit room
          </Link>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <section className="surface-card rounded-[2rem] p-6">
          <div className="rounded-[1.5rem] border border-line bg-white p-4 text-sm text-muted">
            <div className="font-semibold text-foreground">
              How to run the practice room
            </div>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Select which participant to relay to.</li>
              <li>
                Hold `Space` or the talk button to speak your interpretation.
              </li>
              <li>
                Use text relay only for quick testing or noisy environments.
              </li>
              <li>
                Press `Finish` to calculate score and open your results
                breakdown.
              </li>
            </ul>
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-line bg-white p-6">
            <div className="flex flex-wrap items-start justify-center gap-6">
              <ParticipantAvatar
                label={scenario.aiAgentA.name}
                subLabel={scenario.aiAgentA.role}
                imageUrl={scenario.aiAgentA.avatarImageUrl}
                initials={getInitials(
                  scenario.aiAgentA.name || scenario.aiAgentA.role,
                )}
                isSpeaking={speakingKey === "agent_a"}
              />
              <ParticipantAvatar
                label="You"
                subLabel={scenario.practiceRuntime.interpreterRole}
                initials="ME"
                isSpeaking={speakingKey === "interpreter" || isPushToTalkActive}
              />
              <ParticipantAvatar
                label={scenario.aiAgentB.name}
                subLabel={scenario.aiAgentB.role}
                imageUrl={scenario.aiAgentB.avatarImageUrl}
                initials={getInitials(
                  scenario.aiAgentB.name || scenario.aiAgentB.role,
                )}
                isSpeaking={speakingKey === "agent_b"}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {!sessionIsLive ? (
              <button
                type="button"
                onClick={handleStartPractice}
                disabled={isStarting || !canStartPractice}
                className="action-primary disabled:opacity-50"
              >
                {isConvexAuthLoading
                  ? "Checking access..."
                  : isStarting
                    ? "Starting..."
                    : "Start practice"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishPractice}
                disabled={isAssessing}
                className="action-primary bg-[#001EFF] disabled:opacity-50"
              >
                {isAssessing ? "Calculating score..." : "Finish"}
              </button>
            )}
            {sessionIsLive ? (
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
                className="action-secondary"
              >
                Enable audio
              </button>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!sessionIsLive}
              onClick={() => void switchActiveAgent("agent_a")}
              className={`rounded-full border px-4 py-2 text-sm font-medium ${
                activeAgent === "agent_a"
                  ? "border-brand bg-brand text-white"
                  : "border-line bg-white text-foreground"
              } disabled:opacity-50`}
            >
              Relay to {scenario.aiAgentA.role}
            </button>
            <button
              type="button"
              disabled={!sessionIsLive}
              onClick={() => void switchActiveAgent("agent_b")}
              className={`rounded-full border px-4 py-2 text-sm font-medium ${
                activeAgent === "agent_b"
                  ? "border-brand bg-brand text-white"
                  : "border-line bg-white text-foreground"
              } disabled:opacity-50`}
            >
              Relay to {scenario.aiAgentB.role}
            </button>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-line bg-white p-4">
            <div className="text-sm font-semibold">
              Active target: {activeTargetName ?? "Not started"}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <input
                value={textRelay}
                onChange={(event) => setTextRelay(event.target.value)}
                placeholder="Type an interpreter relay for the active participant..."
                disabled={!sessionIsLive || !activeAgent}
                className="min-w-0 rounded-full border border-line bg-white px-4 py-3 text-sm outline-none disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleSendRelay}
                disabled={!sessionIsLive || !activeAgent || !textRelay.trim()}
                className="action-secondary px-4 py-3 text-sm disabled:opacity-50"
              >
                Send
              </button>
              <button
                type="button"
                onMouseDown={handlePushToTalkStart}
                onMouseUp={handlePushToTalkEnd}
                onMouseLeave={handlePushToTalkEnd}
                onTouchStart={handlePushToTalkStart}
                onTouchEnd={handlePushToTalkEnd}
                disabled={!sessionIsLive || !activeAgent}
                className={`rounded-full px-4 py-3 text-sm font-semibold ${
                  isPushToTalkActive
                    ? "bg-brand text-white"
                    : "border border-line bg-white"
                } disabled:opacity-50`}
              >
                {isPushToTalkActive ? "Release to send" : "Hold to talk"}
              </button>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          {audioNotice ? (
            <div className="mt-4 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {audioNotice}
            </div>
          ) : null}
        </section>

        <aside className="surface-card rounded-[2rem] p-6">
          <p className="eyebrow">Transcript</p>
          <div className="mt-4 max-h-[680px] space-y-3 overflow-y-auto pr-1">
            {visibleTranscriptEntries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-[1.25rem] border border-line bg-white p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">{entry.speaker}</div>
                  <div className="text-[11px] uppercase tracking-[0.14em] text-muted">
                    {entry.role}
                  </div>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {entry.text}
                </p>
              </div>
            ))}
            {visibleTranscriptEntries.length === 0 ? (
              <p className="text-sm text-muted">
                Transcript entries appear here once the conversation starts.
              </p>
            ) : null}
          </div>
        </aside>
      </section>
    </div>
  );
}
