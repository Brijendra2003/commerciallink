/**
 * Admin/CRM entities. Field names mirror the Supabase tables in Section 6 of
 * the brief (`leads`, `lead_activities`, `deals`, `owners`, `requirements`,
 * `admin_users`) so these read like the rows the panel will eventually query.
 */

import type { AccountType } from "@/lib/types";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "site_visit"
  | "negotiation"
  | "won"
  | "lost";

export type LeadSource =
  | "organic"
  | "paid_ad"
  | "referral"
  | "whatsapp"
  | "brochure"
  | "requirement";

export type ActivityType =
  | "call"
  | "email"
  | "whatsapp"
  | "note"
  | "status_change"
  | "site_visit"
  | "created";

export interface LeadActivity {
  id: string;
  lead_id: string;
  type: ActivityType;
  note: string;
  created_by: string;
  created_at: string;
}

export interface Lead {
  id: string;
  /** Null for requirement-sourced leads — the nullable split from Section 6. */
  property_id: string | null;
  requirement_id: string | null;
  buyer_name: string;
  buyer_company: string;
  buyer_phone: string;
  buyer_email: string;
  source: LeadSource;
  status: LeadStatus;
  assigned_to: string;
  message: string;
  /** Advisor's read on deal size, in INR. Drives pipeline value. */
  value_estimate: number;
  created_at: string;
  last_activity_at: string;
  activities: LeadActivity[];
}

export type RequirementStatus = "open" | "matched" | "closed";

export interface Requirement {
  id: string;
  buyer_name: string;
  buyer_company: string;
  buyer_phone: string;
  buyer_email: string;
  property_type: string;
  city: string;
  locality: string;
  budget_label: string;
  area_sqft: number;
  purpose: "buy" | "lease";
  timeline: string;
  notes: string;
  status: RequirementStatus;
  created_at: string;
  /** Property ids the desk has shortlisted against this brief. */
  matched_property_ids: string[];
}

export type DealStatus = "in_progress" | "won" | "lost";

export interface Deal {
  id: string;
  lead_id: string;
  property_id: string;
  property_title: string;
  client: string;
  value: number;
  commission_pct: number;
  status: DealStatus;
  closed_at: string | null;
  owner_id: string;
  assigned_to: string;
  payout_settled: boolean;
}

export type KycStatus = "verified" | "pending" | "rejected";

export interface OwnerContact {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  city: string;
  /** Owner / broker / developer (0006_projects_and_leads.sql). */
  account_type: AccountType;
  /** The lister's own MahaRERA agent or promoter registration, if any. */
  rera_number: string | null;
  kyc_status: KycStatus;
  verified_at: string | null;
  property_ids: string[];
  notes: { date: string; author: string; text: string }[];
}

export type AdminRole = "super_admin" | "sales_exec" | "content_editor";

export interface AdminUser {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  last_seen: string;
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  created_at: string;
}
