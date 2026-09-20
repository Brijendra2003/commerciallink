import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { PropertyStatusBadge } from "@/components/admin/status-badge";
import { StatTile } from "@/components/charts/stat-tile";
import { Photo } from "@/components/ui/photo";
import { PROPERTY_TYPE_LABEL, PURPOSE_LABEL } from "@/lib/data/taxonomy";
import { makeOwnerLookup } from "@/lib/data/crm";
import { getAllProperties, getLeads, getOwners } from "@/lib/data/queries";
import { formatArea, formatINR, formatPrice } from "@/lib/format";
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
        title="Property management"
        lead="Listings, the owner-submission approval queue, and media. Nothing publishes until documents are verified."
        action={
          <button
            type="button"
            className="rounded-lg bg-brand-700 px-5 py-2.5 text-[0.8125rem] font-semibold text-white transition-colors hover:bg-brand-800"
          >
            + New listing
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Published listings" value={String(properties.filter((p) => p.status === "published").length)} />
        <StatTile label="Total listing views" value={totalViews.toLocaleString("en-IN")} delta={9} deltaLabel="vs last month" />
        <StatTile label="Enquiries generated" value={String(totalEnquiries)} delta={14} deltaLabel="vs last month" />
        <StatTile
          label="View → enquiry rate"
          value={`${((totalEnquiries / totalViews) * 100).toFixed(1)}%`}
          delta={2}
          deltaLabel="vs last month"
        />
      </div>

      {pending.length > 0 ? (
        <div className="mt-4">
          <Panel
            title={`Approval queue · ${pending.length} awaiting review`}
            padded={false}
          >
            <ul className="divide-y divide-sand-200">
              {pending.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.8125rem] font-bold text-brand-900">
                      {p.title}
                    </span>
                    <span className="mt-0.5 block text-[0.75rem] text-ink-500">
                      Submitted by {ownerById(p.owner_id)?.name ?? p.owner_id} ·{" "}
                      {formatArea(p.area_sqft)}
                    </span>
                  </span>
                  <span className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      className="rounded-full bg-brand-900 px-4 py-2 text-[0.75rem] font-semibold text-sand-50 transition-colors hover:bg-brand-800"
                    >
                      Review &amp; publish
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-brand-900/15 px-4 py-2 text-[0.75rem] font-semibold text-ink-500 transition-colors hover:bg-sand-100"
                    >
                      Request docs
                    </button>
                  </span>
                </li>
              ))}
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
                  : "border border-brand-900/12 text-ink-500 hover:bg-white"
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

      <div className="overflow-x-auto rounded-3xl border border-brand-900/8 bg-white shadow-soft">
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
              const rate = (p.enquiry_count / p.view_count) * 100;
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
                      {PURPOSE_LABEL[p.purpose]}
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
                    {rate.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/properties/${p.id}`}
                      className="rounded-full border border-brand-900/15 px-3.5 py-1.5 text-[0.6875rem] font-semibold text-brand-900 transition-colors hover:bg-sand-100"
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
