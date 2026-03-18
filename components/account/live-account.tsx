"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function LiveAccount() {
  const { user } = useUser();
  const currentUser = useQuery(api.users.current, {});

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="section-frame rounded-[2rem] p-6">
        <p className="eyebrow">Profile</p>
        <div className="mt-6 space-y-4 text-sm text-muted">
          <p>Name: {currentUser?.name ?? user?.fullName ?? "Unknown user"}</p>
          <p>
            Email:{" "}
            {currentUser?.email ?? user?.primaryEmailAddress?.emailAddress ?? "Not available"}
          </p>
          <p>Role: {currentUser?.role ?? "interpreter"}</p>
          <p>Subscription: {currentUser?.subscriptionStatus ?? "free"}</p>
        </div>
      </div>
      <div className="surface-card rounded-[2rem] p-6">
        <p className="eyebrow">Preferences</p>
        <div className="mt-6 space-y-4 text-sm text-muted">
          <p>Email preferences</p>
          <p>Password and security</p>
          <p>Voice practice defaults</p>
          <p>Organization memberships</p>
        </div>
      </div>
    </section>
  );
}
