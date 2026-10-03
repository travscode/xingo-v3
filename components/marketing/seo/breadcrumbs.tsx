import Link from "next/link";
import { breadcrumbJsonLd, type Crumb } from "@/lib/structured-data";
import { JsonLd } from "@/components/marketing/seo/json-ld";

/** Visible breadcrumb trail plus BreadcrumbList JSON-LD. The last crumb is the current page. */
export function Breadcrumbs({ crumbs, className = "pt-8 sm:pt-10" }: { crumbs: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={`text-sm text-gray-500 ${className}`}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1;
          return (
            <li key={crumb.path} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className="line-clamp-1 text-gray-700">
                  {crumb.name}
                </span>
              ) : (
                <>
                  <Link href={crumb.path} className="hover:text-ink">
                    {crumb.name}
                  </Link>
                  <span aria-hidden>/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </nav>
  );
}
