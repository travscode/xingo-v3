"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAction, useMutation, useQuery } from "convex/react";
import { RealtimeAgent } from "@openai/agents/realtime";
import { ArrowLeft, FlaskConical, Mic, Square } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { buildRealtimeAgentInstructions, planAgentLanguages, retargetLanguage, transcriptionLanguageCode } from "@/lib/ai";
import { friendlyError } from "@/lib/errors";
import { flagEmoji, isEnglishOnly, languageMatches } from "@/lib/languages";
import { cn } from "@/lib/utils";
import { useActiveLanguagePair } from "@/components/providers/language-pair-context";
import { useRealtimeVoiceSession } from "@/components/practice/use-realtime-voice-session";
import { Badge, Card, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import type { Scenario, VoiceAgent } from "@/types/scenario";
import type { TranscriptEntry } from "@/types/session";

/**
 * EXPERIMENT (Admin → Lab, D-033): the learner never switches person. Both AI
 * participants receive the microphone; when an utterance ends we detect its
 * language with Whisper and commit the audio only to the participant who speaks
 * it. The learner-facing practice room is untouched.
 */

type AgentKey = "agent_a" | "agent_b";
type Phase = "setup" | "connecting" | "live";
type InputMode = "handsfree" | "hold";
type LogEntry = {
  id: string;
  at: string;
  durationMs: number;
  detected: string | null;
  latencyMs: number;
  routedTo: AgentKey | null;
  reason: string;
  text: string;
};

const VAD_START_MS = 150;
const VAD_END_SILENCE_MS = 800;
const MIN_UTTERANCE_MS = 400;

function pickRecorderMime() {
  const options = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
  return options.find((type) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) ?? "";
}

export function AutoSwitchRoom({ scenarioId }: { scenarioId: string }) {
  const data = useQuery(api.catalog.scenarioForPractice, { scenarioId });
  if (data === undefined) return <Skeleton className="h-96" />;
  if (data === null) return <p className="text-gray-500">Scenario not found.</p>;
  if (!data.scenario.aiAgentB) return <p className="text-gray-500">The lab needs a scenario with two participants.</p>;
  return <Room scenario={data.scenario as unknown as Scenario} />;
}

function Room({ scenario }: { scenario: Scenario }) {
  const { activePair } = useActiveLanguagePair();
  const startAttempt = useMutation(api.practice.startAttempt);
  const cancelAttempt = useMutation(api.practice.cancelAttempt);
  const heartbeat = useMutation(api.practice.heartbeat);
  const createRealtimeSecret = useAction(api.practiceActions.createRealtimeSecret);
  const detectLanguage = useAction(api.labActions.detectLanguage);

  const [phase, setPhase] = useState<Phase>("setup");
  const [inputMode, setInputMode] = useState<InputMode>("handsfree");
  const [threshold, setThreshold] = useState(0.03);
  const [state, setState] = useState<"idle" | "listening" | "detecting">("idle");
  const [target, setTarget] = useState<AgentKey | null>(null);
  const [audible, setAudible] = useState<Record<AgentKey, boolean>>({ agent_a: false, agent_b: false });
  const [level, setLevel] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const attemptIdRef = useRef<string | null>(null);
  const audioRefs = { agent_a: useRef<HTMLAudioElement | null>(null), agent_b: useRef<HTMLAudioElement | null>(null) };
  const micStreamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const agentAnalysersRef = useRef<Partial<Record<AgentKey, AnalyserNode>>>({});
  const frameRef = useRef<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const utteranceStartRef = useRef(0);
  const stateRef = useRef<"idle" | "listening" | "detecting">("idle");
  const aboveSinceRef = useRef<number | null>(null);
  const belowSinceRef = useRef<number | null>(null);
  const audibleRef = useRef<Record<AgentKey, boolean>>({ agent_a: false, agent_b: false });
  const settingsRef = useRef({ inputMode, threshold });
  const lastTargetRef = useRef<AgentKey | null>(null);

  useEffect(() => {
    settingsRef.current = { inputMode, threshold };
  }, [inputMode, threshold]);

  const plan = useMemo(() => planAgentLanguages(scenario, activePair), [scenario, activePair]);
  const configs = useMemo<Record<AgentKey, VoiceAgent>>(
    () => ({
      agent_a: { ...scenario.aiAgentA, language: plan.agentALanguage },
      agent_b: { ...scenario.aiAgentB!, language: plan.agentBLanguage },
    }),
    [plan, scenario],
  );

  // ---- Transcript ---------------------------------------------------------------
  const callbacks = useMemo(
    () => ({
      onTranscriptStart: (entry: TranscriptEntry) =>
        setTranscript((current) => (current.some((e) => e.id === entry.id) ? current : [...current, entry])),
      onTranscriptUpdate: (id: string, text: string, append: boolean) =>
        setTranscript((current) => current.map((e) => (e.id === id ? { ...e, text: append ? e.text + text : text } : e))),
      onTranscriptComplete: (id: string, text?: string) =>
        text ? setTranscript((current) => current.map((e) => (e.id === id ? { ...e, text } : e))) : undefined,
      onError: (message: string) => console.warn("[Lab] realtime", message),
    }),
    [],
  );
  const sessions = {
    agent_a: useRealtimeVoiceSession(configs.agent_a.name ?? "A", "You", callbacks),
    agent_b: useRealtimeVoiceSession(configs.agent_b.name ?? "B", "You", callbacks),
  };
  const sessionsRef = useRef(sessions);
  sessionsRef.current = sessions;

  const buildAgent = useCallback(
    (key: AgentKey) => {
      const other: AgentKey = key === "agent_a" ? "agent_b" : "agent_a";
      const authored = key === "agent_a" ? scenario.aiAgentA : scenario.aiAgentB;
      const config = configs[key];
      return new RealtimeAgent({
        name: config.name ?? config.role,
        voice: config.voice,
        handoffs: [],
        instructions: buildRealtimeAgentInstructions({
          scenario,
          agent: { ...config, openingLine: retargetLanguage(config.openingLine, authored?.language, config.language) },
          authoredLanguage: authored?.language,
          counterpart: configs[other],
          isProfessional: key === plan.professionalKey,
        }),
      });
    },
    [configs, plan.professionalKey, scenario],
  );

  // ---- Routing ------------------------------------------------------------------

  /** Commits the buffered audio to one participant and discards it for the other. */
  const route = useCallback((to: AgentKey) => {
    const other: AgentKey = to === "agent_a" ? "agent_b" : "agent_a";
    sessionsRef.current[other].startPushToTalk(); // interrupt + clear its buffer
    sessionsRef.current[to].stopPushToTalk(); // commit + respond
    const toAudio = audioRefs[to].current;
    const otherAudio = audioRefs[other].current;
    if (otherAudio) otherAudio.muted = true;
    if (toAudio) {
      toAudio.muted = false;
      void toAudio.play().catch(() => undefined);
    }
    setTarget(to);
    lastTargetRef.current = to;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const beginUtterance = useCallback(() => {
    if (stateRef.current !== "idle" || !micStreamRef.current) return;
    // The learner takes the floor: everyone stops and both buffers start fresh.
    sessionsRef.current.agent_a.startPushToTalk();
    sessionsRef.current.agent_b.startPushToTalk();
    const mime = pickRecorderMime();
    const recorder = new MediaRecorder(micStreamRef.current, mime ? { mimeType: mime } : undefined);
    chunksRef.current = [];
    recorder.ondataavailable = (event) => event.data.size > 0 && chunksRef.current.push(event.data);
    recorder.start();
    recorderRef.current = recorder;
    utteranceStartRef.current = performance.now();
    stateRef.current = "listening";
    setState("listening");
  }, []);

  const endUtterance = useCallback(async () => {
    const recorder = recorderRef.current;
    if (stateRef.current !== "listening" || !recorder) return;
    const durationMs = Math.round(performance.now() - utteranceStartRef.current);
    stateRef.current = "detecting";
    setState("detecting");

    const blob = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => resolve(new Blob(chunksRef.current, { type: recorder.mimeType }));
      recorder.stop();
    });
    recorderRef.current = null;

    const finish = () => {
      stateRef.current = "idle";
      setState("idle");
    };

    if (durationMs < MIN_UTTERANCE_MS) {
      sessionsRef.current.agent_a.startPushToTalk();
      sessionsRef.current.agent_b.startPushToTalk();
      finish();
      return;
    }

    const started = performance.now();
    let detected: string | null = null;
    let text = "";
    try {
      const result = await detectLanguage({ audio: await blob.arrayBuffer(), mimeType: blob.type || "audio/webm" });
      detected = result.language;
      text = result.text;
    } catch (detectError) {
      setError(friendlyError(detectError, "Language detection failed."));
    }
    const latencyMs = Math.round(performance.now() - started);

    const matchA = detected ? languageMatches(detected, configs.agent_a.language ?? "") : false;
    const matchB = detected ? languageMatches(detected, configs.agent_b.language ?? "") : false;
    let to: AgentKey | null = null;
    let reason = "";
    if (matchA !== matchB) {
      to = matchA ? "agent_a" : "agent_b";
      reason = "language match";
    } else if (lastTargetRef.current) {
      // Unknown or ambiguous: assume the learner turned to the other person.
      to = lastTargetRef.current === "agent_a" ? "agent_b" : "agent_a";
      reason = detected ? `no clear match for "${detected}", alternated` : "no language detected, alternated";
    } else {
      // First utterance: the interpreter introduces themselves to the client (non-professional).
      to = plan.professionalKey === "agent_a" ? "agent_b" : "agent_a";
      reason = "first turn default";
    }

    if (to && text.trim()) route(to);
    else {
      sessionsRef.current.agent_a.startPushToTalk();
      sessionsRef.current.agent_b.startPushToTalk();
      to = null;
      reason = "nothing heard";
    }

    setLog((current) => [
      { id: crypto.randomUUID(), at: new Date().toLocaleTimeString("en-AU"), durationMs, detected, latencyMs, routedTo: to, reason, text },
      ...current,
    ].slice(0, 50));
    finish();
  }, [configs, detectLanguage, plan.professionalKey, route]);

  // ---- Level meters + voice activity detection ------------------------------------

  const tick = useCallback(() => {
    const rms = (analyser: AnalyserNode) => {
      const data = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (const sample of data) sum += ((sample - 128) / 128) ** 2;
      return Math.sqrt(sum / data.length);
    };
    const now = performance.now();

    const nextAudible = { ...audibleRef.current };
    for (const key of ["agent_a", "agent_b"] as const) {
      const analyser = agentAnalysersRef.current[key];
      const audio = audioRefs[key].current;
      nextAudible[key] = Boolean(analyser && audio && !audio.muted && !audio.paused && rms(analyser) > 0.015);
    }
    if (nextAudible.agent_a !== audibleRef.current.agent_a || nextAudible.agent_b !== audibleRef.current.agent_b) {
      audibleRef.current = nextAudible;
      setAudible(nextAudible);
    }

    const mic = micAnalyserRef.current;
    if (mic) {
      const value = rms(mic);
      setLevel(value);
      const { inputMode: mode, threshold: limit } = settingsRef.current;
      if (mode === "handsfree") {
        const agentSpeaking = nextAudible.agent_a || nextAudible.agent_b;
        if (value > limit && !agentSpeaking) {
          belowSinceRef.current = null;
          aboveSinceRef.current ??= now;
          if (stateRef.current === "idle" && now - aboveSinceRef.current > VAD_START_MS) beginUtterance();
        } else {
          aboveSinceRef.current = null;
          belowSinceRef.current ??= now;
          if (stateRef.current === "listening" && now - belowSinceRef.current > VAD_END_SILENCE_MS) void endUtterance();
        }
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beginUtterance, endUtterance]);

  // Hold Space (no tapping to switch: the language decides).
  useEffect(() => {
    if (phase !== "live" || inputMode !== "hold") return;
    const down = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat) return;
      event.preventDefault();
      beginUtterance();
    };
    const up = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      event.preventDefault();
      void endUtterance();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [beginUtterance, endUtterance, inputMode, phase]);

  // Keep the attempt alive.
  useEffect(() => {
    if (phase !== "live") return;
    const interval = window.setInterval(() => {
      const id = attemptIdRef.current;
      if (id) void heartbeat({ attemptId: id }).catch(() => undefined);
    }, 20_000);
    return () => window.clearInterval(interval);
  }, [heartbeat, phase]);

  // ---- Start / stop -----------------------------------------------------------------

  const stopAll = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    sessionsRef.current.agent_a.disconnect();
    sessionsRef.current.agent_b.disconnect();
    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    micStreamRef.current = null;
    void contextRef.current?.close().catch(() => undefined);
    contextRef.current = null;
    agentAnalysersRef.current = {};
    stateRef.current = "idle";
  }, []);

  useEffect(() => stopAll, [stopAll]);

  const start = async () => {
    setError(null);
    setPhase("connecting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      micStreamRef.current = stream;
      const context = new AudioContext();
      contextRef.current = context;
      const micAnalyser = context.createAnalyser();
      micAnalyser.fftSize = 1024;
      context.createMediaStreamSource(stream).connect(micAnalyser);
      micAnalyserRef.current = micAnalyser;

      const { attemptId } = await startAttempt({
        scenarioId: scenario.id,
        sourceLanguage: activePair.sourceLanguage,
        targetLanguage: activePair.targetLanguage,
        mode: "practice",
      });
      attemptIdRef.current = attemptId;

      await Promise.all(
        (["agent_a", "agent_b"] as const).map(async (key) => {
          const audio = audioRefs[key].current!;
          await sessionsRef.current[key].connect({
            getEphemeralKey: () => createRealtimeSecret({ attemptId }),
            agent: buildAgent(key),
            audioElement: audio,
            transcriptionLanguage: configs[key].language ?? "English",
            transcriptionLanguageCode: transcriptionLanguageCode(configs[key].language ?? "English"),
          });
          // Both listen to the mic; nothing is sent until we commit to one of them.
          sessionsRef.current[key].setTurnDetectionEnabled(false);
          sessionsRef.current[key].mute(false);
          audio.muted = false;
          void audio.play().catch(() => undefined);
          // Meter the participant's output.
          const attach = (tries = 0) => {
            if (audio.srcObject instanceof MediaStream && audio.srcObject.getAudioTracks().length > 0) {
              const analyser = context.createAnalyser();
              analyser.fftSize = 512;
              context.createMediaStreamSource(audio.srcObject).connect(analyser);
              agentAnalysersRef.current[key] = analyser;
            } else if (tries < 50) window.setTimeout(() => attach(tries + 1), 200);
          };
          attach();
        }),
      );

      setPhase("live");
      frameRef.current = requestAnimationFrame(tick);
    } catch (startError) {
      console.error("[Lab] start", startError);
      setError(friendlyError(startError, "Couldn't start the lab session."));
      const id = attemptIdRef.current;
      attemptIdRef.current = null;
      if (id) void cancelAttempt({ attemptId: id }).catch(() => undefined);
      stopAll();
      setPhase("setup");
    }
  };

  const end = () => {
    const id = attemptIdRef.current;
    attemptIdRef.current = null;
    if (id) void cancelAttempt({ attemptId: id }).catch(() => undefined);
    stopAll();
    setPhase("setup");
    setTarget(null);
  };

  // ---- Render ---------------------------------------------------------------------

  const englishOnly = isEnglishOnly(activePair);

  return (
    <div className="space-y-6">
      <audio ref={audioRefs.agent_a} autoPlay playsInline className="sr-only" />
      <audio ref={audioRefs.agent_b} autoPlay playsInline className="sr-only" />
      <Link href="/admin/lab" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Lab
      </Link>
      <header>
        <Badge tone="warning">
          <FlaskConical className="h-3 w-3" aria-hidden /> Experiment · admins only · not scored
        </Badge>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em]">{scenario.title}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Speak either language. XINGO detects it and sends what you said to the person who speaks it. Use headphones.
        </p>
      </header>

      {englishOnly ? (
        <Card className="p-5 text-sm">Switch the language picker (top right) to English ⇄ another language. Auto-switching needs two different languages.</Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {(["agent_a", "agent_b"] as const).map((key) => {
          const config = configs[key];
          return (
            <div
              key={key}
              className={cn(
                "rounded-2xl border-2 p-5 text-center transition-colors",
                audible[key] ? "border-live bg-paper" : target === key ? "border-ink" : "border-transparent bg-gray-50",
              )}
            >
              {config.avatarImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={config.avatarImageUrl} alt="" className="mx-auto h-24 w-24 rounded-full object-cover" />
              ) : (
                <div className="mx-auto h-24 w-24 rounded-full bg-gray-200" />
              )}
              <p className="mt-3 text-lg font-bold">{config.name ?? config.role}</p>
              <p className="text-sm text-gray-500">
                {config.role} · {flagEmoji(config.language ?? "")} {config.language}
              </p>
              <p className="mt-2 text-xs font-semibold text-gray-500">
                {audible[key] ? "Speaking" : target === key ? "Last spoken to" : " "}
              </p>
            </div>
          );
        })}
      </div>

      <Card className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1" role="group" aria-label="Input mode">
            {(
              [
                ["handsfree", "Hands-free"],
                ["hold", "Hold Space"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={inputMode === value}
                onClick={() => setInputMode(value)}
                className={cn("rounded-lg px-3 py-1.5 text-sm font-semibold", inputMode === value ? "bg-ink text-paper" : "bg-gray-100 hover:bg-gray-200")}
              >
                {label}
              </button>
            ))}
          </div>
          {phase === "setup" ? (
            <Button onClick={() => void start()} disabled={englishOnly}>
              <Mic className="h-4 w-4" aria-hidden /> Start lab session
            </Button>
          ) : (
            <Button variant="outline" onClick={end}>
              <Square className="h-4 w-4" aria-hidden /> End
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="w-28 font-semibold">
            {phase === "connecting" ? "Connecting…" : state === "listening" ? "Listening…" : state === "detecting" ? "Detecting language…" : phase === "live" ? (inputMode === "hold" ? "Hold Space to talk" : "Speak any time") : "Not started"}
          </span>
          <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-gray-100" aria-hidden>
            <div className={cn("h-full", state === "listening" ? "bg-record" : "bg-ink")} style={{ width: `${Math.min(100, level * 600)}%` }} />
            {inputMode === "handsfree" ? <div className="absolute top-0 h-full w-0.5 bg-accent-ink" style={{ left: `${Math.min(100, threshold * 600)}%` }} /> : null}
          </div>
        </div>
        {inputMode === "handsfree" ? (
          <label className="flex items-center gap-3 text-sm text-gray-500">
            Sensitivity
            <input type="range" min={0.01} max={0.1} step={0.005} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="flex-1" />
          </label>
        ) : null}
        {error ? <p className="text-sm text-record">{error}</p> : null}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-2 text-lg font-bold">Routing log</h2>
          <div className="max-h-[420px] divide-y divide-gray-200 overflow-y-auto rounded-xl border border-gray-200 text-sm">
            {log.length === 0 ? <p className="p-4 text-gray-500">Each utterance appears here with the detected language and where it went.</p> : null}
            {log.map((entry) => (
              <div key={entry.id} className="p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-gray-500">{entry.at}</span>
                  <Badge>{entry.detected ?? "unknown"}</Badge>
                  <span>→ {entry.routedTo ? configs[entry.routedTo].name ?? configs[entry.routedTo].role : "nobody"}</span>
                  <span className="text-xs text-gray-500">
                    {(entry.durationMs / 1000).toFixed(1)}s spoken · {entry.latencyMs} ms to detect · {entry.reason}
                  </span>
                </div>
                {entry.text ? <p className="mt-1 text-gray-700">“{entry.text}”</p> : null}
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold">Transcript</h2>
          <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-3 text-sm">
            {transcript.filter((e) => e.text.trim()).map((entry) => (
              <p key={entry.id}>
                <span className="font-semibold">{entry.speaker}: </span>
                {entry.text}
              </p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
