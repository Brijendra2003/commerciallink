import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { PortalSession } from "@/lib/portal";
import type { Property } from "@/lib/types";
import type { Requirement } from "@/lib/admin-types";
import type { RequirementRow } from "@/lib/supabase/types";
import {
  PROPERTY_SELECT,
  toProperty,
  type PropertyWithMedia,
} from "@/lib/data/mappers";

/**
 * Reads for the buyer/owner portal. Everything here runs under the caller's
 * own session, so RLS — not application code — is what scopes a row to them.
 */

/** An owner's listings, in every state. Includes the database uuid so the
 *  withdraw action can target it. */
export async function getOwnerListings(
  session: PortalSession,
): Promise<{ uuid: string; property: Property }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
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
