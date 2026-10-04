"use client";

import { useEffect, useRef } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { identify, track } from "@/lib/analytics";

/** Last Clerk session reported to GA, so each sign-in is counted once per browser. */
const REPORTED_SESSION_KEY = "xingo_ga_session";
/** A session older than this when first seen is a returning visit, not a fresh sign-in. */
const FRESH_SESSION_MS = 10 * 60 * 1000;

/**
 * Keeps the Convex user profile in sync with Clerk. Roles are not sent from
 * here; they are managed server-side (users:setRole, admin invites).
 * Also tells GA who is signed in (opaque id, plan and goal only) and reports
 * `sign_up` / `login`.
 */
export function AppBootstrap() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { session } = useSession();
  const { isAuthenticated } = useConvexAuth();
  const syncCurrentUser = useMutation(api.users.syncCurrentUser);
  const me = useQuery(api.users.me, isAuthenticated ? {} : "skip");
  const lastSyncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || !isAuthenticated) {
      return;
    }

    const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? "";
    const name = user.fullName ?? user.username ?? "Interpreter";
    const signature = `${user.id}|${email}|${name}|${user.imageUrl ?? ""}`;

    if (lastSyncedRef.current === signature) {
      return;
    }

    lastSyncedRef.current = signature;
    void syncCurrentUser({ email, name, imageUrl: user.imageUrl ?? undefined })
      .then((result) => {
        if (result.created) {
          track("sign_up", { method: "clerk" });
          rememberReportedSession(session?.id);
        } else if (session && isNewSession(session.id, session.createdAt)) {
          track("login", { method: "clerk" });
          rememberReportedSession(session.id);
        }
      })
      .catch((error: unknown) => {
        lastSyncedRef.current = null;
        console.error("[AppBootstrap] Failed to sync user", error);
      });
  }, [isAuthenticated, isLoaded, isSignedIn, session, syncCurrentUser, user]);

  const plan = me ? (me.user.role === "platform_admin" ? "admin" : me.entitlement.plan) : null;
  const goal = me?.user.practiceGoal ?? "none";
  const packBuyer = me ? me.entitlement.packMinutesPurchased > 0 : false;

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !user) {
      identify(null);
      return;
    }
    if (!plan) return;
    identify(user.id, { plan, practice_goal: goal, pack_buyer: packBuyer ? "yes" : "no" }, plan === "admin");
  }, [goal, isLoaded, isSignedIn, packBuyer, plan, user]);

  return null;
}

function isNewSession(sessionId: string, createdAt: Date) {
  try {
    if (localStorage.getItem(REPORTED_SESSION_KEY) === sessionId) return false;
  } catch {
    // Storage blocked: fall back to the session's age alone.
  }
  return Date.now() - createdAt.getTime() < FRESH_SESSION_MS;
}

function rememberReportedSession(sessionId: string | undefined) {
  if (!sessionId) return;
  try {
    localStorage.setItem(REPORTED_SESSION_KEY, sessionId);
  } catch {
    // Ignore: worst case a sign-in is reported twice.
  }
}
