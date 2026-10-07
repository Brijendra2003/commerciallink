import Link from "next/link";
import { Photo } from "@/components/ui/photo";
import { ButtonLink } from "@/components/ui/button";
import { PropertyStatusBadge, KycBadge } from "@/components/admin/status-badge";
import { StatTile } from "@/components/charts/stat-tile";
import { ProfilePanel } from "@/components/portal/profile-panel";
import { RelistButton, WithdrawButton } from "@/components/portal/withdraw-button";
import { LeadInbox } from "@/components/portal/lead-inbox";
import { VerifyEmailNotice } from "@/components/portal/portal-header";
import {
  ACCOUNT_TYPE_LABEL,
  PROJECT_CATEGORY_LABEL,
  PROPERTY_TYPE_LABEL,
  purposeLabel,
} from "@/lib/data/taxonomy";
import { formatArea, formatPrice } from "@/lib/format";
import { site } from "@/lib/data/site";
import type { PortalSession } from "@/lib/portal";
import type { Property, PropertyStatus } from "@/lib/types";
import type { OwnerLead } from "@/lib/data/portal-queries";

/**
 * The dashboard for an owner, broker or developer.
 *
 * All three see the same thing, because all three do the same thing: list
 * projects, and work the enquiries that come in on them. The account type
 * changes the labels, not the capabilities.
 */
export function OwnerDashboard({
  session,
  listings,
  leads,
}: {
  session: PortalSession;
  listings: { uuid: string; property: Property }[];
  leads: OwnerLead[];
}) {
  const live = listings.filter((l) => l.property.status === "published");
  const pending = listings.filter((l) => l.property.status === "pending_review");
  const totalViews = listings.reduce((s, l) => s + l.property.view_count, 0);
  const newLeads = leads.filter((l) => l.status === "new");

  const accountLabel =
    ACCOUNT_TYPE_LABEL[session.accountType ?? "owner"] ?? "Owner";

  return (
    <>
      {!session.emailVerified ? <VerifyEmailNotice email={session.email} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Live projects" value={String(live.length)} />
        <StatTile label="Awaiting verification" value={String(pending.length)} />
        <StatTile label="Total views" value={totalViews.toLocaleString("en-IN")} />
        <StatTile
          label={
            leads.length > 0
              ? `New enquiries (${leads.length} in total)`
              : "New enquiries"
          }
          value={String(newLeads.length)}
        />
      </div>

      {/* Leads come first. They are time-sensitive in a way a listing edit
          never is — a buyer who enquired this morning is worth calling now. */}
      <section id="leads" className="mt-8 scroll-mt-24">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-[1.1875rem] font-semibold tracking-[-0.015em] text-brand-900">
              Leads on your projects
            </h2>
            <p className="mt-1 text-[0.8125rem] text-ink-500">
              Every buyer who enquired, with their name and number. Call them
              directly.
            </p>
          </div>
          {newLeads.length > 0 ? (
            <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-brand-800">
              {newLeads.length} new
            </span>
          ) : null}
        </div>

        <LeadInbox leads={leads} />
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-[1.1875rem] font-semibold tracking-[-0.015em] text-brand-900">
              My projects
            </h2>
            <ButtonLink href="/list-your-property#submit" size="sm" arrow>
              Add a project
            </ButtonLink>
          </div>

          {listings.length === 0 ? (
            <div className="rounded-lg border border-dashed border-sand-300 bg-white px-6 py-10 text-center">
              <p className="font-display text-[1.0625rem] font-semibold text-brand-900">
                Nothing listed yet.
              </p>
              <p className="mx-auto mt-2.5 max-w-sm text-[0.875rem] leading-relaxed text-ink-500">
                Adding a project takes about two minutes. Our team verifies the
                details, it goes live, and enquiries land in the panel above.
              </p>
              <div className="mt-6">
                <ButtonLink href="/list-your-property#submit" arrow>
                  Add your first project
                </ButtonLink>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {listings.map(({ uuid, property }) => {
                const price = formatPrice(property);
                const cover = property.media.find((m) => m.type === "image");
                const projectLeads = leads.filter(
                  (l) => l.propertyRef === property.id,
                );

                return (
                  <li
                    key={uuid}
                    className="rounded-lg border border-sand-200 bg-white p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <span className="relative h-32 w-full shrink-0 overflow-hidden rounded border border-sand-200 bg-sand-100 sm:h-24 sm:w-32">
                        {cover ? (
                          <Photo
                            publicId={cover.cloudinary_public_id}
                            alt=""
                            sizes="140px"
                            width={320}
                          />
                        ) : null}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <PropertyStatusBadge
                            status={property.status as PropertyStatus}
                          />
                          <span className="text-[0.6875rem] text-ink-300">
                            {PROPERTY_TYPE_LABEL[property.type]} ·{" "}
                            {purposeLabel(property.purpose, property.segment)}
                          </span>
                        </div>

                        <h3 className="mt-2 text-[0.9375rem] font-semibold leading-snug tracking-tight text-brand-900">
                          {property.status === "published" ? (
                            <Link
                              href={`/properties/${property.slug}`}
                              className="hover:text-brand-700"
                            >
                              {property.title}
                            </Link>
                          ) : (
                            property.title
                          )}
                        </h3>
                        <p className="mt-1 text-[0.75rem] text-ink-500">
                          {property.locality} · {formatArea(property.area_sqft)} ·{" "}
                          {price.value}
                          {price.unit ? ` ${price.unit}` : ""}
                        </p>
                        <p className="mt-1 text-[0.6875rem] text-ink-300">
                          {PROJECT_CATEGORY_LABEL[property.category]}
                          {property.rera_number
                            ? ` · RERA ${property.rera_number}`
                            : ""}
                        </p>

                        {/* The verification outcome, in the lister's words
                            rather than an enum name. */}
                        {property.status === "pending_review" ? (
                          <p className="mt-2.5 rounded border border-sand-200 bg-sand-50 px-3 py-2 text-[0.75rem] leading-relaxed text-ink-500">
                            {property.review_note
                              ? property.review_note
                              : "Our team is verifying this project. It publishes once approved."}
                          </p>
                        ) : null}
                        {property.review_status === "rejected" ||
                        property.review_status === "changes_requested" ? (
                          <p className="mt-2.5 rounded border border-clay-100 bg-clay-50 px-3 py-2 text-[0.75rem] leading-relaxed text-clay-700">
                            {property.review_note ??
                              "Our team could not verify this project. Please get in touch."}
                          </p>
                        ) : null}

                        <div className="mt-3.5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-sand-200 pt-3.5">
                          <Metric
                            label="Views"
                            value={property.view_count.toLocaleString("en-IN")}
                          />
                          <Metric
                            label="Enquiries"
                            value={String(
                              // Prefer the leads actually readable here; fall
                              // back to the counter for historical rows.
                              projectLeads.length || property.enquiry_count,
                            )}
                          />
                          <span className="ml-auto flex items-center gap-4">
                            {projectLeads.length > 0 ? (
                              <Link
                                href="#leads"
                                className="text-[0.75rem] font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-900"
                              >
                                View leads
                              </Link>
                            ) : null}
                            {property.status === "archived" ? (
                              <RelistButton propertyId={uuid} />
                            ) : (
                              <WithdrawButton
                                propertyId={uuid}
                                live={property.status === "published"}
                              />
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <p className="mt-5 rounded-lg border border-sand-200 bg-white px-5 py-4 text-[0.75rem] leading-relaxed text-ink-500">
            <span className="font-semibold text-brand-900">
              Need something changed on a live project?
            </span>{" "}
            Take it off the market and relist it, or call us on {site.phone} and
            we will edit it for you. An edit to a live project is re-verified
            before it goes back up.
          </p>
        </section>

        <div className="space-y-4">
          <ProfilePanel session={session} />

          <section className="rounded-lg border border-sand-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[0.9375rem] font-semibold tracking-tight text-brand-900">
                {accountLabel} verification
              </h2>
              {session.kycStatus ? <KycBadge status={session.kycStatus} /> : null}
            </div>
            <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-500">
              {session.kycStatus === "verified"
                ? "Your documents are on file. Projects you add go straight into the verification queue."
                : "We need to verify who you are before a project can publish. One call and the documents below is all it takes."}
            </p>
            {session.reraNumber ? (
              <p className="mt-3 rounded border border-sand-200 bg-sand-50 px-3 py-2 text-[0.75rem] text-ink-500">
                RERA registration on file:{" "}
                <span className="font-semibold text-brand-900">
                  {session.reraNumber}
                </span>
              </p>
            ) : null}
            <ul className="mt-4 space-y-2 border-t border-sand-200 pt-4">
              {(session.accountType === "developer"
                ? [
                    "Company registration (GST / CIN)",
                    "MahaRERA promoter registration",
                    "Project RERA certificate per project",
                    "Photo ID of the signatory",
                  ]
                : session.accountType === "broker"
                  ? [
                      "MahaRERA agent registration",
                      "Photo ID and PAN",
                      "Authority letter from the owner you represent",
                    ]
                  : [
                      "Agreement or index II",
                      "Share certificate, where applicable",
                      "Latest property tax receipt",
                      "Photo ID of the owner",
                    ]
              ).map((doc) => (
                <li
                  key={doc}
                  className="flex items-start gap-2.5 text-[0.8125rem] text-ink-500"
                >
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600"
                  />
                  {doc}
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-sand-200 pt-4 text-[0.75rem] leading-relaxed text-ink-300">
              Send documents to{" "}
              <a
                href={`mailto:${site.email}`}
                className="font-semibold text-brand-700 underline underline-offset-4"
              >
                {site.email}
              </a>{" "}
              — in-dashboard upload is coming with the secure document store.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <span className="block text-[0.625rem] font-bold uppercase tracking-[0.12em] text-ink-300">
        {label}
      </span>
      <span className="mt-0.5 block text-[0.875rem] font-semibold tabular-nums text-brand-900">
        {value}
      </span>
    </span>
  );
}
