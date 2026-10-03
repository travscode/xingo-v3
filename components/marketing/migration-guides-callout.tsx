import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MIGRATION_GUIDES_ANCHOR, MIGRATION_HUB_PATH, migrationGuidePath, migrationGuidesForPage } from "@/lib/migration-guides";

/**
 * "Moving to Australia?" strip linking a practice page into the migration guide
 * cluster (lib/migration-guides). Renders nothing for pages without guides.
 */
export function MigrationGuidesCallout({ pagePath, className }: { pagePath: string; className?: string }) {
  const guides = migrationGuidesForPage(pagePath);
  if (!guides.length) return null;

  return (
    <aside
      aria-labelledby="moving-to-australia"
      className={`grid gap-5 rounded-xl border border-gray-200 p-5 sm:p-6 md:grid-cols-[minmax(0,16rem)_1fr] md:items-start md:gap-8 ${className ?? ""}`}
    >
      <div>
        <h2 id="moving-to-australia" className="text-lg font-bold tracking-[-0.02em]">
          Moving to Australia?
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          Plain-English guides to where this fits in your move.{" "}
          <Link href={`${MIGRATION_HUB_PATH}#${MIGRATION_GUIDES_ANCHOR}`} className="font-semibold text-ink underline underline-offset-4">
            All migration guides
          </Link>
        </p>
      </div>
      <ul className={`grid gap-3 ${guides.length > 1 ? "sm:grid-cols-2" : ""}`}>
        {guides.map((guide) => (
          <li key={guide.slug}>
            <Link
              href={migrationGuidePath(guide.slug)}
              className="group flex h-full flex-col rounded-lg bg-gray-50 p-4 hover:bg-gray-100"
            >
              <span className="inline-flex items-start gap-1.5 font-bold leading-6">
                {guide.title}
                <ArrowRight size={16} className="mt-1 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
              <span className="mt-1 line-clamp-2 text-sm leading-6 text-gray-500">{guide.excerpt}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
