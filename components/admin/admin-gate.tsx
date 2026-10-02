"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/primitives";

/** Renders children only for platform admins (UI convenience; Convex enforces access). */
export function AdminGate({ children }: { children: ReactNode }) {
  const me = useQuery(api.users.me, {});

  if (me === undefined) {
    return <Skeleton className="h-80" />;
  }

  if (me?.user.role !== "platform_admin") {
    return (
      <EmptyState
        title="Admins only"
        description="Ask an existing admin to invite you from Admin → Invites."
        action={
          <Button asChild>
            <Link href="/dashboard">Home</Link>
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
}
