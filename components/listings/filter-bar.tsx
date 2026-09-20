"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SearchIcon } from "@/components/ui/icons";
import { Loader } from "@/components/ui/loader";
import {
  AREA_BANDS,
  BUDGET_BANDS,
  MICRO_MARKETS,
  POSSESSION_LABEL,
  PROPERTY_TYPES,
  SORT_OPTIONS,
  ZONES,
} from "@/lib/data/taxonomy";

export type Filters = {
  q: string;
  type: string;
  /** Micro-market within the MMR — the portal covers Mumbai only. */
  market: string;
  zone: string;
  purpose: string;
  budget: string;
  area: string;
  possession: string;
  sort: string;
};

const EMPTY: Filters = {
  q: "",
  type: "",
  market: "",
  zone: "",
  purpose: "",
  budget: "",
  area: "",
  possession: "",
  sort: "newest",
};

function toQuery(filters: Filters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value && !(key === "sort" && value === "newest")) params.set(key, value);
  }
  const q = params.toString();
  return q ? `/properties?${q}` : "/properties";
}

/**
 * Filters live in the URL so a filtered search is shareable and indexable —
 * the long-tail landing pages in Section 8 depend on it.
 */
export function FilterBar({ initial }: { initial: Filters }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filters, setFilters] = useState<Filters>(initial);

  function apply(next: Filters) {
    setFilters(next);
    startTransition(() => router.push(toQuery(next), { scroll: false }));
  }

  function set<K extends keyof Filters>(key: K, value: string) {
    apply({ ...filters, [key]: value });
  }

  const active = (Object.keys(EMPTY) as (keyof Filters)[]).filter(
    (k) => k !== "sort" && filters[k],
  );

  return (
    <div
      className={`rounded-lg border border-sand-200 bg-white p-4 transition-opacity sm:p-5 ${
        pending ? "opacity-60" : ""
      }`}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply(filters);
        }}
        className="flex flex-col gap-3"
      >
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <label htmlFor="filter-q" className="sr-only">
            Search listings
          </label>
          <input
            id="filter-q"
            type="search"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder="Search by micro-market, zoning or amenity — try “dock leveller” or “BKC”"
            className="field-input pl-9"
          />
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            label="Property type"
            value={filters.type}
            onChange={(v) => set("type", v)}
            options={PROPERTY_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            anyLabel="All types"
          />
          <Select
            label="Zone"
            value={filters.zone}
            onChange={(v) => apply({ ...filters, zone: v, market: "" })}
            options={ZONES.map((z) => ({ value: z.value, label: z.label }))}
            anyLabel="All of MMR"
          />
          <Select
            label="Micro-market"
            value={filters.market}
            onChange={(v) => set("market", v)}
            options={
              filters.zone
                ? MICRO_MARKETS.filter((m) => m.zone === filters.zone).map((m) => ({
                    value: m.name,
                    label: m.name,
                  }))
                : // Eighty markets is too many to scan flat, so they are
                  // grouped by corridor until a zone narrows them.
                  ZONES.map((zone) => ({
                    group: zone.label,
                    options: MICRO_MARKETS.filter((m) => m.zone === zone.value).map(
                      (m) => ({ value: m.name, label: m.name }),
                    ),
                  }))
            }
            anyLabel={filters.zone ? "Anywhere in this zone" : "Any micro-market"}
          />
          <Select
            label="Buy or lease"
            value={filters.purpose}
            onChange={(v) => set("purpose", v)}
            options={[
              { value: "lease", label: "For lease" },
              { value: "buy", label: "For sale" },
            ]}
            anyLabel="Either"
          />
          <Select
            label="Budget"
            value={filters.budget}
            onChange={(v) => set("budget", v)}
            options={BUDGET_BANDS.map((b) => ({ value: b.value, label: b.label }))}
            anyLabel="Any budget"
          />
          <Select
            label="Area"
            value={filters.area}
            onChange={(v) => set("area", v)}
            options={AREA_BANDS.map((a) => ({ value: a.value, label: a.label }))}
            anyLabel="Any size"
          />
          <Select
            label="Possession"
            value={filters.possession}
            onChange={(v) => set("possession", v)}
            options={Object.entries(POSSESSION_LABEL).map(([value, label]) => ({
              value,
              label,
            }))}
            anyLabel="Any status"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-sand-200 pt-3.5">
          <div className="flex items-center gap-2.5">
            <label
              htmlFor="filter-sort"
              className="text-[0.75rem] font-semibold text-ink-500"
            >
              Sort
            </label>
            <select
              id="filter-sort"
              value={filters.sort}
              onChange={(e) => set("sort", e.target.value)}
              className="field-input w-auto py-2 text-[0.8125rem]"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            {active.length > 0 ? (
              <button
                type="button"
                onClick={() => apply({ ...EMPTY, sort: filters.sort })}
                className="text-[0.75rem] font-semibold text-ink-500 underline underline-offset-4 transition-colors hover:text-brand-700"
              >
                Clear {active.length} filter{active.length > 1 ? "s" : ""}
              </button>
            ) : null}
            {/* Changing any control re-runs the query, so this reports every
                filter change and not only a press of Apply. */}
            <button
              type="submit"
              disabled={pending}
              aria-busy={pending || undefined}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-5 py-2.5 text-[0.8125rem] font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-80"
            >
              {pending ? <Loader size="xs" /> : null}
              {pending ? "Filtering…" : "Apply"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

type Option = { value: string; label: string };
type OptionGroup = { group: string; options: Option[] };

function Select({
  label,
  value,
  onChange,
  options,
  anyLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[] | OptionGroup[];
  anyLabel: string;
}) {
  const id = `filter-${label.replace(/\s+/g, "-").toLowerCase()}`;
  const grouped = options.length > 0 && "group" in options[0];

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-[0.625rem] font-bold uppercase tracking-[0.13em] text-ink-300"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field-input py-2.5 text-[0.8125rem]"
      >
        <option value="">{anyLabel}</option>
        {grouped
          ? (options as OptionGroup[]).map((g) => (
              <optgroup key={g.group} label={g.group}>
                {g.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            ))
          : (options as Option[]).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
      </select>
    </div>
  );
}
