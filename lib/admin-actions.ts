"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession, hasRole, type AdminSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  FURNISHING_LABEL,
  POSSESSION_LABEL,
  PROJECT_CATEGORY_LABEL,
  PROPERTY_TYPE_LABEL,
  ZONE_LABEL,
  reraRequired,
  segmentForType,
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
import {
  MEDIA_ROOT,
  destroyAsset,
  destroyAssets,
  fileUnderProperty,
  verifySubmittedMedia,
} from "@/lib/cloudinary";
import { LIMIT, type UploadedAsset } from "@/lib/media";
import type {
  FurnishingDb,
  PossessionDb,
  ProjectCategoryDb,
  PropertyRow,
  PropertyStatusDb,
  PropertyTypeDb,
  PurposeDb,
  ReviewOutcomeDb,
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
  if (!(zone in ZONE_LABEL)) errors.zone = "Pick a belt.";

  // Segment follows the type rather than being independently editable — an
  // "apartment" is residential by definition, and letting the two disagree
  // would break every segment filter on the public side.
  const segment = segmentForType(type);

  const category = text(data, "category");
  if (!(category in PROJECT_CATEGORY_LABEL)) errors.category = "Pick a category.";

  // The same conditional rule the public form enforces, and the same rule the
  // CHECK constraint on `properties` enforces underneath.
  const reraNumber = text(data, "rera_number").toUpperCase();
  if (reraRequired(category) && !reraNumber) {
    errors.rera_number =
      "A new project under construction cannot be saved without its RERA number.";
  }
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
  const possessionBy = text(data, "possession_by");

  const update: Partial<PropertyRow> = {
    title,
    segment,
    type: type as PropertyTypeDb,
    category: category as ProjectCategoryDb,
    rera_number: reraNumber || null,
    bedrooms: optionalNumber(data, "bedrooms", errors),
    bathrooms: optionalNumber(data, "bathrooms", errors),
    balconies: optionalNumber(data, "balconies", errors),
    possession_by: /^\d{4}-\d{2}-\d{2}$/.test(possessionBy) ? possessionBy : null,
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
 * Verification
 * ------------------------------------------------------------------ */

/**
 * The admin verification pass on a submitted project.
 *
 * Approving is the only route to `published`: the RLS policy in
 * 0006_projects_and_leads.sql refuses a lister's own write when the status is
 * `published`, so nothing reaches the public site without a staff decision
 * going through here.
 *
 * The note is written to `review_note`, which the lister sees on their own
 * dashboard row — a rejection with no reason just generates a phone call.
 */
export async function reviewProperty(
  ref: string,
  outcome: Exclude<ReviewOutcomeDb, "pending">,
  note?: string,
): Promise<AdminActionState> {
  if (!isSupabaseConfigured) return DEMO;
  const session = await requireEditor();

  const supabase = await createClient();
  const { data: property } = await supabase
    .from("properties")
    .select("id, slug, title, status, category, rera_number")
    .eq("ref", ref)
    .maybeSingle();

  if (!property) return { ok: false, message: "Listing not found." };

  // Refuse to publish a new project that is missing the one document the law
  // requires. The CHECK constraint would also stop this, but failing here
  // gives the reviewer a sentence instead of a Postgres error.
  if (
    outcome === "approved" &&
    reraRequired(property.category) &&
    !property.rera_number
  ) {
    return {
      ok: false,
      message:
        "This is a new project under construction with no RERA number. Add the number before approving.",
    };
  }

  const trimmed = note?.trim().slice(0, 1000) || null;
  if (outcome !== "approved" && !trimmed) {
    return {
      ok: false,
      message: "Tell the lister what needs fixing — they see this note.",
      fieldErrors: { review_note: "Add a reason." },
    };
  }

  // `approved` publishes. The others keep it out of the public set but differ
  // in what the lister is being asked to do, so they are not the same state.
  const status: PropertyStatusDb =
    outcome === "approved"
      ? "published"
      : outcome === "rejected"
        ? "archived"
        : "pending_review";

  const { data: saved, error } = await supabase
    .from("properties")
    .update({
      status,
      review_status: outcome,
      review_note: trimmed,
      reviewed_at: new Date().toISOString(),
      reviewed_by: session.id,
      verified: outcome === "approved",
    })
    .eq("ref", ref)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[admin] review update failed", error);
    return { ok: false, message: "Could not save that decision." };
  }
  // RLS filters the row out rather than erroring when the role lacks rights.
  if (!saved) {
    return { ok: false, message: "Listing not found, or your role cannot review it." };
  }

  const verb =
    outcome === "approved"
      ? "Approved and published listing"
      : outcome === "rejected"
        ? "Rejected listing"
        : "Requested changes on listing";

  await audit(session, verb, ref);
  refresh(ref, property.slug);
  revalidatePath("/dashboard");

  return {
    ok: true,
    message:
      outcome === "approved"
        ? `${property.title} is live.`
        : outcome === "rejected"
          ? "Rejected. The lister can see your note."
          : "Sent back to the lister with your note.",
  };
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

/**
 * Adds media that the browser already uploaded to Cloudinary, filing it under
 * the listing's own folder. Photos, videos and floor plans take this path;
 * the brochure stays in the private Supabase bucket, which is what keeps it
 * gated behind a qualified enquiry.
 */
export async function attachPropertyMedia(
  ref: string,
  assets: UploadedAsset[],
): Promise<AdminActionState> {
  if (!isSupabaseConfigured) return DEMO;
  const session = await requireEditor();

  const supabase = await createClient();
  const { data: property } = await supabase
    .from("properties")
    .select("id, title")
    .eq("ref", ref)
    .maybeSingle();
  if (!property) return { ok: false, message: "Listing not found." };

  const verified = await verifySubmittedMedia(JSON.stringify(assets));
  if (verified.error) return { ok: false, message: verified.error };
  if (verified.assets.length === 0) return { ok: false, message: "Nothing to attach." };

  const { data: existing } = await supabase
    .from("property_media")
    .select("id, type, sort_order")
    .eq("property_id", property.id);

  // Respect the same per-kind ceilings the public form enforces.
  for (const kind of ["image", "video", "floor_plan"] as const) {
    const have = (existing ?? []).filter((m) => m.type === kind).length;
    const adding = verified.assets.filter((a) => a.kind === kind).length;
    if (have + adding > LIMIT[kind].count) {
      return {
        ok: false,
        message: `That would exceed the limit of ${LIMIT[kind].count} ${kind.replace("_", " ")} files.`,
      };
    }
  }

  const filed = await fileUnderProperty(verified.assets, property.title, ref);

  const BASE: Record<string, number> = { image: 0, video: 50, floor_plan: 100 };
  const next: Record<string, number> = {};
  for (const kind of ["image", "video", "floor_plan"] as const) {
    next[kind] = (existing ?? [])
      .filter((m) => m.type === kind)
      .reduce((max, m) => Math.max(max, m.sort_order + 1), BASE[kind]);
  }

  const rows = filed.map((asset) => ({
    property_id: property.id,
    cloudinary_public_id: asset.publicId,
    type: asset.kind,
    alt: `${property.title} — ${asset.kind.replace("_", " ")}`,
    sort_order: next[asset.kind]++,
  }));

  const { error } = await supabase.from("property_media").insert(rows);
  if (error) {
    console.error("[admin] media attach failed", error);
    await destroyAssets(filed);
    return { ok: false, message: "Could not save the media." };
  }

  await audit(session, `Added ${rows.length} media file(s)`, ref);
  refresh(ref);
  return { ok: true, message: `Added ${rows.length} file${rows.length === 1 ? "" : "s"}.` };
}

async function removeMediaRows(rows: { id: string; ref: string; type: string }[]) {
  const supabase = await createClient();
  const storage = createAdminClient();
  const { error } = await supabase.from("property_media").delete().in("id", rows.map((r) => r.id));
  if (error) throw error;

  for (const row of rows) {
    if (row.type === "brochure" && row.ref.startsWith(`${DOCUMENT_BUCKET}/`)) {
      await storage.storage.from(DOCUMENT_BUCKET).remove([row.ref.slice(DOCUMENT_BUCKET.length + 1)]);
      continue;
    }
    // Cloudinary ids carry the media root; legacy uploads are Storage URLs.
    if (row.ref.startsWith(`${MEDIA_ROOT}/`)) {
      await destroyAsset(row.ref, row.type === "video" ? "video" : "image");
      continue;
    }
    const path = pathFromPublicUrl(row.ref);
    if (path) await storage.storage.from(MEDIA_BUCKET).remove([path]);
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

/* ------------------------------------------------------------------ *
 * Owners, deals and staff
 * ------------------------------------------------------------------ */

/** Sales actions are not listing edits, so they take the wider staff check. */
async function requireStaff(...roles: AdminSession["role"][]): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new Error("Not signed in.");
  if (roles.length > 0 && !hasRole(session, ...roles)) {
    throw new Error("Your role cannot perform that action.");
  }
  return session;
}

export async function createOwner(
  _prev: AdminActionState | null,
  data: FormData,
): Promise<AdminActionState> {
  if (!isSupabaseConfigured) return DEMO;
  const session = await requireStaff("super_admin", "sales_exec");

  const name = text(data, "name");
  const email = text(data, "email").toLowerCase();
  const phone = text(data, "phone");
  const company = text(data, "company");

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Enter the owner's full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) fieldErrors.email = "Enter a valid email.";
  if (!/^[+]?[\d\s-]{8,15}$/.test(phone)) fieldErrors.phone = "Enter a valid phone number.";
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("owners")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) {
    return { ok: false, message: "An owner with that email is already on the book." };
  }

  const { error } = await supabase.from("owners").insert({
    name,
    email,
    phone,
    company: company || null,
    city: "Mumbai",
    kyc_status: "pending",
  });

  if (error) {
    console.error("[admin] owner insert failed", error);
    return { ok: false, message: "Could not create the owner record." };
  }

  await audit(session, "Onboarded owner", email);
  revalidatePath("/admin/owners");
  return { ok: true, message: `${name} added, KYC pending.` };
}

export async function addOwnerNote(
  _prev: AdminActionState | null,
  data: FormData,
): Promise<AdminActionState> {
  if (!isSupabaseConfigured) return DEMO;
  const session = await requireStaff();

  const ownerId = text(data, "owner_id");
  const note = text(data, "text");
  if (!ownerId) return { ok: false, message: "Owner not found." };
  if (note.length < 3) {
    return { ok: false, message: "Write a note first.", fieldErrors: { text: "Too short." } };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("owner_notes").insert({
    owner_id: ownerId,
    author: session.name,
    text: note.slice(0, 2000),
  });

  if (error) {
    console.error("[admin] owner note insert failed", error);
    return { ok: false, message: "Could not save the note." };
  }

  await audit(session, "Logged owner note", ownerId);
  revalidatePath("/admin/owners");
  return { ok: true, message: "Note saved." };
}

/** Marks a won deal's brokerage as paid out to the owner. */
export async function settleDealPayout(dealRef: string): Promise<AdminActionState> {
  if (!isSupabaseConfigured) return DEMO;
  const session = await requireStaff("super_admin", "sales_exec");

  const supabase = await createClient();
  const { data: deal, error: lookupError } = await supabase
    .from("deals")
    .select("id, status, payout_settled")
    .eq("ref", dealRef)
    .maybeSingle();

  if (lookupError || !deal) return { ok: false, message: "Deal not found." };
  if (deal.status !== "won") {
    return { ok: false, message: "Only a won deal can be settled." };
  }
  if (deal.payout_settled) return { ok: true, message: "Already settled." };

  const { error } = await supabase
    .from("deals")
    .update({ payout_settled: true })
    .eq("id", deal.id);

  if (error) {
    console.error("[admin] deal settle failed", error);
    return { ok: false, message: "Could not mark the payout settled." };
  }

  await audit(session, "Settled payout", dealRef);
  revalidatePath("/admin/sales");
  return { ok: true, message: "Payout marked settled." };
}

/**
 * Invites a staff member. Creates the auth user through Supabase's invite flow
 * and the `admin_users` row that actually grants access — membership of that
 * table is the admin grant, so both have to exist.
 */
export async function inviteStaffUser(
  _prev: AdminActionState | null,
  data: FormData,
): Promise<AdminActionState> {
  if (!isSupabaseConfigured) return DEMO;
  const session = await requireStaff("super_admin");

  const name = text(data, "name");
  const email = text(data, "email").toLowerCase();
  const role = text(data, "role") as AdminSession["role"];

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Enter their full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) fieldErrors.email = "Enter a valid email.";
  if (!["super_admin", "sales_exec", "content_editor"].includes(role)) {
    fieldErrors.role = "Pick a role.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors };
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("admin_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) return { ok: false, message: "That address already has a staff account." };

  const redirectTo = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`
    : undefined;

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { name },
    redirectTo,
  });

  if (inviteError || !invited?.user) {
    console.error("[admin] invite failed", inviteError);
    return {
      ok: false,
      message:
        inviteError?.message ??
        "Could not send the invitation. Check the Supabase email settings.",
    };
  }

  const initials = name
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  const { error } = await admin.from("admin_users").insert({
    auth_user_id: invited.user.id,
    name,
    initials,
    email,
    role,
    is_active: true,
  });

  if (error) {
    console.error("[admin] staff row insert failed", error);
    return { ok: false, message: "Invitation sent, but the staff record failed to save." };
  }

  await audit(session, `Invited ${role.replace("_", " ")}`, email);
  revalidatePath("/admin/settings");
  return { ok: true, message: `Invitation sent to ${email}.` };
}

/**
 * Starts a listing from the desk rather than from an owner submission. It
 * lands as a draft so the rest of the detail is filled in on the edit screen,
 * which is where every other listing change already happens.
 */
export async function createDraftListing(
  _prev: AdminActionState | null,
  data: FormData,
): Promise<AdminActionState & { ref?: string }> {
  if (!isSupabaseConfigured) return DEMO;
  const session = await requireEditor();

  const title = text(data, "title");
  const ownerId = text(data, "owner_id");
  const type = text(data, "type") as PropertyTypeDb;
  const purpose = text(data, "purpose") as PurposeDb;

  const fieldErrors: Record<string, string> = {};
  if (title.length < 6) fieldErrors.title = "Give the listing a working title.";
  if (!ownerId) fieldErrors.owner_id = "Pick the owner this sits with.";
  if (!["office", "retail", "warehouse", "industrial", "land", "coworking"].includes(type)) {
    fieldErrors.type = "Pick an asset class.";
  }
  if (!["buy", "lease"].includes(purpose)) fieldErrors.purpose = "Sale or lease?";
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors };
  }

  const ref = `PRP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const slug = `${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)}-${ref.slice(-6)}`;

  const supabase = await createClient();
  const { error } = await supabase.from("properties").insert({
    ref,
    slug,
    title,
    type,
    purpose,
    city: "Mumbai",
    zone: "central",
    locality: "To be confirmed",
    address: "To be confirmed",
    area_sqft: 0,
    status: "draft",
    owner_id: ownerId,
    created_by: session.id,
  });

  if (error) {
    console.error("[admin] draft listing insert failed", error);
    return { ok: false, message: "Could not create the draft." };
  }

  await audit(session, "Created draft listing", ref);
  revalidatePath("/admin/properties");
  return { ok: true, message: "Draft created.", ref };
}
