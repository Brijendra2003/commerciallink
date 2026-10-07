"use server";

import { randomInt } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getPortalSession } from "@/lib/portal";
import {
  ACCOUNT_TYPE_LABEL,
  FURNISHING_LABEL,
  POSSESSION_LABEL,
  PROJECT_CATEGORIES,
  PROJECT_CATEGORY_LABEL,
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABEL,
  isLandType,
  purposeLabel,
  reraRequired,
  segmentForType,
  zoneForMarket,
} from "@/lib/data/taxonomy";
import {
  deleteDraftFolder,
  destroyAssets,
  fileUnderProperty,
  verifySubmittedMedia,
} from "@/lib/cloudinary";
import type {
  LeadSubmission,
  ProjectCategory,
  PropertySegment,
} from "@/lib/types";
import type {
  FurnishingDb,
  LeadSourceDb,
  PossessionDb,
  ProjectCategoryDb,
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
      "Enquiry sent. It is with the lister of this project and our team — expect a call back, usually the same working day.",
    reference: ref,
  };
}

export async function submitRequirement(
  _prev: LeadSubmission | null,
  data: FormData,
): Promise<LeadSubmission> {
  const { errors, name, email, phone } = validateContact(data);

  if (!text(data, "property_type")) {
    errors.property_type = "Select the type of property you need.";
  }
  if (!text(data, "market")) errors.market = "Select a preferred station area.";
  if (!text(data, "purpose")) {
    errors.purpose = "Tell us whether you want to buy or lease.";
  }

  if (Object.keys(errors).length > 0) return invalid(errors);
  if (await rateLimited()) return THROTTLED;

  const ref = reference("REQ");
  const market = text(data, "market");
  const extra = text(data, "locality");

  // `requirements` has no segment or BHK column — the brief is free-form by
  // design, and the desk works it by reading it. Both are folded into the
  // notes so nothing the buyer told us is dropped on the floor.
  const bhk = text(data, "bhk");
  const notes = [
    bhk ? `Configuration wanted: ${bhk} BHK or more.` : null,
    text(data, "notes") || null,
  ]
    .filter(Boolean)
    .join("\n");

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
    notes: notes || null,
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
const CATEGORY_VALUES = PROJECT_CATEGORIES.map((c) => c.value);

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Builds the listing title from the facts the lister already gave us.
 *
 * Asking for a title was the single worst field on the old form: it is the
 * part a non-technical owner stalls on, and the part the desk rewrote anyway.
 * "2 BHK Flat in Sunrise Heights, Mira Road East" is what a buyer searches
 * for, and it falls straight out of type + configuration + building + market.
 */
function composeTitle({
  segment,
  type,
  bedrooms,
  building,
  market,
  areaSqft,
}: {
  segment: PropertySegment;
  type: string;
  bedrooms: number | null;
  building: string;
  market: string;
  areaSqft: number;
}): string {
  const short =
    PROPERTY_TYPES.find((t) => t.value === type)?.short ?? "Property";

  let subject: string;
  if (isLandType(type)) {
    subject = `${areaSqft.toLocaleString("en-IN")} sq.ft. ${short}`;
  } else if (segment === "residential" && bedrooms && bedrooms > 0) {
    subject = `${bedrooms} BHK ${short}`;
  } else {
    subject = short;
  }

  const place = building ? `${building}, ${market}` : market;
  return `${subject} in ${place}`.slice(0, 120);
}

/**
 * Project submission.
 *
 * Registration is a hard gate: there is no anonymous path through this action
 * any more. A listing has an accountable owner, broker or developer behind it
 * before it reaches the review queue, which is what makes the verification
 * step in the admin panel mean anything.
 *
 * The form that feeds this is one screen with about a dozen controls. Fields
 * the old six-tab version demanded — title, carpet area, deposit, lock-in,
 * ceiling height, amenities, zoning — are either derived here, collected in
 * the optional "more details" section, or filled in by the desk on review.
 */
export async function submitPropertyListing(
  _prev: LeadSubmission | null,
  data: FormData,
): Promise<LeadSubmission> {
  if (!isSupabaseConfigured) {
    // Demo mode has no accounts, so the gate cannot be enforced; validate and
    // log so the form stays exercisable without credentials.
    return submitPropertyListingDemo(data);
  }

  const session = await getPortalSession();
  const ownerSession = session?.role === "owner" ? session : null;

  if (!ownerSession) {
    return {
      ok: false,
      message: session
        ? "This is a buyer account. Register as an owner, broker or developer to list a project."
        : "Please create an account or sign in before listing a project.",
    };
  }

  // Contact details are not read off the form at all any more: they come from
  // the signed-in profile, which is the whole point of the registration gate.
  const errors: Record<string, string> = {};

  if (data.get("consent") !== "on") {
    errors.consent = "Please confirm you agree to be contacted.";
  }

  /* ---- What it is ---- */
  const segmentRaw = text(data, "segment");
  const segment: PropertySegment =
    segmentRaw === "residential" ? "residential" : "commercial";
  if (segmentRaw !== "residential" && segmentRaw !== "commercial") {
    errors.segment = "Choose residential or commercial.";
  }

  const type = text(data, "property_type");
  if (!PROPERTY_TYPE_VALUES.includes(type)) {
    errors.property_type = "Select the property type.";
  } else if (segmentForType(type) !== segment) {
    // Guards against a stale select left over from a segment switch.
    errors.property_type = "That type does not belong to the selected segment.";
  }

  const category = text(data, "category");
  if (!CATEGORY_VALUES.includes(category as ProjectCategory)) {
    errors.category = "Select the project category.";
  }

  /* ---- RERA: mandatory for an under-construction new project ----
     The same predicate guards the form field, this action and a CHECK
     constraint on the table, so the rule cannot be bypassed by posting the
     form directly. */
  const reraNumber = text(data, "rera_number").toUpperCase();
  if (reraRequired(category)) {
    if (!reraNumber) {
      errors.rera_number =
        "A RERA registration number is required for a new project under construction.";
    } else if (!/^[A-Z0-9/-]{8,30}$/.test(reraNumber)) {
      errors.rera_number =
        "Enter the MahaRERA number as registered, e.g. P99000051284.";
    }
  }

  const purposeRaw = text(data, "purpose");
  if (purposeRaw !== "buy" && purposeRaw !== "lease") {
    errors.purpose =
      segment === "residential"
        ? "Tell us whether you want to sell or rent it out."
        : "Tell us whether you want to sell or lease it.";
  }
  const purpose = purposeRaw as PurposeDb;
  const wantsSale = purposeRaw === "buy";
  const wantsLease = purposeRaw === "lease";

  /* ---- Where it is ---- */
  const market = text(data, "market");
  const zone = zoneForMarket(market);
  if (!zone) {
    errors.market = "Select the location. We cover Mira Road to Dahanu Road.";
  }

  const building = text(data, "building_name");
  if (building.length < 2) {
    errors.building_name = isLandType(type)
      ? "Give the layout or survey reference."
      : "Enter the building or project name.";
  }

  const landmark = text(data, "address");
  const pincode = text(data, "pincode");
  if (pincode && !/^[1-9]\d{5}$/.test(pincode)) {
    errors.pincode = "Enter a 6-digit PIN code.";
  }

  /* ---- Size, configuration and price ---- */
  const area = numberField(
    data,
    "area_sqft",
    { min: 50, max: 50_000_000, label: "built-up area" },
    errors,
  );
  if (area === null && !errors.area_sqft) {
    errors.area_sqft = "Enter the built-up area in sq.ft.";
  }

  const bedrooms = numberField(
    data,
    "bedrooms",
    { max: 50, label: "bedrooms" },
    errors,
  );
  // A flat without a BHK count is unsearchable; a plot has no bedrooms at all.
  if (segment === "residential" && !isLandType(type) && bedrooms === null) {
    if (!errors.bedrooms) errors.bedrooms = "Select the configuration.";
  }

  const price = wantsSale
    ? numberField(data, "price", { min: 10_000, max: 1e13, label: "price" }, errors)
    : null;
  const rentPsf = wantsLease
    ? numberField(
        data,
        "rent_psf",
        { integer: false, min: 1, max: 100_000, label: "rent per sq.ft." },
        errors,
      )
    : null;

  /* ---- Optional detail (the collapsed section of the form) ---- */
  const carpet = numberField(
    data,
    "carpet_area_sqft",
    { min: 1, max: 50_000_000, label: "carpet area" },
    errors,
  );
  if (area && carpet && carpet > area) {
    errors.carpet_area_sqft = "Carpet area cannot exceed built-up area.";
  }

  const bathrooms = numberField(data, "bathrooms", { max: 50, label: "bathrooms" }, errors);
  const balconies = numberField(data, "balconies", { max: 50, label: "balconies" }, errors);
  const floor = text(data, "floor");
  const totalFloors = numberField(data, "total_floors", { min: 1, max: 200, label: "total floors" }, errors);
  const age = numberField(data, "property_age_years", { max: 200, label: "age of the property" }, errors);
  const parking = numberField(data, "parking_slots", { max: 10_000, label: "parking slots" }, errors);
  const maintenance = numberField(data, "maintenance_psf", { integer: false, max: 10_000, label: "maintenance" }, errors);
  const deposit = wantsLease
    ? numberField(data, "security_deposit_months", { max: 120, label: "security deposit" }, errors)
    : null;

  const possessionBy = text(data, "possession_by");
  if (possessionBy && !/^\d{4}-\d{2}-\d{2}$/.test(possessionBy)) {
    errors.possession_by = "Pick a valid date.";
  }
  if (reraRequired(category) && !possessionBy) {
    // Not fatal — the desk can chase it — but a new project with no date is
    // the single most-asked question on an enquiry call.
    errors.possession_by = "Enter the committed possession date.";
  }

  const furnishingRaw = text(data, "furnishing");
  const furnishing: FurnishingDb = FURNISHING_VALUES.includes(furnishingRaw)
    ? (furnishingRaw as FurnishingDb)
    : segment === "residential"
      ? "unfurnished"
      : "bare_shell";

  // Possession follows the category: an under-construction project is not
  // "ready", whatever the form says.
  const possessionRaw = text(data, "possession");
  const possession: PossessionDb = reraRequired(category)
    ? "under_construction"
    : POSSESSION_VALUES.includes(possessionRaw)
      ? (possessionRaw as PossessionDb)
      : "ready";

  const amenities = [
    ...data.getAll("amenities").map(String),
    ...text(data, "amenities_other").split(",").map((a) => a.trim()),
  ]
    .filter(Boolean)
    .filter((a, i, all) => all.indexOf(a) === i)
    .slice(0, 40);

  const zoning = text(data, "zoning");
  const tenancy = text(data, "tenancy_status");
  const documents = data.getAll("documents").map(String);
  const deskNotes = text(data, "notes");

  /* ---- Description: optional ----
     A one-line summary is generated from the facts when it is left blank, so
     an owner who does not want to write copy is not blocked. The desk edits
     the listing before it publishes either way. */
  const description = text(data, "description");

  /* ---- Photographs ----
     Uploaded straight to Cloudinary by the browser; the form carries only
     their identifiers, which are re-read from Cloudinary rather than trusted. */
  const media = await verifySubmittedMedia(text(data, "media"));
  if (media.error) errors.photos = media.error;
  else if (!media.assets.some((a) => a.kind === "image")) {
    errors.photos = "Add at least one photograph.";
  }

  if (Object.keys(errors).length > 0) return invalid(errors);
  if (await rateLimited()) return THROTTLED;

  /* ---- Compose the row ---- */
  const ref = reference("PRP");
  const title = composeTitle({
    segment,
    type,
    bedrooms,
    building,
    market,
    areaSqft: area!,
  });

  const paragraphs = description
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const generatedSummary = [
    title,
    `${area!.toLocaleString("en-IN")} sq.ft.`,
    PROJECT_CATEGORY_LABEL[category as ProjectCategory],
    purposeLabel(purpose, segment).toLowerCase(),
  ].join(" · ");

  const property = {
    ref,
    slug: `${slugify(title) || "listing"}-${ref.slice(-6)}`,
    title,
    segment,
    type: type as PropertyTypeDb,
    category: category as ProjectCategoryDb,
    rera_number: reraNumber || null,
    purpose,
    city: "Mumbai",
    zone: zone!,
    locality: market,
    address: [building, landmark, market, "Maharashtra", pincode]
      .filter(Boolean)
      .join(", "),
    building_name: building,
    pincode: pincode || null,
    price,
    rent_psf: rentPsf,
    area_sqft: area!,
    carpet_area_sqft: carpet,
    bedrooms,
    bathrooms,
    balconies,
    floor: floor || null,
    total_floors: totalFloors,
    property_age_years: age,
    possession_by: possessionBy || null,
    available_from: null,
    maintenance_psf: maintenance,
    security_deposit_months: deposit,
    lock_in_months: null,
    parking_slots: parking,
    power_load_kva: null,
    ceiling_height_ft: null,
    possession,
    furnishing,
    zoning: zoning || null,
    amenities,
    summary: paragraphs[0]?.slice(0, 280) ?? generatedSummary,
    description: paragraphs,
    // Every submission enters the queue. Only the admin review action can
    // move it to `published`.
    status: "pending_review" as const,
    review_status: "pending" as const,
    verified: false,
  };

  // Lister-private context. Kept off `properties` (publicly readable once
  // published) and filed as an admin-only owner note instead.
  const privateNote = [
    `Submitted from the ${ACCOUNT_TYPE_LABEL[ownerSession.accountType ?? "owner"]} dashboard.`,
    tenancy ? `Occupancy: ${tenancy}.` : null,
    documents.length
      ? `Documents ready: ${documents.join(", ")}.`
      : "No documents marked ready.",
    deskNotes ? `Lister notes: ${deskNotes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const supabase = createAdminClient();
  const failed: LeadSubmission = {
    ok: false,
    message:
      "Something went wrong saving your submission. Please try again or call the desk.",
  };

  const { data: inserted, error: insertError } = await supabase
    .from("properties")
    .insert({ ...property, owner_id: ownerSession.profileId })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("[listing] property insert failed", insertError);
    return failed;
  }

  // Assets are moved out of the draft folder below; on failure these are the
  // ids to clean up, wherever they ended up.
  let filed = media.assets;
  try {
    // Everything for this listing now lives under one folder named for the
    // property, with an images / videos / floor-plans sub-folder in it.
    filed = await fileUnderProperty(media.assets, title, ref);

    const ORDER_BASE: Record<string, number> = { image: 0, video: 50, floor_plan: 100 };
    const seen: Record<string, number> = {};
    const rows = filed.map((asset) => {
      const n = (seen[asset.kind] = (seen[asset.kind] ?? 0) + 1);
      const noun =
        asset.kind === "image" ? "photo" : asset.kind === "video" ? "video" : "floor plan";
      return {
        property_id: inserted.id,
        cloudinary_public_id: asset.publicId,
        type: asset.kind,
        alt: `${title} — ${noun} ${n}`,
        sort_order: ORDER_BASE[asset.kind] + n - 1,
      };
    });

    const { error: mediaError } = await supabase.from("property_media").insert(rows);
    if (mediaError) throw mediaError;
  } catch (error) {
    console.error("[listing] media filing failed", error);
    // Roll back so a half-submitted listing does not sit in the review queue.
    await destroyAssets(filed);
    await supabase.from("properties").delete().eq("id", inserted.id);
    return {
      ok: false,
      message:
        "We couldn't save your photographs. Please check your connection and try again.",
    };
  }

  // The draft folder is empty now that its files are filed under the property.
  const draftRef = text(data, "draft_ref");
  if (draftRef) await deleteDraftFolder(draftRef);

  const { error: noteError } = await supabase.from("owner_notes").insert({
    owner_id: ownerSession.profileId,
    author: `Project submission ${ref}`,
    text: privateNote,
  });
  if (noteError) console.error("[listing] owner note insert failed", noteError);

  revalidatePath("/dashboard");
  revalidatePath("/admin/properties");

  return {
    ok: true,
    message:
      "Submitted. It is in your dashboard as Pending verification — our team checks the details and it goes live once approved. Enquiries will appear under Leads.",
    reference: ref,
  };
}

/**
 * The no-credentials path. Keeps the form usable in demo mode by validating
 * the essentials and logging the payload instead of writing a row.
 */
async function submitPropertyListingDemo(
  data: FormData,
): Promise<LeadSubmission> {
  const errors: Record<string, string> = {};
  const category = text(data, "category");
  const market = text(data, "market");

  if (!PROPERTY_TYPE_VALUES.includes(text(data, "property_type"))) {
    errors.property_type = "Select the property type.";
  }
  if (!CATEGORY_VALUES.includes(category as ProjectCategory)) {
    errors.category = "Select the project category.";
  }
  if (reraRequired(category) && !text(data, "rera_number")) {
    errors.rera_number =
      "A RERA registration number is required for a new project under construction.";
  }
  if (!zoneForMarket(market)) errors.market = "Select the location.";
  if (!text(data, "area_sqft")) errors.area_sqft = "Enter the built-up area in sq.ft.";
  if (data.get("consent") !== "on") {
    errors.consent = "Please confirm you agree to be contacted.";
  }

  if (Object.keys(errors).length > 0) return invalid(errors);

  const ref = reference("PRP");
  console.info("[listing] submission captured (demo mode)", {
    ref,
    segment: text(data, "segment"),
    type: text(data, "property_type"),
    category,
    rera: text(data, "rera_number"),
    market,
    building: text(data, "building_name"),
    area: text(data, "area_sqft"),
  });

  return {
    ok: true,
    message:
      "Submitted (demo mode — nothing was saved). Connect Supabase in .env.local to file real submissions.",
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
