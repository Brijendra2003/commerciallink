"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getPortalSession } from "@/lib/portal";
import type { LeadSubmission } from "@/lib/types";
import type { LeadSourceDb, PropertyTypeDb, PurposeDb } from "@/lib/supabase/types";

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

function reference(prefix: string): string {
  const n = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${new Date().getFullYear()}${n}`;
}

function validateContact(data: FormData) {
  const errors: Record<string, string> = {};
  const name = text(data, "name");
  const email = text(data, "email");
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

export async function submitPropertyListing(
  _prev: LeadSubmission | null,
  data: FormData,
): Promise<LeadSubmission> {
  const { errors, name, email, phone } = validateContact(data);

  if (!text(data, "property_type")) {
    errors.property_type = "Select the property type.";
  }
  if (!text(data, "market")) errors.market = "Select the micro-market.";
  if (!text(data, "area_sqft")) errors.area_sqft = "Enter the built-up area.";
  if (!text(data, "purpose")) {
    errors.purpose = "Tell us whether you want to sell or lease.";
  }

  if (Object.keys(errors).length > 0) return invalid(errors);
  if (await rateLimited()) return THROTTLED;

  const ref = reference("PRP");
  const submission = {
    owner_name: name,
    owner_email: email,
    owner_phone: phone,
    title: text(data, "title"),
    type: text(data, "property_type"),
    purpose: text(data, "purpose"),
    city: "Mumbai",
    market: text(data, "market"),
    locality: text(data, "locality"),
    area_sqft: text(data, "area_sqft"),
    expectation: text(data, "expectation"),
    notes: text(data, "notes"),
  };

  if (isSupabaseConfigured) {
    const supabase = createAdminClient();

    // Upsert the owner first — properties.owner_id is NOT NULL, which is what
    // makes registration a structural prerequisite rather than a UI gate.
    const { data: owner, error: ownerError } = await supabase
      .from("owners")
      .upsert(
        {
          name,
          email,
          phone,
          city: "Mumbai",
          kyc_status: "pending" as const,
        },
        { onConflict: "email" },
      )
      .select("id")
      .single();

    if (ownerError || !owner) {
      console.error("[listing] owner upsert failed", ownerError);
      return {
        ok: false,
        message: "Something went wrong saving your submission. Please call the desk.",
      };
    }

    const { error } = await supabase.from("properties").insert({
      ref,
      slug: `${ref.toLowerCase()}-${submission.market.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      title: submission.title || `${submission.market} — owner submission`,
      type: submission.type as PropertyTypeDb,
      purpose: (submission.purpose === "buy" ? "buy" : "lease") as PurposeDb,
      city: "Mumbai",
      // Zone is assigned by the desk during review; default to the largest.
      zone: "western",
      locality: submission.market,
      address: [submission.locality, submission.market, "Mumbai"]
        .filter(Boolean)
        .join(", "),
      area_sqft: Number(submission.area_sqft.replace(/[^\d]/g, "")) || 1,
      summary: submission.expectation || null,
      description: submission.notes ? [submission.notes] : [],
      status: "pending_review",
      owner_id: owner.id,
    });

    if (error) {
      console.error("[listing] property insert failed", error);
      return {
        ok: false,
        message: "Something went wrong saving your submission. Please call the desk.",
      };
    }
  } else {
    console.info("[listing] owner submission captured (demo mode)", submission);
  }

  return {
    ok: true,
    message:
      "Submission received. Our onboarding team will call to verify documents and schedule photography.",
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
