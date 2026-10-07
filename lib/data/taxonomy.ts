import type {
  FurnishingStatus,
  PossessionStatus,
  ProjectCategory,
  PropertySegment,
  PropertyType,
  Purpose,
  Zone,
} from "@/lib/types";

/**
 * CommercialLink serves one corridor: the Western line from Mira Road to
 * Dahanu Road. `city` stays on the schema (it is a column in `properties`)
 * but is no longer a useful facet — the thing buyers search on is the
 * station micro-market, grouped into the three belts below.
 */
export const CITY = "Mumbai";

/** Shown wherever the service area needs naming in prose. */
export const REGION = "Mira Road to Dahanu Road";
export const REGION_LONG =
  "the Western line corridor from Mira Road to Dahanu Road";

/* ------------------------------------------------------------------ *
 * Segments
 * ------------------------------------------------------------------ */

export const SEGMENTS: {
  value: PropertySegment;
  label: string;
  short: string;
  blurb: string;
}[] = [
  {
    value: "residential",
    label: "Residential",
    short: "Homes",
    blurb:
      "Flats, villas, row houses and plots — new launches, ready possession and resale.",
  },
  {
    value: "commercial",
    label: "Commercial",
    short: "Commercial",
    blurb:
      "Shops, offices, godowns and industrial units along the corridor and the Tarapur belt.",
  },
];

export const SEGMENT_LABEL: Record<PropertySegment, string> = {
  residential: "Residential",
  commercial: "Commercial",
};

/* ------------------------------------------------------------------ *
 * Project category — the field that gates the RERA number
 * ------------------------------------------------------------------ */

export const PROJECT_CATEGORIES: {
  value: ProjectCategory;
  label: string;
  blurb: string;
  /** A RERA registration number is mandatory for this category. */
  reraRequired: boolean;
}[] = [
  {
    value: "new_project",
    label: "New project (under construction)",
    blurb: "Launched or under construction, possession still ahead.",
    reraRequired: true,
  },
  {
    value: "ready_to_move",
    label: "Ready to move in",
    blurb: "Completed, OC received, available to occupy now.",
    reraRequired: false,
  },
  {
    value: "resale",
    label: "Resale / owner property",
    blurb: "A previously sold unit being resold, or an owner's own property.",
    reraRequired: false,
  },
];

export const PROJECT_CATEGORY_LABEL: Record<ProjectCategory, string> =
  Object.fromEntries(
    PROJECT_CATEGORIES.map((c) => [c.value, c.label]),
  ) as Record<ProjectCategory, string>;

/** Single source of truth for the conditional RERA rule, used by the form
 *  (to show the field) and the server action (to require it). */
export function reraRequired(category: string): boolean {
  return category === "new_project";
}

/* ------------------------------------------------------------------ *
 * Geography
 * ------------------------------------------------------------------ */

export const ZONES: { value: Zone; label: string; blurb: string }[] = [
  {
    value: "mira_bhayandar",
    label: "Mira Road & Bhayandar",
    blurb:
      "Mira Road, Kashimira, Bhayandar and Uttan — the corridor's dense, best-connected end.",
  },
  {
    value: "vasai_virar",
    label: "Vasai & Virar",
    blurb:
      "Naigaon, Vasai, Nalasopara and Virar — the volume market for new launches.",
  },
  {
    value: "palghar",
    label: "Palghar & Dahanu",
    blurb:
      "Saphale, Kelve Road, Palghar, Boisar, Tarapur MIDC and Dahanu Road — land, industry and value.",
  },
];

export const ZONE_LABEL: Record<Zone, string> = Object.fromEntries(
  ZONES.map((z) => [z.value, z.label]),
) as Record<Zone, string>;

/**
 * The searchable micro-markets, ordered south to north — the way the line
 * itself runs, so the dropdown reads like a journey from Mira Road out to
 * Dahanu Road rather than like an alphabetical list.
 */
export const MICRO_MARKETS: { name: string; zone: Zone }[] = [
  /* ---- Mira Road & Bhayandar --------------------------------------- */
  { name: "Mira Road East", zone: "mira_bhayandar" },
  { name: "Mira Road West", zone: "mira_bhayandar" },
  { name: "Kashimira", zone: "mira_bhayandar" },
  { name: "Shanti Park", zone: "mira_bhayandar" },
  { name: "Beverly Park", zone: "mira_bhayandar" },
  { name: "Silver Park", zone: "mira_bhayandar" },
  { name: "Sheetal Nagar", zone: "mira_bhayandar" },
  { name: "Bhayandar East", zone: "mira_bhayandar" },
  { name: "Bhayandar West", zone: "mira_bhayandar" },
  { name: "Navghar", zone: "mira_bhayandar" },
  { name: "Uttan", zone: "mira_bhayandar" },
  { name: "Dongri", zone: "mira_bhayandar" },

  /* ---- Vasai & Virar ----------------------------------------------- */
  { name: "Naigaon East", zone: "vasai_virar" },
  { name: "Naigaon West", zone: "vasai_virar" },
  { name: "Juchandra", zone: "vasai_virar" },
  { name: "Vasai Road East", zone: "vasai_virar" },
  { name: "Vasai Road West", zone: "vasai_virar" },
  { name: "Vasai Gaon", zone: "vasai_virar" },
  { name: "Papdy", zone: "vasai_virar" },
  { name: "Nalasopara East", zone: "vasai_virar" },
  { name: "Nalasopara West", zone: "vasai_virar" },
  { name: "Achole", zone: "vasai_virar" },
  { name: "Virar East", zone: "vasai_virar" },
  { name: "Virar West", zone: "vasai_virar" },
  { name: "Bolinj", zone: "vasai_virar" },
  { name: "Agashi", zone: "vasai_virar" },
  { name: "Arnala", zone: "vasai_virar" },

  /* ---- Palghar & Dahanu -------------------------------------------- */
  { name: "Vaitarna", zone: "palghar" },
  { name: "Saphale", zone: "palghar" },
  { name: "Kelve Road", zone: "palghar" },
  { name: "Palghar East", zone: "palghar" },
  { name: "Palghar West", zone: "palghar" },
  { name: "Umroli", zone: "palghar" },
  { name: "Boisar East", zone: "palghar" },
  { name: "Boisar West", zone: "palghar" },
  { name: "Tarapur MIDC", zone: "palghar" },
  { name: "Vangaon", zone: "palghar" },
  { name: "Chinchani", zone: "palghar" },
  { name: "Dahanu Road", zone: "palghar" },
];

export const MICRO_MARKET_NAMES = MICRO_MARKETS.map((m) => m.name);

export function marketsInZone(zone: Zone): string[] {
  return MICRO_MARKETS.filter((m) => m.zone === zone).map((m) => m.name);
}

export function zoneForMarket(market: string): Zone | null {
  return MICRO_MARKETS.find((m) => m.name === market)?.zone ?? null;
}

/* ------------------------------------------------------------------ *
 * Asset classes
 * ------------------------------------------------------------------ */

export const PROPERTY_TYPES: {
  value: PropertyType;
  segment: PropertySegment;
  label: string;
  short: string;
  blurb: string;
}[] = [
  /* ---- Residential -------------------------------------------------- */
  {
    value: "apartment",
    segment: "residential",
    label: "Flat / Apartment",
    short: "Flat",
    blurb:
      "1 BHK to 4 BHK in towers and walk-ups, from Mira Road through to Palghar.",
  },
  {
    value: "studio",
    segment: "residential",
    label: "Studio apartment",
    short: "Studio",
    blurb: "Compact single-room homes, popular with first-time buyers and tenants.",
  },
  {
    value: "penthouse",
    segment: "residential",
    label: "Penthouse",
    short: "Penthouse",
    blurb: "Top-floor homes with private terraces in the corridor's newer towers.",
  },
  {
    value: "villa",
    segment: "residential",
    label: "Villa",
    short: "Villa",
    blurb: "Gated independent homes around Vasai, Virar and the Kelve belt.",
  },
  {
    value: "row_house",
    segment: "residential",
    label: "Row house",
    short: "Row house",
    blurb: "Ground-plus-one terraced homes in planned townships.",
  },
  {
    value: "bungalow",
    segment: "residential",
    label: "Bungalow",
    short: "Bungalow",
    blurb: "Standalone houses on their own plot, including sea-facing stock near Dahanu.",
  },
  {
    value: "plot",
    segment: "residential",
    label: "Residential plot / NA land",
    short: "Plot",
    blurb: "Clear-title NA plots with confirmed layout approval and access road.",
  },

  /* ---- Commercial --------------------------------------------------- */
  {
    value: "office",
    segment: "commercial",
    label: "Office space",
    short: "Office",
    blurb: "Business-park floors and standalone suites along the station belts.",
  },
  {
    value: "retail",
    segment: "commercial",
    label: "Shop & retail",
    short: "Shop",
    blurb: "Station-road frontage, high-street shops and mall units with proven footfall.",
  },
  {
    value: "warehouse",
    segment: "commercial",
    label: "Warehouse / godown",
    short: "Warehouse",
    blurb: "Godowns and logistics sheds around Vasai, Virar, Boisar and the highway.",
  },
  {
    value: "industrial",
    segment: "commercial",
    label: "Industrial unit",
    short: "Industrial",
    blurb: "Tarapur MIDC and Vasai industrial estate sheds with power load and consent.",
  },
  {
    value: "land",
    segment: "commercial",
    label: "Commercial land",
    short: "Land",
    blurb: "Parcels with confirmed zoning, FSI and approach road width.",
  },
  {
    value: "coworking",
    segment: "commercial",
    label: "Co-working",
    short: "Co-working",
    blurb: "Managed desks and cabins on flexible 11-month terms.",
  },
];

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> =
  Object.fromEntries(
    PROPERTY_TYPES.map((t) => [t.value, t.label]),
  ) as Record<PropertyType, string>;

export function typesInSegment(segment: PropertySegment) {
  return PROPERTY_TYPES.filter((t) => t.segment === segment);
}

export function segmentForType(type: string): PropertySegment {
  return (
    PROPERTY_TYPES.find((t) => t.value === type)?.segment ?? "commercial"
  );
}

/** Residential plots and commercial land have no rooms and no fit-out. */
export function isLandType(type: string): boolean {
  return type === "plot" || type === "land";
}

/* ------------------------------------------------------------------ *
 * Labels
 * ------------------------------------------------------------------ */

export const PURPOSE_LABEL: Record<Purpose, string> = {
  buy: "For Sale",
  lease: "For Lease",
};

/** Residential stock is sold and rented, not "leased". */
export const PURPOSE_LABEL_RESIDENTIAL: Record<Purpose, string> = {
  buy: "For Sale",
  lease: "For Rent",
};

export function purposeLabel(
  purpose: Purpose,
  segment: PropertySegment = "commercial",
): string {
  return segment === "residential"
    ? PURPOSE_LABEL_RESIDENTIAL[purpose]
    : PURPOSE_LABEL[purpose];
}

export const POSSESSION_LABEL: Record<PossessionStatus, string> = {
  ready: "Ready to move",
  under_construction: "Under construction",
  shell_core: "Shell & core",
};

export const FURNISHING_LABEL: Record<FurnishingStatus, string> = {
  bare_shell: "Bare shell",
  warm_shell: "Warm shell",
  fully_fitted: "Fully fitted",
  unfurnished: "Unfurnished",
  semi_furnished: "Semi-furnished",
  furnished: "Fully furnished",
};

/** The handover options worth offering, per segment. */
export const FURNISHING_BY_SEGMENT: Record<PropertySegment, FurnishingStatus[]> =
  {
    residential: ["unfurnished", "semi_furnished", "furnished"],
    commercial: ["bare_shell", "warm_shell", "fully_fitted"],
  };

export const ACCOUNT_TYPES: {
  value: "owner" | "broker" | "developer";
  label: string;
  blurb: string;
  /** Asked for a RERA agent/promoter registration at signup. */
  wantsRera: boolean;
}[] = [
  {
    value: "owner",
    label: "Property owner",
    blurb: "I am listing a property I own — a flat, shop, godown or plot.",
    wantsRera: false,
  },
  {
    value: "broker",
    label: "Broker / channel partner",
    blurb: "I list and market property on behalf of owners and developers.",
    wantsRera: true,
  },
  {
    value: "developer",
    label: "Developer",
    blurb: "We are a real-estate company marketing our own projects.",
    wantsRera: true,
  },
];

export const ACCOUNT_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  ACCOUNT_TYPES.map((a) => [a.value, a.label]),
);

/** BHK configurations, for the residential filter and form. */
export const BHK_OPTIONS = [
  { value: "1", label: "1 BHK" },
  { value: "2", label: "2 BHK" },
  { value: "3", label: "3 BHK" },
  { value: "4", label: "4 BHK" },
  { value: "5", label: "5 BHK & above" },
];

/** The provisions listers tick most often. Free text covers the rest. */
export const AMENITY_OPTIONS = [
  "Lift",
  "24x7 security & CCTV",
  "Power backup",
  "Covered car parking",
  "Children's play area",
  "Clubhouse / society office",
  "Gymnasium",
  "Swimming pool",
  "Garden / open space",
  "Water supply 24x7",
  "Fire NOC & sprinklers",
  "Washrooms within premises",
  "Loading / unloading access",
  "Road-facing frontage",
  "Walking distance to station",
  "High-speed fibre ready",
];

/** Documents the verification call asks for. Captured as a readiness checklist. */
export const OWNER_DOCUMENTS = [
  "Agreement / index II",
  "Share certificate",
  "Occupancy certificate (OC)",
  "Latest property tax receipt",
  "Approved building plan",
  "Society / developer NOC",
  "7/12 extract or NA order (land)",
];

export const TENANCY_STATUSES = [
  "Vacant",
  "Currently tenanted",
  "Owner occupied",
  "Under construction",
];

/**
 * Budget bands, in INR. `max: null` means "and above".
 *
 * Re-cut for this corridor: a 1 BHK in Nalasopara and a Tarapur shed sit in
 * the same book, so the bands start far lower than the old MMR-wide set.
 */
export const BUDGET_BANDS = [
  { value: "0-2500000", label: "Under ₹25 L", min: 0, max: 2_500_000 },
  { value: "2500000-5000000", label: "₹25 L – ₹50 L", min: 2_500_000, max: 5_000_000 },
  { value: "5000000-10000000", label: "₹50 L – ₹1 Cr", min: 5_000_000, max: 10_000_000 },
  { value: "10000000-25000000", label: "₹1 Cr – ₹2.5 Cr", min: 10_000_000, max: 25_000_000 },
  { value: "25000000-", label: "₹2.5 Cr and above", min: 25_000_000, max: null },
];

export const AREA_BANDS = [
  { value: "0-600", label: "Under 600 sq.ft.", min: 0, max: 600 },
  { value: "600-1200", label: "600 – 1,200 sq.ft.", min: 600, max: 1200 },
  { value: "1200-2500", label: "1,200 – 2,500 sq.ft.", min: 1200, max: 2500 },
  { value: "2500-10000", label: "2,500 – 10,000 sq.ft.", min: 2500, max: 10000 },
  { value: "10000-", label: "10,000 sq.ft. and above", min: 10000, max: null },
];

export const TIMELINES = [
  "Immediate (within 30 days)",
  "1 – 3 months",
  "3 – 6 months",
  "6 – 12 months",
  "Just exploring",
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "area_desc", label: "Largest area" },
];
