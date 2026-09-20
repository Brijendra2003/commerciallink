"use client";

import { useState } from "react";
import { ChartEmpty } from "@/components/charts/chart-empty";
import { FORMATTERS, type ValueFormat } from "@/components/charts/format";

/**
 * Horizontal bars for nominal categories (lead source, asset class). The
 * categories have no natural order, so every bar takes the same slot-1 hue —
 * colouring them darker-where-bigger would re-encode what bar length shows.
 */
export function BarList({
  data,
  format = "number",
  color = "var(--color-viz-series-1)",
  note,
}: {
  data: { label: string; value: number; sub?: string }[];
  format?: ValueFormat;
  color?: string;
  note?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const fmt = FORMATTERS[format];
  const max = Math.max(...data.map((d) => d.value), 1);

  if (data.length === 0) return <ChartEmpty />;

  return (
    <div>
      <ul className="space-y-3">
        {data.map((d, i) => {
          const active = hover === i;
          return (
            <li
              key={d.label}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              tabIndex={0}
              className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              <div className="flex items-baseline justify-between gap-3 pb-1.5">
                <span className="min-w-0 truncate text-[0.75rem] font-medium text-ink-500">
                  {d.label}
                </span>
                <span className="flex shrink-0 items-baseline gap-2">
                  {d.sub ? (
                    <span className="text-[0.6875rem] text-ink-300">{d.sub}</span>
                  ) : null}
                  <span className="text-[0.8125rem] font-bold tabular-nums text-brand-900">
                    {fmt(d.value)}
                  </span>
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-l-[2px] bg-sand-100">
                <div
                  className="h-full rounded-r-[4px] transition-[width,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    width: `${Math.max((d.value / max) * 100, 1.5)}%`,
                    background: color,
                    opacity: hover === null || active ? 1 : 0.5,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      {note ? (
        <p className="mt-4 border-t border-sand-200 pt-3 text-[0.6875rem] leading-relaxed text-ink-300">
          {note}
        </p>
      ) : null}
    </div>
  );
}
