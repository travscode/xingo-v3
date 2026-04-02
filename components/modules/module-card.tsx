import Link from "next/link";

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
    <article className="surface-card flex h-full flex-col rounded-[1.75rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{module.industryCategory}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{module.title}</h3>
        </div>
        <span className="mono-chip rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
          {module.difficultyLevel}
        </span>
      </div>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-muted">{module.description}</p>
      <div className="mt-6 flex flex-wrap gap-2 text-sm text-muted">
        <span>{module.durationMinutes} min</span>
        <span>•</span>
        <span>{module.isFree ? "Free access" : "Professional"}</span>
        <span>•</span>
        <span>{module.badgeIcon}</span>
      </div>
      <Link
        href={`/modules/${module.id}`}
        className="mt-6 inline-flex w-fit rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong"
      >
        View module
      </Link>
    </article>
  );
}
