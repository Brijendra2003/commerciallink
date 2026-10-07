/**
 * Field names here mirror the Supabase schema in supabase/migrations, so
 * swapping the mock reads in lib/data for real `supabase.from(...)` queries is
 * a drop-in change.
 */

/**
 * Service-area belts along the Western line.
 *
 * The portal covers Mira Road to Dahanu Road only. The six legacy MMR values
 * remain in the database enum (Postgres cannot drop a label historical rows
 * may carry) but are not offered anywhere in the UI.
 */
export type Zone = "mira_bhayandar" | "vasai_virar" | "palghar";

export type PropertySegment = "commercial" | "residential";

/** The buyer-facing category. `new_project` requires a RERA number. */
export type ProjectCategory = "new_project" | "ready_to_move" | "resale";

export type PropertyType =
  // Residential
  | "apartment"
  | "studio"
  | "penthouse"
  | "villa"
  | "row_house"
  | "bungalow"
  | "plot"
  // Commercial
  | "office"
  | "retail"
  | "warehouse"
  | "industrial"
  | "land"
  | "coworking";

export type PropertyStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "archived"
  | "sold"
  | "leased";

/** The outcome of the admin verification pass. */
export type ReviewStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "changes_requested";

export type Purpose = "buy" | "lease";

export type PossessionStatus = "ready" | "under_construction" | "shell_core";

export type FurnishingStatus =
  | "bare_shell"
  | "warm_shell"
  | "fully_fitted"
  | "unfurnished"
  | "semi_furnished"
  | "furnished";

/** Which side of the desk a signed-in supply-side account sits on. */
export type AccountType = "owner" | "broker" | "developer";

export interface PropertyMedia {
  id: string;
  /** Cloudinary public_id in production; a resolvable URL in this build. */
  cloudinary_public_id: string;
  type: "image" | "floor_plan" | "brochure" | "video";
  alt: string;
  sort_order: number;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  segment: PropertySegment;
  type: PropertyType;
  /** New project / ready to move / resale. Drives the RERA requirement. */
  category: ProjectCategory;
  /** MahaRERA registration. Mandatory when `category` is `new_project`. */
  rera_number: string | null;
  purpose: Purpose;
  /** Always "Mumbai" — kept as a column for schema fidelity. */
  city: string;
  zone: Zone;
  /** The station micro-market buyers actually filter on, e.g. "Virar West". */
  locality: string;
  address: string;
  /** Total ask in INR. `null` renders as "Price on request" — a deliberate soft gate. */
  price: number | null;
  /** Monthly rent per sq.ft. for lease and rental listings. */
  rent_psf: number | null;
  area_sqft: number;
  carpet_area_sqft: number;
  floor: string;
  possession: PossessionStatus;
  furnishing: FurnishingStatus;
  zoning: string;
  status: PropertyStatus;
  featured: boolean;
  verified: boolean;
  amenities: string[];
  summary: string;
  description: string[];
  media: PropertyMedia[];
  /** Residential configuration (0006_projects_and_leads.sql). */
  bedrooms?: number | null;
  bathrooms?: number | null;
  balconies?: number | null;
  /** Expected possession date on an under-construction project. */
  possession_by?: string | null;
  /** Admin verification trail. */
  review_status?: ReviewStatus;
  review_note?: string | null;
  reviewed_at?: string | null;
  /** Optional specifications (0003_listing_details.sql). Unset renders nothing. */
  building_name?: string | null;
  pincode?: string | null;
  total_floors?: number | null;
  property_age_years?: number | null;
  available_from?: string | null;
  maintenance_psf?: number | null;
  security_deposit_months?: number | null;
  lock_in_months?: number | null;
  parking_slots?: number | null;
  power_load_kva?: number | null;
  ceiling_height_ft?: number | null;
  meta_title?: string | null;
  meta_description?: string | null;
  /** Supply-side reference — the owner, broker or developer who listed it. */
  owner_id: string;
  created_at: string;
  /** Surfaced to the lister's dashboard only, never to buyers. */
  view_count: number;
  enquiry_count: number;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

export interface LeadSubmission {
  ok: boolean;
  message: string;
  /** Reference shown to the buyer so a follow-up call has a shared handle. */
  reference?: string;
  fieldErrors?: Record<string, string>;
}
