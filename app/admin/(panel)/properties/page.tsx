import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { NewListingButton } from "@/components/admin/quick-actions";
import { PropertyStatusBadge } from "@/components/admin/status-badge";
import { ReviewActions } from "@/components/admin/review-actions";
import { StatTile } from "@/components/charts/stat-tile";
import { Photo } from "@/components/ui/photo";
import {
  PROJECT_CATEGORY_LABEL,
  PROPERTY_TYPE_LABEL,
  SEGMENT_LABEL,
  purposeLabel,
} from "@/lib/data/taxonomy";
import { makeOwnerLookup } from "@/lib/data/crm";
import { getAllProperties, getLeads, getOwners } from "@/lib/data/queries";
import { formatArea, formatINR, formatPrice, formatRate } from "@/lib/format";
import type { PropertyStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Property Management" };

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "published", label: "Published" },
  { value: "pending_review", label: "Pending review" },
  { value: "draft", label: "Draft" },
  { value: "sold", label: "Sold / leased" },
  { value: "archived", label: "Archived" },
];

function one(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

/** Opens the desk's mail client with the verification request drafted. */
function requestDocsHref(title: string, ownerEmail: string | undefined): string {
  const subject = `Documents needed to publish: ${title}`;
  const body = [
    "Hello,",
    "",
    `Thank you for submitting "${title}" to CommercialLink.`,
    "",
    "Before it can publish we need to verify ownership. Please reply with:",
    "  • Title deed or share certificate",
    "  • Latest property tax receipt",
    "  • Photo ID of the signatory",
    "  • Occupancy certificate, where issued",
    "",
    "Once these are with us we will confirm the details on a short call and",
    "arrange photography at our cost.",
    "",
    "Regards,",
    "CommercialLink onboarding desk",
  ].join("\n");

  return `mailto:${ownerEmail ?? ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [sp, properties, leads, owners] = await Promise.all([
    searchParams,
    getAllProperties(),
    getLeads(),
    getOwners(),
  ]);
  const ownerById = makeOwnerLookup(owners);
  const status = one(sp.status);

  const rows = properties.filter((p) => {
    if (!status) return true;
    if (status === "sold") return p.status === "sold" || p.status === "leased";
    return p.status === status;
  });

  const totalViews = properties.reduce((s, p) => s + p.view_count, 0);
  const totalEnquiries = properties.reduce((s, p) => s + p.enquiry_count, 0);
  const pending = properties.filter((p) => p.status === "pending_review");

  return (
    <>
      <PageHeader
        title="Project management"
        lead="Residential and commercial listings, the verification queue, and media. Nothing publishes until a reviewer approves it."
        action={
          <NewListingButton
            owners={owners.map((o) => ({
              id: o.id,
              name: o.name,
              company: o.company ?? "",
            }))}
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Published listings" value={String(properties.filter((p) => p.status === "published").length)} />
        <StatTile label="Total listing views" value={totalViews.toLocaleString("en-IN")} />
        <StatTile label="Enquiries generated" value={String(totalEnquiries)} />
        <StatTile
          label="View → enquiry rate"
          value={formatRate(totalEnquiries, totalViews)}
        />
      </div>

      {pending.length > 0 ? (
        <div className="mt-4">
          <Panel
            title={`Verification queue · ${pending.length} awaiting review`}
            padded={false}
          >
            <ul className="divide-y divide-sand-200">
              {pending.map((p) => {
                // A new project with no RERA number cannot be approved, so the
                // reviewer is told before they click rather than after.
                const missingRera =
                  p.category === "new_project" && !p.rera_number;

                return (
                  <li key={p.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-start gap-4">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.8125rem] font-bold text-brand-900">
                          {p.title}
                        </span>
                        <span className="mt-0.5 block text-[0.75rem] text-ink-500">
                          {SEGMENT_LABEL[p.segment]} ·{" "}
                          {PROJECT_CATEGORY_LABEL[p.category]} ·{" "}
                          {formatArea(p.area_sqft)} · submitted by{" "}
                          {ownerById(p.owner_id)?.name ?? p.owner_id}
                        </span>
                        {p.rera_number ? (
                          <span className="mt-1 block text-[0.6875rem] text-ink-300">
                            RERA {p.rera_number}
                          </span>
                        ) : null}
                        {missingRera ? (
                          <span className="mt-1.5 inline-block rounded border border-clay-100 bg-clay-50 px-2 py-1 text-[0.6875rem] font-semibold text-clay-700">
                            New project with no RERA number — add it before
                            approving
                          </span>
                        ) : null}
                      </span>
                      <span className="flex shrink-0 flex-wrap gap-2">
                        <Link
                          href={`/admin/properties/${p.id}`}
                          className="rounded-lg border border-sand-300 px-4 py-2 text-[0.75rem] font-semibold text-brand-900 transition-colors hover:bg-sand-100"
                        >
                          Open
                        </Link>
                        <a
                          href={requestDocsHref(p.title, ownerById(p.owner_id)?.email)}
                          className="rounded-lg border border-sand-300 px-4 py-2 text-[0.75rem] font-semibold text-ink-500 transition-colors hover:bg-sand-100"
                        >
                          Request docs
                        </a>
                      </span>
                    </div>
                    <div className="mt-3">
                      <ReviewActions propertyRef={p.id} compact />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      ) : null}

      <nav aria-label="Filter by status" className="mt-6 mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const active = status === f.value;
          const count =
            f.value === ""
              ? properties.length
              : f.value === "sold"
                ? properties.filter((p) => p.status === "sold" || p.status === "leased").length
                : properties.filter((p) => p.status === f.value).length;
          return (
            <Link
              key={f.value || "all"}
              href={f.value ? `/admin/properties?status=${f.value}` : "/admin/properties"}
              aria-current={active ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-[0.75rem] font-semibold transition-colors ${
                active
                  ? "bg-brand-900 text-sand-50"
                  : "border border-sand-300 text-ink-500 hover:bg-white"
              }`}
            >
              {f.label}
              <span className={`ml-1.5 tabular-nums ${active ? "text-brand-100" : "text-ink-300"}`}>
                {count}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="overflow-x-auto rounded-3xl border border-sand-200 bg-white shadow-soft">
        <table className="w-full min-w-[58rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-sand-200 bg-sand-50">
              {["Listing", "Type", "Status", "Ask", "Views", "Enquiries", "Rate", ""].map(
                (h, i) => (
                  <th
                    key={h || i}
                    scope="col"
                    className={`px-4 py-3 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-ink-300 ${
                      i >= 3 && i <= 6 ? "text-right" : ""
                    }`}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const price = formatPrice(p);
              const cover = p.media.find((m) => m.type === "image");
              const enquiryRate = formatRate(p.enquiry_count, p.view_count);
              const linked = leads.filter((l) => l.property_id === p.id).length;

              return (
                <tr key={p.id} className="border-b border-sand-200 last:border-0 transition-colors hover:bg-sand-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-brand-100">
                        {cover ? (
                          <Photo
                            publicId={cover.cloudinary_public_id}
                            alt=""
                            sizes="56px"
                            width={200}
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0">
                        <span className="block max-w-[18rem] truncate text-[0.8125rem] font-bold text-brand-900">
                          {p.title}
                        </span>
                        <span className="mt-0.5 block text-[0.6875rem] text-ink-300">
                          {p.locality}, {p.city} · {linked} linked lead
                          {linked === 1 ? "" : "s"}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block text-[0.75rem] text-ink-500">
                      {PROPERTY_TYPE_LABEL[p.type]}
                    </span>
                    <span className="mt-0.5 block text-[0.6875rem] text-ink-300">
                      {purposeLabel(p.purpose, p.segment)} ·{" "}
                      {PROJECT_CATEGORY_LABEL[p.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <PropertyStatusBadge status={p.status as PropertyStatus} />
                  </td>
                  <td className="px-4 py-3 text-right text-[0.8125rem] font-semibold tabular-nums text-brand-800">
                    {price.value}
                  </td>
                  <td className="px-4 py-3 text-right text-[0.8125rem] tabular-nums text-ink-500">
                    {p.view_count.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right text-[0.8125rem] tabular-nums text-ink-500">
                    {p.enquiry_count}
                  </td>
                  <td className="px-4 py-3 text-right text-[0.8125rem] font-semibold tabular-nums text-brand-900">
                    {enquiryRate}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/properties/${p.id}`}
                      className="rounded-lg border border-sand-300 px-3.5 py-1.5 text-[0.6875rem] font-semibold text-brand-900 transition-colors hover:bg-sand-100"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {rows.length === 0 ? (
          <p className="px-4 py-12 text-center text-[0.8125rem] text-ink-300">
            Nothing in this state right now.
          </p>
        ) : null}
      </div>

      <p className="mt-4 text-[0.6875rem] text-ink-300">
        Pipeline value attached to these listings:{" "}
        {formatINR(
          leads
            .filter((l) => l.property_id && !["won", "lost"].includes(l.status))
            .reduce((s, l) => s + l.value_estimate, 0),
        )}
      </p>
    </>
  );
}
