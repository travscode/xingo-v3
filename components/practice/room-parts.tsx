"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Lottie } from "lottie-react";
import { Headphones, Mic, MicOff, Video, VideoOff } from "lucide-react";
import soundWavesAnimation from "@/public/animations/sound-waves.json";
import { flagEmoji } from "@/lib/languages";
import { cn } from "@/lib/utils";

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part.trim().charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatClock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${`${seconds}`.padStart(2, "0")}`;
}

type TileState = "idle" | "selected" | "speaking" | "listening";

/**
 * One AI participant. The state label always says, in words, what is happening,
 * so colour is never the only signal.
 */
export function ParticipantTile({
  name,
  role,
  language,
  imageUrl,
  state,
  disabled,
  onSelect,
}: {
  name: string;
  role: string;
  language: string;
  imageUrl?: string;
  state: TileState;
  disabled?: boolean;
  onSelect?: () => void;
}) {
  const label =
    state === "speaking"
      ? "Speaking"
      : state === "listening"
        ? "Listening to you"
        : state === "selected"
          ? "You're talking to them"
          : "Tap to talk to them";

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={state !== "idle"}
      className={cn(
        "group flex w-full flex-col items-center rounded-2xl border-2 p-5 text-center transition-colors sm:p-6",
        state === "idle" ? "border-transparent bg-gray-50 hover:bg-gray-100" : "border-live bg-paper",
        disabled && "cursor-default hover:bg-gray-50",
      )}
    >
      <div className="relative">
        {state === "speaking" ? <span className="avatar-speaking-ring" aria-hidden /> : null}
        {state === "listening" ? <span className="record-ring" aria-hidden /> : null}
        <div
          className={cn(
            "relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-3xl font-bold sm:h-36 sm:w-36",
            state !== "idle" && "ring-4 ring-live",
          )}
        >
          {imageUrl ? (
            // Signed Convex storage URLs don't work with the Next image optimiser.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span>{initials(name)}</span>
          )}
          {state === "speaking" ? (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
              <div className="h-20 w-20">
                <Lottie src={soundWavesAnimation as object} loop autoplay />
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="mt-4 text-xl font-bold tracking-[-0.02em]">{name}</div>
      <div className="mt-0.5 text-sm text-gray-500">
        {role} · {flagEmoji(language)} {language}
      </div>
      <div
        className={cn(
          "mt-3 rounded-md px-2 py-1 text-xs font-semibold",
          state === "idle" && "text-gray-500",
          state === "selected" && "bg-live text-paper",
          state === "speaking" && "bg-live text-paper",
          state === "listening" && "bg-record text-paper",
        )}
      >
        {label}
      </div>
    </button>
  );
}

/** Hold-to-talk control. Mirrors the Space bar. */
export function MicButton({
  recording,
  disabled,
  onStart,
  onEnd,
  targetName,
}: {
  recording: boolean;
  disabled: boolean;
  onStart: () => void;
  onEnd: () => void;
  targetName?: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          onStart();
        }}
        onPointerUp={onEnd}
        onPointerCancel={onEnd}
        disabled={disabled}
        aria-label={recording ? "Release to send" : "Hold to talk"}
        className={cn(
          "relative flex h-24 w-24 touch-none select-none items-center justify-center rounded-full text-paper transition-colors disabled:opacity-30",
          recording ? "bg-record" : "bg-ink hover:bg-gray-700",
        )}
      >
        {recording ? <span className="record-ring" aria-hidden /> : null}
        <Mic className="h-9 w-9" />
      </button>
      <p className="mt-3 text-sm font-semibold">
        {recording ? `Talking to ${targetName ?? "them"}… release to send` : "Hold to talk"}
      </p>
      <p className="mt-0.5 hidden text-xs text-gray-500 sm:block">
        or hold <Kbd>Space</Kbd> · tap <Kbd>Space</Kbd> to switch person
      </p>
    </div>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-gray-300 bg-paper px-1.5 py-0.5 font-sans text-[11px] font-semibold text-ink">
      {children}
    </kbd>
  );
}

/** The one instruction that matters right now. */
export function CoachBar({
  step,
  totalSteps,
  title,
  detail,
  tone = "default",
}: {
  step?: number;
  totalSteps?: number;
  title: string;
  detail?: string;
  tone?: "default" | "done" | "warning";
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-xl px-5 py-4",
        tone === "default" && "bg-ink text-paper",
        tone === "done" && "bg-accent text-accent-ink",
        tone === "warning" && "bg-warning text-ink",
      )}
    >
      {step && totalSteps ? (
        <p className="text-xs font-semibold uppercase tracking-[0.08em] opacity-70">
          Step {step} of {totalSteps}
        </p>
      ) : null}
      <p className="mt-0.5 text-base font-bold leading-snug sm:text-lg">{title}</p>
      {detail ? <p className="mt-1 text-sm opacity-80">{detail}</p> : null}
    </div>
  );
}

/** Live microphone level so learners can confirm they're heard before starting. */
export function MicCheck({ onStatusChange }: { onStatusChange?: (ok: boolean) => void }) {
  const [status, setStatus] = useState<"idle" | "testing" | "ok" | "denied">("idle");
  const [level, setLevel] = useState(0);
  const cleanupRef = useRef<(() => void) | null>(null);
  const heardRef = useRef(false);

  const stop = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const start = useCallback(async () => {
    try {
      setStatus("testing");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new AudioContext();
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      context.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      let frame = 0;

      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let peak = 0;
        for (const value of data) peak = Math.max(peak, Math.abs(value - 128));
        const next = Math.min(1, peak / 64);
        setLevel(next);

        if (next > 0.25 && !heardRef.current) {
          heardRef.current = true;
          setStatus("ok");
          onStatusChange?.(true);
        }

        frame = requestAnimationFrame(tick);
      };

      tick();
      cleanupRef.current = () => {
        cancelAnimationFrame(frame);
        stream.getTracks().forEach((track) => track.stop());
        void context.close();
      };
    } catch {
      setStatus("denied");
      onStatusChange?.(false);
    }
  }, [onStatusChange]);

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => (status === "idle" || status === "denied" ? void start() : stop())}
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
          status === "ok" ? "bg-accent text-accent-ink" : "bg-gray-100 text-ink",
        )}
        aria-label="Test microphone"
      >
        {status === "denied" ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">
          {status === "idle" && "Test your microphone"}
          {status === "testing" && "Say something…"}
          {status === "ok" && "We can hear you"}
          {status === "denied" && "Microphone blocked — allow it in your browser's address bar"}
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
          <div
            className={cn("h-full rounded-full transition-[width] duration-75", status === "ok" ? "bg-accent" : "bg-ink")}
            style={{ width: `${status === "idle" ? 0 : level * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function HeadphonesTip() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100">
        <Headphones className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold">Use headphones</p>
        <p className="text-sm text-gray-500">Speakers let the AI hear itself and talk over you.</p>
      </div>
    </div>
  );
}

/** Optional self-view. Off by default; never recorded. */
export function SelfView() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [on, setOn] = useState(false);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setOn(false);
  }, []);

  useEffect(() => stop, [stop]);

  const toggle = async () => {
    if (on) {
      stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setOn(true);
    } catch {
      setOn(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className={cn("h-12 w-12 overflow-hidden rounded-full bg-gray-100", !on && "hidden")}>
        <video ref={videoRef} muted playsInline className="h-full w-full -scale-x-100 object-cover" />
      </div>
      <button
        type="button"
        onClick={() => void toggle()}
        className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-ink"
      >
        {on ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
        {on ? "Hide camera" : "Show camera"}
      </button>
    </div>
  );
}
