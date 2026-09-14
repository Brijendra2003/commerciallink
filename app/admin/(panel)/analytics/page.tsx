import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { ChartCard } from "@/components/charts/chart-card";
import { ColumnChart } from "@/components/charts/column-chart";
import { BarList } from "@/components/charts/bar-list";
import { FunnelChart } from "@/components/charts/funnel";
import { StatTile } from "@/components/charts/stat-tile";
import {
  LEAD_SOURCE_LABEL,
  LEAD_STATUS_LABEL,
  PAID_SOURCES,
  funnelCounts,
  leadVolume,
  leadsBySource,
} from "@/lib/data/crm";
import { getLeads, getPublishedProperties } from "@/lib/data/queries";
import { PROPERTY_TYPE_LABEL } from "@/lib/data/taxonomy";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const [leads, published] = await Promise.all([
    getLeads(),
    getPublishedProperties(),
  ]);
  const funnel = funnelCounts(leads);
  const sources = leadsBySource(leads).filter((s) => s.count > 0);

  const paidLeads = leads.filter((l) => PAID_SOURCES.includes(l.source)).length;
  const organicShare = Math.round(((leads.length - paidLeads) / leads.length) * 100);

  // Value-weighted source performance: volume alone hides that paid brings
  // more leads at a smaller average ticket.
  const sourceValue = sources.map((s) => ({
    label: LEAD_SOURCE_LABEL[s.source],
    value: Math.round(
      leads
        .filter((l) => l.source === s.source)
        .reduce((sum, l) => sum + l.value_estimate, 0) / s.count,
    ),
    sub: `${s.count} leads`,
  }));

  const listings = [...published].sort(
    (a, b) =>
      b.enquiry_count / b.view_count - a.enquiry_count / a.view_count,
  );

  return (
    <>
      <PageHeader
        title="Analytics"
        lead="Funnel health, where leads come from, and which listings actually convert attention into enquiries."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Leads, last 12 months"
          value={leadVolume.reduce((s, m) => s + m.organic + m.paid, 0).toLocaleString("en-IN")}
          delta={31}
          deltaLabel="vs prior year"
          spark={leadVolume.map((m) => m.organic + m.paid)}
        />
        <StatTile
          label="Unpaid share of leads"
          value={`${organicShare}%`}
          delta={5}
          deltaLabel="vs last quarter"
        />
        <StatTile
          label="Avg. lead value"
          value={formatINR(
            Math.round(
              leads.reduce((s, l) => s + l.value_estimate, 0) / leads.length,
            ),
          )}
        />
        <StatTile
          label="Site-visit rate"
          value={`${Math.round(
            (funnel[3].count / funnel[1].count) * 100,
          )}%`}
          delta={4}
          deltaLabel="of contacted leads"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <ChartCard
          title="Funnel health"
          subtitle="Drop-off between each stage."
          table={{
            columns: ["Stage", "Leads"],
            rows: funnel.map((f) => [LEAD_STATUS_LABEL[f.stage], f.count]),
          }}
        >
          <FunnelChart
            data={funnel.map((f) => ({
              label: LEAD_STATUS_LABEL[f.stage],
              count: f.count,
            }))}
          />
        </ChartCard>

        <ChartCard
          title="Leads by source"
          subtitle="Volume across the acquisition channels."
          table={{
            columns: ["Source", "Leads"],
            rows: sources.map((s) => [LEAD_SOURCE_LABEL[s.source], s.count]),
          }}
        >
          <BarList
            data={sources.map((s) => ({
              label: LEAD_SOURCE_LABEL[s.source],
              value: s.count,
            }))}
          />
        </ChartCard>

        <ChartCard
          title="Average lead value by source"
          subtitle="The counterweight to volume — where the big tickets come from."
          table={{
            columns: ["Source", "Avg. value (₹)"],
            rows: sourceValue.map((s) => [s.label, s.value.toLocaleString("en-IN")]),
          }}
        >
          <BarList
            data={sourceValue}
            format="inr"
            note="Referrals bring the fewest leads and the largest tickets. Paid ads are the mirror image — worth the spend on retail, marginal on industrial."
          />
        </ChartCard>
      </div>

      <div className="mt-4">
        <ChartCard
          title="Acquisition split by month"
          subtitle="Paid against everything else. One axis — the two are the same measure."
          table={{
            columns: ["Month", "Unpaid", "Paid", "Paid share"],
            rows: leadVolume.map((m) => [
              m.month,
              m.organic,
              m.paid,
              `${Math.round((m.paid / (m.organic + m.paid)) * 100)}%`,
            ]),
          }}
        >
          <ColumnChart
            height={200}
            data={leadVolume.map((m) => ({
              label: m.month,
              organic: m.organic,
              paid: m.paid,
            }))}
            series={[
              {
                key: "organic",
                label: "Unpaid (organic, referral, WhatsApp, brochure)",
                color: "var(--color-viz-series-1)",
              },
              { key: "paid", label: "Paid ads", color: "var(--color-viz-series-2)" },
            ]}
          />
        </ChartCard>
      </div>

      <div className="mt-4">
        {/* Twelve listings across six classes: past ~7 meaningful classes this
            is a table, not more colours. */}
        <Panel title="Listing performance" padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-sand-200 bg-sand-50">
                  {["Listing", "Class", "Views", "Enquiries", "Rate", "Pipeline"].map(
                    (h, i) => (
                      <th
                        key={h}
                        scope="col"
                        className={`px-4 py-3 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-ink-300 ${
                          i >= 2 ? "text-right" : ""
                        }`}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {listings.map((p) => {
                  const rate = (p.enquiry_count / p.view_count) * 100;
                  const pipeline = leads
                    .filter(
                      (l) =>
                        l.property_id === p.id &&
                        !["won", "lost"].includes(l.status),
                    )
                    .reduce((s, l) => s + l.value_estimate, 0);

                  return (
                    <tr key={p.id} className="border-b border-sand-200 last:border-0">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/properties/${p.id}`}
                          className="block max-w-[20rem] truncate text-[0.8125rem] font-semibold text-brand-900 hover:text-clay-600"
                        >
                          {p.title}
                        </Link>
                        <span className="mt-0.5 block text-[0.6875rem] text-ink-300">
                          {p.locality}, {p.city}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[0.75rem] text-ink-500">
                        {PROPERTY_TYPE_LABEL[p.type]}
                      </td>
                      <td className="px-4 py-3 text-right text-[0.8125rem] tabular-nums text-ink-500">
                        {p.view_count.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-right text-[0.8125rem] tabular-nums text-ink-500">
                        {p.enquiry_count}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="h-1.5 w-10 overflow-hidden rounded-full bg-sand-200"
                          >
                            <span
                              className="block h-full rounded-full"
                              style={{
                                width: `${Math.min(rate * 30, 100)}%`,
                                background: "var(--color-viz-series-1)",
                              }}
                            />
                          </span>
                          <span className="w-10 text-right text-[0.8125rem] font-bold tabular-nums text-brand-900">
                            {rate.toFixed(1)}%
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-[0.8125rem] font-semibold tabular-nums text-brand-800">
                        {pipeline > 0 ? formatINR(pipeline) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}
