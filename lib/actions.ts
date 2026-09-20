"use server";

import { randomInt } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getPortalSession } from "@/lib/portal";
import {
  FURNISHING_LABEL,
  POSSESSION_LABEL,
  PROPERTY_TYPE_LABEL,
  zoneForMarket,
} from "@/lib/data/taxonomy";
import {
  DOCUMENT_BUCKET,
  MAX_PDF_BYTES,
  files,
  upload,
  validateFiles,
} from "@/lib/storage";
import {
  deleteDraftFolder,
  destroyAssets,
  fileUnderProperty,
  verifySubmittedMedia,
} from "@/lib/cloudinary";
import type { LeadSubmission } from "@/lib/types";
import type {
  FurnishingDb,
  LeadSourceDb,
  PossessionDb,
  PropertyTypeDb,
  PurposeDb,
} from "@/lib/supabase/types";

/**
 * Lead capture. Every public form on the site funnels through here, which is
 * the point of the platform: an enquiry, a requirement and an owner submission
 * all become rows the admin CRM works.
 *
 * Writes go through the service-role client because the `leads` table has an
 * INSERT policy for anon but no SELECT policy — a visitor can submit an enquiry
 * and cannot read anybody's back. Without Supabase credentials the submission
 * is validated and logged instead, so the forms stay exercisable.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+]?[\d\s-]{8,15}$/;

function text(data: FormData, key: string): string {
  return String(data.get(key) ?? "").trim();
}

/** e.g. PRP-2026-483920. Six random digits — refs are UNIQUE columns, and the
 *  old four-digit suffix gave ~9,000 possibilities a year before inserts
 *  started colliding. */
function reference(prefix: string): string {
  return `${prefix}-${new Date().getFullYear()}-${randomInt(100000, 1000000)}`;
}

function validateContact(data: FormData) {
  const errors: Record<string, string> = {};
  const name = text(data, "name");
  const email = text(data, "email").toLowerCase();
  const phone = text(data, "phone");

  if (name.length < 2) errors.name = "Please enter your full name.";
  if (!EMAIL.test(email)) errors.email = "Please enter a valid email address.";
  if (!PHONE.test(phone)) errors.phone = "Please enter a valid phone number.";
  if (data.get("consent") !== "on") {
    errors.consent = "Please confirm you agree to be contacted.";
  }

  return { errors, name, email, phone };
}

function invalid(fieldErrors: Record<string, string>): LeadSubmission {
  return {
    ok: false,
    message: "Please correct the highlighted fields.",
    fieldErrors,
  };
}

/**
 * Naive per-process throttle keyed on IP. Enough to blunt a form-spam script in
 * a single-instance deployment; put a real limiter (Upstash, or Supabase edge
 * rate limiting) in front of this before running multi-region.
 */
const RECENT = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

async function rateLimited(): Promise<boolean> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const hits = (RECENT.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  RECENT.set(ip, hits);

  // Keep the map from growing without bound on a long-lived process.
  if (RECENT.size > 5000) RECENT.clear();

  return hits.length > MAX_PER_WINDOW;
}

const THROTTLED: LeadSubmission = {
  ok: false,
  message: "That's a lot of submissions in a short window. Please try again in a minute.",
};

/**
 * Footer subscribe form. A duplicate address is reported as success — telling
 * a stranger whether an email is already on the list would leak membership.
 */
export async function subscribeToMarketNotes(
  _prev: LeadSubmission | null,
  data: FormData,
): Promise<LeadSubmission> {
  const email = text(data, "email").toLowerCase();

  if (!EMAIL.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }
  if (await rateLimited()) return THROTTLED;

  const done: LeadSubmission = {
    ok: true,
    message: "You're on the list. The next quarterly note goes out at the end of the quarter.",
  };

  if (!isSupabaseConfigured) {
    console.info("[market-notes] subscription captured (demo mode)", { email });
    return done;
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("market_notes_subscribers")
    .upsert(
      { email, source: text(data, "source") || "footer", unsubscribed_at: null },
      { onConflict: "email" },
    );

  if (error) {
    console.error("[market-notes] subscribe failed", error);
    return {
      ok: false,
      message: "We couldn't save that just now. Please try again in a moment.",
    };
  }

  return done;
}

async function propertyIdFromRef(ref: string): Promise<string | null> {
  if (!ref) return null;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("properties")
    .select("id")
    .eq("ref", ref)
    .maybeSingle();
  return data?.id ?? null;
}

/* ------------------------------------------------------------------ */

export async function submitEnquiry(
  _prev: LeadSubmission | null,
  data: FormData,
): Promise<LeadSubmission> {
  const { errors, name, email, phone } = validateContact(data);
  if (Object.keys(errors).length > 0) return invalid(errors);
  if (await rateLimited()) return THROTTLED;

  const ref = reference("ENQ");
  const intent = text(data, "intent") || "request_details";
  const source: LeadSourceDb =
    intent === "brochure" ? "brochure" : "organic";

  const lead = {
    ref,
    buyer_name: name,
    buyer_phone: phone,
    buyer_email: email,
    message: text(data, "message") || `Intent: ${intent}`,
    preferred_time: text(data, "preferred_time") || null,
    source,
    status: "new" as const,
    consent: true,
    utm_source: text(data, "utm_source") || null,
    utm_campaign: text(data, "utm_campaign") || null,
  };

  if (isSupabaseConfigured) {
    const property_id = await propertyIdFromRef(text(data, "property_id"));
    // A signed-in buyer gets the lead attached to their profile so it shows up
    // in their dashboard; an anonymous enquiry is still a perfectly good lead.
    const session = await getPortalSession();
    const buyer_id = session?.role === "buyer" ? session.profileId : null;

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("leads")
      .insert({ ...lead, property_id, requirement_id: null, buyer_id });

    if (error) {
      console.error("[lead] enquiry insert failed", error);
      return {
        ok: false,
        message: "Something went wrong saving your enquiry. Please call the desk.",
      };
    }
  } else {
    console.info("[lead] enquiry captured (demo mode)", {
      ...lead,
      property_ref: text(data, "property_id"),
    });
  }

  return {
    ok: true,
    message:
      "Enquiry received. An advisor will call you within four working hours.",
    reference: ref,
  };
}

export async function submitRequirement(
  _prev: LeadSubmission | null,
  data: FormData,
): Promise<LeadSubmission> {
  const { errors, name, email, phone } = validateContact(data);

  if (!text(data, "property_type")) {
    errors.property_type = "Select the type of space you need.";
  }
  if (!text(data, "market")) errors.market = "Select a preferred micro-market.";
  if (!text(data, "purpose")) {
    errors.purpose = "Tell us whether you want to buy or lease.";
  }

  if (Object.keys(errors).length > 0) return invalid(errors);
  if (await rateLimited()) return THROTTLED;

  const ref = reference("REQ");
  const market = text(data, "market");
  const extra = text(data, "locality");

  const requirement = {
    ref,
    buyer_name: name,
    buyer_email: email,
    buyer_phone: phone,
    property_type: text(data, "property_type") as PropertyTypeDb,
    city: "Mumbai",
    locality: [market, extra].filter(Boolean).join(" / "),
    budget_label: text(data, "budget") || null,
    area_sqft: Number(text(data, "area_sqft").replace(/[^\d]/g, "")) || null,
    purpose: text(data, "purpose") as PurposeDb,
    timeline: text(data, "timeline") || null,
    notes: text(data, "notes") || null,
    status: "open" as const,
  };

  if (isSupabaseConfigured) {
    const session = await getPortalSession();
    const buyer_id = session?.role === "buyer" ? session.profileId : null;
    const supabase = createAdminClient();

    // A requirement creates a `requirements` row AND a linked `leads` row
    // tagged source: "requirement" — Section 4.2 of the brief.
    const { data: inserted, error } = await supabase
      .from("requirements")
      .insert({ ...requirement, buyer_id })
      .select("id")
      .single();

    if (error || !inserted) {
      console.error("[lead] requirement insert failed", error);
      return {
        ok: false,
        message: "Something went wrong saving your requirement. Please call the desk.",
      };
    }

    const { error: leadError } = await supabase.from("leads").insert({
      ref: reference("L"),
      property_id: null,
      requirement_id: inserted.id,
      buyer_id,
      buyer_name: name,
      buyer_phone: phone,
      buyer_email: email,
      message: requirement.notes ?? "Requirement listing submitted.",
      source: "requirement",
      status: "new",
      consent: true,
    });

    if (leadError) console.error("[lead] requirement lead insert failed", leadError);
  } else {
    console.info("[lead] requirement captured (demo mode)", requirement);
  }

  return {
    ok: true,
    message:
      "Requirement logged. We will come back with matched options — including off-market stock — within two working days.",
    reference: ref,
  };
}

/**
 * Parses an optional number typed the way people type money and area in India
 * ("2,50,00,000", "18 400", "₹285"). Returns `undefined` for blank, and an
 * error string when the value is present but unusable.
 */
function numberField(
  data: FormData,
  key: string,
  { integer = true, min = 0, max = Number.MAX_SAFE_INTEGER, label }: {
    integer?: boolean;
    min?: number;
    max?: number;
    label: string;
  },
  errors: Record<string, string>,
): number | null {
  const raw = text(data, key).replace(/[₹,\s]/g, "");
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || (integer && !Number.isInteger(value))) {
    errors[key] = `Enter ${label} as a ${integer ? "whole " : ""}number.`;
    return null;
  }
  if (value < min || value > max) {
    errors[key] = `${label[0].toUpperCase()}${label.slice(1)} looks out of range.`;
    return null;
  }
  return value;
}

const PROPERTY_TYPE_VALUES = Object.keys(PROPERTY_TYPE_LABEL);
const POSSESSION_VALUES = Object.keys(POSSESSION_LABEL);
const FURNISHING_VALUES = Object.keys(FURNISHING_LABEL);

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function submitPropertyListing(
  _prev: LeadSubmission | null,
  data: FormData,
): Promise<LeadSubmission> {
  // A signed-in owner submits against their own profile; everyone else
  // identifies themselves in the form.
  const session = isSupabaseConfigured ? await getPortalSession() : null;
  const ownerSession = session?.role === "owner" ? session : null;

  const contact = ownerSession
    ? {
        errors: {} as Record<string, string>,
        name: ownerSession.name,
        email: ownerSession.email,
        phone: ownerSession.phone,
      }
    : validateContact(data);
  const { errors, name, email, phone } = contact;
  if (ownerSession && data.get("consent") !== "on") {
    errors.consent = "Please confirm you agree to be contacted.";
  }

  /* ---- The property ---- */
  const title = text(data, "title");
  const type = text(data, "property_type");
  const purposeRaw = text(data, "purpose");
  const possession = text(data, "possession") || "ready";
  const furnishing = text(data, "furnishing") || "bare_shell";

  if (title.length < 5) {
    errors.title = "Give the listing a descriptive name, e.g. building and floor.";
  }
  if (!PROPERTY_TYPE_VALUES.includes(type)) errors.property_type = "Select the property type.";
  if (!["buy", "lease", "either"].includes(purposeRaw)) {
    errors.purpose = "Tell us whether you want to sell or lease.";
  }
  if (!POSSESSION_VALUES.includes(possession)) errors.possession = "Select the possession status.";
  if (!FURNISHING_VALUES.includes(furnishing)) errors.furnishing = "Select the handover condition.";

  /* ---- Location ---- */
  const market = text(data, "market");
  const zone = zoneForMarket(market);
  const address = text(data, "address");
  const pincode = text(data, "pincode");
  if (!zone) errors.market = "Select the micro-market.";
  if (address.length < 5) errors.address = "Enter the street address or building location.";
  if (pincode && !/^[1-9]\d{5}$/.test(pincode)) errors.pincode = "Enter a 6-digit PIN code.";

  /* ---- Size & commercials ---- */
  const area = numberField(data, "area_sqft", { min: 50, max: 50_000_000, label: "built-up area" }, errors);
  if (area === null && !errors.area_sqft) errors.area_sqft = "Enter the built-up area.";
  const carpet = numberField(data, "carpet_area_sqft", { min: 1, max: 50_000_000, label: "carpet area" }, errors);
  if (area && carpet && carpet > area) {
    errors.carpet_area_sqft = "Carpet area cannot exceed built-up area.";
  }

  const wantsSale = purposeRaw === "buy" || purposeRaw === "either";
  const wantsLease = purposeRaw === "lease" || purposeRaw === "either";
  const price = wantsSale
    ? numberField(data, "price", { min: 10_000, max: 1e13, label: "sale price" }, errors)
    : null;
  const rentPsf = wantsLease
    ? numberField(data, "rent_psf", { integer: false, min: 1, max: 100_000, label: "rent per sq.ft." }, errors)
    : null;
  const maintenance = numberField(data, "maintenance_psf", { integer: false, max: 10_000, label: "maintenance" }, errors);
  const deposit = wantsLease
    ? numberField(data, "security_deposit_months", { max: 120, label: "security deposit" }, errors)
    : null;
  const lockIn = wantsLease
    ? numberField(data, "lock_in_months", { max: 240, label: "lock-in period" }, errors)
    : null;

  const floor = text(data, "floor");
  const totalFloors = numberField(data, "total_floors", { min: 1, max: 200, label: "total floors" }, errors);
  const age = numberField(data, "property_age_years", { max: 200, label: "age of the property" }, errors);
  const availableFrom = text(data, "available_from");
  if (availableFrom && !/^\d{4}-\d{2}-\d{2}$/.test(availableFrom)) {
    errors.available_from = "Pick a valid date.";
  }

  /* ---- Specifications ---- */
  const parking = numberField(data, "parking_slots", { max: 10_000, label: "parking slots" }, errors);
  const power = numberField(data, "power_load_kva", { max: 1_000_000, label: "power load" }, errors);
  const ceiling = numberField(data, "ceiling_height_ft", { integer: false, min: 1, max: 200, label: "ceiling height" }, errors);
  const zoning = text(data, "zoning");

  const amenities = [
    ...data.getAll("amenities").map(String),
    ...text(data, "amenities_other").split(",").map((a) => a.trim()),
  ]
    .filter(Boolean)
    .filter((a, i, all) => all.indexOf(a) === i)
    .slice(0, 40);

  /* ---- Description & private notes ---- */
  const description = text(data, "description");
  if (description.length < 40) {
    errors.description = "Describe the property in a few sentences (at least 40 characters).";
  }
  const tenancy = text(data, "tenancy_status");
  const documents = data.getAll("documents").map(String);
  const deskNotes = text(data, "notes");
  const company = text(data, "company");

  /* ---- Media ----
     Photos, videos and floor plans were uploaded straight to Cloudinary by the
     browser; the form carries only their identifiers, which are re-read from
     Cloudinary here rather than trusted. */
  const media = await verifySubmittedMedia(text(data, "media"));
  if (media.error) errors.photos = media.error;
  else if (!media.assets.some((a) => a.kind === "image")) {
    errors.photos = "Add at least one photograph of the property.";
  }

  const brochure = await validateFiles(files(data, "brochure"), {
    accept: "pdf",
    maxBytes: MAX_PDF_BYTES,
    maxCount: 1,
    label: "brochure",
  });
  if (brochure.error) errors.brochure = brochure.error;

  if (Object.keys(errors).length > 0) return invalid(errors);
  if (await rateLimited()) return THROTTLED;

  const ref = reference("PRP");
  const purpose: PurposeDb =
    purposeRaw === "buy" ? "buy" : purposeRaw === "lease" ? "lease" : rentPsf !== null ? "lease" : "buy";

  const paragraphs = description
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const property = {
    ref,
    slug: `${slugify(title) || "listing"}-${ref.slice(-6)}`,
    title,
    type: type as PropertyTypeDb,
    purpose,
    city: "Mumbai",
    zone: zone!,
    locality: market,
    address: [address, market, "Mumbai", pincode].filter(Boolean).join(", "),
    building_name: text(data, "building_name") || null,
    pincode: pincode || null,
    price,
    rent_psf: rentPsf,
    area_sqft: area!,
    carpet_area_sqft: carpet,
    floor: floor || null,
    total_floors: totalFloors,
    property_age_years: age,
    available_from: availableFrom || null,
    maintenance_psf: maintenance,
    security_deposit_months: deposit,
    lock_in_months: lockIn,
    parking_slots: parking,
    power_load_kva: power,
    ceiling_height_ft: ceiling,
    possession: possession as PossessionDb,
    furnishing: furnishing as FurnishingDb,
    zoning: zoning || null,
    amenities,
    summary: paragraphs[0]?.slice(0, 280) ?? null,
    description: paragraphs,
    status: "pending_review" as const,
  };

  // Owner-private context. Kept out of `properties` (publicly readable once
  // published) and filed as an admin-only owner note instead.
  const privateNote = [
    purposeRaw === "either" ? "Open to both sale and lease." : null,
    tenancy ? `Tenancy: ${tenancy}.` : null,
    documents.length ? `Documents ready: ${documents.join(", ")}.` : "No documents marked ready.",
    deskNotes ? `Owner notes: ${deskNotes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  if (!isSupabaseConfigured) {
    console.info("[listing] owner submission captured (demo mode)", {
      owner: { name, email, phone, company },
      property,
      privateNote,
      media: {
        cloudinary: media.assets.map((a) => `${a.kind}:${a.publicId}`),
        brochure: brochure.files.length,
      },
    });
    return {
      ok: true,
      message:
        "Submission received. Our onboarding team will call to verify documents before anything goes live.",
      reference: ref,
    };
  }

  const supabase = createAdminClient();
  const failed: LeadSubmission = {
    ok: false,
    message: "Something went wrong saving your submission. Please try again or call the desk.",
  };

  // Resolve the owner. properties.owner_id is NOT NULL, which is what makes
  // registration a structural prerequisite rather than a UI gate.
  //
  // An anonymous submission never overwrites an existing owner record: if the
  // email is already known we attach to it as-is, so nobody can change a
  // registered owner's name or phone by typing their email into this form.
  let ownerId = ownerSession?.profileId ?? null;
  if (!ownerId) {
    const { data: existing } = await supabase
      .from("owners")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      ownerId = existing.id;
    } else {
      const { data: created, error } = await supabase
        .from("owners")
        .insert({ name, email, phone, company: company || null, city: "Mumbai", kyc_status: "pending" })
        .select("id")
        .single();
      if (error || !created) {
        console.error("[listing] owner insert failed", error);
        return failed;
      }
      ownerId = created.id;
    }
  }

  const { data: inserted, error: insertError } = await supabase
    .from("properties")
    .insert({ ...property, owner_id: ownerId })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("[listing] property insert failed", insertError);
    return failed;
  }

  const uploadedDocs: string[] = [];
  // Assets are moved out of the draft folder below; on failure these are the
  // ids to clean up, wherever they ended up.
  let filed = media.assets;
  try {
    // Everything for this listing now lives under one folder named for the
    // property, with an images / videos / floor-plans sub-folder in it.
    filed = await fileUnderProperty(media.assets, title, ref);

    const rows: {
      property_id: string;
      cloudinary_public_id: string;
      type: "image" | "floor_plan" | "brochure" | "video";
      alt: string;
      sort_order: number;
    }[] = [];

    const ORDER_BASE: Record<string, number> = { image: 0, video: 50, floor_plan: 100 };
    const seen: Record<string, number> = {};

    for (const asset of filed) {
      const n = (seen[asset.kind] = (seen[asset.kind] ?? 0) + 1);
      const noun =
        asset.kind === "image" ? "photo" : asset.kind === "video" ? "video" : "floor plan";
      rows.push({
        property_id: inserted.id,
        cloudinary_public_id: asset.publicId,
        type: asset.kind,
        alt: `${title} — ${noun} ${n}`,
        sort_order: ORDER_BASE[asset.kind] + n - 1,
      });
    }

    for (const file of brochure.files) {
      // Private bucket: the desk releases brochures on a qualified enquiry.
      const path = await upload(supabase, DOCUMENT_BUCKET, inserted.id, file);
      uploadedDocs.push(path);
      rows.push({
        property_id: inserted.id,
        cloudinary_public_id: `${DOCUMENT_BUCKET}/${path}`,
        type: "brochure",
        alt: `${title} — brochure`,
        sort_order: 200,
      });
    }

    const { error: mediaError } = await supabase.from("property_media").insert(rows);
    if (mediaError) throw mediaError;
  } catch (error) {
    console.error("[listing] media filing failed", error);
    // Roll back so a half-submitted listing does not sit in the review queue.
    await destroyAssets(filed);
    if (uploadedDocs.length) await supabase.storage.from(DOCUMENT_BUCKET).remove(uploadedDocs);
    await supabase.from("properties").delete().eq("id", inserted.id);
    return {
      ok: false,
      message: "We couldn't save your files. Please check your connection and try again.",
    };
  }

  // The draft folder is empty now that its files are filed under the property.
  const draftRef = text(data, "draft_ref");
  if (draftRef) await deleteDraftFolder(draftRef);

  const { error: noteError } = await supabase.from("owner_notes").insert({
    owner_id: ownerId,
    author: `Listing submission ${ref}`,
    text: privateNote,
  });
  if (noteError) console.error("[listing] owner note insert failed", noteError);

  revalidatePath("/dashboard");
  revalidatePath("/admin/properties");

  return {
    ok: true,
    message: ownerSession
      ? "Submission received — it's now in your dashboard as Pending review. Our onboarding team will call to verify documents."
      : "Submission received. Our onboarding team will call to verify documents before anything goes live.",
    reference: ref,
  };
}

export async function submitContact(
  _prev: LeadSubmission | null,
  data: FormData,
): Promise<LeadSubmission> {
  const { errors, name, email, phone } = validateContact(data);

  if (text(data, "message").length < 10) {
    errors.message = "Please tell us a little more so we can route this properly.";
  }

  if (Object.keys(errors).length > 0) return invalid(errors);
  if (await rateLimited()) return THROTTLED;

  const ref = reference("MSG");
  const subject = text(data, "subject");
  const message = text(data, "message");

  if (isSupabaseConfigured) {
    const supabase = createAdminClient();

    // Contact messages become requirement-less, property-less leads. The
    // origin CHECK constraint needs one of the two, so they attach to a
    // requirement row carrying the message.
    const { data: req } = await supabase
      .from("requirements")
      .insert({
        ref: `${ref}-R`,
        buyer_name: name,
        buyer_email: email,
        buyer_phone: phone,
        property_type: "office",
        city: "Mumbai",
        purpose: "lease",
        notes: `[${subject || "general"}] ${message}`,
        status: "open",
      })
      .select("id")
      .single();

    const { error } = await supabase.from("leads").insert({
      ref,
      property_id: null,
      requirement_id: req?.id ?? null,
      buyer_name: name,
      buyer_phone: phone,
      buyer_email: email,
      message,
      source: "organic",
      status: "new",
      consent: true,
    });

    if (error) {
      console.error("[lead] contact insert failed", error);
      return {
        ok: false,
        message: "Something went wrong sending your message. Please call the desk.",
      };
    }
  } else {
    console.info("[lead] contact captured (demo mode)", {
      name,
      email,
      phone,
      subject,
      message,
    });
  }

  return {
    ok: true,
    message:
      "Thanks — your message is with our desk. Expect a reply the same working day.",
    reference: ref,
  };
}
