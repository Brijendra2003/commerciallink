import type { Metadata } from "next";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { ExportDealsButton, SettleDealButton } from "@/components/admin/quick-actions";
import { DealStatusBadge } from "@/components/admin/status-badge";
import { ChartCard } from "@/components/charts/chart-card";
import { ColumnChart } from "@/components/charts/column-chart";
import { BarList } from "@/components/charts/bar-list";
import { StatTile } from "@/components/charts/stat-tile";
import {
  makeAdminLookup,
  makeOwnerLookup,
  revenueByMonth,
} from "@/lib/data/crm";
import {
  getAdmins,
  getAllProperties,
  getDeals,
  getOwners,
} from "@/lib/data/queries";
import { PROPERTY_TYPE_LABEL } from "@/lib/data/taxonomy";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = { title: "Sales & Revenue" };

function commission(value: number, pct: number) {
  return (value * pct) / 100;
}

export default async function SalesPage() {
  const [deals, admins, owners, properties] = await Promise.all([
    getDeals(),
    getAdmins(),
    getOwners(),
    getAllProperties(),
  ]);
  const adminById = makeAdminLookup(admins);
  const ownerById = makeOwnerLookup(owners);

  const won = deals.filter((d) => d.status === "won");
  const open = deals.filter((d) => d.status === "in_progress");

  const totalRevenue = won.reduce(
    (s, d) => s + commission(d.value, d.commission_pct),
    0,
  );
  const openCommission = open.reduce(
    (s, d) => s + commission(d.value, d.commission_pct),
    0,
  );
  const unsettled = won.filter((d) => !d.payout_settled);

  // Commission by advisor — nominal categories, so one hue for every bar.
  const byExec = admins
    .filter((a) => a.role === "sales_exec")
    .map((a) => ({
      label: a.name,
      value: won
        .filter((d) => d.assigned_to === a.id)
        .reduce((s, d) => s + commission(d.value, d.commission_pct), 0),
      sub: `${won.filter((d) => d.assigned_to === a.id).length} deals`,
    }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);

  const byType = Object.entries(
    won.reduce<Record<string, number>>((acc, d) => {
      const property = properties.find((p) => p.id === d.property_id);
      if (!property) return acc;
      const key = PROPERTY_TYPE_LABEL[property.type];
      acc[key] = (acc[key] ?? 0) + commission(d.value, d.commission_pct);
      return acc;
    }, {}),
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <>
      <PageHeader
        title="Sales & revenue"
        lead="Deals linked to a lead and a property, with commission tracked from close through owner payout."
        action={
          <ExportDealsButton
            rows={deals.map((d) => ({
              ref: d.id,
              client: d.client,
              value: d.value,
              commission_pct: d.commission_pct,
              status: d.status,
              closed_at: d.closed_at,
              payout_settled: d.payout_settled,
            }))}
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Brokerage earned (12 mo)"
          value={formatINR(totalRevenue)}
          spark={revenueByMonth.map((m) => m.value)}
        />
        <StatTile label="Deals won" value={String(won.length)} />
        <StatTile label="Commission in open deals" value={formatINR(openCommission)} />
        <StatTile label="Payouts unsettled" value={String(unsettled.length)} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <ChartCard
          title="Brokerage revenue by month"
          subtitle="Recognised on close. Lumpy by nature — a single industrial sale carries a quarter."
          table={{
            columns: ["Month", "Revenue (₹)"],
            rows: revenueByMonth.map((m) => [m.month, m.value.toLocaleString("en-IN")]),
          }}
        >
          <ColumnChart
            height={220}
            data={revenueByMonth.map((m) => ({ label: m.month, value: m.value }))}
            series={[
              { key: "value", label: "Brokerage", color: "var(--color-viz-series-1)" },
            ]}
            format="inr"
          />
        </ChartCard>

        <ChartCard
          title="Commission by advisor"
          subtitle="Closed deals only, last twelve months."
          table={{
            columns: ["Advisor", "Commission (₹)"],
            rows: byExec.map((r) => [r.label, r.value.toLocaleString("en-IN")]),
          }}
        >
          <BarList data={byExec} format="inr" />
        </ChartCard>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <ChartCard
          title="Commission by asset class"
          subtitle="Where the revenue actually comes from."
          table={{
            columns: ["Asset class", "Commission (₹)"],
            rows: byType.map((r) => [r.label, r.value.toLocaleString("en-IN")]),
          }}
        >
          <BarList
            data={byType}
            format="inr"
            note="Industrial and office carry the book despite lower deal counts — larger tickets, lower percentage."
          />
        </ChartCard>

        <Panel title="Deal register" padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-sand-200 bg-sand-50">
                  {["Deal", "Client", "Value", "Comm.", "Fee", "Status", "Payout"].map(
                    (h, i) => (
                      <th
                        key={h}
                        scope="col"
                        className={`px-4 py-3 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-ink-300 ${
                          i >= 2 && i <= 4 ? "text-right" : ""
                        }`}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {deals.map((d) => (
                  <tr key={d.id} className="border-b border-sand-200 last:border-0">
                    <td className="px-4 py-3">
                      <span className="block text-[0.8125rem] font-bold text-brand-900">
                        {d.id}
                      </span>
                      <span className="mt-0.5 block max-w-[16rem] truncate text-[0.6875rem] text-ink-300">
                        {d.property_title}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block text-[0.8125rem] text-ink-500">
                        {d.client}
                      </span>
                      <span className="mt-0.5 block text-[0.6875rem] text-ink-300">
                        {adminById(d.assigned_to)?.name} ·{" "}
                        {ownerById(d.owner_id)?.company ?? d.owner_id}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-[0.8125rem] tabular-nums text-ink-500">
                      {formatINR(d.value)}
                    </td>
                    <td className="px-4 py-3 text-right text-[0.75rem] tabular-nums text-ink-300">
                      {d.commission_pct}%
                    </td>
                    <td className="px-4 py-3 text-right text-[0.8125rem] font-bold tabular-nums text-brand-800">
                      {formatINR(commission(d.value, d.commission_pct))}
                    </td>
                    <td className="px-4 py-3">
                      <DealStatusBadge status={d.status} />
                    </td>
                    <td className="px-4 py-3">
                      {d.status !== "won" ? (
                        <span className="text-[0.75rem] text-ink-300">—</span>
                      ) : d.payout_settled ? (
                        <span className="text-[0.75rem] font-semibold text-ink-500">
                          Settled
                        </span>
                      ) : (
                        <SettleDealButton dealRef={d.id} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}
