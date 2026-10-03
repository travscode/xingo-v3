import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Closing call to action used at the bottom of marketing pages. */
export function CtaBand({
  title,
  description,
  href = "/sign-up",
  label = "Start free",
  secondary,
}: {
  title: string;
  description?: ReactNode;
  href?: string;
  label?: string;
  secondary?: ReactNode;
}) {
  return (
    <section className="rounded-xl bg-ink px-6 py-10 text-paper sm:px-10 sm:py-12">
      <h2 className="max-w-2xl text-3xl font-bold tracking-[-0.03em] sm:text-4xl">{title}</h2>
      {description ? (
        <p className="mt-3 max-w-xl text-[15px] leading-6 text-gray-300">{description}</p>
      ) : null}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button asChild variant="accent" size="lg">
          <Link href={href}>
            {label}
            <ArrowRight size={18} />
          </Link>
        </Button>
        {secondary}
      </div>
    </section>
  );
}

/** Standard page intro for secondary marketing pages (one h1). */
export function MarketingIntro({
  eyebrow,
  title,
  description,
  children,
  breadcrumbs,
  media,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Optional <Breadcrumbs className="mb-6 sm:mb-8" /> shown above the eyebrow. */
  breadcrumbs?: ReactNode;
  /** Optional image or illustration shown beside the text from `lg` (below it on smaller screens). */
  media?: ReactNode;
}) {
  const text = (
    <>
      <p className="eyebrow">{eyebrow}</p>
      <h1
        className={
          media
            ? "mt-4 max-w-3xl text-4xl font-bold tracking-[-0.035em] text-balance sm:text-5xl xl:text-6xl"
            : "mt-4 max-w-3xl text-4xl font-bold tracking-[-0.035em] text-balance sm:text-6xl"
        }
      >
        {title}
      </h1>
      {description ? (
        <p className="mt-5 max-w-2xl text-lg leading-7 text-gray-500">{description}</p>
      ) : null}
      {children ? <div className="mt-8 flex flex-col gap-3 sm:flex-row">{children}</div> : null}
    </>
  );

  return (
    <section className={breadcrumbs ? "pt-6 sm:pt-8" : "pt-8 sm:pt-14"}>
      {breadcrumbs}
      {media ? (
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div>{text}</div>
          {media}
        </div>
      ) : (
        text
      )}
    </section>
  );
}
