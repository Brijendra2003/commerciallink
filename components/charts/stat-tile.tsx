import type { ReactNode } from "react";

/**
 * Stat tile: label · value · optional signed delta · optional 12-point
 * sparkline. Values use proportional figures — tabular-nums would make a
 * display-size number look loose.
 */
export function StatTile({
  label,
  value,
  delta,
  deltaLabel,
  upIsGood = true,
  spark,
  icon,
}: {
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  upIsGood?: boolean;
  spark?: number[];
  icon?: ReactNode;
}) {
  const good = delta === undefined ? null : delta >= 0 === upIsGood;

  return (
    <div className="rounded-3xl border border-brand-900/8 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.75rem] font-medium text-ink-500">{label}</p>
        {icon ? (
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
            {icon}
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-[1.75rem] font-bold leading-none tracking-[-0.02em] text-brand-900">
        {value}
      </p>

      <div className="mt-3 flex items-end justify-between gap-3">
        {delta !== undefined ? (
          <p className="flex items-center gap-1.5 text-[0.75rem]">
            <span
              aria-hidden="true"
              className="text-[0.875rem] leading-none"
              style={{
                color: good
                  ? "var(--color-status-good)"
                  : "var(--color-status-critical)",
              }}
            >
              {delta >= 0 ? "↑" : "↓"}
            </span>
            <span
              className="font-bold tabular-nums"
              style={{
                color: good
                  ? "var(--color-status-good)"
                  : "var(--color-status-critical)",
              }}
            >
              {Math.abs(delta)}%
            </span>
            {deltaLabel ? (
              <span className="text-ink-300">{deltaLabel}</span>
            ) : null}
          </p>
        ) : (
          <span />
        )}

        {spark && spark.length > 1 ? <Sparkline points={spark} /> : null}
      </div>
    </div>
  );
}

function Sparkline({ points }: { points: number[] }) {
  const w = 72;
  const h = 24;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / range) * (h - 4) - 2;
    return [x, y] as const;
  });

  const d = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const [lastX, lastY] = coords[coords.length - 1];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      aria-hidden="true"
      className="shrink-0 overflow-visible"
    >
      <path
        d={d}
        fill="none"
        stroke="var(--color-viz-step-1)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* The current period carries the accent; the ring keeps it legible. */}
      <circle
        cx={lastX}
        cy={lastY}
        r="4"
        fill="var(--color-viz-series-1)"
        stroke="#ffffff"
        strokeWidth="2"
      />
    </svg>
  );
}
