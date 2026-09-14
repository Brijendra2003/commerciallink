/**
 * Field names here mirror the Supabase schema in the project documentation
 * (Section 6, "Core Data Model"), so swapping the mock reads in lib/data for
 * real `supabase.from(...)` queries is a drop-in change.
 */

/** MMR zone groupings. The portal covers Mumbai only. */
export type Zone =
  | "south"
  | "central"
  | "western"
  | "eastern"
  | "navi"
  | "thane";

export type PropertyType =
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

export type Purpose = "buy" | "lease";

export type PossessionStatus = "ready" | "under_construction" | "shell_core";

export type FurnishingStatus = "bare_shell" | "warm_shell" | "fully_fitted";

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
  type: PropertyType;
  purpose: Purpose;
  /** Always "Mumbai" — kept as a column for schema fidelity. */
  city: string;
  zone: Zone;
  /** The micro-market buyers actually filter on, e.g. "Bandra Kurla Complex". */
  locality: string;
  address: string;
  /** Total ask in INR. `null` renders as "Price on request" — a deliberate soft gate. */
  price: number | null;
  /** Monthly rent per sq.ft. for lease listings. */
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
  /** Supply-side owner reference. Contact fields are never exposed publicly. */
  owner_id: string;
  created_at: string;
  /** Surfaced to the owner dashboard only, never to buyers. */
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
