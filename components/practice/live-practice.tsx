"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PracticeRoom } from "@/components/practice/practice-room";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/primitives";

export function LivePractice({ scenarioId }: { scenarioId: string }) {
  const data = useQuery(api.catalog.scenarioForPractice, { scenarioId });

  if (data === undefined) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <h1 className="text-2xl font-bold">We couldn&apos;t find that dialogue</h1>
        <p className="mt-2 text-gray-500">It may have been renamed or removed.</p>
        <Button asChild className="mt-6">
          <Link href="/courses">Back to practice</Link>
        </Button>
      </div>
    );
  }

  return <PracticeRoom data={data} />;
}
