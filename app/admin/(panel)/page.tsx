import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { LeadStatusBadge } from "@/components/admin/status-badge";
import { ChartCard } from "@/components/charts/chart-card";
import { ColumnChart } from "@/components/charts/column-chart";
import { FunnelChart } from "@/components/charts/funnel";
import { StatTile } from "@/components/charts/stat-tile";
import { Arrow } from "@/components/ui/button";
import {
  LEAD_SOURCE_LABEL,
  LEAD_STATUS_LABEL,
  conversionRate,
  funnelCounts,
  leadVolume,
  makeAdminLookup,
  pipelineValue,
} from "@/lib/data/crm";
import {
  getAdmins,
  getAllProperties,
  getAuditLog,
  getLeads,
  getOwners,
  getRequirements,
} from "@/lib/data/queries";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const [leads, properties, requirements, admins, owners, auditLog] =
    await Promise.all([
      getLeads(),
      getAllProperties(),
      getRequirements(),
      getAdmins(),
      getOwners(),
      getAuditLog(),
    ]);

  const adminById = makeAdminLookup(admins);
  const funnel = funnelCounts(leads);
  const newThisWeek = leads.filter((l) => l.created_at >= "2026-08-30").length;
  const openRequirements = requirements.filter((r) => r.status === "open").length;
  const pendingReview = properties.filter(
    (p) => p.status === "pending_review",
  ).length;
  const published = properties.filter((p) => p.status === "published").length;
  const kycPending = owners.filter((o) => o.kyc_status === "pending").length;

  // Leads with no advisor contact yet — the queue that actually costs money.
  const untouched = leads
    .filter((l) => l.status === "new")
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const recent = [...leads]
    .sort((a, b) => b.last_activity_at.localeCompare(a.last_activity_at))
    .slice(0, 6);

  return (
    <>
      <PageHeader
        title="Dashboard"
        lead="Everything the desk is working right now — pipeline, funnel health and the leads that still need a first call."
        action={
          <Link
            href="/admin/leads"
            className="group/btn inline-flex items-center gap-2 rounded-lg bg-brand-700 px-5 py-2.5 text-[0.8125rem] font-semibold text-white transition-colors hover:bg-brand-800"
          >
            Open lead board
            <Arrow />
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* No month-on-month deltas: nothing snapshots these figures over
            time yet, and a made-up "+18% vs last month" is worse than none. */}
        <StatTile
          label="Open pipeline value"
          value={formatINR(pipelineValue(leads))}
          spark={leadVolume.slice(-12).map((m) => m.organic + m.paid)}
        />
        <StatTile
          label="New leads this week"
          value={String(newThisWeek)}
          spark={leadVolume.slice(-12).map((m) => m.paid)}
        />
        <StatTile label="Active listings" value={String(published)} />
        <StatTile
          label="Lead → won conversion"
          value={leads.length ? `${conversionRate(leads).toFixed(0)}%` : "—"}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.25fr]">
        <ChartCard
          title="Lead funnel"
          subtitle="Cumulative — a lead in negotiation also passed every stage before it."
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
          title="Lead volume by month"
          subtitle="Twelve months, split by acquisition channel."
          table={{
            columns: ["Month", "Unpaid", "Paid", "Total"],
            rows: leadVolume.map((m) => [
              m.month,
              m.organic,
              m.paid,
              m.organic + m.paid,
            ]),
          }}
        >
          <ColumnChart
            height={224}
            data={leadVolume.map((m) => ({
              label: m.month,
              organic: m.organic,
              paid: m.paid,
            }))}
            series={[
              {
                key: "organic",
                label: "Unpaid (organic, referral, WhatsApp)",
                color: "var(--color-viz-series-1)",
              },
              {
                key: "paid",
                label: "Paid ads",
                color: "var(--color-viz-series-2)",
              },
            ]}
          />
        </ChartCard>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <Panel
          title="Needs a first call"
          padded={false}
          action={
            <Link
              href="/admin/leads?status=new"
              className="text-[0.75rem] font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-800"
            >
              View all
            </Link>
          }
        >
          {untouched.length === 0 ? (
            <p className="px-5 py-8 text-center text-[0.8125rem] text-ink-300">
              Every new lead has been contacted. Good.
            </p>
          ) : (
            <ul className="divide-y divide-sand-200">
              {untouched.map((lead) => (
                <li key={lead.id}>
                  <Link
                    href={`/admin/leads?lead=${lead.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-sand-50"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-[0.6875rem] font-bold text-brand-700">
                      {lead.buyer_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.8125rem] font-bold text-brand-900">
                        {lead.buyer_name} · {lead.buyer_company}
                      </span>
                      <span className="mt-0.5 block truncate text-[0.75rem] text-ink-500">
                        {LEAD_SOURCE_LABEL[lead.source]} · {lead.created_at}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[0.8125rem] font-bold tabular-nums text-brand-800">
                        {formatINR(lead.value_estimate)}
                      </span>
                      <span className="mt-0.5 block text-[0.6875rem] text-ink-300">
                        {adminById(lead.assigned_to)?.name.split(" ")[0] ?? "—"}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel title="Queue">
            <ul className="space-y-2.5">
              <QueueRow
                href="/admin/properties?status=pending_review"
                label="Owner submissions awaiting approval"
                count={pendingReview}
              />
              <QueueRow
                href="/admin/requirements"
                label="Open requirements to match"
                count={openRequirements}
              />
              <QueueRow
                href="/admin/owners"
                label="Owners with KYC outstanding"
                count={kycPending}
              />
              <QueueRow
                href="/admin/sales"
                label="Closed deals with payout unsettled"
                count={1}
              />
            </ul>
          </Panel>

          <Panel title="Recent activity" padded={false}>
            <ul className="divide-y divide-sand-200">
              {recent.map((lead) => {
                const last = lead.activities[lead.activities.length - 1];
                if (!last) return null;
                return (
                  <li key={lead.id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-[0.75rem] font-bold text-brand-900">
                        {lead.id} · {lead.buyer_company}
                      </span>
                      <LeadStatusBadge status={lead.status} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-[0.75rem] leading-relaxed text-ink-500">
                      {last.note}
                    </p>
                    <p className="mt-1 text-[0.6875rem] text-ink-300">
                      {last.created_by === "system"
                        ? "System"
                        : (adminById(last.created_by)?.name ?? "Staff")}{" "}
                      · {last.created_at}
                    </p>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel title="Audit log" padded={false}>
            <ul className="divide-y divide-sand-200">
              {auditLog.slice(0, 4).map((entry) => (
                <li key={entry.id} className="px-5 py-3">
                  <p className="text-[0.75rem] text-ink-500">
                    <span className="font-bold text-brand-900">
                      {entry.actor}
                    </span>{" "}
                    {entry.action.toLowerCase()}
                  </p>
                  <p className="mt-0.5 truncate text-[0.6875rem] text-ink-300">
                    {entry.target} · {entry.created_at}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}

function QueueRow({
  href,
  label,
  count,
}: {
  href: string;
  label: string;
  count: number;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group/row flex items-center gap-3 rounded-lg border border-sand-200 px-4 py-3 transition-colors hover:border-brand-600 hover:bg-sand-50"
      >
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded text-[0.75rem] font-bold tabular-nums ${
            count > 0
              ? "bg-brand-700 text-white"
              : "bg-sand-100 text-ink-300"
          }`}
        >
          {count}
        </span>
        <span className="min-w-0 flex-1 text-[0.8125rem] text-ink-500">
          {label}
        </span>
        <Arrow className="text-ink-300 group-hover/row:translate-x-0.5" />
      </Link>
    </li>
  );
}
