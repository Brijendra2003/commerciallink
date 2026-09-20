import type {
  FurnishingStatus,
  PossessionStatus,
  PropertyType,
  Purpose,
  Zone,
} from "@/lib/types";

/**
 * CommercialLink operates in the Mumbai Metropolitan Region only. `city` stays
 * on the schema (it is a column in `properties`) but is constant — the facet
 * buyers actually search on is the micro-market, grouped into MMR zones.
 */
export const CITY = "Mumbai";

export const ZONES: { value: Zone; label: string; blurb: string }[] = [
  {
    value: "south",
    label: "South Mumbai",
    blurb: "Nariman Point, Fort and Ballard Estate — the legacy CBD.",
  },
  {
    value: "central",
    label: "Central Mumbai",
    blurb: "Worli, Lower Parel and Prabhadevi — the mill-land office belt.",
  },
  {
    value: "western",
    label: "Western Suburbs",
    blurb: "BKC, Andheri, Goregaon and Malad — the deepest occupier market.",
  },
  {
    value: "eastern",
    label: "Eastern Suburbs",
    blurb: "Powai, Vikhroli and Ghatkopar — value against a metro spine.",
  },
  {
    value: "navi",
    label: "Navi Mumbai",
    blurb: "Vashi, Turbhe, Belapur and Taloja — industrial and back-office scale.",
  },
  {
    value: "thane",
    label: "Thane & Beyond",
    blurb: "Thane, Wagle Estate, Bhiwandi and Panvel — warehousing and logistics.",
  },
];

export const ZONE_LABEL: Record<Zone, string> = Object.fromEntries(
  ZONES.map((z) => [z.value, z.label]),
) as Record<Zone, string>;

/** The searchable micro-markets, in the zone they belong to. */
export const MICRO_MARKETS: { name: string; zone: Zone }[] = [
  { name: "Nariman Point", zone: "south" },
  { name: "Fort & Ballard Estate", zone: "south" },
  { name: "Colaba", zone: "south" },
  { name: "Worli", zone: "central" },
  { name: "Lower Parel", zone: "central" },
  { name: "Prabhadevi", zone: "central" },
  { name: "Dadar", zone: "central" },
  { name: "Bandra Kurla Complex", zone: "western" },
  { name: "Bandra West", zone: "western" },
  { name: "Andheri East", zone: "western" },
  { name: "Andheri West", zone: "western" },
  { name: "Goregaon", zone: "western" },
  { name: "Malad", zone: "western" },
  { name: "Powai", zone: "eastern" },
  { name: "Vikhroli", zone: "eastern" },
  { name: "Ghatkopar", zone: "eastern" },
  { name: "Chembur", zone: "eastern" },
  { name: "Vashi", zone: "navi" },
  { name: "Turbhe", zone: "navi" },
  { name: "Airoli", zone: "navi" },
  { name: "Belapur", zone: "navi" },
  { name: "Taloja MIDC", zone: "navi" },
  { name: "Thane West", zone: "thane" },
  { name: "Wagle Estate", zone: "thane" },
  { name: "Bhiwandi", zone: "thane" },
  { name: "Panvel", zone: "thane" },
];

export const MICRO_MARKET_NAMES = MICRO_MARKETS.map((m) => m.name);

export function marketsInZone(zone: Zone): string[] {
  return MICRO_MARKETS.filter((m) => m.zone === zone).map((m) => m.name);
}

export const PROPERTY_TYPES: {
  value: PropertyType;
  label: string;
  short: string;
  blurb: string;
}[] = [
  {
    value: "office",
    label: "Office Space",
    short: "Office",
    blurb: "Grade-A floors and fitted suites across BKC, Lower Parel and the Andheri belt.",
  },
  {
    value: "retail",
    label: "Retail & High Street",
    short: "Retail",
    blurb: "Linking Road and Link Road frontage, mall units and anchor space with proven footfall.",
  },
  {
    value: "warehouse",
    label: "Warehouse",
    short: "Warehouse",
    blurb: "Grade-A logistics parks on the Bhiwandi and Panvel corridors, docked and ready.",
  },
  {
    value: "industrial",
    label: "Industrial",
    short: "Industrial",
    blurb: "MIDC sheds in Taloja and Wagle Estate with power load and MPCB consent.",
  },
  {
    value: "land",
    label: "Commercial Land",
    short: "Land",
    blurb: "Clear-title parcels with confirmed zoning, FSI and approach road width.",
  },
  {
    value: "coworking",
    label: "Co-working",
    short: "Co-working",
    blurb: "Managed floors and enterprise seats on flexible 11-month to 5-year terms.",
  },
];

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> =
  Object.fromEntries(
    PROPERTY_TYPES.map((t) => [t.value, t.label]),
  ) as Record<PropertyType, string>;

export const PURPOSE_LABEL: Record<Purpose, string> = {
  buy: "For Sale",
  lease: "For Lease",
};

export const POSSESSION_LABEL: Record<PossessionStatus, string> = {
  ready: "Ready to move",
  under_construction: "Under construction",
  shell_core: "Shell & core",
};

export const FURNISHING_LABEL: Record<FurnishingStatus, string> = {
  bare_shell: "Bare shell",
  warm_shell: "Warm shell",
  fully_fitted: "Fully fitted",
};

export function zoneForMarket(market: string): Zone | null {
  return MICRO_MARKETS.find((m) => m.name === market)?.zone ?? null;
}

/** The provisions owners tick most often. Free text covers the rest. */
export const AMENITY_OPTIONS = [
  "24x7 security & CCTV",
  "Power backup (DG)",
  "Central air-conditioning",
  "Passenger lifts",
  "Service / goods lift",
  "Covered car parking",
  "Fire NOC & sprinklers",
  "Cafeteria / food court",
  "Conference rooms",
  "Pantry",
  "Washrooms within premises",
  "Loading docks",
  "Truck turning radius",
  "Road-facing frontage",
  "Near metro / railway",
  "High-speed fibre ready",
];

/** Documents the onboarding call asks for. Captured as a readiness checklist. */
export const OWNER_DOCUMENTS = [
  "Title deed / share certificate",
  "Occupancy certificate (OC)",
  "Latest property tax receipt",
  "Approved building plan",
  "Fire NOC",
  "Society / developer NOC",
];

export const TENANCY_STATUSES = [
  "Vacant",
  "Currently tenanted",
  "Owner occupied",
  "Under construction",
];

/** Budget bands, in INR. `max: null` means "and above". */
export const BUDGET_BANDS = [
  { value: "0-5000000", label: "Under ₹50 L", min: 0, max: 5_000_000 },
  { value: "5000000-20000000", label: "₹50 L – ₹2 Cr", min: 5_000_000, max: 20_000_000 },
  { value: "20000000-75000000", label: "₹2 Cr – ₹7.5 Cr", min: 20_000_000, max: 75_000_000 },
  { value: "75000000-250000000", label: "₹7.5 Cr – ₹25 Cr", min: 75_000_000, max: 250_000_000 },
  { value: "250000000-", label: "₹25 Cr and above", min: 250_000_000, max: null },
];

export const AREA_BANDS = [
  { value: "0-2500", label: "Under 2,500 sq.ft.", min: 0, max: 2500 },
  { value: "2500-10000", label: "2,500 – 10,000 sq.ft.", min: 2500, max: 10000 },
  { value: "10000-40000", label: "10,000 – 40,000 sq.ft.", min: 10000, max: 40000 },
  { value: "40000-", label: "40,000 sq.ft. and above", min: 40000, max: null },
];

export const TIMELINES = [
  "Immediate (within 30 days)",
  "1 – 3 months",
  "3 – 6 months",
  "6 – 12 months",
  "Exploring the market",
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "area_desc", label: "Largest area" },
];
