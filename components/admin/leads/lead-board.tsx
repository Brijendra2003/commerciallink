"use client";

import { useMemo, useState } from "react";
import { LeadDrawer } from "@/components/admin/leads/lead-drawer";
import { LeadStatusBadge } from "@/components/admin/status-badge";
import {
  LEAD_PIPELINE,
  LEAD_SOURCE_LABEL,
  LEAD_STATUS_LABEL,
  makeAdminLookup,
} from "@/lib/data/crm";
import { formatINR } from "@/lib/format";
import type {
  AdminUser,
  Lead,
  LeadSource,
  LeadStatus,
  Requirement,
} from "@/lib/admin-types";

const ALL_STATUSES: LeadStatus[] = [...LEAD_PIPELINE, "lost"];

export function LeadBoard({
  initialLeads,
  admins,
  requirements,
  initialStatus = "",
  initialLeadId,
}: {
  initialLeads: Lead[];
  admins: AdminUser[];
  requirements: Requirement[];
  initialStatus?: string;
  initialLeadId?: string;
}) {
  const adminById = makeAdminLookup(admins);
  // Status is held in component state so the board reacts instantly to a drag
  // or a drawer change; in production the same handler posts to Supabase and
  // the row comes back through the query cache.
  const [leads, setLeads] = useState(initialLeads);
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [openId, setOpenId] = useState<string | null>(initialLeadId ?? null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<LeadStatus | null>(null);

  const [status, setStatus] = useState(initialStatus);
  const [source, setSource] = useState("");
  const [assignee, setAssignee] = useState("");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (status && l.status !== status) return false;
      if (source && l.source !== source) return false;
      if (assignee && l.assigned_to !== assignee) return false;
      if (
        q &&
        ![l.id, l.buyer_name, l.buyer_company, l.message]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
  }, [leads, status, source, assignee, query]);

  const activeFilters = [status, source, assignee, query].filter(Boolean).length;

  function move(id: string, next: LeadStatus) {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: next,
              last_activity_at: new Date().toISOString().slice(0, 10),
              activities: [
                ...l.activities,
                {
                  id: `${l.id}-act-${l.activities.length}`,
                  lead_id: l.id,
                  type: "status_change" as const,
                  note: `Moved to ${LEAD_STATUS_LABEL[next]}.`,
                  created_by: "a-1",
                  created_at: new Date().toISOString().slice(0, 10),
                },
              ],
            }
          : l,
      ),
    );
  }

  function exportCsv() {
    const header = [
      "id", "name", "company", "phone", "email",
      "source", "status", "assigned_to", "value_estimate", "created_at",
    ];
    const rows = filtered.map((l) => [
      l.id, l.buyer_name, l.buyer_company, l.buyer_phone, l.buyer_email,
      LEAD_SOURCE_LABEL[l.source], LEAD_STATUS_LABEL[l.status],
      adminById(l.assigned_to)?.name ?? "", String(l.value_estimate), l.created_at,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `commerciallink-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const openLead = leads.find((l) => l.id === openId) ?? null;

  return (
    <>
      {/* One filter row above everything it scopes. */}
      <div className="mb-4 rounded-3xl border border-sand-200 bg-white p-4 shadow-soft">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, company, reference or message…"
            className="field-input flex-1 py-2.5 text-[0.8125rem]"
            aria-label="Search leads"
          />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:shrink-0">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Filter by status"
              className="field-input w-auto py-2.5 text-[0.8125rem]"
            >
              <option value="">All statuses</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {LEAD_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              aria-label="Filter by source"
              className="field-input w-auto py-2.5 text-[0.8125rem]"
            >
              <option value="">All sources</option>
              {(Object.keys(LEAD_SOURCE_LABEL) as LeadSource[]).map((s) => (
                <option key={s} value={s}>
                  {LEAD_SOURCE_LABEL[s]}
                </option>
              ))}
            </select>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              aria-label="Filter by advisor"
              className="field-input w-auto py-2.5 text-[0.8125rem]"
            >
              <option value="">All advisors</option>
              {admins
                .filter((a) => a.role === "sales_exec" && a.is_active)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-sand-200 pt-3">
          <p className="text-[0.75rem] text-ink-500">
            <span className="font-bold text-brand-900">{filtered.length}</span>{" "}
            of {leads.length} leads
            {activeFilters > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setStatus("");
                  setSource("");
                  setAssignee("");
                  setQuery("");
                }}
                className="ml-3 font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-800"
              >
                Clear filters
              </button>
            ) : null}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportCsv}
              className="rounded-lg border border-sand-300 px-4 py-1.5 text-[0.75rem] font-semibold text-brand-900 transition-colors hover:bg-sand-100"
            >
              Export CSV
            </button>
            <div
              role="tablist"
              aria-label="Board view"
              className="flex rounded-lg border border-sand-200 bg-sand-100 p-0.5"
            >
              {(["kanban", "table"] as const).map((v) => (
                <button
                  key={v}
                  role="tab"
                  type="button"
                  aria-selected={view === v}
                  onClick={() => setView(v)}
                  className={`rounded px-3.5 py-1.5 text-[0.6875rem] font-semibold capitalize transition-colors ${
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
        </div>
      </div>

      {view === "kanban" ? (
        <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex min-w-max gap-3">
            {ALL_STATUSES.map((column) => {
              const items = filtered.filter((l) => l.status === column);
              const value = items.reduce((s, l) => s + l.value_estimate, 0);

              return (
                <div
                  key={column}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setOverColumn(column);
                  }}
                  onDragLeave={() => setOverColumn(null)}
                  onDrop={() => {
                    if (dragging) move(dragging, column);
                    setDragging(null);
                    setOverColumn(null);
                  }}
                  className={`flex w-[17rem] shrink-0 flex-col rounded-2xl border p-2.5 transition-colors ${
                    overColumn === column
                      ? "border-brand-600 bg-brand-50"
                      : "border-sand-200 bg-white/60"
                  }`}
                >
                  <div className="mb-2.5 flex items-center justify-between gap-2 px-1.5 pt-1">
                    <span className="flex items-center gap-2">
                      <span className="text-[0.75rem] font-bold text-brand-900">
                        {LEAD_STATUS_LABEL[column]}
                      </span>
                      <span className="rounded-full bg-sand-100 px-1.5 py-0.5 text-[0.625rem] font-bold tabular-nums text-ink-500">
                        {items.length}
                      </span>
                    </span>
                    {value > 0 ? (
                      <span className="text-[0.625rem] font-semibold tabular-nums text-ink-300">
                        {formatINR(value)}
                      </span>
                    ) : null}
                  </div>

                  <ul className="flex-1 space-y-2">
                    {items.map((lead) => (
                      <li key={lead.id}>
                        <button
                          type="button"
                          draggable
                          onDragStart={() => setDragging(lead.id)}
                          onDragEnd={() => setDragging(null)}
                          onClick={() => setOpenId(lead.id)}
                          className={`w-full cursor-grab rounded-xl border border-sand-200 bg-white p-3 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift active:cursor-grabbing ${
                            dragging === lead.id ? "opacity-40" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="min-w-0 text-[0.8125rem] font-bold leading-snug text-brand-900">
                              {lead.buyer_company}
                            </span>
                            <span className="shrink-0 text-[0.625rem] tabular-nums text-ink-300">
                              {lead.id}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-[0.75rem] text-ink-500">
                            {lead.buyer_name}
                          </p>
                          <p className="mt-2.5 line-clamp-2 text-[0.6875rem] leading-relaxed text-ink-300">
                            {lead.message}
                          </p>
                          <div className="mt-3 flex items-center justify-between gap-2 border-t border-sand-200 pt-2.5">
                            <span className="truncate text-[0.625rem] text-ink-300">
                              {LEAD_SOURCE_LABEL[lead.source]}
                            </span>
                            <span className="flex shrink-0 items-center gap-2">
                              <span className="text-[0.6875rem] font-bold tabular-nums text-brand-800">
                                {formatINR(lead.value_estimate)}
                              </span>
                              <span
                                title={adminById(lead.assigned_to)?.name}
                                className="grid h-5 w-5 place-items-center rounded-full bg-brand-800 text-[0.5rem] font-bold text-brand-100"
                              >
                                {adminById(lead.assigned_to)?.initials}
                              </span>
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                    {items.length === 0 ? (
                      <li className="rounded-xl border border-dashed border-sand-300 px-3 py-6 text-center text-[0.6875rem] text-ink-300">
                        Drop a lead here
                      </li>
                    ) : null}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-sand-200 bg-white shadow-soft">
          <table className="w-full min-w-[54rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-sand-200 bg-sand-50">
                {["Lead", "Company", "Source", "Status", "Advisor", "Est. value", "Created"].map(
                  (h, i) => (
                    <th
                      key={h}
                      scope="col"
                      className={`px-4 py-3 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-ink-300 ${
                        i === 5 ? "text-right" : ""
                      }`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setOpenId(lead.id)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setOpenId(lead.id);
                  }}
                  className="cursor-pointer border-b border-sand-200 last:border-0 transition-colors hover:bg-sand-50 focus-visible:bg-sand-50"
                >
                  <td className="px-4 py-3">
                    <span className="block text-[0.8125rem] font-bold text-brand-900">
                      {lead.buyer_name}
                    </span>
                    <span className="mt-0.5 block text-[0.6875rem] tabular-nums text-ink-300">
                      {lead.id}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[0.8125rem] text-ink-500">
                    {lead.buyer_company}
                  </td>
                  <td className="px-4 py-3 text-[0.75rem] text-ink-500">
                    {LEAD_SOURCE_LABEL[lead.source]}
                  </td>
                  <td className="px-4 py-3">
                    <LeadStatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3 text-[0.75rem] text-ink-500">
                    {adminById(lead.assigned_to)?.name}
                  </td>
                  <td className="px-4 py-3 text-right text-[0.8125rem] font-bold tabular-nums text-brand-800">
                    {formatINR(lead.value_estimate)}
                  </td>
                  <td className="px-4 py-3 text-[0.75rem] tabular-nums text-ink-300">
                    {lead.created_at}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 ? (
            <p className="px-4 py-12 text-center text-[0.8125rem] text-ink-300">
              No leads match those filters.
            </p>
          ) : null}
        </div>
      )}

      <LeadDrawer
        lead={openLead}
        admins={admins}
        requirements={requirements}
        onClose={() => setOpenId(null)}
        onStatusChange={move}
      />
    </>
  );
}
