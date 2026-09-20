/**
 * Database types for the schema in supabase/migrations/0001_schema.sql.
 *
 * Hand-maintained to match. Once your project is live you can replace this file
 * with generated output and the rest of the app keeps compiling:
 *
 *   npx supabase gen types typescript --project-id <ref> > lib/supabase/types.ts
 */

export type PropertyTypeDb =
  | "office" | "retail" | "warehouse" | "industrial" | "land" | "coworking";
export type PropertyStatusDb =
  | "draft" | "pending_review" | "published" | "archived" | "sold" | "leased";
export type PurposeDb = "buy" | "lease";
export type PossessionDb = "ready" | "under_construction" | "shell_core";
export type FurnishingDb = "bare_shell" | "warm_shell" | "fully_fitted";
export type ZoneDb = "south" | "central" | "western" | "eastern" | "navi" | "thane";
export type MediaTypeDb = "image" | "floor_plan" | "brochure" | "video";
export type LeadStatusDb =
  | "new" | "contacted" | "qualified" | "site_visit" | "negotiation" | "won" | "lost";
export type LeadSourceDb =
  | "organic" | "paid_ad" | "referral" | "whatsapp" | "brochure" | "requirement";
export type ActivityTypeDb =
  | "call" | "email" | "whatsapp" | "note" | "status_change" | "site_visit" | "created";
export type RequirementStatusDb = "open" | "matched" | "closed";
export type DealStatusDb = "in_progress" | "won" | "lost";
export type KycStatusDb = "verified" | "pending" | "rejected";
export type AdminRoleDb = "super_admin" | "sales_exec" | "content_editor";

export type PropertyRow = {
  id: string;
  ref: string;
  slug: string;
  title: string;
  type: PropertyTypeDb;
  purpose: PurposeDb;
  city: string;
  zone: ZoneDb;
  locality: string;
  address: string;
  price: number | null;
  rent_psf: number | null;
  area_sqft: number;
  carpet_area_sqft: number | null;
  floor: string | null;
  possession: PossessionDb;
  furnishing: FurnishingDb;
  zoning: string | null;
  status: PropertyStatusDb;
  featured: boolean;
  verified: boolean;
  amenities: string[];
  summary: string | null;
  description: string[];
  meta_title: string | null;
  meta_description: string | null;
  /** Added in 0003_listing_details.sql. */
  building_name: string | null;
  pincode: string | null;
  total_floors: number | null;
  property_age_years: number | null;
  available_from: string | null;
  maintenance_psf: number | null;
  security_deposit_months: number | null;
  lock_in_months: number | null;
  parking_slots: number | null;
  power_load_kva: number | null;
  ceiling_height_ft: number | null;
  owner_id: string;
  created_by: string | null;
  view_count: number;
  enquiry_count: number;
  created_at: string;
  updated_at: string;
}

export type PropertyMediaRow = {
  id: string;
  property_id: string;
  cloudinary_public_id: string;
  type: MediaTypeDb;
  alt: string | null;
  sort_order: number;
  created_at: string;
}

export type OwnerRow = {
  id: string;
  auth_user_id: string | null;
  name: string;
  company: string | null;
  phone: string;
  email: string;
  city: string;
  kyc_status: KycStatusDb;
  verified_at: string | null;
  created_at: string;
}

export type BuyerRow = {
  id: string;
  auth_user_id: string | null;
  name: string;
  company: string | null;
  phone: string;
  email: string;
  created_at: string;
}

export type AdminUserRow = {
  id: string;
  auth_user_id: string | null;
  name: string;
  initials: string;
  email: string;
  role: AdminRoleDb;
  is_active: boolean;
  last_seen: string | null;
  created_at: string;
}

export type LeadRow = {
  id: string;
  ref: string;
  property_id: string | null;
  requirement_id: string | null;
  /** Added in 0002_portal.sql — links an enquiry to a registered buyer. */
  buyer_id: string | null;
  buyer_name: string;
  buyer_company: string | null;
  buyer_phone: string;
  buyer_email: string;
  source: LeadSourceDb;
  status: LeadStatusDb;
  assigned_to: string | null;
  message: string | null;
  preferred_time: string | null;
  value_estimate: number;
  consent: boolean;
  utm_source: string | null;
  utm_campaign: string | null;
  created_at: string;
  last_activity_at: string;
}

export type LeadActivityRow = {
  id: string;
  lead_id: string;
  type: ActivityTypeDb;
  note: string;
  created_by: string | null;
  created_at: string;
}

export type RequirementRow = {
  id: string;
  ref: string;
  /** Set when a signed-in buyer posts the brief. */
  buyer_id: string | null;
  buyer_name: string;
  buyer_company: string | null;
  buyer_phone: string;
  buyer_email: string;
  property_type: PropertyTypeDb;
  city: string;
  locality: string | null;
  budget_label: string | null;
  area_sqft: number | null;
  purpose: PurposeDb;
  timeline: string | null;
  notes: string | null;
  status: RequirementStatusDb;
  matched_property_ids: string[];
  created_at: string;
}

export type DealRow = {
  id: string;
  ref: string;
  lead_id: string | null;
  property_id: string | null;
  owner_id: string | null;
  client: string;
  value: number;
  commission_pct: number;
  status: DealStatusDb;
  assigned_to: string | null;
  payout_settled: boolean;
  closed_at: string | null;
  created_at: string;
}

export type OwnerNoteRow = {
  id: string;
  owner_id: string;
  author: string;
  text: string;
  created_at: string;
}

export type AuditLogRow = {
  id: string;
  actor: string;
  action: string;
  target: string | null;
  created_at: string;
}

/** Added in 0004_market_notes.sql. */
export type MarketNotesSubscriberRow = {
  id: string;
  email: string;
  source: string;
  confirmed: boolean;
  unsubscribed_at: string | null;
  created_at: string;
}

type Table<Row, Insert = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Insert>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      properties: Table<PropertyRow>;
      property_media: Table<PropertyMediaRow>;
      owners: Table<OwnerRow>;
      buyers: Table<BuyerRow>;
      admin_users: Table<AdminUserRow>;
      leads: Table<LeadRow>;
      lead_activities: Table<LeadActivityRow>;
      requirements: Table<RequirementRow>;
      deals: Table<DealRow>;
      owner_notes: Table<OwnerNoteRow>;
      audit_log: Table<AuditLogRow>;
      market_notes_subscribers: Table<MarketNotesSubscriberRow>;
    };
    Views: Record<never, never>;
    Functions: {
      is_admin: { Args: Record<never, never>; Returns: boolean };
      admin_role: { Args: Record<never, never>; Returns: AdminRoleDb };
      can_edit_listings: { Args: Record<never, never>; Returns: boolean };
    };
    Enums: {
      property_type: PropertyTypeDb;
      property_status: PropertyStatusDb;
      purpose: PurposeDb;
      possession: PossessionDb;
      furnishing: FurnishingDb;
      mmr_zone: ZoneDb;
      media_type: MediaTypeDb;
      lead_status: LeadStatusDb;
      lead_source: LeadSourceDb;
      activity_type: ActivityTypeDb;
      requirement_status: RequirementStatusDb;
      deal_status: DealStatusDb;
      kyc_status: KycStatusDb;
      admin_role: AdminRoleDb;
    };
    CompositeTypes: Record<never, never>;
  };
}
