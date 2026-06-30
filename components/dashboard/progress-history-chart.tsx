"use client";

type ProgressHistoryPoint = {
  bucketStart: string;
  bucketLabel: string;
  value: number;
  attemptCount: number;
};

type ProgressHistoryChartProps = {
  title: string;
  subtitle: string;
  points: ProgressHistoryPoint[];
  formatValue: (value: number) => string;
};

/**
 * Returns the SVG path for a smoothed chart line and area.
 */
function buildChartGeometry(points: ProgressHistoryPoint[]) {
  const width = 720;
  const height = 260;
  const padding = { top: 24, right: 24, bottom: 44, left: 24 };
  const usableWidth = width - padding.left - padding.right;
  const usableHeight = height - padding.top - padding.bottom;
  const values = points.map((point) => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = Math.max(1, maxValue - minValue);

  const positioned = points.map((point, index) => {
    const x =
      padding.left +
      (points.length === 1 ? usableWidth / 2 : (usableWidth / (points.length - 1)) * index);
    const normalized = (point.value - minValue) / valueRange;
    const y = padding.top + usableHeight - normalized * usableHeight;
    return { ...point, x, y };
  });

  const linePath = positioned
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${positioned[positioned.length - 1]?.x ?? padding.left} ${height - padding.bottom} L ${positioned[0]?.x ?? padding.left} ${height - padding.bottom} Z`;

  return {
    width,
    height,
    padding,
    minValue,
    maxValue,
    positioned,
    linePath,
    areaPath,
  };
}

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

export function ProgressHistoryChart({
  title,
  subtitle,
  points,
  formatValue,
}: ProgressHistoryChartProps) {
  if (points.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-line bg-white px-5 py-12 text-center">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <p className="mt-2 text-sm text-muted">
          No completed attempts match the current filters yet.
        </p>
      </div>
    );
  }

  const { width, height, padding, minValue, maxValue, positioned, linePath, areaPath } =
    buildChartGeometry(points);

  return (
    <div className="rounded-[1.75rem] border border-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold text-foreground">{title}</div>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-[0.16em] text-muted">Latest</div>
          <div className="mt-1 text-lg font-semibold text-foreground">
            {formatValue(points[points.length - 1]?.value ?? 0)}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
          <defs>
            <linearGradient id="progress-area-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={height - padding.bottom}
            y2={height - padding.bottom}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top}
            y2={padding.top}
            stroke="#f1f5f9"
            strokeWidth="1"
          />

          <path d={areaPath} fill="url(#progress-area-fill)" />
          <path
            d={linePath}
            fill="none"
            stroke="#4f46e5"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {positioned.map((point, index) => (
            <g key={point.bucketStart}>
              <circle cx={point.x} cy={point.y} r="4.5" fill="#4f46e5" />
              {shouldShowLabel(index, positioned.length) ? (
                <text
                  x={point.x}
                  y={height - 16}
                  textAnchor="middle"
                  className="fill-muted text-[10px]"
                >
                  {point.bucketLabel}
                </text>
              ) : null}
            </g>
          ))}

          <text x={padding.left} y={16} className="fill-muted text-[10px]">
            Max {formatValue(maxValue)}
          </text>
          <text
            x={padding.left}
            y={height - padding.bottom - 8}
            className="fill-muted text-[10px]"
          >
            Min {formatValue(minValue)}
          </text>
        </svg>
      </div>
    </div>
  );
}
