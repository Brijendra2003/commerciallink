"use client";

import { useState } from "react";
import { ChartEmpty } from "@/components/charts/chart-empty";

const RAMP = [
  "var(--color-viz-step-1)",
  "var(--color-viz-step-2)",
  "var(--color-viz-step-3)",
  "var(--color-viz-step-4)",
  "var(--color-viz-step-5)",
  "var(--color-viz-step-6)",
];

/**
 * Funnel stages are ordered, so this is an *ordinal* encoding: one hue stepped
 * light→dark, never eight categorical colours. Bars are direct-labelled, so the
 * hover layer supplements rather than gates.
 */
export function FunnelChart({
  data,
}: {
  data: { label: string; count: number }[];
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.count), 1);

  if (data.length === 0 || data.every((d) => d.count === 0)) {
    return <ChartEmpty message="No leads in the funnel yet." />;
  }

  return (
    <ol className="space-y-2.5">
      {data.map((stage, i) => {
        const pct = (stage.count / max) * 100;
        // An empty stage above this one means there is no drop-off to state,
        // rather than a 100% (or NaN) one.
        const previous = i === 0 ? 0 : data[i - 1].count;
        const dropoff =
          i === 0 || previous === 0
            ? null
            : Math.round((1 - stage.count / previous) * 100);
        const active = hover === i;

        return (
          <li
            key={stage.label}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            tabIndex={0}
            className="group/stage relative rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            <div className="flex items-baseline justify-between gap-3 pb-1.5">
              <span className="text-[0.75rem] font-semibold text-ink-500">
                {stage.label}
              </span>
              <span className="flex items-baseline gap-2">
                {dropoff !== null && dropoff > 0 ? (
                  <span className="text-[0.6875rem] tabular-nums text-ink-300">
                    −{dropoff}%
                  </span>
                ) : null}
                <span className="text-[0.8125rem] font-bold tabular-nums text-brand-900">
                  {stage.count}
                </span>
              </span>
            </div>

            {/* 20px bar, 4px rounded data-end, square at the baseline. */}
            <div className="h-5 w-full overflow-hidden rounded-l-[2px] bg-sand-100">
              <div
                className="h-full rounded-r-[4px] transition-[width,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  width: `${Math.max(pct, 2)}%`,
                  background: RAMP[i] ?? RAMP[RAMP.length - 1],
                  opacity: hover === null || active ? 1 : 0.55,
                }}
              />
            </div>

            {active ? (
              <div
                role="status"
                // The top row has no room above it — flip that one below the bar
                // rather than letting it ride over the card header.
                className={`pointer-events-none absolute right-0 z-10 rounded-xl bg-brand-900 px-3 py-2 text-[0.6875rem] leading-relaxed text-sand-50 shadow-lift ${
                  i === 0 ? "top-full mt-1" : "-top-1 -translate-y-full"
                }`}
              >
                <span className="font-bold">{stage.count} leads</span> reached{" "}
                {stage.label.toLowerCase()}
                {dropoff !== null ? (
                  <span className="block text-sand-200/70">
                    {dropoff}% drop from {data[i - 1].label.toLowerCase()}
                  </span>
                ) : null}
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
