import { zoneForMarket } from "@/lib/data/taxonomy";
import type { PropertyMediaRow, PropertyRow } from "@/lib/supabase/types";
import type { Property, PropertyMedia, Zone } from "@/lib/types";

/** Row → domain mappers shared by the admin, public and portal reads. */

/**
 * The three belts the app knows about. The `mmr_zone` enum still carries the
 * six legacy MMR labels — Postgres cannot drop an enum label that historical
 * rows may hold — so a row read from a pre-corridor database can arrive with
 * `zone: "thane"`, which `Zone` no longer admits.
 */
const CORRIDOR_ZONES: Zone[] = ["mira_bhayandar", "vasai_virar", "palghar"];

/**
 * Resolves a row's belt.
 *
 * The locality is consulted first and the stored zone second, because the
 * locality names an actual station area and therefore pins the belt exactly,
 * while a legacy "western" could mean anywhere from Bandra to Boisar. A row
 * that matches neither is out of the service area; it falls back to the
 * nearest belt rather than crashing the page, and the desk re-tags it.
 */
function toZone(row: Pick<PropertyRow, "zone" | "locality">): Zone {
  const fromMarket = zoneForMarket(row.locality);
  if (fromMarket) return fromMarket;
  if (CORRIDOR_ZONES.includes(row.zone as Zone)) return row.zone as Zone;
  return "mira_bhayandar";
}

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
    // `segment` and `category` are NOT NULL with defaults in the database, but
    // a row read back from an older generated client can still arrive without
    // them — fall back rather than render `undefined` into a label lookup.
    segment: row.segment ?? "commercial",
    type: row.type,
    category: row.category ?? "ready_to_move",
    rera_number: row.rera_number ?? null,
    purpose: row.purpose,
    city: row.city,
    zone: toZone(row),
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
    bedrooms: row.bedrooms ?? null,
    bathrooms: row.bathrooms ?? null,
    balconies: row.balconies ?? null,
    possession_by: row.possession_by ?? null,
    review_status: row.review_status ?? "pending",
    review_note: row.review_note ?? null,
    reviewed_at: row.reviewed_at ?? null,
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
