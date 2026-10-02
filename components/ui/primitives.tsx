import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Page title block. Every app page starts with exactly one of these (one h1). */
export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
        <h1 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-[15px] leading-6 text-gray-500">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
    </header>
  );
}

export function Card({
  className,
  children,
  tone = "default",
}: {
  className?: string;
  children: ReactNode;
  tone?: "default" | "muted" | "inverse";
}) {
  return (
    <div
      className={cn(
        "rounded-xl",
        tone === "default" && "border border-gray-200 bg-paper",
        tone === "muted" && "bg-gray-50",
        tone === "inverse" && "bg-ink text-paper",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-lg font-bold tracking-[-0.02em]">{children}</h2>
      {action}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "live" | "dark" | "warning" | "success";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
        tone === "neutral" && "bg-gray-100 text-gray-700",
        tone === "accent" && "bg-accent text-accent-ink",
        tone === "live" && "bg-live text-paper",
        tone === "dark" && "bg-ink text-paper",
        tone === "warning" && "bg-warning/30 text-ink",
        tone === "success" && "bg-success/10 text-success",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  tone = "ink",
  className,
}: {
  value: number;
  tone?: "ink" | "accent" | "record";
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(1, value));

  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-gray-200", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-[width]",
          tone === "ink" && "bg-ink",
          tone === "accent" && "bg-accent",
          tone === "record" && "bg-record",
        )}
        style={{ width: `${clamped * 100}%` }}
      />
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-3xl font-bold tracking-[-0.03em]">{value}</div>
      {hint ? <div className="mt-1 text-xs text-gray-500">{hint}</div> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl bg-gray-50 px-6 py-12 text-center">
      <p className="text-base font-semibold">{title}</p>
      {description ? <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-gray-100", className)} />;
}
