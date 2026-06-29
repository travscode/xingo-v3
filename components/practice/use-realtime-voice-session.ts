"use client";

import { useCallback, useRef, useState } from "react";
import {
  OpenAIRealtimeWebRTC,
  RealtimeAgent,
  RealtimeSession,
} from "@openai/agents/realtime";
import type { TranscriptEntry } from "@/types/session";

export type RealtimeConnectionStatus =
  | "DISCONNECTED"
  | "CONNECTING"
  | "CONNECTED";

interface TranscriptCallbacks {
  onTranscriptStart: (entry: TranscriptEntry) => void;
  onTranscriptUpdate: (entryId: string, text: string, append: boolean) => void;
  onTranscriptComplete: (entryId: string, text?: string) => void;
  onError?: (message: string) => void;
}

interface ConnectOptions {
  getEphemeralKey: () => Promise<string>;
  agent: RealtimeAgent;
  audioElement: HTMLAudioElement;
}

type RealtimeMessageItem = {
  type?: string;
  text?: string;
  output_text?: string;
  transcript?: string | null;
};

type RealtimeHistoryMessage = {
  type?: string;
  itemId?: string;
  id?: string;
  role?: string;
  content?: RealtimeMessageItem[];
};

type RealtimeTransportEvent = {
  type?: string;
  item_id?: string;
  transcript?: string;
  delta?: string;
  error?: {
    message?: string;
  };
};

function extractMessageText(content: RealtimeMessageItem[] = []): string {
  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((part) => {
      if (!part || typeof part !== "object") {
        return "";
      }

      if (part.type === "input_text") {
        return part.text ?? "";
      }

      if (part.type === "text" || part.type === "output_text") {
        return part.output_text ?? part.text ?? "";
      }

      if (
        part.type === "audio" ||
        part.type === "input_audio" ||
        part.type === "output_audio"
      ) {
        return part.transcript ?? "";
      }

      return "";
    })
    .filter(Boolean)
    .join("\n");
}

/**
 * Returns a normalized transcript string or null when the event has no usable text.
 */
function normalizeTranscriptValue(transcript?: string | null) {
  if (typeof transcript !== "string") {
    return null;
  }

  const value = transcript.trim();
  return value ? value : null;
}

export function useRealtimeVoiceSession(
  speakerLabel: string,
  interpreterLabel: string,
  callbacks: TranscriptCallbacks,
) {
  const sessionRef = useRef<RealtimeSession | null>(null);
  const knownTranscriptItemIdsRef = useRef<Set<string>>(new Set());
  const [status, setStatus] =
    useState<RealtimeConnectionStatus>("DISCONNECTED");

  const ensureConnected = useCallback(() => {
    if (!sessionRef.current) {
      throw new Error("Realtime session is not connected.");
    }

    return sessionRef.current;
  }, []);

  /**
   * Tracks transcript items and guarantees each item has an initial entry.
   */
  const ensureTranscriptItem = useCallback(
    (itemId: string, role: TranscriptEntry["role"]) => {
      if (!itemId) {
        return;
      }

      if (!knownTranscriptItemIdsRef.current.has(itemId)) {
        knownTranscriptItemIdsRef.current.add(itemId);
        callbacks.onTranscriptStart({
          id: itemId,
          role,
          speaker: role === "assistant" ? speakerLabel : interpreterLabel,
          text: "",
          createdAt: new Date().toISOString(),
        });
      }
    },
    [callbacks, interpreterLabel, speakerLabel],
  );

  const handleHistoryAdded = useCallback(
    (item: RealtimeHistoryMessage) => {
      if (!item || item.type !== "message") {
        return;
      }

      const itemId = item.itemId ?? item.id;
      const role = item.role as TranscriptEntry["role"] | undefined;

      if (!itemId || !role || (role !== "assistant" && role !== "user")) {
        return;
      }

      knownTranscriptItemIdsRef.current.add(itemId);
      const text = extractMessageText(item.content ?? []);
      callbacks.onTranscriptStart({
        id: itemId,
        role,
        speaker: role === "assistant" ? speakerLabel : interpreterLabel,
        text,
        createdAt: new Date().toISOString(),
      });
    },
    [callbacks, interpreterLabel, speakerLabel],
  );

  const handleHistoryUpdated = useCallback(
    (items: RealtimeHistoryMessage[]) => {
      items.forEach((item) => {
        if (!item || item.type !== "message") {
          return;
        }

        const itemId = item.itemId ?? item.id;
        const role = item.role as TranscriptEntry["role"] | undefined;
        const text = extractMessageText(item.content ?? []);

        if (
          itemId &&
          role &&
          (role === "assistant" || role === "user") &&
          !knownTranscriptItemIdsRef.current.has(itemId)
        ) {
          knownTranscriptItemIdsRef.current.add(itemId);
          callbacks.onTranscriptStart({
            id: itemId,
            role,
            speaker: role === "assistant" ? speakerLabel : interpreterLabel,
            text: "",
            createdAt: new Date().toISOString(),
          });
        }

        if (itemId && text) {
          callbacks.onTranscriptUpdate(itemId, text, false);
        }
      });
    },
    [callbacks, interpreterLabel, speakerLabel],
  );

  const handleTransportEvent = useCallback(
    (event: unknown) => {
      if (!event || typeof event !== "object") {
        return;
      }

      const transportEvent = event as RealtimeTransportEvent;

      if (
        transportEvent.type ===
          "conversation.item.input_audio_transcription.completed" &&
        transportEvent.item_id
      ) {
        ensureTranscriptItem(transportEvent.item_id, "user");
        const transcript = normalizeTranscriptValue(transportEvent.transcript);
        if (transcript) {
          callbacks.onTranscriptUpdate(
            transportEvent.item_id,
            transcript,
            false,
          );
          callbacks.onTranscriptComplete(transportEvent.item_id, transcript);
        }
        return;
      }

      if (
        transportEvent.type === "response.audio_transcript.delta" &&
        transportEvent.item_id
      ) {
        ensureTranscriptItem(transportEvent.item_id, "assistant");
        callbacks.onTranscriptUpdate(
          transportEvent.item_id,
          transportEvent.delta || "",
          true,
        );
        return;
      }

      if (
        transportEvent.type === "response.audio_transcript.done" &&
        transportEvent.item_id
      ) {
        ensureTranscriptItem(transportEvent.item_id, "assistant");
        const transcript = normalizeTranscriptValue(transportEvent.transcript);
        if (transcript) {
          callbacks.onTranscriptUpdate(
            transportEvent.item_id,
            transcript,
            false,
          );
          callbacks.onTranscriptComplete(transportEvent.item_id, transcript);
        }
        return;
      }

      if (transportEvent.type === "error") {
        const message =
          transportEvent.error &&
          typeof transportEvent.error === "object" &&
          "message" in transportEvent.error &&
          typeof transportEvent.error.message === "string"
            ? transportEvent.error.message
            : "Realtime session error.";
        callbacks.onError?.(message);
      }
    },
    [callbacks, ensureTranscriptItem],
  );

  const connect = useCallback(
    async ({ getEphemeralKey, agent, audioElement }: ConnectOptions) => {
      if (sessionRef.current) {
        return;
      }

      setStatus("CONNECTING");
      const apiKey = await getEphemeralKey();
      const session = new RealtimeSession(agent, {
        transport: new OpenAIRealtimeWebRTC({ audioElement }),
        model: "gpt-realtime",
        config: {
          inputAudioTranscription: {
            model: "gpt-4o-mini-transcribe",
          },
        },
      });

      session.on("history_added", handleHistoryAdded);
      session.on("history_updated", handleHistoryUpdated);
      session.on("transport_event", handleTransportEvent);
      session.on("error", (error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Realtime session error.";
        callbacks.onError?.(message);
      });

      sessionRef.current = session;
      knownTranscriptItemIdsRef.current.clear();

      try {
        await session.connect({ apiKey });
        setStatus("CONNECTED");
      } catch (error) {
        sessionRef.current = null;
        setStatus("DISCONNECTED");
        throw error;
      }
    },
    [callbacks, handleHistoryAdded, handleHistoryUpdated, handleTransportEvent],
  );

  const disconnect = useCallback(() => {
    sessionRef.current?.close();
    sessionRef.current = null;
    knownTranscriptItemIdsRef.current.clear();
    setStatus("DISCONNECTED");
  }, []);

  const setTurnDetectionEnabled = useCallback(
    (enabled: boolean) => {
      const session = ensureConnected();
      session.transport.sendEvent({
        type: "session.update",
        session: {
          turn_detection: enabled
            ? {
                type: "server_vad",
                threshold: 0.85,
                prefix_padding_ms: 250,
                silence_duration_ms: 500,
                create_response: true,
              }
            : null,
        },
      } as never);
    },
    [ensureConnected],
  );

  const mute = useCallback(
    (shouldMute: boolean) => {
      ensureConnected().mute(shouldMute);
    },
    [ensureConnected],
  );

  const interrupt = useCallback(() => {
    sessionRef.current?.interrupt();
  }, []);

  const sendInterpreterText = useCallback(
    (text: string) => {
      const session = ensureConnected();
      const itemId = crypto.randomUUID();
      knownTranscriptItemIdsRef.current.add(itemId);
      callbacks.onTranscriptStart({
        id: itemId,
        role: "user",
        speaker: interpreterLabel,
        text,
        createdAt: new Date().toISOString(),
      });
      callbacks.onTranscriptComplete(itemId, text);

      session.transport.sendEvent({
        type: "conversation.item.create",
        item: {
          id: itemId,
          type: "message",
          role: "user",
          content: [{ type: "input_text", text }],
        },
      } as never);
      session.transport.sendEvent({ type: "response.create" } as never);
    },
    [callbacks, ensureConnected, interpreterLabel],
  );

  const sendHiddenInstruction = useCallback(
    (text: string) => {
      const session = ensureConnected();
      session.transport.sendEvent({
        type: "conversation.item.create",
        item: {
          id: crypto.randomUUID(),
          type: "message",
          role: "user",
          content: [{ type: "input_text", text }],
        },
      } as never);
      session.transport.sendEvent({ type: "response.create" } as never);
    },
    [ensureConnected],
  );

  const startPushToTalk = useCallback(() => {
    const session = ensureConnected();
    session.interrupt();
    session.transport.sendEvent({ type: "input_audio_buffer.clear" } as never);
  }, [ensureConnected]);

  const stopPushToTalk = useCallback(() => {
    const session = ensureConnected();
    session.transport.sendEvent({ type: "input_audio_buffer.commit" } as never);
    session.transport.sendEvent({ type: "response.create" } as never);
  }, [ensureConnected]);

  return {
    status,
    connect,
    disconnect,
    mute,
    interrupt,
    setTurnDetectionEnabled,
    sendInterpreterText,
    sendHiddenInstruction,
    startPushToTalk,
    stopPushToTalk,
  } as const;
}
