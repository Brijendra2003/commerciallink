import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { LeadStatusBadge, RequirementBadge } from "@/components/admin/status-badge";
import { StatTile } from "@/components/charts/stat-tile";
import { ProfilePanel } from "@/components/portal/profile-panel";
import { CloseRequirementButton } from "@/components/portal/close-requirement-button";
import { VerifyEmailNotice } from "@/components/portal/portal-header";
import { PROPERTY_TYPE_LABEL } from "@/lib/data/taxonomy";
import { formatArea } from "@/lib/format";
import { site } from "@/lib/data/site";
import type { PortalSession } from "@/lib/portal";
import type { BuyerEnquiry } from "@/lib/data/portal-queries";
import type { LeadStatus, Requirement } from "@/lib/admin-types";
import type { PropertyType } from "@/lib/types";

export function BuyerDashboard({
  session,
  enquiries,
  requirements,
}: {
  session: PortalSession;
  enquiries: BuyerEnquiry[];
  requirements: { uuid: string; requirement: Requirement }[];
}) {
  const open = requirements.filter((r) => r.requirement.status !== "closed");
  const active = enquiries.filter(
    (e) => !["won", "lost"].includes(e.status),
  ).length;

  return (
    <>
      {!session.emailVerified ? <VerifyEmailNotice email={session.email} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Enquiries sent" value={String(enquiries.length)} />
        <StatTile label="Being worked" value={String(active)} />
        <StatTile label="Open requirements" value={String(open.length)} />
        <StatTile
          label="Matches shortlisted"
          value={String(
            requirements.reduce(
              (s, r) => s + r.requirement.matched_property_ids.length,
              0,
            ),
          )}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-8">
          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-display text-[1.35rem] tracking-[-0.015em] text-brand-900">
                My enquiries
              </h2>
              <ButtonLink href="/properties" variant="ghost" size="sm" arrow>
                Browse properties
              </ButtonLink>
            </div>

            {enquiries.length === 0 ? (
              <EmptyPanel
                title="No enquiries yet."
                body="When you enquire on a listing it appears here, with the status our desk is working it at."
                href="/properties"
                cta="Browse Properties"
              />
            ) : (
              <ul className="space-y-2.5">
                {enquiries.map((e) => (
                  <li
                    key={e.id}
                    className="rounded-3xl border border-brand-900/8 bg-white p-5 shadow-soft"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-[0.9375rem] font-bold leading-snug tracking-tight text-brand-900">
                          {e.propertySlug && e.propertyTitle ? (
                            <Link
                              href={`/properties/${e.propertySlug}`}
                              className="hover:text-clay-600"
                            >
                              {e.propertyTitle}
                            </Link>
                          ) : (
                            "General enquiry"
                          )}
                        </h3>
                        <p className="mt-1 text-[0.6875rem] tabular-nums text-ink-300">
                          {e.ref} · sent {e.created_at}
                        </p>
                      </div>
                      <LeadStatusBadge status={e.status as LeadStatus} />
                    </div>
                    {e.message ? (
                      <p className="mt-3 line-clamp-2 border-t border-sand-200 pt-3 text-[0.8125rem] leading-relaxed text-ink-500">
                        {e.message}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-display text-[1.35rem] tracking-[-0.015em] text-brand-900">
                My requirements
              </h2>
              <ButtonLink href="/post-requirement" size="sm" arrow>
                Post a requirement
              </ButtonLink>
            </div>

            {requirements.length === 0 ? (
              <EmptyPanel
                title="No requirements posted."
                body="About a third of what we transact never gets listed. A written brief is how you see it."
                href="/post-requirement"
                cta="Post Your Requirement"
              />
            ) : (
              <ul className="space-y-2.5">
                {requirements.map(({ uuid, requirement: r }) => (
                  <li
                    key={uuid}
                    className="rounded-3xl border border-brand-900/8 bg-white p-5 shadow-soft"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-[0.9375rem] font-bold leading-snug tracking-tight text-brand-900">
                          {PROPERTY_TYPE_LABEL[r.property_type as PropertyType]} ·{" "}
                          {r.area_sqft > 0 ? formatArea(r.area_sqft) : "Area flexible"}
                        </h3>
                        <p className="mt-1 text-[0.75rem] text-ink-500">
                          {r.locality || "Anywhere in MMR"} ·{" "}
                          {r.purpose === "lease" ? "Lease" : "Buy"} · {r.budget_label}
                        </p>
                        <p className="mt-1 text-[0.6875rem] tabular-nums text-ink-300">
                          {r.id} · posted {r.created_at}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <RequirementBadge status={r.status} />
                        {r.status !== "closed" ? (
                          <CloseRequirementButton requirementId={uuid} />
                        ) : null}
                      </div>
                    </div>

                    {r.matched_property_ids.length > 0 ? (
                      <p className="mt-3 border-t border-sand-200 pt-3 text-[0.8125rem] text-brand-700">
                        <span className="font-bold">
                          {r.matched_property_ids.length} option
                          {r.matched_property_ids.length === 1 ? "" : "s"} shortlisted
                        </span>{" "}
                        — your advisor will walk you through them.
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-4">
          <ProfilePanel session={session} />

          <section className="rounded-3xl border border-brand-900/8 bg-white p-5 shadow-soft">
            <h2 className="text-[0.9375rem] font-bold tracking-tight text-brand-900">
              Your advisor
            </h2>
            <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-500">
              Every enquiry and requirement here is owned by a named advisor. If
              you want to move faster than the queue, call the desk directly.
            </p>
            <div className="mt-4 space-y-2">
              <a
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                className="block rounded-2xl bg-sand-100 px-4 py-3 text-[0.8125rem] font-semibold text-brand-900 transition-colors hover:bg-sand-200"
              >
                {site.phone}
              </a>
              <a
                href={`mailto:${site.email}`}
                className="block rounded-2xl bg-sand-100 px-4 py-3 text-[0.8125rem] font-semibold text-brand-900 transition-colors hover:bg-sand-200"
              >
                {site.email}
              </a>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function EmptyPanel({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-brand-900/15 bg-sand-100 px-6 py-11 text-center">
      <p className="font-display text-[1.15rem] text-brand-900">{title}</p>
      <p className="mx-auto mt-2.5 max-w-sm text-[0.875rem] leading-relaxed text-ink-500">
        {body}
      </p>
      <div className="mt-6">
        <ButtonLink href={href} arrow>
          {cta}
        </ButtonLink>
      </div>
    </div>
  );
}
