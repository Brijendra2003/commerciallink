import type { PropertyMediaRow, PropertyRow } from "@/lib/supabase/types";
import type { Property, PropertyMedia } from "@/lib/types";

/** Row → domain mappers shared by the admin, public and portal reads. */

export type PropertyWithMedia = PropertyRow & {
  property_media: PropertyMediaRow[] | null;
};

export const PROPERTY_SELECT = "*, property_media(*)";

export function toMedia(rows: PropertyMediaRow[] | null): PropertyMedia[] {
  return (rows ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((m) => ({
      id: m.id,
      cloudinary_public_id: m.cloudinary_public_id,
      type: m.type,
      alt: m.alt ?? "",
      sort_order: m.sort_order,
    }));
}

export function toProperty(row: PropertyWithMedia): Property {
  return {
    id: row.ref,
    slug: row.slug,
    title: row.title,
    type: row.type,
    purpose: row.purpose,
    city: row.city,
    zone: row.zone,
    locality: row.locality,
    address: row.address,
    price: row.price,
    rent_psf: row.rent_psf,
    area_sqft: row.area_sqft,
    carpet_area_sqft: row.carpet_area_sqft ?? row.area_sqft,
    floor: row.floor ?? "—",
    possession: row.possession,
    furnishing: row.furnishing,
    zoning: row.zoning ?? "",
    status: row.status,
    featured: row.featured,
    verified: row.verified,
    amenities: row.amenities,
    summary: row.summary ?? "",
    description: row.description,
    media: toMedia(row.property_media),
    building_name: row.building_name ?? null,
    pincode: row.pincode ?? null,
    total_floors: row.total_floors ?? null,
    property_age_years: row.property_age_years ?? null,
    available_from: row.available_from ?? null,
    maintenance_psf: row.maintenance_psf ?? null,
    security_deposit_months: row.security_deposit_months ?? null,
    lock_in_months: row.lock_in_months ?? null,
    parking_slots: row.parking_slots ?? null,
    power_load_kva: row.power_load_kva ?? null,
    ceiling_height_ft: row.ceiling_height_ft ?? null,
    meta_title: row.meta_title,
    meta_description: row.meta_description,
    owner_id: row.owner_id,
    created_at: row.created_at.slice(0, 10),
    view_count: row.view_count,
    enquiry_count: row.enquiry_count,
  };
}
