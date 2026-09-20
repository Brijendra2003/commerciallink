"use client";

import { useId, useState, type ReactNode } from "react";

/**
 * Every chart ships with a table-view twin. The plot is the fast read; the
 * table is the accessible, exact one — no value is reachable only by hovering.
 */
export function ChartCard({
  title,
  subtitle,
  action,
  table,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  table: { columns: string[]; rows: (string | number)[][] };
  children: ReactNode;
  className?: string;
}) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const panelId = useId();

  return (
    <section
      className={`flex flex-col rounded-lg border border-sand-200 bg-white p-5 sm:p-6 ${className}`}
    >
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[0.9375rem] font-semibold tracking-tight text-brand-900">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-[0.75rem] text-ink-500">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {action}
          <div
            role="tablist"
            aria-label={`${title} view`}
            className="flex rounded-lg border border-sand-200 bg-sand-100 p-0.5"
          >
            {(["chart", "table"] as const).map((v) => (
              <button
                key={v}
                role="tab"
                type="button"
                aria-selected={view === v}
                aria-controls={panelId}
                onClick={() => setView(v)}
                className={`rounded px-3 py-1 text-[0.6875rem] font-semibold capitalize transition-colors ${
                  view === v
                    ? "bg-white text-brand-900 shadow-soft"
                    : "text-ink-500 hover:text-brand-800"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div id={panelId} role="tabpanel" className="flex-1">
        {view === "chart" ? (
          children
        ) : (
          <div className="-mx-1 overflow-x-auto">
            <table className="w-full min-w-[20rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-sand-200">
                  {table.columns.map((c, i) => (
                    <th
                      key={c}
                      scope="col"
                      className={`px-2 pb-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-ink-300 ${
                        i > 0 ? "text-right" : ""
                      }`}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-sand-200/70 last:border-0">
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className={`px-2 py-2.5 text-[0.8125rem] ${
                          ci > 0
                            ? "text-right font-semibold tabular-nums text-brand-900"
                            : "text-ink-500"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
