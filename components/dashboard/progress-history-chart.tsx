"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

type ProgressHistoryPoint = {
  bucketStart: string;
  bucketLabel: string;
  value: number;
  attemptCount: number;
};

type ProgressHistorySeries = {
  id: string;
  label: string;
  color: string;
  points: ProgressHistoryPoint[];
  formatValue: (value: number) => string;
};

type ProgressHistoryChartProps = {
  title: string;
  subtitle: string;
  series: ProgressHistorySeries[];
};

type PositionedPoint = ProgressHistoryPoint & {
  x: number;
  y: number;
};

const DEFAULT_CHART_WIDTH = 720;
const MIN_CHART_WIDTH = 320;

/**
 * Limits x-axis labels so dense ranges stay readable.
 */
function shouldShowLabel(index: number, total: number) {
  if (total <= 6) {
    return true;
  }

  if (total <= 12) {
    return index % 2 === 0 || index === total - 1;
  }

  const step = Math.ceil(total / 6);
  return index % step === 0 || index === total - 1;
}

/**
 * Builds the SVG line path for one positioned series.
 */
function buildLinePath(points: PositionedPoint[]) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

/**
 * Builds a filled area shape under the primary series.
 */
function buildAreaPath(
  points: PositionedPoint[],
  baselineY: number,
  fallbackX: number,
) {
  const linePath = buildLinePath(points);
  return `${linePath} L ${points[points.length - 1]?.x ?? fallbackX} ${baselineY} L ${points[0]?.x ?? fallbackX} ${baselineY} Z`;
}

/**
 * Calculates shared chart coordinates for every displayed series.
 */
function buildChartGeometry(
  series: ProgressHistorySeries[],
  containerWidth: number,
) {
  const width = Math.max(MIN_CHART_WIDTH, Math.floor(containerWidth));
  const height = 260;
  const padding = { top: 24, right: 24, bottom: 44, left: 24 };
  const usableWidth = width - padding.left - padding.right;
  const usableHeight = height - padding.top - padding.bottom;
  const referencePoints = series[0]?.points ?? [];
  const values = series.flatMap((item) =>
    item.points.map((point) => point.value),
  );
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = Math.max(1, maxValue - minValue);

  const positionedSeries = series.map((item) => ({
    ...item,
    positionedPoints: item.points.map((point, index) => {
      const x =
        padding.left +
        (referencePoints.length === 1
          ? usableWidth / 2
          : (usableWidth / (referencePoints.length - 1)) * index);
      const normalized = (point.value - minValue) / valueRange;
      const y = padding.top + usableHeight - normalized * usableHeight;
      return { ...point, x, y };
    }),
  }));

  return {
    width,
    height,
    padding,
    minValue,
    maxValue,
    baselineY: height - padding.bottom,
    referencePoints,
    positionedSeries,
  };
}

/**
 * Returns the interaction zone width for one x-axis bucket.
 */
function getHitAreaWidth(total: number, usableWidth: number) {
  if (total <= 1) {
    return usableWidth;
  }

  return usableWidth / (total - 1);
}

/**
 * Places the tooltip bubble so it stays inside the chart viewport.
 */
function getTooltipPosition(x: number, y: number, width: number) {
  const tooltipWidth = 180;
  const preferredX = x + 14;
  const tooltipX =
    preferredX + tooltipWidth > width - 12 ? x - tooltipWidth - 14 : preferredX;
  return {
    x: Math.max(12, tooltipX),
    y: Math.max(12, y - 78),
    width: tooltipWidth,
  };
}

export function ProgressHistoryChart({
  title,
  subtitle,
  series,
}: ProgressHistoryChartProps) {
  const gradientId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(DEFAULT_CHART_WIDTH);
  const primarySeries = series[0];
  const latestPrimaryPoint =
    primarySeries?.points[primarySeries.points.length - 1] ?? null;

  /**
   * Tracks the rendered container width so the SVG geometry can fill it exactly.
   */
  useEffect(() => {
    const node = containerRef.current;

    if (!node) {
      return;
    }

    const updateWidth = (nextWidth: number) => {
      setContainerWidth(Math.max(MIN_CHART_WIDTH, Math.floor(nextWidth)));
    };

    updateWidth(node.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      updateWidth(entry.contentRect.width);
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  const chart = useMemo(() => {
    if (series.length === 0 || !series[0] || series[0].points.length === 0) {
      return null;
    }

    return buildChartGeometry(series, containerWidth);
  }, [containerWidth, series]);

  if (!chart || !primarySeries || primarySeries.points.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-line bg-white px-5 py-12 text-center">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <p className="mt-2 text-sm text-muted">
          No completed attempts match the current filters yet.
        </p>
      </div>
    );
  }

  const activeIndex =
    hoveredIndex !== null ? hoveredIndex : primarySeries.points.length - 1;
  const activePrimaryPoint =
    chart.positionedSeries[0]?.positionedPoints[activeIndex] ?? null;
  const activeTooltipSeries = chart.positionedSeries
    .map((item) => ({
      id: item.id,
      label: item.label,
      color: item.color,
      point: item.positionedPoints[activeIndex],
      formatValue: item.formatValue,
    }))
    .filter((item) => Boolean(item.point));
  const tooltipY = Math.min(
    ...activeTooltipSeries.map((item) => item.point?.y ?? chart.padding.top),
  );
  const tooltipPosition = activePrimaryPoint
    ? getTooltipPosition(activePrimaryPoint.x, tooltipY, chart.width)
    : null;
  const usableWidth = chart.width - chart.padding.left - chart.padding.right;

  return (
    <div className="rounded-[1.75rem] border border-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold text-foreground">{title}</div>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-[0.16em] text-muted">
            Latest
          </div>
          <div className="mt-1 text-lg font-semibold text-foreground">
            {latestPrimaryPoint
              ? primarySeries.formatValue(latestPrimaryPoint.value)
              : primarySeries.formatValue(0)}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {series.map((item) => (
          <div
            key={item.id}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-[#fafafa] px-3 py-1.5 text-sm text-muted"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </div>
        ))}
      </div>

      <div ref={containerRef} className="mt-5 w-full">
        <svg
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          className="h-72 w-full"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient
              id={`progress-area-fill-${gradientId}`}
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={primarySeries.color}
                stopOpacity="0.24"
              />
              <stop
                offset="100%"
                stopColor={primarySeries.color}
                stopOpacity="0.02"
              />
            </linearGradient>
          </defs>

          <line
            x1={chart.padding.left}
            x2={chart.width - chart.padding.right}
            y1={chart.baselineY}
            y2={chart.baselineY}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
          <line
            x1={chart.padding.left}
            x2={chart.width - chart.padding.right}
            y1={chart.padding.top}
            y2={chart.padding.top}
            stroke="#f1f5f9"
            strokeWidth="1"
          />
          <line
            x1={chart.padding.left}
            x2={chart.width - chart.padding.right}
            y1={chart.padding.top + (chart.baselineY - chart.padding.top) / 2}
            y2={chart.padding.top + (chart.baselineY - chart.padding.top) / 2}
            stroke="#f8fafc"
            strokeWidth="1"
          />

          <path
            d={buildAreaPath(
              chart.positionedSeries[0].positionedPoints,
              chart.baselineY,
              chart.padding.left,
            )}
            fill={`url(#progress-area-fill-${gradientId})`}
          />

          {chart.positionedSeries.map((item) => (
            <path
              key={item.id}
              d={buildLinePath(item.positionedPoints)}
              fill="none"
              stroke={item.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {activePrimaryPoint ? (
            <line
              x1={activePrimaryPoint.x}
              x2={activePrimaryPoint.x}
              y1={chart.padding.top}
              y2={chart.baselineY}
              stroke="#cbd5e1"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          ) : null}

          {chart.positionedSeries.map((item) =>
            item.positionedPoints.map((point, index) => (
              <g key={`${item.id}_${point.bucketStart}`}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={index === activeIndex ? 6 : 4.5}
                  fill={item.color}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                {item.id === primarySeries.id &&
                shouldShowLabel(index, item.positionedPoints.length) ? (
                  <text
                    x={point.x}
                    y={chart.height - 16}
                    textAnchor="middle"
                    className="fill-muted text-[10px]"
                  >
                    {point.bucketLabel}
                  </text>
                ) : null}
              </g>
            )),
          )}

          {chart.referencePoints.map((point, index) => {
            const hitAreaWidth = getHitAreaWidth(
              chart.referencePoints.length,
              usableWidth,
            );
            return (
              <rect
                key={`hit_${point.bucketStart}`}
                x={chart.padding.left + hitAreaWidth * index - hitAreaWidth / 2}
                y={chart.padding.top}
                width={hitAreaWidth}
                height={chart.baselineY - chart.padding.top}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(index)}
              />
            );
          })}

          {tooltipPosition && activePrimaryPoint ? (
            <g>
              <rect
                x={tooltipPosition.x}
                y={tooltipPosition.y}
                width={tooltipPosition.width}
                height={30 + activeTooltipSeries.length * 18}
                rx="14"
                fill="#111827"
                opacity="0.96"
              />
              <text
                x={tooltipPosition.x + 14}
                y={tooltipPosition.y + 18}
                className="fill-white text-[11px] font-semibold"
              >
                {activePrimaryPoint.bucketLabel}
              </text>
              {activeTooltipSeries.map((item, index) => (
                <g key={`tooltip_${item.id}`}>
                  <circle
                    cx={tooltipPosition.x + 18}
                    cy={tooltipPosition.y + 32 + index * 18}
                    r="3.5"
                    fill={item.color}
                  />
                  <text
                    x={tooltipPosition.x + 28}
                    y={tooltipPosition.y + 35 + index * 18}
                    className="fill-white text-[10px]"
                  >
                    {item.label}: {item.formatValue(item.point?.value ?? 0)}
                  </text>
                </g>
              ))}
            </g>
          ) : null}

          <text
            x={chart.padding.left}
            y={16}
            className="fill-muted text-[10px]"
          >
            Max {primarySeries.formatValue(chart.maxValue)}
          </text>
          <text
            x={chart.padding.left}
            y={chart.baselineY - 8}
            className="fill-muted text-[10px]"
          >
            Min {primarySeries.formatValue(chart.minValue)}
          </text>
        </svg>
      </div>
    </div>
  );
}
