"use client";

import Link from "next/link";
import { useEffect } from "react";
import { LeadStatusBadge } from "@/components/admin/status-badge";
import {
  LEAD_PIPELINE,
  LEAD_SOURCE_LABEL,
  LEAD_STATUS_LABEL,
  makeAdminLookup,
} from "@/lib/data/crm";
import { formatINR } from "@/lib/format";
import type {
  ActivityType,
  AdminUser,
  Lead,
  LeadStatus,
  Requirement,
} from "@/lib/admin-types";

const ACTIVITY_GLYPH: Record<ActivityType, string> = {
  call: "☎",
  email: "✉",
  whatsapp: "◇",
  note: "✎",
  status_change: "⇢",
  site_visit: "⌂",
  created: "✦",
};

export function LeadDrawer({
  lead,
  admins,
  requirements,
  onClose,
  onStatusChange,
}: {
  lead: Lead | null;
  admins: AdminUser[];
  requirements: Requirement[];
  onClose: () => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
}) {
  const adminById = makeAdminLookup(admins);
  useEffect(() => {
    if (!lead) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lead, onClose]);

  if (!lead) return null;

  const requirement = lead.requirement_id
    ? requirements.find((r) => r.id === lead.requirement_id)
    : undefined;
  const advisor = adminById(lead.assigned_to);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close lead"
        onClick={onClose}
        className="absolute inset-0 bg-brand-900/45 backdrop-blur-sm"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Lead ${lead.id}`}
        className="relative flex h-full w-[34rem] max-w-full flex-col bg-sand-50 shadow-lift"
      >
        <header className="flex items-start justify-between gap-4 border-b border-sand-200 bg-white px-6 py-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-sand-100 px-2.5 py-1 text-[0.625rem] font-bold tracking-wider text-ink-500">
                {lead.id}
              </span>
              <LeadStatusBadge status={lead.status} />
            </div>
            <h2 className="mt-2.5 font-display text-[1.25rem] leading-tight tracking-[-0.015em] text-brand-900">
              {lead.buyer_name}
            </h2>
            <p className="mt-1 text-[0.8125rem] text-ink-500">
              {lead.buyer_company}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-brand-900/10 text-ink-500 transition-colors hover:bg-sand-100"
          >
            <svg
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Contact block — visible here and nowhere on the public site. */}
          <section className="rounded-2xl border border-brand-900/8 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[0.6875rem] font-bold uppercase tracking-[0.13em] text-ink-300">
                Contact
              </h3>
              <span className="text-[0.625rem] font-semibold text-brand-600">
                Admin-only field
              </span>
            </div>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-[0.6875rem] text-ink-300">Phone</dt>
                <dd className="mt-0.5">
                  <a
                    href={`tel:${lead.buyer_phone.replace(/\s/g, "")}`}
                    className="text-[0.8125rem] font-semibold text-brand-800 hover:underline"
                  >
                    {lead.buyer_phone}
                  </a>
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[0.6875rem] text-ink-300">Email</dt>
                <dd className="mt-0.5 truncate">
                  <a
                    href={`mailto:${lead.buyer_email}`}
                    className="text-[0.8125rem] font-semibold text-brand-800 hover:underline"
                  >
                    {lead.buyer_email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[0.6875rem] text-ink-300">Source</dt>
                <dd className="mt-0.5 text-[0.8125rem] font-semibold text-brand-900">
                  {LEAD_SOURCE_LABEL[lead.source]}
                </dd>
              </div>
              <div>
                <dt className="text-[0.6875rem] text-ink-300">Est. value</dt>
                <dd className="mt-0.5 text-[0.8125rem] font-semibold tabular-nums text-brand-900">
                  {formatINR(lead.value_estimate)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="mt-4 rounded-2xl border border-brand-900/8 bg-white p-4">
            <h3 className="text-[0.6875rem] font-bold uppercase tracking-[0.13em] text-ink-300">
              Enquiry
            </h3>
            <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-ink-500">
              “{lead.message}”
            </p>

            {lead.property_id ? (
              <Link
                href={`/admin/properties/${lead.property_id}`}
                className="mt-4 flex items-center gap-3 rounded-xl bg-sand-100 px-3.5 py-3 transition-colors hover:bg-sand-200"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-800 text-[0.625rem] font-bold text-brand-100">
                  {lead.property_id.replace("p-", "")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.75rem] font-bold text-brand-900">
                    Linked listing {lead.property_id}
                  </span>
                  <span className="block text-[0.6875rem] text-ink-500">
                    Open the listing record
                  </span>
                </span>
              </Link>
            ) : null}

            {requirement ? (
              <div className="mt-4 rounded-lg border border-brand-100 bg-brand-50 p-3.5">
                <p className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-brand-700">
                  Requirement brief · {requirement.id}
                </p>
                <dl className="mt-2.5 grid grid-cols-2 gap-2.5 text-[0.75rem]">
                  <Pair label="Type" value={requirement.property_type} />
                  <Pair label="Purpose" value={requirement.purpose} />
                  <Pair
                    label="Location"
                    value={`${requirement.locality}, ${requirement.city}`}
                  />
                  <Pair
                    label="Area"
                    value={`${requirement.area_sqft.toLocaleString("en-IN")} sq.ft.`}
                  />
                  <Pair label="Budget" value={requirement.budget_label} />
                  <Pair label="Timeline" value={requirement.timeline} />
                </dl>
                <p className="mt-3 border-t border-brand-100 pt-2.5 text-[0.75rem] leading-relaxed text-ink-500">
                  {requirement.notes}
                </p>
              </div>
            ) : null}
          </section>

          <section className="mt-4 rounded-2xl border border-brand-900/8 bg-white p-4">
            <h3 className="text-[0.6875rem] font-bold uppercase tracking-[0.13em] text-ink-300">
              Move through the pipeline
            </h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[...LEAD_PIPELINE, "lost" as const].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => onStatusChange(lead.id, status)}
                  aria-pressed={lead.status === status}
                  className={`rounded-full px-3 py-1.5 text-[0.6875rem] font-semibold transition-colors ${
                    lead.status === status
                      ? "bg-brand-900 text-sand-50"
                      : "border border-sand-300 text-ink-500 hover:border-brand-900/25 hover:text-brand-800"
                  }`}
                >
                  {LEAD_STATUS_LABEL[status]}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[0.6875rem] text-ink-300">
              Assigned to {advisor?.name}. Status changes write a
              `lead_activities` row in production.
            </p>
          </section>

          <section className="mt-4">
            <h3 className="mb-3 text-[0.6875rem] font-bold uppercase tracking-[0.13em] text-ink-300">
              Activity timeline
            </h3>
            <ol className="relative space-y-4 border-l border-sand-300 pl-6">
              {[...lead.activities].reverse().map((a) => (
                <li key={a.id} className="relative">
                  <span className="absolute -left-[1.9rem] grid h-6 w-6 place-items-center rounded-full border-2 border-sand-50 bg-brand-800 text-[0.625rem] text-brand-100">
                    {ACTIVITY_GLYPH[a.type]}
                  </span>
                  <p className="text-[0.8125rem] leading-relaxed text-ink-500">
                    {a.note}
                  </p>
                  <p className="mt-1 text-[0.6875rem] text-ink-300">
                    {a.created_by === "system"
                      ? "System"
                      : adminById(a.created_by)?.name}{" "}
                    · {a.created_at}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <footer className="flex gap-2 border-t border-sand-200 bg-white px-6 py-4">
          <a
            href={`tel:${lead.buyer_phone.replace(/\s/g, "")}`}
            className="flex-1 rounded-lg bg-brand-700 px-5 py-2.5 text-center text-[0.8125rem] font-semibold text-white transition-colors hover:bg-brand-800"
          >
            Call now
          </a>
          <a
            href={`mailto:${lead.buyer_email}`}
            className="flex-1 rounded-lg border border-sand-300 px-5 py-2.5 text-center text-[0.8125rem] font-semibold text-brand-900 transition-colors hover:bg-sand-100"
          >
            Email
          </a>
        </footer>
      </aside>
    </div>
  );
}

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.625rem] text-ink-300">{label}</dt>
      <dd className="mt-0.5 font-semibold capitalize text-brand-900">{value}</dd>
    </div>
  );
}
