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
  const lastSyncSignatureRef = useRef<string | null>(null);

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

    if (lastSyncSignatureRef.current === syncSignature) {
      return;
    }

    lastSyncSignatureRef.current = syncSignature;

    if (process.env.NODE_ENV !== "production") {
      console.info("[AppBootstrap] Clerk user metadata snapshot", {
        clerkId: user.id,
        publicMetadata: user.publicMetadata,
        resolvedRole: role ?? null,
      });
    }

    void syncCurrentUser({
      clerkId: user.id,
      email: primaryEmail ?? "",
      name: user.fullName ?? user.username ?? "Interpreter",
      imageUrl: user.imageUrl ?? undefined,
      role,
    }).catch((error: unknown) => {
      if (process.env.NODE_ENV !== "production") {
        console.error("[AppBootstrap] Failed to sync current user", error);
      }
    });
  }, [isLoaded, isSignedIn, syncCurrentUser, user]);

  return null;
}
