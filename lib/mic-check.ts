/**
 * Did a push-to-talk turn contain anything to hear? (D-050)
 *
 * Without this check the AI replies to every release of the talk button, even when
 * it heard nothing, and invents the rest of the conversation. Keep framework-free.
 */

/** Shorter than this is a click on the button, not a held turn. */
export const MIN_HOLD_MS = 300;
/** A mic level (RMS, 0-1) at or above this counts as sound. Dead or idle mics sit below it. */
export const VOICE_LEVEL_RMS = 0.008;
/** A held turn needs at least this much sound. Deliberately low: a short "yes" must pass. */
export const MIN_VOICED_MS = 100;

export type TurnVerdict = "send" | "too_short" | "silent";

/** `voicedMs` is null when the mic couldn't be measured; the turn is then sent as normal. */
export function judgeHeldTurn(turn: { heldMs: number; voicedMs: number | null }): TurnVerdict {
  if (turn.heldMs < MIN_HOLD_MS) return "too_short";
  if (turn.voicedMs !== null && turn.voicedMs < MIN_VOICED_MS) return "silent";
  return "send";
}

export const turnNotHeardMessage: Record<Exclude<TurnVerdict, "send">, string> = {
  too_short: "Hold the button down the whole time you're speaking, then let go to send.",
  silent: "We couldn't hear you. Check that the right microphone is selected in your browser, then try again.",
};
