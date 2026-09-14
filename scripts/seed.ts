/**
 * Seeds a fresh Supabase project from the same typed mock data the app falls
 * back to, so the demo and the live database never drift.
 *
 *   npm run db:seed
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in
 * .env.local, and 0001_schema.sql already applied.
 *
 * Idempotent: every insert is an upsert keyed on a natural unique column, and
 * staff auth users are created only if missing.
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/supabase/types";
import { properties } from "../lib/data/properties";
import {
  admins,
  auditLog,
  deals,
  leads,
  owners,
  requirements,
} from "../lib/data/crm";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const seedPassword = process.env.SEED_ADMIN_PASSWORD;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

if (!seedPassword || seedPassword.length < 12) {
  console.error(
    "Set SEED_ADMIN_PASSWORD in .env.local to at least 12 characters.\n" +
      "It becomes the initial password for every seeded staff account —\n" +
      "change it from the Supabase dashboard once you are in.",
  );
  process.exit(1);
}

const db = createClient<Database>(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function fail(step: string, error: unknown): never {
  console.error(`✗ ${step}`);
  console.error(error);
  process.exit(1);
}

async function main() {
  console.log(`Seeding ${url}\n`);

  /* ---- staff: auth users + admin_users ---------------------------- */
  const { data: existing } = await db.auth.admin.listUsers({ perPage: 1000 });
  const byEmail = new Map(
    (existing?.users ?? []).map((u) => [u.email?.toLowerCase(), u.id]),
  );

  const adminIdByMockId = new Map<string, string>();

  for (const staff of admins) {
    let authId = byEmail.get(staff.email.toLowerCase());

    if (!authId) {
      const { data, error } = await db.auth.admin.createUser({
        email: staff.email,
        password: seedPassword,
        email_confirm: true,
        user_metadata: { name: staff.name },
      });
      if (error) fail(`create auth user ${staff.email}`, error);
      authId = data.user.id;
    }

    const { data: row, error } = await db
      .from("admin_users")
      .upsert(
        {
          auth_user_id: authId,
          name: staff.name,
          initials: staff.initials,
          email: staff.email,
          role: staff.role,
          is_active: staff.is_active,
          last_seen: new Date(staff.last_seen).toISOString(),
        },
        { onConflict: "email" },
      )
      .select("id")
      .single();

    if (error || !row) fail(`upsert admin_users ${staff.email}`, error);
    adminIdByMockId.set(staff.id, row.id);
  }
  console.log(`✓ ${admins.length} staff accounts`);

  /**
   * Gives an email a login, reusing the auth user if it already exists.
   * Returns the auth user id.
   */
  async function ensureAuthUser(email: string, name: string): Promise<string> {
    const found = byEmail.get(email.toLowerCase());
    if (found) return found;

    const { data, error } = await db.auth.admin.createUser({
      email,
      password: seedPassword,
      email_confirm: true,
      user_metadata: { name },
    });
    if (error) fail(`create auth user ${email}`, error);
    byEmail.set(email.toLowerCase(), data.user.id);
    return data.user.id;
  }

  /* ---- owners ------------------------------------------------------ */
  const ownerIdByMockId = new Map<string, string>();

  // The first two owners get a working portal login so /dashboard can be
  // exercised straight after seeding. The rest are desk-managed records.
  const OWNER_LOGINS = new Set(owners.slice(0, 2).map((o) => o.email));

  for (const owner of owners) {
    const authId = OWNER_LOGINS.has(owner.email)
      ? await ensureAuthUser(owner.email, owner.name)
      : null;

    const { data: row, error } = await db
      .from("owners")
      .upsert(
        {
          auth_user_id: authId,
          name: owner.name,
          company: owner.company,
          phone: owner.phone,
          email: owner.email,
          city: owner.city,
          kyc_status: owner.kyc_status,
          verified_at: owner.verified_at
            ? new Date(owner.verified_at).toISOString()
            : null,
        },
        { onConflict: "email" },
      )
      .select("id")
      .single();

    if (error || !row) fail(`upsert owner ${owner.email}`, error);
    ownerIdByMockId.set(owner.id, row.id);

    await db.from("owner_notes").delete().eq("owner_id", row.id);
    if (owner.notes.length > 0) {
      const { error: noteError } = await db.from("owner_notes").insert(
        owner.notes.map((n) => ({
          owner_id: row.id,
          author: n.author,
          text: n.text,
          created_at: new Date(n.date).toISOString(),
        })),
      );
      if (noteError) fail(`insert owner notes ${owner.email}`, noteError);
    }
  }
  console.log(`✓ ${owners.length} owners`);

  /* ---- a demo buyer, so the buyer dashboard has something in it ----- */
  const demoBuyer = {
    name: "Rohan Mehta",
    email: "rohan@arclighttech.example.com",
    phone: "+91 98200 41001",
    company: "Arclight Technologies",
  };

  const buyerAuthId = await ensureAuthUser(demoBuyer.email, demoBuyer.name);
  const { data: buyerRow, error: buyerError } = await db
    .from("buyers")
    .upsert({ auth_user_id: buyerAuthId, ...demoBuyer }, { onConflict: "email" })
    .select("id")
    .single();

  if (buyerError || !buyerRow) fail("upsert demo buyer", buyerError);
  console.log("✓ 1 demo buyer account");

  /* ---- properties + media ------------------------------------------ */
  const propertyIdByRef = new Map<string, string>();

  for (const p of properties) {
    const ownerId = ownerIdByMockId.get(p.owner_id);
    if (!ownerId) fail(`property ${p.id} references unknown owner ${p.owner_id}`, null);

    const { data: row, error } = await db
      .from("properties")
      .upsert(
        {
          ref: p.id,
          slug: p.slug,
          title: p.title,
          type: p.type,
          purpose: p.purpose,
          city: p.city,
          zone: p.zone,
          locality: p.locality,
          address: p.address,
          price: p.price,
          rent_psf: p.rent_psf,
          area_sqft: p.area_sqft,
          carpet_area_sqft: p.carpet_area_sqft,
          floor: p.floor,
          possession: p.possession,
          furnishing: p.furnishing,
          zoning: p.zoning,
          status: p.status,
          featured: p.featured,
          verified: p.verified,
          amenities: p.amenities,
          summary: p.summary,
          description: p.description,
          meta_title: `${p.title}, Mumbai`,
          meta_description: p.summary,
          owner_id: ownerId,
          view_count: p.view_count,
          // Reset to zero: the leads inserted below trip the counter trigger.
          enquiry_count: 0,
          created_at: new Date(p.created_at).toISOString(),
        },
        { onConflict: "ref" },
      )
      .select("id")
      .single();

    if (error || !row) fail(`upsert property ${p.id}`, error);
    propertyIdByRef.set(p.id, row.id);

    await db.from("property_media").delete().eq("property_id", row.id);
    const { error: mediaError } = await db.from("property_media").insert(
      p.media.map((m) => ({
        property_id: row.id,
        cloudinary_public_id: m.cloudinary_public_id,
        type: m.type,
        alt: m.alt,
        sort_order: m.sort_order,
      })),
    );
    if (mediaError) fail(`insert media for ${p.id}`, mediaError);
  }
  console.log(`✓ ${properties.length} properties and their media`);

  /* ---- requirements ------------------------------------------------ */
  const requirementIdByRef = new Map<string, string>();

  for (const r of requirements) {
    const { data: row, error } = await db
      .from("requirements")
      .upsert(
        {
          ref: r.id,
          buyer_name: r.buyer_name,
          buyer_company: r.buyer_company,
          buyer_phone: r.buyer_phone,
          buyer_email: r.buyer_email,
          property_type: r.property_type as Database["public"]["Enums"]["property_type"],
          city: r.city,
          locality: r.locality,
          budget_label: r.budget_label,
          area_sqft: r.area_sqft,
          purpose: r.purpose,
          timeline: r.timeline,
          notes: r.notes,
          status: r.status,
          buyer_id: r.buyer_company === demoBuyer.company ? buyerRow.id : null,
          matched_property_ids: r.matched_property_ids
            .map((ref) => propertyIdByRef.get(ref))
            .filter((id): id is string => Boolean(id)),
          created_at: new Date(r.created_at).toISOString(),
        },
        { onConflict: "ref" },
      )
      .select("id")
      .single();

    if (error || !row) fail(`upsert requirement ${r.id}`, error);
    requirementIdByRef.set(r.id, row.id);
  }
  console.log(`✓ ${requirements.length} requirements`);

  /* ---- leads + activities ------------------------------------------ */
  const leadIdByRef = new Map<string, string>();

  for (const l of leads) {
    const { data: row, error } = await db
      .from("leads")
      .upsert(
        {
          ref: l.id,
          property_id: l.property_id ? propertyIdByRef.get(l.property_id) : null,
          requirement_id: l.requirement_id
            ? requirementIdByRef.get(l.requirement_id)
            : null,
          buyer_name: l.buyer_name,
          buyer_company: l.buyer_company,
          buyer_phone: l.buyer_phone,
          buyer_email: l.buyer_email,
          source: l.source,
          status: l.status,
          assigned_to: adminIdByMockId.get(l.assigned_to) ?? null,
          // Attach the demo buyer's own leads so their dashboard is populated.
          buyer_id: l.buyer_company === demoBuyer.company ? buyerRow.id : null,
          message: l.message,
          value_estimate: l.value_estimate,
          consent: true,
          created_at: new Date(l.created_at).toISOString(),
          last_activity_at: new Date(l.last_activity_at).toISOString(),
        },
        { onConflict: "ref" },
      )
      .select("id")
      .single();

    if (error || !row) fail(`upsert lead ${l.id}`, error);
    leadIdByRef.set(l.id, row.id);

    await db.from("lead_activities").delete().eq("lead_id", row.id);
    const { error: actError } = await db.from("lead_activities").insert(
      l.activities.map((a) => ({
        lead_id: row.id,
        type: a.type,
        note: a.note,
        created_by: adminIdByMockId.get(a.created_by) ?? null,
        created_at: new Date(a.created_at).toISOString(),
      })),
    );
    if (actError) fail(`insert activities for ${l.id}`, actError);
  }
  console.log(`✓ ${leads.length} leads and their activity trails`);

  /* ---- deals -------------------------------------------------------- */
  for (const d of deals) {
    const { error } = await db.from("deals").upsert(
      {
        ref: d.id,
        lead_id: leadIdByRef.get(d.lead_id) ?? null,
        property_id: propertyIdByRef.get(d.property_id) ?? null,
        owner_id: ownerIdByMockId.get(d.owner_id) ?? null,
        client: d.client,
        value: d.value,
        commission_pct: d.commission_pct,
        status: d.status,
        assigned_to: adminIdByMockId.get(d.assigned_to) ?? null,
        payout_settled: d.payout_settled,
        closed_at: d.closed_at,
      },
      { onConflict: "ref" },
    );
    if (error) fail(`upsert deal ${d.id}`, error);
  }
  console.log(`✓ ${deals.length} deals`);

  /* ---- audit log ---------------------------------------------------- */
  await db.from("audit_log").delete().neq("actor", "");
  const { error: auditError } = await db.from("audit_log").insert(
    auditLog.map((e) => ({
      actor: e.actor,
      action: e.action,
      target: e.target,
      created_at: new Date(e.created_at.replace(" ", "T")).toISOString(),
    })),
  );
  if (auditError) fail("insert audit log", auditError);
  console.log(`✓ ${auditLog.length} audit entries`);

  /* ---- recompute enquiry counts ------------------------------------- */
  // The trigger counts inserts; re-align with the curated numbers so the
  // analytics page reads sensibly on a fresh seed.
  for (const p of properties) {
    const id = propertyIdByRef.get(p.id);
    if (!id) continue;
    await db
      .from("properties")
      .update({ enquiry_count: p.enquiry_count })
      .eq("id", id);
  }

  console.log("\nDone. Every account below uses SEED_ADMIN_PASSWORD.\n");
  console.log("  Staff    /admin/login   " + admins[0].email);
  console.log("  Owner    /login         " + owners[0].email);
  console.log("  Buyer    /login         " + demoBuyer.email);
  console.log("\nRotate these passwords from the Supabase dashboard before going live.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
