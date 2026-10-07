"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { Loader } from "@/components/ui/loader";
import {
  updateOwnerLeadStatus,
  type OwnerLeadStatus,
} from "@/lib/portal-actions";
import type { OwnerLead } from "@/lib/data/portal-queries";

/**
 * The lister's enquiry inbox.
 *
 * This is the screen the whole change is for: a buyer fills in the enquiry
 * form on a project, and the owner, broker or developer who listed it sees the
 * lead here — name, phone, email, message — and calls them.
 *
 * It is a client component because working a lead is a sequence of small
 * interactions (expand, call, mark contacted) that should not each cost a page
 * navigation. The status change is optimistic so the pill moves the instant it
 * is picked.
 */

const STATUSES: { value: OwnerLeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "site_visit", label: "Site visit" },
  { value: "negotiation", label: "Negotiating" },
  { value: "won", label: "Closed — won" },
  { value: "lost", label: "Closed — lost" },
];

const STATUS_TONE: Record<string, string> = {
  new: "border-brand-200 bg-brand-50 text-brand-800",
  contacted: "border-sand-300 bg-sand-50 text-ink-700",
  qualified: "border-sand-300 bg-sand-50 text-ink-700",
  site_visit: "border-sand-300 bg-sand-50 text-ink-700",
  negotiation: "border-sand-300 bg-sand-50 text-ink-700",
  won: "border-brand-600 bg-brand-600 text-white",
  lost: "border-clay-100 bg-clay-50 text-clay-700",
};

/** Open enquiries are the ones that still need a call. */
const OPEN_STATUSES = ["new", "contacted", "qualified", "site_visit", "negotiation"];

export function LeadInbox({ leads }: { leads: OwnerLead[] }) {
  // Which project to show. One list across every project is unusable once a
  // developer has four towers on the site.
  const [project, setProject] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(false);

  const projects = Array.from(
    new Map(
      leads
        .filter((l) => l.propertyRef)
        .map((l) => [l.propertyRef!, l.propertyTitle ?? l.propertyRef!]),
    ),
  );

  const visible = leads.filter((l) => {
    if (project && l.propertyRef !== project) return false;
    if (onlyOpen && !OPEN_STATUSES.includes(l.status)) return false;
    return true;
  });

  if (leads.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-sand-300 bg-white px-6 py-10 text-center">
        <p className="font-display text-[1.0625rem] font-semibold text-brand-900">
          No enquiries yet.
        </p>
        <p className="mx-auto mt-2.5 max-w-sm text-[0.875rem] leading-relaxed text-ink-500">
          When a buyer sends an enquiry on one of your projects it appears here
          with their name, phone number and message — straight away, with no
          one in between.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        {projects.length > 1 ? (
          <>
            <label htmlFor="lead-project" className="sr-only">
              Filter by project
            </label>
            <select
              id="lead-project"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="field-input w-auto py-2 text-[0.8125rem]"
            >
              <option value="">All projects ({leads.length})</option>
              {projects.map(([ref, title]) => (
                <option key={ref} value={ref}>
                  {title}
                </option>
              ))}
            </select>
          </>
        ) : null}

        <label className="flex cursor-pointer items-center gap-2 text-[0.75rem] font-semibold text-ink-500">
          <input
            type="checkbox"
            checked={onlyOpen}
            onChange={(e) => setOnlyOpen(e.target.checked)}
            className="control-box"
          />
          Open enquiries only
        </label>

        <span className="ml-auto text-[0.75rem] text-ink-300 tabular-nums">
          Showing {visible.length} of {leads.length}
        </span>
      </div>

      <ul className="space-y-3">
        {visible.map((lead) => (
          <LeadRow key={lead.id} lead={lead} showProject={!project} />
        ))}
      </ul>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-sand-200 bg-white px-5 py-8 text-center text-[0.8125rem] text-ink-300">
          Nothing matches that filter.
        </p>
      ) : null}
    </div>
  );
}

function LeadRow({
  lead,
  showProject,
}: {
  lead: OwnerLead;
  showProject: boolean;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // Moves the pill immediately, then reconciles when the action resolves.
  const [status, setStatus] = useOptimistic<OwnerLeadStatus>(
    lead.status as OwnerLeadStatus,
  );

  function move(next: OwnerLeadStatus) {
    setError(null);
    start(async () => {
      setStatus(next);
      const result = await updateOwnerLeadStatus(lead.id, next);
      if (!result.ok) setError(result.message);
    });
  }

  const tel = lead.buyerPhone.replace(/[^\d+]/g, "");

  return (
    <li className="rounded-lg border border-sand-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.1em] ${
                STATUS_TONE[status] ?? STATUS_TONE.contacted
              }`}
            >
              {STATUSES.find((s) => s.value === status)?.label ?? status}
            </span>
            <span className="text-[0.6875rem] text-ink-300 tabular-nums">
              {lead.created_at} · {lead.ref}
            </span>
          </div>

          <p className="mt-2 text-[0.9375rem] font-semibold leading-snug tracking-tight text-brand-900">
            {lead.buyerName}
            {lead.buyerCompany ? (
              <span className="font-normal text-ink-500"> · {lead.buyerCompany}</span>
            ) : null}
          </p>

          {showProject && lead.propertyTitle ? (
            <p className="mt-1 text-[0.75rem] text-ink-500">
              Enquired on{" "}
              {lead.propertySlug ? (
                <Link
                  href={`/properties/${lead.propertySlug}`}
                  className="font-semibold text-brand-700 underline underline-offset-4"
                >
                  {lead.propertyTitle}
                </Link>
              ) : (
                <span className="font-semibold text-brand-900">
                  {lead.propertyTitle}
                </span>
              )}
            </p>
          ) : null}
        </div>

        {/* The two things a lister actually wants to do with a fresh lead. */}
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <a
            href={`tel:${tel}`}
            className="rounded-lg bg-brand-700 px-4 py-2 text-[0.75rem] font-semibold text-white transition-colors hover:bg-brand-800"
          >
            Call {lead.buyerPhone}
          </a>
          <a
            href={`https://wa.me/${tel.replace(/^\+/, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-sand-300 px-4 py-2 text-[0.75rem] font-semibold text-brand-900 transition-colors hover:bg-sand-100"
          >
            WhatsApp
          </a>
        </div>
      </div>

      <dl className="mt-3.5 grid gap-x-6 gap-y-2 border-t border-sand-200 pt-3.5 sm:grid-cols-2">
        <Detail label="Email">
          <a
            href={`mailto:${lead.buyerEmail}`}
            className="font-semibold text-brand-700 underline underline-offset-4"
          >
            {lead.buyerEmail}
          </a>
        </Detail>
        <Detail label="Prefers a call">
          {lead.preferredTime ? lead.preferredTime : "Any time"}
        </Detail>
        {lead.message ? (
          <Detail label="Message" className="sm:col-span-2">
            {lead.message}
          </Detail>
        ) : null}
      </dl>

      <div className="mt-3.5 flex flex-wrap items-center gap-2.5 border-t border-sand-200 pt-3.5">
        <label
          htmlFor={`status-${lead.id}`}
          className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-300"
        >
          Stage
        </label>
        <select
          id={`status-${lead.id}`}
          value={status}
          disabled={pending}
          onChange={(e) => move(e.target.value as OwnerLeadStatus)}
          className="field-input w-auto py-1.5 text-[0.75rem]"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {pending ? <Loader size="xs" /> : null}
        {error ? (
          <span role="alert" className="text-[0.75rem] font-medium text-clay-700">
            {error}
          </span>
        ) : null}
      </div>
    </li>
  );
}

function Detail({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-ink-300">
        {label}
      </dt>
      <dd className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink-700">
        {children}
      </dd>
    </div>
  );
}
