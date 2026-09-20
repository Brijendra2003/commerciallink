"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession, hasRole, type AdminSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  FURNISHING_LABEL,
  POSSESSION_LABEL,
  PROPERTY_TYPE_LABEL,
  ZONE_LABEL,
} from "@/lib/data/taxonomy";
import {
  DOCUMENT_BUCKET,
  MAX_FLOOR_PLANS,
  MAX_IMAGE_BYTES,
  MAX_PDF_BYTES,
  MAX_PHOTOS,
  MEDIA_BUCKET,
  files,
  pathFromPublicUrl,
  publicUrl,
  upload,
  validateFiles,
} from "@/lib/storage";
import type {
  FurnishingDb,
  PossessionDb,
  PropertyRow,
  PropertyStatusDb,
  PropertyTypeDb,
  PurposeDb,
  ZoneDb,
} from "@/lib/supabase/types";

export interface AdminActionState {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
}

const DEMO: AdminActionState = {
  ok: false,
  message: "Demo mode — connect Supabase in .env.local to save changes.",
};

/**
 * Every admin action re-checks the caller itself; the panel layout is not a
 * security boundary. Listing edits are limited to the roles the database's
 * can_edit_listings() allows, and RLS enforces the same rule underneath.
 */
async function requireEditor(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new Error("Not signed in.");
  if (!hasRole(session, "super_admin", "content_editor")) {
    throw new Error("Your role cannot edit listings.");
  }
  return session;
}

function text(data: FormData, key: string): string {
  return String(data.get(key) ?? "").trim();
}

function optionalNumber(
  data: FormData,
  key: string,
  errors: Record<string, string>,
  { integer = true, min = 0 }: { integer?: boolean; min?: number } = {},
): number | null {
  const raw = text(data, key).replace(/[₹,\s]/g, "");
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < min || (integer && !Number.isInteger(n))) {
    errors[key] = integer ? "Enter a whole number." : "Enter a number.";
    return null;
  }
  return n;
}

async function propertyIdByRef(ref: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("properties").select("id").eq("ref", ref).maybeSingle();
  return data?.id ?? null;
}

async function audit(session: AdminSession, action: string, target: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("audit_log").insert({ actor: session.name, action, target });
  if (error) console.error("[admin] audit insert failed", error);
}

function refresh(ref: string, slug?: string) {
  revalidatePath(`/admin/properties/${ref}`);
  revalidatePath("/admin/properties");
  revalidatePath("/properties");
  revalidatePath("/");
  if (slug) revalidatePath(`/properties/${slug}`);
}

/* ------------------------------------------------------------------ *
 * Listing details
 * ------------------------------------------------------------------ */

const STATUSES: PropertyStatusDb[] = ["draft", "pending_review", "published", "archived", "sold", "leased"];

export async function updateProperty(
  _prev: AdminActionState | null,
  data: FormData,
): Promise<AdminActionState> {
  if (!isSupabaseConfigured) return DEMO;
  const session = await requireEditor();

  const ref = text(data, "ref");
  const errors: Record<string, string> = {};

  const title = text(data, "title");
  if (title.length < 5) errors.title = "Title is too short.";

  const type = text(data, "type");
  if (!(type in PROPERTY_TYPE_LABEL)) errors.type = "Pick a property type.";
  const purpose = text(data, "purpose");
  if (purpose !== "buy" && purpose !== "lease") errors.purpose = "Pick a purpose.";
  const zone = text(data, "zone");
  if (!(zone in ZONE_LABEL)) errors.zone = "Pick a zone.";
  const possession = text(data, "possession");
  if (!(possession in POSSESSION_LABEL)) errors.possession = "Pick a possession status.";
  const furnishing = text(data, "furnishing");
  if (!(furnishing in FURNISHING_LABEL)) errors.furnishing = "Pick a handover condition.";
  const status = text(data, "status") as PropertyStatusDb;
  if (!STATUSES.includes(status)) errors.status = "Pick a status.";

  const locality = text(data, "locality");
  if (!locality) errors.locality = "Pick a micro-market.";
  const address = text(data, "address");
  if (address.length < 5) errors.address = "Enter the address.";

  const area = optionalNumber(data, "area_sqft", errors, { min: 1 });
  if (area === null && !errors.area_sqft) errors.area_sqft = "Built-up area is required.";
  const carpet = optionalNumber(data, "carpet_area_sqft", errors, { min: 1 });

  const slug = text(data, "slug").toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    errors.slug = "Lower-case letters, numbers and single hyphens only.";
  }

  const pincode = text(data, "pincode");
  if (pincode && !/^[1-9]\d{5}$/.test(pincode)) errors.pincode = "Enter a 6-digit PIN code.";

  const availableFrom = text(data, "available_from");

  const update: Partial<PropertyRow> = {
    title,
    type: type as PropertyTypeDb,
    purpose: purpose as PurposeDb,
    zone: zone as ZoneDb,
    locality,
    address,
    building_name: text(data, "building_name") || null,
    pincode: pincode || null,
    area_sqft: area ?? undefined,
    carpet_area_sqft: carpet,
    price: optionalNumber(data, "price", errors),
    rent_psf: optionalNumber(data, "rent_psf", errors, { integer: false }),
    maintenance_psf: optionalNumber(data, "maintenance_psf", errors, { integer: false }),
    security_deposit_months: optionalNumber(data, "security_deposit_months", errors),
    lock_in_months: optionalNumber(data, "lock_in_months", errors),
    floor: text(data, "floor") || null,
    total_floors: optionalNumber(data, "total_floors", errors, { min: 1 }),
    property_age_years: optionalNumber(data, "property_age_years", errors),
    available_from: /^\d{4}-\d{2}-\d{2}$/.test(availableFrom) ? availableFrom : null,
    parking_slots: optionalNumber(data, "parking_slots", errors),
    power_load_kva: optionalNumber(data, "power_load_kva", errors),
    ceiling_height_ft: optionalNumber(data, "ceiling_height_ft", errors, { integer: false, min: 1 }),
    possession: possession as PossessionDb,
    furnishing: furnishing as FurnishingDb,
    zoning: text(data, "zoning") || null,
    summary: text(data, "summary") || null,
    description: text(data, "description")
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean),
    amenities: text(data, "amenities")
      .split(/[,\n]/)
      .map((a) => a.trim())
      .filter(Boolean),
    meta_title: text(data, "meta_title") || null,
    meta_description: text(data, "meta_description") || null,
    slug,
    status,
    featured: data.get("featured") === "on",
    verified: data.get("verified") === "on",
  };

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors: errors };
  }

  const supabase = await createClient();
  const { data: before } = await supabase
    .from("properties")
    .select("slug, status")
    .eq("ref", ref)
    .maybeSingle();

  const { data: saved, error } = await supabase
    .from("properties")
    .update(update)
    .eq("ref", ref)
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, message: "That slug is already used by another listing.", fieldErrors: { slug: "Already in use." } };
    }
    console.error("[admin] property update failed", error);
    return { ok: false, message: "Could not save the listing." };
  }
  // RLS filters the row out rather than erroring when the role lacks rights.
  if (!saved) return { ok: false, message: "Listing not found, or your role cannot edit it." };

  await audit(
    session,
    before && before.status !== status ? `Changed listing status to ${status}` : "Edited listing",
    ref,
  );
  refresh(ref, slug);
  if (before?.slug && before.slug !== slug) revalidatePath(`/properties/${before.slug}`);

  return { ok: true, message: "Changes saved." };
}

/* ------------------------------------------------------------------ *
 * Media
 * ------------------------------------------------------------------ */

export async function uploadPropertyMedia(
  ref: string,
  kind: "image" | "floor_plan" | "brochure",
  data: FormData,
): Promise<AdminActionState> {
  if (!isSupabaseConfigured) return DEMO;
  const session = await requireEditor();

  const propertyId = await propertyIdByRef(ref);
  if (!propertyId) return { ok: false, message: "Listing not found." };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("property_media")
    .select("id, type, sort_order, cloudinary_public_id")
    .eq("property_id", propertyId);
  const sameKind = (existing ?? []).filter((m) => m.type === kind);

  const limit = kind === "image" ? MAX_PHOTOS : kind === "floor_plan" ? MAX_FLOOR_PLANS : 1;
  const validated = await validateFiles(files(data, "files"), {
    accept: kind === "brochure" ? "pdf" : "image",
    maxBytes: kind === "brochure" ? MAX_PDF_BYTES : MAX_IMAGE_BYTES,
    maxCount: kind === "brochure" ? 1 : Math.max(0, limit - sameKind.length),
    label: kind === "brochure" ? "brochure" : kind === "image" ? "more photos" : "more floor plans",
  });
  if (validated.error) return { ok: false, message: validated.error };
  if (validated.files.length === 0) return { ok: false, message: "Choose a file to upload." };

  // Storage writes need the service role (no client storage policies exist);
  // the editor check above is what authorises them.
  const storage = createAdminClient();
  const base = kind === "image" ? 0 : kind === "floor_plan" ? 100 : 200;
  let next = sameKind.reduce((max, m) => Math.max(max, m.sort_order + 1), base);

  const rows = [];
  const uploaded: { bucket: string; path: string }[] = [];
  try {
    for (const file of validated.files) {
      const bucket = kind === "brochure" ? DOCUMENT_BUCKET : MEDIA_BUCKET;
      const path = await upload(storage, bucket, propertyId, file);
      uploaded.push({ bucket, path });
      rows.push({
        property_id: propertyId,
        cloudinary_public_id: kind === "brochure" ? `${DOCUMENT_BUCKET}/${path}` : publicUrl(storage, path),
        type: kind,
        alt: kind === "brochure" ? "Brochure" : file.name.replace(/\.[^.]+$/, ""),
        sort_order: next++,
      });
    }
    const { error } = await supabase.from("property_media").insert(rows);
    if (error) throw error;
  } catch (error) {
    console.error("[admin] media upload failed", error);
    for (const u of uploaded) await storage.storage.from(u.bucket).remove([u.path]);
    return { ok: false, message: "Upload failed. Please try again." };
  }

  // A brochure is replaced, not accumulated.
  if (kind === "brochure" && sameKind.length > 0) {
    await removeMediaRows(sameKind.map((m) => ({ id: m.id, ref: m.cloudinary_public_id, type: m.type })));
  }

  await audit(session, `Uploaded ${rows.length} ${kind.replace("_", " ")} file(s)`, ref);
  refresh(ref);
  return { ok: true, message: "Uploaded." };
}

async function removeMediaRows(rows: { id: string; ref: string; type: string }[]) {
  const supabase = await createClient();
  const storage = createAdminClient();
  const { error } = await supabase.from("property_media").delete().in("id", rows.map((r) => r.id));
  if (error) throw error;

  for (const row of rows) {
    if (row.type === "brochure" && row.ref.startsWith(`${DOCUMENT_BUCKET}/`)) {
      await storage.storage.from(DOCUMENT_BUCKET).remove([row.ref.slice(DOCUMENT_BUCKET.length + 1)]);
    } else {
      const path = pathFromPublicUrl(row.ref);
      if (path) await storage.storage.from(MEDIA_BUCKET).remove([path]);
    }
  }
}

export async function deletePropertyMedia(ref: string, mediaId: string): Promise<AdminActionState> {
  if (!isSupabaseConfigured) return DEMO;
  const session = await requireEditor();

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("property_media")
    .select("id, type, cloudinary_public_id")
    .eq("id", mediaId)
    .maybeSingle();
  if (!row) return { ok: false, message: "That file no longer exists." };

  try {
    await removeMediaRows([{ id: row.id, ref: row.cloudinary_public_id, type: row.type }]);
  } catch (error) {
    console.error("[admin] media delete failed", error);
    return { ok: false, message: "Could not remove that file." };
  }

  await audit(session, `Removed ${row.type.replace("_", " ")}`, ref);
  refresh(ref);
  return { ok: true, message: "Removed." };
}

export async function reorderPropertyMedia(ref: string, orderedIds: string[]): Promise<AdminActionState> {
  if (!isSupabaseConfigured) return DEMO;
  await requireEditor();

  const propertyId = await propertyIdByRef(ref);
  if (!propertyId) return { ok: false, message: "Listing not found." };

  const supabase = await createClient();
  const results = await Promise.all(
    orderedIds.map((id, i) =>
      supabase
        .from("property_media")
        .update({ sort_order: i })
        .eq("id", id)
        .eq("property_id", propertyId)
        .eq("type", "image"),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) {
    console.error("[admin] media reorder failed", failed.error);
    return { ok: false, message: "Could not save the new order." };
  }

  refresh(ref);
  return { ok: true, message: "Order saved." };
}
