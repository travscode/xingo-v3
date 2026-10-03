"use client";

import Link from "next/link";
import { BadgeCheck, Check, Languages, MessagesSquare, Plus } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export type CourseCardData = {
  moduleId: string;
  slug: string;
  kind: "roleplay" | "interpreting";
  title: string;
  tagline: string;
  creatorName: string;
  certifications: Array<{ name: string; issuer?: string }>;
  bannerUrl: string | null;
  logoUrl: string | null;
  scenarioCount: number;
  addCount: number;
  inLibrary?: boolean;
  isOwner?: boolean;
  status?: "draft" | "published" | "removed";
};

/** Banner image, or a quiet pattern so cards without one still look intentional. */
export function CourseBanner({ url, title, className }: { url: string | null; title: string; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-ink", className)}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-end bg-[radial-gradient(circle_at_20%_20%,#2a2a2a,transparent_55%),radial-gradient(circle_at_80%_70%,#1a1a1a,transparent_50%)] p-4">
          <span className="line-clamp-2 text-lg font-bold leading-tight tracking-[-0.02em] text-paper/90">{title}</span>
        </div>
      )}
    </div>
  );
}

export function CourseCard({
  course,
  onAdd,
  adding,
}: {
  course: CourseCardData;
  onAdd?: () => void;
  adding?: boolean;
}) {
  const href = course.isOwner ? `/marketplace/manage/${course.moduleId}` : `/marketplace/${course.slug}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-paper transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
      <Link href={href} className="relative block">
        <CourseBanner url={course.bannerUrl} title={course.title} className="aspect-[2/1]" />
        {course.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.logoUrl}
            alt=""
            className="absolute -bottom-5 left-4 h-11 w-11 rounded-xl border-2 border-paper bg-paper object-contain"
          />
        ) : null}
      </Link>
      <div className={cn("flex flex-1 flex-col p-4", course.logoUrl && "pt-7")}>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge>
            {course.kind === "roleplay" ? <MessagesSquare className="h-3 w-3" aria-hidden /> : <Languages className="h-3 w-3" aria-hidden />}
            {course.kind === "roleplay" ? "One-on-one" : "Interpreting"}
          </Badge>
          {course.certifications[0] ? (
            <Badge tone="accent">
              <BadgeCheck className="h-3 w-3" aria-hidden /> {course.certifications[0].name}
            </Badge>
          ) : null}
          {course.status && course.status !== "published" ? (
            <Badge tone="warning" className="capitalize">
              {course.status}
            </Badge>
          ) : null}
        </div>
        <Link href={href} className="mt-2 font-bold leading-snug hover:underline">
          {course.title}
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-gray-500">{course.tagline}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <p className="min-w-0 truncate text-xs text-gray-500">
            By <span className="font-semibold text-ink">{course.creatorName}</span> · {course.scenarioCount}{" "}
            {course.scenarioCount === 1 ? "scenario" : "scenarios"}
          </p>
          {onAdd && !course.isOwner ? (
            course.inLibrary ? (
              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-gray-500">
                <Check className="h-3.5 w-3.5" aria-hidden /> Added
              </span>
            ) : (
              <button
                type="button"
                onClick={onAdd}
                disabled={adding}
                className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg bg-gray-100 px-2.5 text-xs font-semibold hover:bg-gray-200 disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden /> Add
              </button>
            )
          ) : null}
        </div>
      </div>
    </article>
  );
}
