"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAction, useMutation } from "convex/react";
import { Check, MessageCircle, Mic, Square, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { DICTATION_MAX_SECONDS, FEEDBACK_MAX_CHARS } from "@/lib/beta";
import { friendlyError } from "@/lib/errors";
import { cn } from "@/lib/utils";

type Status = "idle" | "recording" | "transcribing" | "sending" | "sent";

function pickRecorderMime() {
  const options = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
  return options.find((type) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) ?? "";
}

/**
 * Beta feedback button (D-049). Typing or talking both end up as text the tester can
 * correct before sending. The shell leaves it out of the practice room, so it can
 * never compete with push-to-talk.
 */
export function FeedbackWidget() {
  const pathname = usePathname();
  const submit = useMutation(api.beta.submitFeedback);
  const transcribe = useAction(api.beta.transcribeFeedback);
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [dictated, setDictated] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const discardRef = useRef(false);

  const releaseMic = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, []);

  useEffect(
    () => () => {
      discardRef.current = true;
      stopRecording();
      releaseMic();
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    },
    [releaseMic, stopRecording],
  );

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = pickRecorderMime();
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks: Blob[] = [];
      discardRef.current = false;
      streamRef.current = stream;
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = () => {
        releaseMic();
        recorderRef.current = null;
        if (discardRef.current) {
          setStatus("idle");
          return;
        }
        setStatus("transcribing");
        const blob = new Blob(chunks, { type: recorder.mimeType });
        void blob
          .arrayBuffer()
          .then((audio) => transcribe({ audio, mimeType: blob.type || "audio/webm" }))
          .then(({ text }) => {
            if (text) {
              setComment((current) => (current.trim() ? `${current.trim()} ${text}` : text));
              setDictated(true);
            } else {
              setError("We didn't catch anything. Please try again.");
            }
          })
          .catch((dictationError: unknown) => setError(friendlyError(dictationError)))
          .finally(() => setStatus("idle"));
      };
      recorder.start();
      setSeconds(0);
      setStatus("recording");
      let elapsed = 0;
      timerRef.current = setInterval(() => {
        elapsed += 1;
        setSeconds(elapsed);
        if (elapsed >= DICTATION_MAX_SECONDS) stopRecording();
      }, 1000);
    } catch (micError) {
      releaseMic();
      setStatus("idle");
      setError(friendlyError(micError, "We couldn't turn on your microphone. You can type your feedback instead."));
    }
  };

  const close = () => {
    if (status === "recording") {
      discardRef.current = true;
      stopRecording();
    }
    setOpen(false);
    setError(null);
  };

  const send = async () => {
    setStatus("sending");
    setError(null);
    try {
      await submit({ comment, page: pathname, source: dictated ? "voice" : "typed" });
      setComment("");
      setDictated(false);
      setStatus("sent");
      closeTimerRef.current = setTimeout(() => {
        setOpen(false);
        setStatus("idle");
      }, 1800);
    } catch (sendError) {
      setStatus("idle");
      setError(friendlyError(sendError));
    }
  };

  const busy = status === "recording" || status === "transcribing" || status === "sending";

  return (
    <>
      {open ? (
        <div
          role="dialog"
          aria-label="Send feedback"
          onKeyDown={(event) => {
            if (event.key === "Escape") close();
          }}
          className="fixed bottom-20 right-4 z-40 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-gray-200 bg-paper p-4 shadow-lg"
        >
          {status === "sent" ? (
            <p className="flex items-center gap-2 py-6 text-sm font-semibold">
              <Check className="h-4 w-4 text-success" aria-hidden /> Thanks, we got it.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="font-bold">Tell us what you think</p>
                <button type="button" onClick={close} aria-label="Close" className="-mr-1 rounded-lg p-1 hover:bg-gray-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <textarea
                autoFocus
                rows={4}
                maxLength={FEEDBACK_MAX_CHARS}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                aria-label="Your feedback"
                placeholder="What worked? What didn't? Type here, or tap the mic and talk."
                className="mt-3 w-full resize-none rounded-lg bg-gray-100 p-3 text-sm outline-none focus:ring-2 focus:ring-live"
              />
              {error ? <p className="mt-2 text-sm text-record">{error}</p> : null}
              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={status === "transcribing" || status === "sending"}
                  onClick={() => (status === "recording" ? stopRecording() : void startRecording())}
                  aria-label={status === "recording" ? "Stop recording" : "Talk instead of typing"}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors disabled:opacity-40",
                    status === "recording" ? "bg-record text-paper" : "bg-gray-100 hover:bg-gray-200",
                  )}
                >
                  {status === "recording" ? <Square className="h-3.5 w-3.5" aria-hidden /> : <Mic className="h-4 w-4" aria-hidden />}
                  {status === "recording" ? `Stop (${seconds}s)` : status === "transcribing" ? "Writing it out…" : "Talk"}
                </button>
                <Button size="sm" disabled={busy || !comment.trim()} onClick={() => void send()}>
                  {status === "sending" ? "Sending…" : "Send"}
                </Button>
              </div>
            </>
          )}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-label={open ? "Close feedback" : "Send feedback"}
        aria-expanded={open}
        className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper shadow-lg transition-colors hover:bg-gray-700"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </>
  );
}
