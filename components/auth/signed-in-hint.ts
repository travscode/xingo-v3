"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether the visitor *looks* signed in, from Clerk's `__client_uat` cookie
 * (a non-secret timestamp Clerk sets on the site domain; "0" or absent when signed out).
 * Lets public pages pick "Dashboard" vs "Log in" without loading Clerk (D-032).
 * Never use this for access control: the app pages check auth properly.
 *
 * Returns null during server render and hydration, then true/false.
 */
function read() {
  const match = document.cookie.match(/(?:^|;\s*)__client_uat(?:_[^=]+)?=([^;]*)/);
  return Boolean(match && match[1] && match[1] !== "0");
}

const subscribe = () => () => undefined;

export function useSignedInHint(): boolean | null {
  return useSyncExternalStore(subscribe, read, () => null);
}
