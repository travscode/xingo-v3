"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function AppBootstrap() {
  const { isLoaded, isSignedIn, user } = useUser();
  const seedBaseData = useMutation(api.seed.seedBaseData);
  const syncCurrentUser = useMutation(api.users.syncCurrentUser);
  const seededRef = useRef(false);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (seededRef.current) {
      return;
    }

    seededRef.current = true;
    void seedBaseData();
  }, [seedBaseData]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || syncedRef.current) {
      return;
    }

    syncedRef.current = true;
    const primaryEmail = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress;
    const role =
      typeof user.publicMetadata.role === "string" ? user.publicMetadata.role : undefined;

    void syncCurrentUser({
      clerkId: user.id,
      email: primaryEmail ?? "",
      name: user.fullName ?? user.username ?? "Interpreter",
      imageUrl: user.imageUrl ?? undefined,
      role,
    });
  }, [isLoaded, isSignedIn, syncCurrentUser, user]);

  return null;
}
