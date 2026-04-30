import Link from "next/link";
import { Clock, BarChart, Tag } from "lucide-react";
import { ArrowRightIcon } from "@/components/ui/icons";

interface ModuleCardProps {
  module: {
    id: string;
    title: string;
    description: string;
    industryCategory: string;
    durationMinutes: number;
    difficultyLevel: string;
    isFree: boolean;
    badgeIcon: string;
  };
}

export function ModuleCard({ module }: ModuleCardProps) {
  return (
    <article className="surface-card flex h-full flex-col rounded-[2rem] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{module.industryCategory}</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
            {module.title}
          </h3>
        </div>
      </div>
      <p className="mt-4 line-clamp-3 flex-1 text-sm leading-7 text-muted">
        {module.description}
      </p>
      <div className="mt-5 flex flex-wrap gap-2 text-sm text-muted">
        <span className="mono-chip rounded-full px-3 py-2 flex items-center gap-1.5">
          <Clock size={12} className="text-muted/70" />
          {module.durationMinutes} min
        </span>
        <span className="mono-chip rounded-full px-3 py-2 flex items-center gap-1.5 capitalize">
          <BarChart size={12} className="text-muted/70" />
          {module.difficultyLevel}
        </span>
        <span className="mono-chip rounded-full px-3 py-2 flex items-center gap-1.5">
          <Tag size={12} className="text-muted/70" />
          {module.isFree ? "Free" : "Pro"}
        </span>
      </div>
      <Link
        href={`/modules/${module.id}`}
        className="action-secondary mt-6 w-full flex gap-2"
      >
        <span>Open module</span>
        <ArrowRightIcon size={12.6} />
      </Link>
    </article>
  );
}
