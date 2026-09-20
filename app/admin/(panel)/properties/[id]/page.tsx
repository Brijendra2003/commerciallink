import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { PropertyStatusBadge } from "@/components/admin/status-badge";
import { MediaManager } from "@/components/admin/media-manager";
import { PropertyEditForm } from "@/components/admin/property-edit-form";
import { StatTile } from "@/components/charts/stat-tile";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { makeOwnerLookup } from "@/lib/data/crm";
import { getLeads, getOwners, getPropertyByRef } from "@/lib/data/queries";
import {
  FURNISHING_LABEL,
  MICRO_MARKETS,
  POSSESSION_LABEL,
  PROPERTY_TYPES,
  ZONES,
} from "@/lib/data/taxonomy";
import { site } from "@/lib/data/site";
import { formatINR } from "@/lib/format";
import type { PropertyStatus } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await getPropertyByRef(id);
  return { title: property ? `Edit · ${property.title}` : "Property" };
}

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [property, owners, leads] = await Promise.all([
    getPropertyByRef(id),
    getOwners(),
    getLeads(),
  ]);

  if (!property) notFound();

  const owner = makeOwnerLookup(owners)(property.owner_id);
  const linked = leads.filter((l) => l.property_id === property.id);
  const openValue = linked
    .filter((l) => !["won", "lost"].includes(l.status))
    .reduce((s, l) => s + l.value_estimate, 0);
  const enquiryRate =
    property.view_count > 0
      ? `${((property.enquiry_count / property.view_count) * 100).toFixed(1)}%`
      : "—";

  // The micro-market list may not include a legacy value; keep it selectable.
  const markets = MICRO_MARKETS.some((m) => m.name === property.locality)
    ? MICRO_MARKETS
    : [{ name: property.locality, zone: property.zone }, ...MICRO_MARKETS];

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center gap-2 text-[0.75rem] text-ink-300">
          <li>
            <Link href="/admin/properties" className="hover:text-brand-700">
              Properties
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="truncate font-medium text-ink-500">{property.id}</li>
        </ol>
      </nav>

      <PageHeader
        title={property.title}
        lead={`${property.locality}, ${property.city} · owner ${owner?.name ?? property.owner_id}`}
        action={
          property.status === "published" ? (
            <Link
              href={`/properties/${property.slug}`}
              target="_blank"
              className="rounded-full border border-brand-900/15 px-5 py-2.5 text-[0.8125rem] font-semibold text-brand-900 transition-colors hover:bg-white"
            >
              View live
            </Link>
          ) : null
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Listing views" value={property.view_count.toLocaleString("en-IN")} />
        <StatTile label="Enquiries" value={String(property.enquiry_count)} />
        <StatTile label="View → enquiry rate" value={enquiryRate} />
        <StatTile label="Open pipeline on this listing" value={openValue > 0 ? formatINR(openValue) : "—"} />
      </div>

      <PropertyEditForm propertyRef={property.id}>
        <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            <Panel title="Listing details">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <Field label="Title" name="title" className="sm:col-span-2">
                  <Input name="title" defaultValue={property.title} />
                </Field>
                <Field label="Property type" name="type">
                  <Select name="type" defaultValue={property.type}>
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Purpose" name="purpose">
                  <Select name="purpose" defaultValue={property.purpose}>
                    <option value="lease">For lease</option>
                    <option value="buy">For sale</option>
                  </Select>
                </Field>
                <Field label="Zone" name="zone">
                  <Select name="zone" defaultValue={property.zone}>
                    {ZONES.map((z) => (
                      <option key={z.value} value={z.value}>{z.label}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Micro-market" name="locality">
                  <Select name="locality" defaultValue={property.locality}>
                    {markets.map((m) => (
                      <option key={m.name} value={m.name}>{m.name}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Address" name="address" className="sm:col-span-2">
                  <Input name="address" defaultValue={property.address} />
                </Field>
                <Field label="Building / project" name="building_name">
                  <Input name="building_name" defaultValue={property.building_name ?? ""} />
                </Field>
                <Field label="PIN code" name="pincode">
                  <Input name="pincode" defaultValue={property.pincode ?? ""} inputMode="numeric" maxLength={6} />
                </Field>
                <Field label="Built-up area (sq.ft.)" name="area_sqft">
                  <Input name="area_sqft" defaultValue={property.area_sqft} inputMode="numeric" />
                </Field>
                <Field label="Carpet area (sq.ft.)" name="carpet_area_sqft">
                  <Input name="carpet_area_sqft" defaultValue={property.carpet_area_sqft} inputMode="numeric" />
                </Field>
                <Field label="Asking price (₹)" name="price" hint="Sale listings. Blank = price on request.">
                  <Input name="price" defaultValue={property.price ?? ""} inputMode="numeric" />
                </Field>
                <Field label="Rent (₹/sq.ft./month)" name="rent_psf" hint="Lease listings. Blank = price on request.">
                  <Input name="rent_psf" defaultValue={property.rent_psf ?? ""} inputMode="decimal" />
                </Field>
                <Field label="Maintenance (₹/sq.ft./month)" name="maintenance_psf">
                  <Input name="maintenance_psf" defaultValue={property.maintenance_psf ?? ""} inputMode="decimal" />
                </Field>
                <div className="grid grid-cols-2 gap-3.5">
                  <Field label="Deposit (months)" name="security_deposit_months">
                    <Input name="security_deposit_months" defaultValue={property.security_deposit_months ?? ""} inputMode="numeric" />
                  </Field>
                  <Field label="Lock-in (months)" name="lock_in_months">
                    <Input name="lock_in_months" defaultValue={property.lock_in_months ?? ""} inputMode="numeric" />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <Field label="Floor" name="floor">
                    <Input name="floor" defaultValue={property.floor === "—" ? "" : property.floor} />
                  </Field>
                  <Field label="Total floors" name="total_floors">
                    <Input name="total_floors" defaultValue={property.total_floors ?? ""} inputMode="numeric" />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <Field label="Building age (yrs)" name="property_age_years">
                    <Input name="property_age_years" defaultValue={property.property_age_years ?? ""} inputMode="numeric" />
                  </Field>
                  <Field label="Available from" name="available_from">
                    <Input name="available_from" type="date" defaultValue={property.available_from ?? ""} />
                  </Field>
                </div>
                <Field label="Possession" name="possession">
                  <Select name="possession" defaultValue={property.possession}>
                    {Object.entries(POSSESSION_LABEL).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Handover condition" name="furnishing">
                  <Select name="furnishing" defaultValue={property.furnishing}>
                    {Object.entries(FURNISHING_LABEL).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </Select>
                </Field>
                <div className="grid grid-cols-3 gap-3.5 sm:col-span-2">
                  <Field label="Parking slots" name="parking_slots">
                    <Input name="parking_slots" defaultValue={property.parking_slots ?? ""} inputMode="numeric" />
                  </Field>
                  <Field label="Power (kVA)" name="power_load_kva">
                    <Input name="power_load_kva" defaultValue={property.power_load_kva ?? ""} inputMode="numeric" />
                  </Field>
                  <Field label="Ceiling (ft)" name="ceiling_height_ft">
                    <Input name="ceiling_height_ft" defaultValue={property.ceiling_height_ft ?? ""} inputMode="decimal" />
                  </Field>
                </div>
                <Field label="Zoning" name="zoning" className="sm:col-span-2">
                  <Input name="zoning" defaultValue={property.zoning} />
                </Field>
                <Field label="Summary" name="summary" className="sm:col-span-2">
                  <Textarea name="summary" rows={2} defaultValue={property.summary} />
                </Field>
                <Field
                  label="Description"
                  name="description"
                  className="sm:col-span-2"
                  hint="Separate paragraphs with a blank line."
                >
                  <Textarea name="description" rows={6} defaultValue={property.description.join("\n\n")} />
                </Field>
                <Field label="Amenities" name="amenities" className="sm:col-span-2" hint="Comma separated.">
                  <Textarea name="amenities" rows={2} defaultValue={property.amenities.join(", ")} />
                </Field>
              </div>
            </Panel>

            <Panel title="Media">
              <MediaManager propertyRef={property.id} media={property.media} />
            </Panel>

            <Panel title="SEO">
              <div className="space-y-3.5">
                <Field label="Meta title" name="meta_title" hint="55–60 characters reads best in results. Blank uses the title.">
                  <Input name="meta_title" defaultValue={property.meta_title ?? ""} placeholder={`${property.title}, Mumbai`} />
                </Field>
                <Field label="Meta description" name="meta_description" hint="Blank uses the summary.">
                  <Textarea name="meta_description" rows={3} defaultValue={property.meta_description ?? ""} placeholder={property.summary} />
                </Field>
                <Field label="Slug" name="slug">
                  <Input name="slug" defaultValue={property.slug} />
                </Field>
                <div className="rounded-2xl border border-sand-200 bg-sand-50 p-4">
                  <p className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-ink-300">
                    Search preview
                  </p>
                  <p className="mt-2.5 truncate text-[0.75rem] text-brand-600">
                    {site.url}/properties/{property.slug}
                  </p>
                  <p className="mt-1 truncate text-[0.9375rem] font-medium text-[#1a0dab]">
                    {property.meta_title || `${property.title}, Mumbai`}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[0.75rem] leading-relaxed text-ink-500">
                    {property.meta_description || property.summary}
                  </p>
                </div>
              </div>
            </Panel>
          </div>

          <div className="space-y-4">
            <Panel title="Publication">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-[0.75rem] text-ink-500">Current state</span>
                <PropertyStatusBadge status={property.status as PropertyStatus} />
              </div>
              <Field label="Set status" name="status">
                <Select name="status" defaultValue={property.status}>
                  <option value="draft">Draft</option>
                  <option value="pending_review">Pending review</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                  <option value="sold">Sold</option>
                  <option value="leased">Leased</option>
                </Select>
              </Field>
              <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-[0.8125rem] text-ink-500">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={property.featured}
                  className="h-4 w-4 cursor-pointer rounded border-sand-300 accent-clay-500"
                />
                Feature on the homepage carousel
              </label>
              <label className="mt-2.5 flex cursor-pointer items-center gap-2.5 text-[0.8125rem] text-ink-500">
                <input
                  type="checkbox"
                  name="verified"
                  defaultChecked={property.verified}
                  className="h-4 w-4 cursor-pointer rounded border-sand-300 accent-clay-500"
                />
                Documents verified — show the verified badge
              </label>
            </Panel>

            <Panel title="Owner">
              {owner ? (
                <>
                  <p className="text-[0.875rem] font-bold text-brand-900">{owner.name}</p>
                  <p className="mt-0.5 text-[0.75rem] text-ink-500">{owner.company}</p>
                  <dl className="mt-3 space-y-2 border-t border-sand-200 pt-3 text-[0.75rem]">
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink-300">Phone</dt>
                      <dd className="font-semibold text-brand-900">{owner.phone}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink-300">Email</dt>
                      <dd className="truncate font-semibold text-brand-900">{owner.email}</dd>
                    </div>
                  </dl>
                  {owner.notes.length > 0 ? (
                    <div className="mt-3 space-y-2 border-t border-sand-200 pt-3">
                      {owner.notes.slice(0, 3).map((n, i) => (
                        <div key={i} className="rounded-xl bg-sand-50 px-3 py-2">
                          <p className="text-[0.625rem] font-bold uppercase tracking-[0.1em] text-ink-300">
                            {n.author} · {n.date}
                          </p>
                          <p className="mt-1 whitespace-pre-line text-[0.75rem] leading-relaxed text-ink-500">
                            {n.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <Link
                    href="/admin/owners"
                    className="mt-4 block rounded-full border border-brand-900/15 px-4 py-2 text-center text-[0.75rem] font-semibold text-brand-900 transition-colors hover:bg-sand-100"
                  >
                    Open owner record
                  </Link>
                </>
              ) : (
                <p className="text-[0.8125rem] text-ink-300">
                  No owner record linked ({property.owner_id}).
                </p>
              )}
            </Panel>

            <Panel title={`Linked leads · ${linked.length}`} padded={false}>
              {linked.length === 0 ? (
                <p className="px-5 py-8 text-center text-[0.8125rem] text-ink-300">
                  No enquiries on this listing yet.
                </p>
              ) : (
                <ul className="divide-y divide-sand-200">
                  {linked.map((l) => (
                    <li key={l.id}>
                      <Link
                        href={`/admin/leads?lead=${l.id}`}
                        className="block px-5 py-3 transition-colors hover:bg-sand-50"
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="truncate text-[0.8125rem] font-bold text-brand-900">
                            {l.buyer_company || l.buyer_name}
                          </span>
                          <span className="shrink-0 text-[0.75rem] font-semibold tabular-nums text-brand-800">
                            {formatINR(l.value_estimate)}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-[0.6875rem] text-ink-300">
                          {l.id} · {l.buyer_name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </div>
      </PropertyEditForm>
    </>
  );
}
