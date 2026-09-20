import "server-only";

import { createClient as createAnonClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabase/env";
import type {
  Database,
  AdminUserRow,
  DealRow,
  LeadActivityRow,
  LeadRow,
  OwnerNoteRow,
  OwnerRow,
  RequirementRow,
} from "@/lib/supabase/types";
import type { Property } from "@/lib/types";
import {
  PROPERTY_SELECT,
  toProperty,
  type PropertyWithMedia,
} from "@/lib/data/mappers";
import type {
  AdminUser,
  Deal,
  Lead,
  OwnerContact,
  Requirement,
} from "@/lib/admin-types";

import * as mockProperties from "@/lib/data/properties";
import {
  admins as mockAdmins,
  deals as mockDeals,
  leads as mockLeads,
  owners as mockOwners,
  requirements as mockRequirements,
  auditLog as mockAuditLog,
} from "@/lib/data/crm";

/**
 * The single data-access boundary. Every page reads through these functions,
 * so the app runs against Supabase when credentials exist and against the
 * typed mock data when they do not — with identical shapes either way.
 */

/* ------------------------------------------------------------------ *
 * Public property reads
 *
 * Published listings are anon-readable under RLS, so these use a cookie-less
 * client. That keeps public pages cacheable and lets generateStaticParams
 * (which runs with no request) prerender listing pages.
 * ------------------------------------------------------------------ */

function publicClient() {
  return createAnonClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getPublishedProperties(): Promise<Property[]> {
  if (!isSupabaseConfigured) return mockProperties.getPublishedProperties();

  const supabase = publicClient();
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as unknown as PropertyWithMedia[]).map(toProperty);
}

/** Slugs for build-time prerendering. */

export async function getPublishedSlugs(): Promise<string[]> {
  if (!isSupabaseConfigured) {
    return mockProperties.getPublishedProperties().map((p) => p.slug);
  }

  const supabase = publicClient();
  const { data, error } = await supabase
    .from("properties")
    .select("slug")
    .eq("status", "published");

  if (error) throw error;
  return (data ?? []).map((p) => p.slug);
}

export async function getFeaturedProperties(limit = 6): Promise<Property[]> {
  if (!isSupabaseConfigured) return mockProperties.getFeaturedProperties(limit);

  const supabase = publicClient();
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("status", "published")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as unknown as PropertyWithMedia[]).map(toProperty);
}

export async function getPropertyBySlug(
  slug: string,
): Promise<Property | undefined> {
  if (!isSupabaseConfigured) return mockProperties.getPropertyBySlug(slug);

  const supabase = publicClient();
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  return data ? toProperty(data as unknown as PropertyWithMedia) : undefined;
}

export async function getSimilarProperties(
  property: Property,
  limit = 3,
): Promise<Property[]> {
  if (!isSupabaseConfigured) {
    return mockProperties.getSimilarProperties(property, limit);
  }

  const supabase = publicClient();
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("status", "published")
    .neq("ref", property.id)
    .or(`type.eq.${property.type},zone.eq.${property.zone}`)
    .limit(12);

  if (error) throw error;

  // Rank in application code — the scoring is cheap and keeps the SQL simple.
  return (data as unknown as PropertyWithMedia[])
    .map(toProperty)
    .map((p) => ({
      p,
      score:
        (p.type === property.type ? 3 : 0) +
        (p.locality === property.locality ? 2 : 0) +
        (p.zone === property.zone ? 1 : 0) +
        (p.purpose === property.purpose ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.p);
}

/**
 * Filtering runs in application code against the published set. At this
 * catalogue size that is one indexed query plus an in-memory pass; if the book
 * grows past a few thousand listings, push the predicates into the query and
 * paginate.
 */
export async function filterProperties(
  filters: mockProperties.PropertyFilters,
): Promise<Property[]> {
  if (!isSupabaseConfigured) return mockProperties.filterProperties(filters);
  const all = await getPublishedProperties();
  return mockProperties.applyFilters(all, filters);
}

/* ------------------------------------------------------------------ *
 * Admin reads
 * ------------------------------------------------------------------ */

export async function getAllProperties(): Promise<Property[]> {
  if (!isSupabaseConfigured) return mockProperties.properties;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as unknown as PropertyWithMedia[]).map(toProperty);
}

export async function getPropertyByRef(
  ref: string,
): Promise<Property | undefined> {
  if (!isSupabaseConfigured) {
    return mockProperties.properties.find((p) => p.id === ref);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("ref", ref)
    .maybeSingle();

  if (error) throw error;
  return data ? toProperty(data as unknown as PropertyWithMedia) : undefined;
}

type LeadWithActivities = LeadRow & {
  lead_activities: LeadActivityRow[] | null;
  properties: { ref: string } | null;
  requirements: { ref: string } | null;
};

export async function getLeads(): Promise<Lead[]> {
  if (!isSupabaseConfigured) return mockLeads;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*, lead_activities(*), properties(ref), requirements(ref)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const staff = await getAdmins();
  const byId = new Map(staff.map((a) => [a.id, a.id]));

  return (data as unknown as LeadWithActivities[]).map((row) => ({
    id: row.ref,
    property_id: row.properties?.ref ?? null,
    requirement_id: row.requirements?.ref ?? null,
    buyer_name: row.buyer_name,
    buyer_company: row.buyer_company ?? "",
    buyer_phone: row.buyer_phone,
    buyer_email: row.buyer_email,
    source: row.source,
    status: row.status,
    assigned_to: row.assigned_to && byId.has(row.assigned_to) ? row.assigned_to : "",
    message: row.message ?? "",
    value_estimate: row.value_estimate,
    created_at: row.created_at.slice(0, 10),
    last_activity_at: row.last_activity_at.slice(0, 10),
    activities: (row.lead_activities ?? [])
      .slice()
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((a) => ({
        id: a.id,
        lead_id: row.ref,
        type: a.type,
        note: a.note,
        created_by: a.created_by ?? "system",
        created_at: a.created_at.slice(0, 10),
      })),
  }));
}

export async function getRequirements(): Promise<Requirement[]> {
  if (!isSupabaseConfigured) return mockRequirements;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("requirements")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data as RequirementRow[]).map((r) => ({
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
  }));
}

export async function getDeals(): Promise<Deal[]> {
  if (!isSupabaseConfigured) return mockDeals;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deals")
    .select("*, properties(ref, title), leads(ref), owners(id)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  type Row = DealRow & {
    properties: { ref: string; title: string } | null;
    leads: { ref: string } | null;
  };

  return (data as unknown as Row[]).map((d) => ({
    id: d.ref,
    lead_id: d.leads?.ref ?? "",
    property_id: d.properties?.ref ?? "",
    property_title: d.properties?.title ?? "—",
    client: d.client,
    value: d.value,
    commission_pct: d.commission_pct,
    status: d.status,
    closed_at: d.closed_at,
    owner_id: d.owner_id ?? "",
    assigned_to: d.assigned_to ?? "",
    payout_settled: d.payout_settled,
  }));
}

export async function getOwners(): Promise<OwnerContact[]> {
  if (!isSupabaseConfigured) return mockOwners;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("owners")
    .select("*, owner_notes(*), properties(ref)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  type Row = OwnerRow & {
    owner_notes: OwnerNoteRow[] | null;
    properties: { ref: string }[] | null;
  };

  return (data as unknown as Row[]).map((o) => ({
    id: o.id,
    name: o.name,
    company: o.company ?? "",
    phone: o.phone,
    email: o.email,
    city: o.city,
    kyc_status: o.kyc_status,
    verified_at: o.verified_at ? o.verified_at.slice(0, 10) : null,
    property_ids: (o.properties ?? []).map((p) => p.ref),
    notes: (o.owner_notes ?? [])
      .slice()
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((n) => ({
        date: n.created_at.slice(0, 10),
        author: n.author,
        text: n.text,
      })),
  }));
}

export async function getAdmins(): Promise<AdminUser[]> {
  if (!isSupabaseConfigured) return mockAdmins;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data as AdminUserRow[]).map((a) => ({
    id: a.id,
    name: a.name,
    initials: a.initials,
    email: a.email,
    role: a.role,
    is_active: a.is_active,
    last_seen: a.last_seen ?? a.created_at,
  }));
}

export async function getAuditLog() {
  if (!isSupabaseConfigured) return mockAuditLog;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;

  return data.map((e) => ({
    id: e.id,
    actor: e.actor,
    action: e.action,
    target: e.target ?? "",
    created_at: e.created_at.slice(0, 16).replace("T", " "),
  }));
}
