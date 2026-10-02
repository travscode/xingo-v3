"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { track } from "@/lib/analytics";

/**
 * Keeps the Convex user profile in sync with Clerk. Roles are not sent from
 * here; they are managed server-side (users:setRole, admin invites).
 */
export function AppBootstrap() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const syncCurrentUser = useMutation(api.users.syncCurrentUser);
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
        }
      })
      .catch((error: unknown) => {
        lastSyncedRef.current = null;
        console.error("[AppBootstrap] Failed to sync user", error);
      });
  }, [isAuthenticated, isLoaded, isSignedIn, syncCurrentUser, user]);

  return null;
}
