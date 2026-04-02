"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { RealtimeAgent } from "@openai/agents/realtime";
import { api } from "@/convex/_generated/api";
import { buildRealtimeAgentInstructions } from "@/lib/ai";
import { ScenarioPanel } from "@/components/practice/scenario-panel";
import { useRealtimeVoiceSession } from "@/components/practice/use-realtime-voice-session";
import type { Scenario } from "@/types/scenario";
import type { SessionAssessment, TranscriptEntry } from "@/types/session";

type AgentKey = "agent_a" | "agent_b";

interface RealtimePracticeRunnerProps {
  scenario: Scenario & { _id: string };
}

function formatMinutes(seconds: number) {
  return Math.max(1, Math.round(seconds / 60));
}

function summarizeTranscript(entries: TranscriptEntry[]) {
  const lastSpeakerTurns = entries
    .filter((entry) => entry.role !== "system" && entry.text.trim())
    .slice(-4)
    .map((entry) => `${entry.speaker}: ${entry.text}`)
    .join(" ");

  return lastSpeakerTurns || "Practice session completed.";
}

export function RealtimePracticeRunner({ scenario }: RealtimePracticeRunnerProps) {
  const { isLoaded: isClerkLoaded, isSignedIn } = useAuth();
  const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexAuthLoading } =
    useConvexAuth();
  const overallMetrics = useQuery(api.sessions.metricsForCurrentUser, {});
  const sessionHistory = useQuery(api.sessions.listByScenarioForCurrentUser, {
    scenarioId: scenario.id,
  });
  const startAttempt = useMutation(api.sessions.startAttempt);
  const completeAttempt = useMutation(api.sessions.completeAttempt);

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [activeAgent, setActiveAgent] = useState<AgentKey | null>(null);
  const [textRelay, setTextRelay] = useState("");
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>([]);
  const [assessment, setAssessment] = useState<SessionAssessment | null>(null);
  const [latestAttemptStamp, setLatestAttemptStamp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioNotice, setAudioNotice] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isAssessing, setIsAssessing] = useState(false);
  const [isPushToTalkActive, setIsPushToTalkActive] = useState(false);

  const agentAAudioRef = useRef<HTMLAudioElement | null>(null);
  const agentBAudioRef = useRef<HTMLAudioElement | null>(null);
  const connectedAgentsRef = useRef<Set<AgentKey>>(new Set());

  const addTranscriptEntry = useCallback((entry: TranscriptEntry) => {
    setTranscriptEntries((current) => {
      const existingIndex = current.findIndex((item) => item.id === entry.id);

      if (existingIndex >= 0) {
        const next = [...current];
        next[existingIndex] = { ...next[existingIndex], ...entry };
        return next;
      }

      return [...current, entry].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    });
  }, []);

  const updateTranscriptEntry = useCallback((entryId: string, text: string, append: boolean) => {
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
  }, []);

  const completeTranscriptEntry = useCallback((entryId: string, text?: string) => {
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
  }, []);

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

  const ensureAudioPlayback = useCallback(async (audioElement: HTMLAudioElement | null) => {
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
      setAudioNotice("Browser audio playback is blocked. Press Enable audio and try again.");
    }
  }, []);

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

      if (currentKey && currentKey !== agentKey && connectedAgentsRef.current.has(currentKey)) {
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
  }, [agentASession, agentBSession]);

  const handleStartPractice = useCallback(async () => {
    if (isStarting) {
      return;
    }

    if (!isClerkLoaded || !isSignedIn || isConvexAuthLoading || !isConvexAuthenticated) {
      setError(
        isClerkLoaded && isSignedIn
          ? "You are signed into Clerk, but Convex is not authenticated. This usually means the Clerk `convex` JWT template or production Convex auth setup is missing or misconfigured."
          : "You need to sign in before starting practice.",
      );
      return;
    }

    setError(null);
    setAudioNotice(null);
    setAssessment(null);
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
          openingAgent.openingLine ?? "Introduce the scenario and ask your first question."
        }`,
      );
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Unable to start practice.";
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
  }, [activeAgent, getSessionBundle]);

  const handlePushToTalkEnd = useCallback(() => {
    if (!activeAgent || !isPushToTalkActive) {
      return;
    }

    const bundle = getSessionBundle(activeAgent);
    bundle.session.stopPushToTalk();
    setIsPushToTalkActive(false);
  }, [activeAgent, getSessionBundle, isPushToTalkActive]);

  const handleFinishPractice = useCallback(async () => {
    if (!attemptId || !sessionStartedAt || transcriptEntries.length === 0 || isAssessing) {
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

      const nextAssessment = (await response.json()) as SessionAssessment;
      const endedAt = new Date().toISOString();
      const durationSeconds = Math.max(30, Math.round((Date.now() - sessionStartedAt) / 1000));
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

      setAssessment({
        ...nextAssessment,
        overallScore: Math.round(nextAssessment.overallScore),
      });
      setLatestAttemptStamp(endedAt);
      setAttemptId(null);
      setSessionStartedAt(null);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Unable to complete practice.";
      setError(message);
    } finally {
      setIsAssessing(false);
    }
  }, [
    attemptId,
    completeAttempt,
    disconnectAll,
    isAssessing,
    scenario,
    sessionStartedAt,
    transcriptEntries,
  ]);

  const recentAttempts = useMemo(() => {
    const baseAttempts: Array<{
      key: string;
      timestamp: string;
      score: number;
      completionStatus: "in_progress" | "completed" | "needs_review";
      transcriptSummary: string;
    }> = (sessionHistory ?? []).map((attempt) => ({
      key: attempt._id,
      timestamp: attempt.timestamp,
      score: attempt.score,
      completionStatus: attempt.completionStatus,
      transcriptSummary: attempt.transcriptSummary,
    }));

    if (
      assessment &&
      latestAttemptStamp &&
      !baseAttempts.some((attempt) => attempt.timestamp === latestAttemptStamp)
    ) {
      baseAttempts.unshift({
        key: `local_${latestAttemptStamp}`,
        timestamp: latestAttemptStamp,
        score: assessment.overallScore,
        completionStatus: assessment.completionDecision,
        transcriptSummary: assessment.summary,
      });
    }

    return baseAttempts.slice(0, 4);
  }, [assessment, latestAttemptStamp, sessionHistory]);

  const scenarioSummary = useMemo(() => {
    const attempts = recentAttempts.filter((attempt) => attempt.completionStatus !== "in_progress");

    if (attempts.length === 0) {
      return {
        attempts: 0,
        averageScore: 0,
        bestScore: 0,
        latestScore: 0,
      };
    }

    return {
      attempts: attempts.length,
      averageScore: Math.round(attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length),
      bestScore: Math.max(...attempts.map((attempt) => attempt.score)),
      latestScore: attempts[0]?.score ?? 0,
    };
  }, [recentAttempts]);

  const sessionIsLive = Boolean(attemptId);
  const canStartPractice =
    isClerkLoaded && isSignedIn && isConvexAuthenticated && !isConvexAuthLoading;
  const activeTargetName =
    activeAgent === "agent_a"
      ? scenario.aiAgentA.role
      : activeAgent === "agent_b"
        ? scenario.aiAgentB.role
        : null;

  return (
    <div className="space-y-6">
      <ScenarioPanel scenario={scenario} />

      <audio ref={agentAAudioRef} autoPlay playsInline className="sr-only" />
      <audio ref={agentBAudioRef} autoPlay playsInline className="sr-only" />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-card rounded-[1.75rem] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Live practice</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{scenario.title}</h2>
              <p className="mt-2 text-sm text-muted">{scenario.practiceRuntime.interpreterRole}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {!sessionIsLive ? (
                <button
                  type="button"
                  onClick={handleStartPractice}
                  disabled={isStarting || !canStartPractice}
                  className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
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
                  className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {isAssessing ? "Assessing..." : "Finish and assess"}
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
                  className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold"
                >
                  Enable audio
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.25rem] border border-line bg-white/70 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Latest</div>
              <div className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                {scenarioSummary.latestScore}%
              </div>
            </div>
            <div className="rounded-[1.25rem] border border-line bg-white/70 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Average</div>
              <div className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                {scenarioSummary.averageScore}%
              </div>
            </div>
            <div className="rounded-[1.25rem] border border-line bg-white/70 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Best</div>
              <div className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                {scenarioSummary.bestScore}%
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!sessionIsLive}
              onClick={() => void switchActiveAgent("agent_a")}
              className={`rounded-full border px-4 py-2 text-sm font-medium ${
                activeAgent === "agent_a"
                  ? "border-brand bg-brand text-white"
                  : "border-line bg-white/80 text-foreground"
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
                  : "border-line bg-white/80 text-foreground"
              } disabled:opacity-50`}
            >
              Relay to {scenario.aiAgentB.role}
            </button>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-line bg-white/70 p-4">
            <div className="text-sm font-semibold">
              Active target: {activeTargetName ?? "Not started"}
            </div>
            <p className="mt-2 text-sm text-muted">Text relay for testing. Push-to-talk for live turns.</p>

            <div className="mt-5 flex flex-col gap-3 md:flex-row">
              <input
                value={textRelay}
                onChange={(event) => setTextRelay(event.target.value)}
                placeholder="Type the interpreter relay for the active participant..."
                disabled={!sessionIsLive || !activeAgent}
                className="min-w-0 flex-1 rounded-full border border-line bg-white px-4 py-3 text-sm outline-none disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleSendRelay}
                disabled={!sessionIsLive || !activeAgent || !textRelay.trim()}
                className="rounded-full border border-line bg-white px-4 py-3 text-sm font-semibold disabled:opacity-50"
              >
                Send relay
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
                  isPushToTalkActive ? "bg-brand text-white" : "border border-line bg-white"
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
          {!sessionIsLive && isClerkLoaded && isSignedIn && !isConvexAuthLoading && !isConvexAuthenticated ? (
            <div className="mt-4 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Clerk is signed in, but Convex is not authenticated. The usual cause is that
              the production Clerk `convex` JWT template/integration is missing or the live app
              is pointed at a different Convex deployment than the one configured for Clerk auth.
            </div>
          ) : null}
          {audioNotice ? (
            <div className="mt-4 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {audioNotice}
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <section className="surface-card rounded-[1.75rem] p-6">
            <p className="eyebrow">Assessment focus</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {scenario.practiceRuntime.assessmentFocus.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-line bg-white/80 px-3 py-2 text-sm text-muted"
                >
                  {item}
                </span>
              ))}
            </div>
          </section>

          <section className="surface-card rounded-[1.75rem] p-6">
            <p className="eyebrow">Progress sync</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-[1.25rem] border border-line bg-white/70 p-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                      Profile average
                    </div>
                    <div className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                      {overallMetrics?.averageScore ?? 0}%
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted">
                    {overallMetrics?.modulesCompleted ?? 0} modules passed
                  </div>
                </div>
              </div>
              {recentAttempts.map((session) => (
                <div key={session.key} className="rounded-[1.25rem] border border-line bg-white/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted">{session.timestamp.slice(0, 10)}</span>
                    <span className="score-pill rounded-full px-3 py-1.5 text-sm font-semibold">
                      {session.score}%
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">{session.transcriptSummary}</p>
                </div>
              ))}
              {recentAttempts.length === 0 ? (
                <p className="text-sm text-muted">No completed attempts yet for this scenario.</p>
              ) : null}
            </div>
          </section>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="surface-card rounded-[1.75rem] p-6">
          <p className="eyebrow">Live transcript</p>
          <div className="mt-5 space-y-4">
            {transcriptEntries.length === 0 ? (
              <p className="text-sm text-muted">
                Start a session to capture the interpreter relay and both participant responses.
              </p>
            ) : (
              transcriptEntries.map((entry) => (
                <div key={entry.id} className="rounded-[1.5rem] border border-line bg-white/70 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm font-semibold">{entry.speaker}</div>
                    <div className="text-xs uppercase tracking-[0.18em] text-muted">{entry.role}</div>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">{entry.text || "[Waiting for transcript]"}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="surface-card rounded-[1.75rem] p-6">
          <p className="eyebrow">Post-assessment</p>
          {assessment ? (
            <div className="mt-5 space-y-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-5xl font-semibold">{assessment.overallScore}%</div>
                  <div className="mt-2 text-sm capitalize text-muted">
                    {assessment.completionDecision.replace("_", " ")}
                  </div>
                </div>
              </div>
              <p className="text-sm leading-7 text-muted">{assessment.summary}</p>
              <div className="space-y-3 text-sm">
                {Object.entries(assessment.breakdown).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between gap-4">
                    <span className="capitalize">{key}</span>
                    <span className="font-semibold">{Math.round(value)}%</span>
                  </div>
                ))}
              </div>
              <div className="rounded-[1.5rem] border border-line bg-white/70 p-4 text-sm leading-6 text-muted">
                <div className="font-semibold text-foreground">Strengths</div>
                <p className="mt-2">{assessment.strengths.join(" ")}</p>
              </div>
              <div className="rounded-[1.5rem] border border-line bg-white/70 p-4 text-sm leading-6 text-muted">
                <div className="font-semibold text-foreground">Needs work</div>
                <p className="mt-2">{assessment.improvementAreas.join(" ")}</p>
              </div>
              <div className="rounded-[1.5rem] border border-line bg-white/70 p-4 text-sm leading-6 text-muted">
                <div className="font-semibold text-foreground">Recommended next step</div>
                <p className="mt-2">{assessment.recommendedNextStep}</p>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm leading-7 text-muted">
              When you finish the scenario, XINGO will assess the transcript and store the result
              against your history for this module.
            </p>
          )}
        </section>
      </section>
    </div>
  );
}
