"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown } from "lucide-react";
import { examIndex } from "@/components/marketing/exam-index";
import { Flag, type FlagCountry } from "@/components/marketing/flag";
import { cn } from "@/lib/utils";

/** The four exams shown in the menu; everything else is one click away on /exams. */
const featured = ["/naati/ccl", "/exams/oet-speaking", "/exams/ielts-speaking", "/exams/amc-clinical-exam"];

/**
 * Header "Exams" mega menu: hover, focus or tap opens a black panel with the top
 * four exams and a "View all exams" card. The trigger still links to /exams.
 */
export function ExamsMenu() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const pathname = usePathname();
  const [openedOn, setOpenedOn] = useState(pathname);
  const exams = featured.map((href) => examIndex.find((exam) => exam.href === href)).filter((exam) => exam !== undefined);
  const countries = [...new Set(examIndex.map((exam) => exam.country))] as FlagCountry[];

  // Close after navigating (render-time reset, no effect needed).
  if (openedOn !== pathname) {
    setOpenedOn(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const show = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hide = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  return (
    <div onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && hide()}>
      <Link
        href="/exams"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={(event) => {
          // Touch: first tap opens the menu, second goes to /exams.
          if (!open && window.matchMedia("(hover: none)").matches) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-gray-100",
          open && "bg-gray-100",
        )}
      >
        Exams
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </Link>

      <div
        className={cn(
          "absolute inset-x-4 top-full z-40 pt-2 transition-[opacity,transform] duration-200 sm:inset-x-6",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
        )}
      >
        <div className="rounded-2xl bg-ink p-4 text-paper shadow-[0_24px_60px_-12px_rgba(0,0,0,0.45)] sm:p-5">
          <div className="mb-4 flex items-center justify-between px-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-paper/50">Practise for your exam</p>
            <p className="text-xs text-paper/40">Independent practice, not affiliated with any exam body</p>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {exams.map((exam) => (
              <li key={exam.href}>
                <Link
                  href={exam.href}
                  className="group flex h-full flex-col rounded-xl bg-paper/[0.06] p-4 transition-colors hover:bg-paper/[0.12]"
                >
                  <span className="flex items-center gap-2 text-xs text-paper/60">
                    <Flag country={exam.country} className="h-3.5 w-5 rounded-[2px]" />
                    {exam.kind}
                  </span>
                  <span className="mt-3 text-lg font-bold tracking-[-0.02em]">{exam.shortName}</span>
                  <span className="mt-1 line-clamp-2 text-sm leading-5 text-paper/60">{exam.audience}</span>
                  <span className="mt-auto flex items-center gap-1 pt-4 text-sm font-semibold text-accent opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    Practise <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/exams"
                className="group flex h-full flex-col justify-between rounded-xl bg-accent p-4 text-accent-ink transition-[filter] hover:brightness-95"
              >
                <span className="flex gap-1.5">
                  {countries.map((country) => (
                    <Flag key={country} country={country} className="h-3.5 w-5 rounded-[2px]" />
                  ))}
                </span>
                <span>
                  <span className="block text-lg font-bold tracking-[-0.02em]">View all exams</span>
                  <span className="mt-1 flex items-center gap-1 text-sm font-semibold">
                    {examIndex.length} exams <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
