"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Small SVG charts for the admin Analytics tab. Black and white (docs/design-system.md):
 * the main series is ink, a second series is light grey, with a legend and a hover
 * tooltip on every chart. One y-axis per chart.
 */

export type ChartSeries = {
  label: string;
  values: (number | null)[];
  /** "ink" (default) or "soft" for the second series. */
  tone?: "ink" | "soft";
};

const tones = { ink: "var(--ink)", soft: "var(--gray-300)" } as const;

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/** 0, and two or three round steps up to just above `max`. */
function niceTicks(max: number) {
  if (max <= 0) return [0, 1];
  const rough = max / 3;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= rough) ?? rough;
  const ticks: number[] = [];
  for (let t = 0; t < max + step * 0.999; t += step) ticks.push(Number(t.toPrecision(6)));
  return ticks;
}

export function Legend({ series }: { series: ChartSeries[] }) {
  if (series.length < 2) return null;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
      {series.map((s) => (
        <span key={s.label} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: tones[s.tone ?? "ink"] }} aria-hidden />
          {s.label}
        </span>
      ))}
    </div>
  );
}

/**
 * Values over time (or any ordered buckets). `kind="bar"` stacks the series;
 * `kind="line"` draws each one as a 2px line.
 */
export function TimeChart({
  labels,
  series,
  kind = "bar",
  format = (n) => n.toLocaleString("en-AU"),
  height = 180,
  tickEvery,
}: {
  labels: string[];
  series: ChartSeries[];
  kind?: "bar" | "line";
  format?: (n: number) => string;
  height?: number;
  /** Show every nth x label (default: about six labels). */
  tickEvery?: number;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const n = labels.length;

  const pad = { top: 8, right: 8, bottom: 22, left: 44 };
  const plotW = Math.max(0, width - pad.left - pad.right);
  const plotH = height - pad.top - pad.bottom;

  const totals = labels.map((_, i) =>
    kind === "bar"
      ? series.reduce((sum, s) => sum + (s.values[i] ?? 0), 0)
      : Math.max(0, ...series.map((s) => s.values[i] ?? 0)),
  );
  const ticks = niceTicks(Math.max(0, ...totals));
  const top = ticks.at(-1) || 1;
  const y = (v: number) => pad.top + plotH - (v / top) * plotH;
  const step = n ? plotW / n : 0;
  const x = (i: number) => pad.left + step * i + step / 2;
  const every = tickEvery ?? Math.max(1, Math.ceil(n / 6));
  const barW = Math.max(1, Math.min(28, step - 2));

  const onMove = (event: React.PointerEvent<SVGRectElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const i = Math.floor(((event.clientX - box.left) / box.width) * n);
    setHover(Math.min(n - 1, Math.max(0, i)));
  };

  return (
    <div className="space-y-2">
      <Legend series={series} />
      <div ref={ref} className="relative" style={{ height }}>
        {width > 0 ? (
          <svg width={width} height={height} role="img" aria-label={series.map((s) => s.label).join(", ")}>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} stroke="var(--gray-200)" strokeWidth={1} />
                <text x={pad.left - 6} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill="var(--gray-500)">
                  {format(t)}
                </text>
              </g>
            ))}
            {labels.map((label, i) =>
              (n - 1 - i) % every === 0 ? (
                <text key={i} x={x(i)} y={height - 6} textAnchor="middle" fontSize={11} fill="var(--gray-500)">
                  {label}
                </text>
              ) : null,
            )}

            {hover !== null ? (
              <rect x={pad.left + step * hover} y={pad.top} width={step} height={plotH} fill="var(--gray-50)" />
            ) : null}

            {kind === "bar"
              ? labels.map((_, i) => {
                  let base = 0;
                  return (
                    <g key={i}>
                      {series.map((s, si) => {
                        const v = s.values[i] ?? 0;
                        if (v <= 0) return null;
                        const y0 = y(base);
                        base += v;
                        const y1 = y(base);
                        // 2px gap between stacked segments; round only the top of the stack.
                        const isTop = series.slice(si + 1).every((other) => (other.values[i] ?? 0) <= 0);
                        const h = Math.max(1, y0 - y1 - (si > 0 ? 2 : 0));
                        return (
                          <rect
                            key={s.label}
                            x={x(i) - barW / 2}
                            y={y1}
                            width={barW}
                            height={h}
                            rx={isTop ? Math.min(4, barW / 2, h / 2) : 0}
                            fill={tones[s.tone ?? "ink"]}
                          />
                        );
                      })}
                    </g>
                  );
                })
              : series.map((s) => {
                  let d = "";
                  s.values.forEach((v, i) => {
                    if (v === null) return;
                    d += `${d && s.values[i - 1] !== null ? "L" : "M"}${x(i)},${y(v)}`;
                  });
                  return (
                    <path
                      key={s.label}
                      d={d}
                      fill="none"
                      stroke={tones[s.tone ?? "ink"]}
                      strokeWidth={2}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  );
                })}

            {kind === "line" && hover !== null
              ? series.map((s) =>
                  s.values[hover] === null ? null : (
                    <circle
                      key={s.label}
                      cx={x(hover)}
                      cy={y(s.values[hover] ?? 0)}
                      r={4}
                      fill={tones[s.tone ?? "ink"]}
                      stroke="var(--paper)"
                      strokeWidth={2}
                    />
                  ),
                )
              : null}
            {kind === "line" && n === 1
              ? series.map((s) => (
                  <circle key={s.label} cx={x(0)} cy={y(s.values[0] ?? 0)} r={4} fill={tones[s.tone ?? "ink"]} />
                ))
              : null}

            <rect
              x={pad.left}
              y={pad.top}
              width={plotW}
              height={plotH}
              fill="transparent"
              onPointerMove={onMove}
              onPointerLeave={() => setHover(null)}
            />
          </svg>
        ) : null}
        {hover !== null && width > 0 ? (
          <div
            className="pointer-events-none absolute z-10 min-w-[120px] rounded-lg bg-ink px-3 py-2 text-xs text-paper shadow-lg"
            style={{
              top: 0,
              left: Math.min(Math.max(0, x(hover) + 12), width - 160),
            }}
          >
            <p className="font-semibold">{labels[hover]}</p>
            {series.map((s) => (
              <p key={s.label} className="mt-0.5 flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-gray-300">
                  {series.length > 1 ? (
                    <span className="h-2 w-2 rounded-sm" style={{ background: s.tone === "soft" ? "var(--gray-300)" : "var(--paper)" }} />
                  ) : null}
                  {s.label}
                </span>
                <span className="font-semibold tabular-nums">{s.values[hover] === null ? "—" : format(s.values[hover] ?? 0)}</span>
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** A card holding one chart: title, the headline value and the chart. */
export function ChartCard({
  title,
  value,
  hint,
  children,
  className,
}: {
  title: string;
  value?: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-gray-200 bg-paper p-5", className)}>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
        {value !== undefined ? <p className="text-xl font-bold tracking-[-0.02em]">{value}</p> : null}
      </div>
      {children}
      {hint ? <p className="mt-3 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

/** Ranked horizontal bars: label on the left, value on the right. */
export function BarList({
  rows,
  format = (n) => n.toLocaleString("en-AU"),
  note,
  empty = "Nothing yet in this period.",
}: {
  rows: { label: string; count: number }[];
  format?: (n: number) => string;
  /** Extra text after the value, e.g. a percentage. */
  note?: (row: { label: string; count: number }, index: number) => ReactNode;
  empty?: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  if (rows.length === 0 || rows.every((r) => r.count === 0)) {
    return <p className="text-sm text-gray-500">{empty}</p>;
  }
  return (
    <ul className="space-y-2.5">
      {rows.map((row, i) => (
        <li key={row.label} title={`${row.label}: ${format(row.count)}`}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">{row.label}</span>
            <span className="shrink-0 tabular-nums">
              <span className="font-semibold">{format(row.count)}</span>
              {note ? <span className="ml-1.5 text-xs text-gray-500">{note(row, i)}</span> : null}
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-gray-100">
            <div className="h-1.5 rounded-full bg-ink" style={{ width: `${(row.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
