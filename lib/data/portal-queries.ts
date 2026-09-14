import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { PortalSession } from "@/lib/portal";
import type { Property } from "@/lib/types";
import type { Requirement } from "@/lib/admin-types";
import type {
  PropertyMediaRow,
  PropertyRow,
  RequirementRow,
} from "@/lib/supabase/types";

/**
 * Reads for the buyer/owner portal. Everything here runs under the caller's
 * own session, so RLS — not application code — is what scopes a row to them.
 */

type PropertyWithMedia = PropertyRow & {
  property_media: PropertyMediaRow[] | null;
};

function toProperty(row: PropertyWithMedia): Property {
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
    media: (row.property_media ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((m) => ({
        id: m.id,
        cloudinary_public_id: m.cloudinary_public_id,
        type: m.type,
        alt: m.alt ?? "",
        sort_order: m.sort_order,
      })),
    owner_id: row.owner_id,
    created_at: row.created_at.slice(0, 10),
    view_count: row.view_count,
    enquiry_count: row.enquiry_count,
  };
}

/** An owner's listings, in every state. Includes the database uuid so the
 *  withdraw action can target it. */
export async function getOwnerListings(
  session: PortalSession,
): Promise<{ uuid: string; property: Property }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*, property_media(*)")
    .eq("owner_id", session.profileId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data as unknown as PropertyWithMedia[]).map((row) => ({
    uuid: row.id,
    property: toProperty(row),
  }));
}

export interface BuyerEnquiry {
  id: string;
  ref: string;
  status: string;
  created_at: string;
  message: string | null;
  propertyTitle: string | null;
  propertySlug: string | null;
}

/** A buyer's own enquiries. The owner-side equivalent deliberately does not
 *  exist — see the note in 0002_portal.sql. */
export async function getBuyerEnquiries(
  session: PortalSession,
): Promise<BuyerEnquiry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("id, ref, status, created_at, message, properties(title, slug)")
    .eq("buyer_id", session.profileId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  type Row = {
    id: string;
    ref: string;
    status: string;
    created_at: string;
    message: string | null;
    properties: { title: string; slug: string } | null;
  };

  return (data as unknown as Row[]).map((l) => ({
    id: l.id,
    ref: l.ref,
    status: l.status,
    created_at: l.created_at.slice(0, 10),
    message: l.message,
    propertyTitle: l.properties?.title ?? null,
    propertySlug: l.properties?.slug ?? null,
  }));
}

export async function getBuyerRequirements(
  session: PortalSession,
): Promise<{ uuid: string; requirement: Requirement }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("requirements")
    .select("*")
    .eq("buyer_id", session.profileId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data as RequirementRow[]).map((r) => ({
    uuid: r.id,
    requirement: {
      id: r.ref,
      buyer_name: r.buyer_name,
      buyer_company: r.buyer_company ?? "",
      buyer_phone: r.buyer_phone,
      buyer_email: r.buyer_email,
      property_type: r.property_type,
      city: r.city,
      locality: r.locality ?? "",
      budget_label: r.budget_label ?? "Not stated",
      area_sqft: r.area_sqft ?? 0,
      purpose: r.purpose,
      timeline: r.timeline ?? "Not stated",
      notes: r.notes ?? "",
      status: r.status,
      created_at: r.created_at.slice(0, 10),
      matched_property_ids: r.matched_property_ids,
    },
  }));
}
