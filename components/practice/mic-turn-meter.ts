import { VOICE_LEVEL_RMS } from "@/lib/mic-check";

const SAMPLE_EVERY_MS = 50;

export type MicTurnMeter = { finish: () => { heldMs: number; voicedMs: number | null } };

/**
 * Measures the mic track a realtime session is sending, for one held turn (D-050).
 * If it can't measure (no track, audio not running), `voicedMs` comes back null so
 * the learner is never blocked by a failure of the check itself.
 */
export function startMicTurnMeter(track: MediaStreamTrack | null, context: AudioContext | null): MicTurnMeter {
  const startedAt = performance.now();
  let voicedMs = 0;
  let samples = 0;
  let release = () => {};

  if (track?.readyState === "live" && context?.state === "running") {
    try {
      const source = context.createMediaStreamSource(new MediaStream([track]));
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      const data = new Uint8Array(new ArrayBuffer(analyser.fftSize));
      let lastSampleAt = startedAt;

      const timer = window.setInterval(() => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (const value of data) {
          const level = (value - 128) / 128;
          sum += level * level;
        }

        const now = performance.now();
        if (Math.sqrt(sum / data.length) >= VOICE_LEVEL_RMS) voicedMs += now - lastSampleAt;
        lastSampleAt = now;
        samples += 1;
      }, SAMPLE_EVERY_MS);

      release = () => {
        window.clearInterval(timer);
        source.disconnect();
      };
    } catch {
      release = () => {};
    }
  }

  return {
    finish: () => {
      release();
      return { heldMs: performance.now() - startedAt, voicedMs: samples > 0 ? voicedMs : null };
    },
  };
}
