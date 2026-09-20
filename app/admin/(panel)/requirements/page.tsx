import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { RequirementBadge } from "@/components/admin/status-badge";
import { StatTile } from "@/components/charts/stat-tile";
import { getLeads, getPublishedProperties, getRequirements } from "@/lib/data/queries";
import { PROPERTY_TYPE_LABEL } from "@/lib/data/taxonomy";
import { formatArea, formatRate } from "@/lib/format";
import type { PropertyType } from "@/lib/types";

export const metadata: Metadata = { title: "Requirements" };

export default async function RequirementsPage() {
  const [requirements, leads, all] = await Promise.all([
    getRequirements(),
    getLeads(),
    getPublishedProperties(),
  ]);
  const open = requirements.filter((r) => r.status === "open");
  const matched = requirements.filter((r) => r.status === "matched");

  return (
    <>
      <PageHeader
        title="Requirement listings"
        lead="Briefs from buyers who found no match on the public site. Each one is a lead the desk works against live inventory and off-market stock — and the buyer's contact never reaches the owners we shop it to."
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Open requirements" value={String(open.length)} />
        <StatTile label="Matched, awaiting response" value={String(matched.length)} />
        <StatTile
          label="Requirement-sourced leads"
          value={String(leads.filter((l) => l.source === "requirement").length)}
        />
        <StatTile
          label="Share of all leads"
          value={formatRate(
            leads.filter((l) => l.source === "requirement").length,
            leads.length,
            0,
          )}
        />
      </div>

      <ul className="space-y-3">
        {requirements.map((r) => {
          const linkedLead = leads.find((l) => l.requirement_id === r.id);
          const matches = r.matched_property_ids
            .map((id) => all.find((p) => p.id === id))
            .filter((p): p is NonNullable<typeof p> => Boolean(p));

          // Candidates the desk hasn't matched yet. The brief's locality field
          // holds one or more micro-markets, so match on any overlap.
          const wanted = r.locality
            .split("/")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);
          const suggestions = all
            .filter(
              (p) =>
                p.type === r.property_type &&
                !r.matched_property_ids.includes(p.id) &&
                wanted.some((w) => p.locality.toLowerCase().includes(w)),
            )
            .slice(0, 2);

          return (
            <li
              key={r.id}
              className="rounded-3xl border border-sand-200 bg-white p-5 shadow-soft"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded border border-sand-200 bg-sand-50 px-2 py-0.5 text-[0.625rem] font-semibold tracking-wider text-ink-500">
                      {r.id}
                    </span>
                    <RequirementBadge status={r.status} />
                    <span className="text-[0.6875rem] text-ink-300">
                      {r.created_at}
                    </span>
                  </div>
                  <h2 className="mt-2.5 font-display text-[1.0625rem] tracking-[-0.01em] text-brand-900">
                    {PROPERTY_TYPE_LABEL[r.property_type as PropertyType]} ·{" "}
                    {formatArea(r.area_sqft)} · {r.locality}
                  </h2>
                  <p className="mt-1 text-[0.8125rem] text-ink-500">
                    {r.buyer_name} · {r.buyer_company}
                  </p>
                </div>

                {linkedLead ? (
                  <Link
                    href={`/admin/leads?lead=${linkedLead.id}`}
                    className="shrink-0 rounded-lg bg-brand-700 px-4 py-2 text-[0.75rem] font-semibold text-white transition-colors hover:bg-brand-800"
                  >
                    Open lead {linkedLead.id}
                  </Link>
                ) : null}
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-sand-200 pt-4 sm:grid-cols-4">
                <Pair label="Purpose" value={r.purpose === "lease" ? "Lease" : "Buy"} />
                <Pair label="Locality" value={r.locality} />
                <Pair label="Budget" value={r.budget_label} />
                <Pair label="Timeline" value={r.timeline} />
              </dl>

              <p className="mt-4 rounded-2xl bg-sand-50 px-4 py-3 text-[0.8125rem] leading-relaxed text-ink-500">
                {r.notes}
              </p>

              {/* Contact block sits behind the admin-role RLS policy. */}
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.75rem]">
                <span className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-brand-600">
                  Admin-only
                </span>
                <a
                  href={`tel:${r.buyer_phone.replace(/\s/g, "")}`}
                  className="font-semibold text-brand-800 hover:underline"
                >
                  {r.buyer_phone}
                </a>
                <a
                  href={`mailto:${r.buyer_email}`}
                  className="font-semibold text-brand-800 hover:underline"
                >
                  {r.buyer_email}
                </a>
              </div>

              <div className="mt-5 border-t border-sand-200 pt-4">
                <p className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-ink-300">
                  Inventory match
                </p>

                {matches.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {matches.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/admin/properties/${p.id}`}
                          className="flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50 px-3.5 py-2.5 transition-colors hover:border-brand-500/40"
                        >
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-700 text-[0.5625rem] font-bold text-brand-100">
                            ✓
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-semibold text-brand-900">
                            {p.title}
                          </span>
                          <span className="shrink-0 text-[0.6875rem] text-ink-500">
                            {formatArea(p.area_sqft)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2.5 text-[0.8125rem] text-ink-300">
                    Nothing shortlisted yet.
                  </p>
                )}

                {suggestions.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-[0.6875rem] text-ink-300">
                      Suggested from live inventory:
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {suggestions.map((p) => (
                        <li key={p.id}>
                          <Link
                            href={`/admin/properties/${p.id}`}
                            className="inline-block max-w-[22rem] truncate rounded border border-dashed border-sand-300 px-3 py-1.5 text-[0.6875rem] font-medium text-ink-500 transition-colors hover:border-brand-500 hover:text-brand-700"
                          >
                            + {p.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-ink-300">
        {label}
      </dt>
      <dd className="mt-1 text-[0.8125rem] font-semibold text-brand-900">
        {value}
      </dd>
    </div>
  );
}
