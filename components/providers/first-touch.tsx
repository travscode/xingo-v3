"use client";

import { useEffect } from "react";
import { firstTouchFrom, type FirstTouch } from "@/lib/heard-about";

const FIRST_TOUCH_KEY = "xingo_first_touch";

/**
 * Remembers where this browser first arrived from (campaign tags, ad click ids,
 * referring site), so the welcome flow can pre-select "How did you hear about
 * XINGO?" (D-055). Stays in the browser; only the learner's chosen answer is saved.
 */
export function FirstTouchCapture() {
  useEffect(() => {
    try {
      if (localStorage.getItem(FIRST_TOUCH_KEY)) return;
      const touch = firstTouchFrom(new URLSearchParams(window.location.search), document.referrer);
      localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(touch));
    } catch {
      // Storage blocked: no suggestion, nothing breaks.
    }
  }, []);

  return null;
}

export function readFirstTouch(): FirstTouch | null {
  try {
    const raw = localStorage.getItem(FIRST_TOUCH_KEY);
    return raw ? (JSON.parse(raw) as FirstTouch) : null;
  } catch {
    return null;
  }
}
