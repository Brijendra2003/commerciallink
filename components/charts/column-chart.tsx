"use client";

import { useState } from "react";
import { ChartEmpty } from "@/components/charts/chart-empty";
import { FORMATTERS, type ValueFormat } from "@/components/charts/format";

export interface ColumnSeries {
  key: string;
  label: string;
  color: string;
}

/**
 * Stacked/single column chart on one y-axis. Never two scales — where a second
 * measure appears it gets its own chart.
 *
 * Segments are separated by a 2px surface gap rather than a stroke, values are
 * labelled selectively (the peak only), and the rest is carried by the axis,
 * the legend and the hover layer.
 */
export function ColumnChart({
  data,
  series,
  format = "number",
  height = 200,
}: {
  data: Record<string, string | number>[];
  series: ColumnSeries[];
  format?: ValueFormat;
  height?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const fmt = FORMATTERS[format];

  const totals = data.map((d) =>
    series.reduce((sum, s) => sum + Number(d[s.key] ?? 0), 0),
  );
  const peak = Math.max(...totals, 1);
  const peakIndex = totals.indexOf(peak);
  const empty = data.length === 0 || totals.every((t) => t === 0);

  // Round the axis top to a clean number so ticks land on readable values.
  const magnitude = 10 ** Math.floor(Math.log10(peak));
  const top = Math.ceil(peak / magnitude) * magnitude;
  const ticks = [0, top / 2, top];

  if (empty) return <ChartEmpty />;

  return (
    <div>
      {series.length > 1 ? (
        <ul className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          {series.map((s) => (
            <li
              key={s.key}
              className="flex items-center gap-2 text-[0.75rem] text-ink-500"
            >
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: s.color }}
              />
              {s.label}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex gap-3">
        <ul
          className="flex shrink-0 flex-col justify-between py-0.5 text-right text-[0.625rem] tabular-nums text-ink-300"
          style={{ height }}
          aria-hidden="true"
        >
          {[...ticks].reverse().map((t) => (
            <li key={t}>{fmt(t)}</li>
          ))}
        </ul>

        <div className="min-w-0 flex-1">
          <div className="relative" style={{ height }}>
            {/* Hairline gridlines, solid, one step off the surface. */}
            {ticks.map((t) => (
              <span
                key={t}
                aria-hidden="true"
                className="absolute inset-x-0 h-px"
                style={{
                  bottom: `${(t / top) * 100}%`,
                  background:
                    t === 0 ? "var(--color-viz-axis)" : "var(--color-viz-grid)",
                }}
              />
            ))}

            <div className="absolute inset-0 flex items-end justify-between gap-[3%]">
              {data.map((d, i) => {
                const total = totals[i];
                const active = hover === i;

                return (
                  <div
                    key={i}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                    tabIndex={0}
                    aria-label={`${d.label}: ${series
                      .map((s) => `${s.label} ${fmt(Number(d[s.key] ?? 0))}`)
                      .join(", ")}`}
                    className="group/col relative flex h-full min-w-0 flex-1 cursor-default flex-col justify-end outline-none"
                  >
                    {/* Hit target spans the full column height, not just the bar. */}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-0 inset-y-0 rounded-md transition-colors ${
                        active ? "bg-sand-100/70" : ""
                      }`}
                    />

                    {i === peakIndex && !active ? (
                      <span className="relative mb-1.5 text-center text-[0.625rem] font-bold tabular-nums text-brand-900">
                        {fmt(total)}
                      </span>
                    ) : null}

                    <div
                      className="relative mx-auto flex w-full max-w-[24px] flex-col-reverse"
                      style={{ height: `${(total / top) * 100}%` }}
                    >
                      {series.map((s, si) => {
                        const v = Number(d[s.key] ?? 0);
                        if (v === 0) return null;
                        return (
                          <div
                            key={s.key}
                            className={
                              si === series.length - 1
                                ? "rounded-t-[4px]"
                                : undefined
                            }
                            style={{
                              height: `${(v / total) * 100}%`,
                              background: s.color,
                              opacity: hover === null || active ? 1 : 0.5,
                              // 2px surface gap between stacked segments.
                              marginTop: si > 0 ? 2 : 0,
                              transition: "opacity 200ms",
                            }}
                          />
                        );
                      })}
                    </div>

                    {active ? (
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max -translate-x-1/2 rounded-xl bg-brand-900 px-3 py-2 text-left text-[0.6875rem] text-sand-50 shadow-lift">
                        <p className="font-bold">{d.label}</p>
                        {series.map((s) => (
                          <p key={s.key} className="mt-1 flex items-center gap-2">
                            <span
                              aria-hidden="true"
                              className="h-2 w-2 shrink-0 rounded-sm"
                              style={{ background: s.color }}
                            />
                            <span className="text-sand-200/75">{s.label}</span>
                            <span className="ml-auto font-semibold tabular-nums">
                              {fmt(Number(d[s.key] ?? 0))}
                            </span>
                          </p>
                        ))}
                        {series.length > 1 ? (
                          <p className="mt-1.5 border-t border-sand-200/20 pt-1.5 font-semibold">
                            Total {fmt(total)}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <ul
            className="mt-2 flex justify-between gap-[3%] text-[0.625rem] text-ink-300"
            aria-hidden="true"
          >
            {data.map((d, i) => (
              <li key={i} className="min-w-0 flex-1 text-center">
                {String(d.label)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
