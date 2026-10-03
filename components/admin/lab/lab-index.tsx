"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { ChevronRight, FlaskConical } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Badge, PageHeader, Skeleton } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/admin/content/fields";

/** Admin → Lab: experiments that aren't ready for learners. */
export function LabIndex() {
  const catalog = useQuery(api.catalog.forCurrentUser, {});

  if (!catalog) return <Skeleton className="h-80" />;

  const courses = catalog.modules
    .map((course) => ({ ...course, scenarios: course.scenarios.filter((s) => s.participants.length === 2) }))
    .filter((course) => course.scenarios.length > 0);

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Lab" }]} />
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-1">
            <FlaskConical className="h-3.5 w-3.5" aria-hidden /> Admins only
          </span>
        }
        title="Lab"
        description="Experiments that learners can't see. Sessions here use the normal voice setup but are never scored."
      />
      <section className="rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center gap-2">
          <p className="font-bold">Auto-switch by language</p>
          <Badge tone="warning">Experiment</Badge>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          No tapping to switch person: speak Spanish and it goes to the Spanish speaker, speak English and it goes to the English
          speaker. Each utterance is language-checked with Whisper, so expect about a second of delay. Pick an interpreting dialogue:
        </p>
        <div className="mt-4 space-y-4">
          {courses.map((course) => (
            <div key={course.id}>
              <p className="text-sm font-semibold text-gray-500">{course.title}</p>
              <ul className="mt-1 divide-y divide-gray-200 rounded-xl border border-gray-200">
                {course.scenarios.map((scenario) => (
                  <li key={scenario.id}>
                    <Link href={`/admin/lab/${scenario.id}`} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50">
                      <span>{scenario.title}</span>
                      <ChevronRight className="h-4 w-4 text-gray-500" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
