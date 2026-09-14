import Link from "next/link";
import { Photo } from "@/components/ui/photo";
import { ButtonLink } from "@/components/ui/button";
import { PropertyStatusBadge, KycBadge } from "@/components/admin/status-badge";
import { StatTile } from "@/components/charts/stat-tile";
import { ProfilePanel } from "@/components/portal/profile-panel";
import { WithdrawButton } from "@/components/portal/withdraw-button";
import { VerifyEmailNotice } from "@/components/portal/portal-header";
import { PROPERTY_TYPE_LABEL, PURPOSE_LABEL } from "@/lib/data/taxonomy";
import { formatArea, formatPrice } from "@/lib/format";
import { site } from "@/lib/data/site";
import type { PortalSession } from "@/lib/portal";
import type { Property, PropertyStatus } from "@/lib/types";

export function OwnerDashboard({
  session,
  listings,
}: {
  session: PortalSession;
  listings: { uuid: string; property: Property }[];
}) {
  const live = listings.filter((l) => l.property.status === "published");
  const pending = listings.filter((l) => l.property.status === "pending_review");
  const totalViews = listings.reduce((s, l) => s + l.property.view_count, 0);
  const totalEnquiries = listings.reduce(
    (s, l) => s + l.property.enquiry_count,
    0,
  );

  return (
    <>
      {!session.emailVerified ? <VerifyEmailNotice email={session.email} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Live listings" value={String(live.length)} />
        <StatTile label="Awaiting review" value={String(pending.length)} />
        <StatTile label="Total views" value={totalViews.toLocaleString("en-IN")} />
        <StatTile label="Enquiries received" value={String(totalEnquiries)} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-[1.35rem] tracking-[-0.015em] text-brand-900">
              My listings
            </h2>
            <ButtonLink href="/list-your-property" size="sm" arrow>
              Submit a property
            </ButtonLink>
          </div>

          {listings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-brand-900/15 bg-sand-100 px-6 py-12 text-center">
              <p className="font-display text-[1.15rem] text-brand-900">
                Nothing listed yet.
              </p>
              <p className="mx-auto mt-2.5 max-w-sm text-[0.875rem] leading-relaxed text-ink-500">
                Submit a property and our onboarding team will verify the
                documents and commission photography — at our cost.
              </p>
              <div className="mt-6">
                <ButtonLink href="/list-your-property" arrow>
                  List Your Property
                </ButtonLink>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {listings.map(({ uuid, property }) => {
                const price = formatPrice(property);
                const cover = property.media.find((m) => m.type === "image");
                const rate =
                  property.view_count > 0
                    ? (property.enquiry_count / property.view_count) * 100
                    : 0;

                return (
                  <li
                    key={uuid}
                    className="rounded-3xl border border-brand-900/8 bg-white p-4 shadow-soft sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <span className="relative h-32 w-full shrink-0 overflow-hidden rounded-2xl bg-brand-100 sm:h-24 sm:w-32">
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
                            {PURPOSE_LABEL[property.purpose]}
                          </span>
                        </div>

                        <h3 className="mt-2 text-[0.9375rem] font-bold leading-snug tracking-tight text-brand-900">
                          {property.status === "published" ? (
                            <Link
                              href={`/properties/${property.slug}`}
                              className="hover:text-clay-600"
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

                        <div className="mt-3.5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-sand-200 pt-3.5">
                          <Metric label="Views" value={property.view_count.toLocaleString("en-IN")} />
                          <Metric label="Enquiries" value={String(property.enquiry_count)} />
                          <Metric label="Enquiry rate" value={`${rate.toFixed(1)}%`} />
                          {property.status === "pending_review" ? (
                            <WithdrawButton propertyId={uuid} />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* The guarantee that makes owners hand us the good stock. */}
          <p className="mt-5 rounded-2xl bg-sand-100 px-5 py-4 text-[0.75rem] leading-relaxed text-ink-500">
            <span className="font-bold text-brand-900">
              You see enquiry counts, not enquirers.
            </span>{" "}
            Buyer names and contact details stay with our desk until you agree to
            an introduction — that&apos;s enforced in the database, not just here.
            Call {site.phone} to discuss any live enquiry.
          </p>
        </section>

        <div className="space-y-4">
          <ProfilePanel session={session} />

          <section className="rounded-3xl border border-brand-900/8 bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[0.9375rem] font-bold tracking-tight text-brand-900">
                Verification
              </h2>
              {session.kycStatus ? <KycBadge status={session.kycStatus} /> : null}
            </div>
            <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-500">
              {session.kycStatus === "verified"
                ? "Your ownership documents are on file. Listings you submit go straight into the review queue."
                : "We need ownership proof before a listing can publish — title deed or share certificate, the latest tax receipt, and a photo ID."}
            </p>
            <ul className="mt-4 space-y-2 border-t border-sand-200 pt-4">
              {[
                "Title deed or share certificate",
                "Latest property tax receipt",
                "Photo ID of the signatory",
                "Occupancy certificate, where issued",
              ].map((doc) => (
                <li
                  key={doc}
                  className="flex items-start gap-2.5 text-[0.8125rem] text-ink-500"
                >
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clay-300"
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
      <span className="mt-0.5 block text-[0.875rem] font-bold tabular-nums text-brand-900">
        {value}
      </span>
    </span>
  );
}
