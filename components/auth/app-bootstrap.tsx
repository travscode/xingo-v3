"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Returns a normalized Clerk public metadata role string when present.
 */
function getClerkPublicRole(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

export function AppBootstrap() {
  const { isLoaded, isSignedIn, user } = useUser();
  const seedBaseData = useMutation(api.seed.seedBaseData);
  const syncCurrentUser = useMutation(api.users.syncCurrentUser);
  const seededRef = useRef(false);
  const lastSuccessfulSyncSignatureRef = useRef<string | null>(null);
  const syncInFlightRef = useRef(false);

  useEffect(() => {
    if (seededRef.current) {
      return;
    }

    seededRef.current = true;
    void seedBaseData();
  }, [seedBaseData]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) {
      return;
    }

    const primaryEmail = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress;
    const role = getClerkPublicRole(user.publicMetadata.role);
    const syncSignature = `${user.id}|${primaryEmail ?? ""}|${user.fullName ?? user.username ?? "Interpreter"}|${user.imageUrl ?? ""}|${role ?? ""}`;

    if (lastSuccessfulSyncSignatureRef.current === syncSignature || syncInFlightRef.current) {
      return;
    }

    syncInFlightRef.current = true;
    console.info("[AppBootstrap] Clerk user metadata snapshot", {
      clerkId: user.id,
      publicMetadata: user.publicMetadata,
      resolvedRole: role ?? null,
    });

    void syncCurrentUser({
      clerkId: user.id,
      email: primaryEmail ?? "",
      name: user.fullName ?? user.username ?? "Interpreter",
      imageUrl: user.imageUrl ?? undefined,
      role,
    })
      .then(() => {
        lastSuccessfulSyncSignatureRef.current = syncSignature;
      })
      .catch((error: unknown) => {
        console.error("[AppBootstrap] Failed to sync current user", error);
      })
      .finally(() => {
        syncInFlightRef.current = false;
      });
  }, [isLoaded, isSignedIn, syncCurrentUser, user]);

  return null;
}
