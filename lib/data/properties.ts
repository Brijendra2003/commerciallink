import type { Property, PropertyMedia } from "@/lib/types";
import {
  AREA_BANDS,
  BUDGET_BANDS,
  marketsInZone,
  type SORT_OPTIONS,
} from "@/lib/data/taxonomy";

/**
 * Stand-in for the `properties` + `property_media` tables, used whenever
 * Supabase credentials are absent. Every read below is a pure function over
 * this array, mirroring the queries in lib/data/properties-db.ts one for one.
 *
 * All stock sits in the Mumbai Metropolitan Region — `city` is constant and
 * `locality` carries the micro-market that buyers actually search on.
 */

function media(
  entries: [id: string, alt: string][],
  brochure = true,
): PropertyMedia[] {
  const images: PropertyMedia[] = entries.map(([id, alt], i) => ({
    id: `m-${id}`,
    cloudinary_public_id: id,
    type: "image",
    alt,
    sort_order: i,
  }));
  if (brochure) {
    images.push({
      id: `m-${entries[0][0]}-brochure`,
      cloudinary_public_id: "",
      type: "brochure",
      alt: "Property brochure",
      sort_order: 99,
    });
  }
  return images;
}

export const properties: Property[] = [
  {
    id: "p-001",
    slug: "grade-a-office-floor-bkc-mumbai",
    title: "Grade-A Office Floor, Bandra Kurla Complex",
    type: "office",
    purpose: "lease",
    city: "Mumbai",
    zone: "western",
    locality: "Bandra Kurla Complex",
    address: "G Block, Bandra Kurla Complex, Mumbai 400051",
    price: null,
    rent_psf: 285,
    area_sqft: 18400,
    carpet_area_sqft: 12880,
    floor: "14th of 22",
    possession: "ready",
    furnishing: "warm_shell",
    zoning: "Commercial (C-2)",
    status: "published",
    featured: true,
    verified: true,
    amenities: [
      "100% DG backup",
      "4-side open floor plate",
      "1:600 car park ratio",
      "LEED Gold certified",
      "Double-height lobby",
      "24×7 security",
    ],
    summary:
      "A full floor plate in Mumbai's primary financial district, handed over warm shell with services drawn to the core.",
    description: [
      "An efficient 18,400 sq.ft. floor plate in a LEED Gold tower on G Block, offering a rare column-free span and four-side natural light. The floor is handed over warm shell with HVAC, fire and electrical services drawn to the core, so a fit-out can start on day one.",
      "The building sits within walking distance of the BKC bus depot and a five-minute drive from the Kurla and Bandra rail heads, with the Metro Line 3 station now operational at the northern edge of the complex.",
      "Landlord is open to a 5+5+5 structure with a 36-month lock-in and a rent-free fit-out window for the right covenant.",
    ],
    media: media([
      ["photo-1497366754035-f200968a6e72", "Open-plan office floor with glazed partitions"],
      ["photo-1497366811353-6870744d04b2", "Meeting rooms along a glazed façade"],
      ["photo-1524758631624-e2822e304c36", "Breakout lounge with soft seating"],
      ["photo-1582407947304-fd86f028f716", "Glass tower exterior at dusk"],
      ["photo-1497215728101-856f4ea42174", "Workstation bank with natural light"],
    ]),
    owner_id: "o-114",
    created_at: "2026-08-18",
    view_count: 1842,
    enquiry_count: 37,
  },
  {
    id: "p-002",
    slug: "logistics-warehouse-bhiwandi-mumbai",
    title: "Grade-A Logistics Warehouse, Bhiwandi",
    type: "warehouse",
    purpose: "lease",
    city: "Mumbai",
    zone: "thane",
    locality: "Bhiwandi",
    address: "Nashik Highway, Bhiwandi, Thane 421302",
    price: null,
    rent_psf: 26,
    area_sqft: 92000,
    carpet_area_sqft: 88500,
    floor: "Ground",
    possession: "ready",
    furnishing: "bare_shell",
    zoning: "Warehousing / Logistics",
    status: "published",
    featured: true,
    verified: true,
    amenities: [
      "12 m clear height",
      "8 dock levellers",
      "FM-2 flooring, 6 T/sqm",
      "Fire NOC in place",
      "Trailer parking bay",
      "Gated park with weighbridge",
    ],
    summary:
      "A ready-to-occupy shed inside a gated logistics park on the Nashik highway, built to Grade-A specification.",
    description: [
      "92,000 sq.ft. of clear-span warehousing inside an established gated park, with 12 m clear height at the eaves and FM-2 grade flooring rated to 6 T/sqm — suitable for high-density racking and automated MHE.",
      "Eight dock levellers face a 45 m concrete apron with dedicated trailer standing, and the park operates a shared weighbridge and 24×7 manned security with ANPR at the gate.",
      "Bhiwandi remains the deepest warehousing cluster serving Mumbai, with the JNPT corridor reachable via the Kalyan–Shil road. Fire NOC and the Shops & Establishments registration are already in place.",
    ],
    media: media([
      ["photo-1553413077-190dd305871c", "Racked warehouse interior with clear span"],
      ["photo-1580674285054-bed31e145f59", "Loading docks with parked trailers"],
      ["photo-1565610222536-ef125c59da2e", "Warehouse aisle with pallet racking"],
      ["photo-1601597111158-2fceff292cdc", "Warehouse exterior and apron"],
    ]),
    owner_id: "o-207",
    created_at: "2026-08-22",
    view_count: 1136,
    enquiry_count: 24,
  },
  {
    id: "p-003",
    slug: "high-street-retail-linking-road-bandra",
    title: "High-Street Retail Unit, Linking Road",
    type: "retail",
    purpose: "lease",
    city: "Mumbai",
    zone: "western",
    locality: "Bandra West",
    address: "Linking Road, Bandra West, Mumbai 400050",
    price: null,
    rent_psf: 195,
    area_sqft: 3200,
    carpet_area_sqft: 2740,
    floor: "Ground + Mezzanine",
    possession: "ready",
    furnishing: "bare_shell",
    zoning: "Commercial retail",
    status: "published",
    featured: true,
    verified: true,
    amenities: [
      "42 ft main-road frontage",
      "Mezzanine included",
      "Signage rights",
      "Valet drop-off",
      "Liquor licence permissible",
      "Grease trap provision",
    ],
    summary:
      "Corner frontage on Mumbai's strongest F&B and lifestyle strip, with signage rights and a mezzanine included.",
    description: [
      "A 3,200 sq.ft. corner unit on Linking Road with 42 ft of unobstructed main-road frontage — the widest currently available on this stretch — plus a mezzanine suitable for back-of-house or a private dining room.",
      "The address sits between two anchor restaurants with measured evening footfall of roughly 11,000 on weekends, and a five-minute walk from Bandra station's west exit.",
      "Kitchen provisions including grease trap and exhaust routing are pre-built. The landlord will consider a stepped rent for the first twelve months for an established F&B brand.",
    ],
    media: media([
      ["photo-1441986300917-64674bd600d8", "Retail storefront with large glazing"],
      ["photo-1567449303078-57ad995bd17a", "Retail interior with display fixtures"],
      ["photo-1554435493-93422e8220c8", "Retail concourse with shopfronts"],
      ["photo-1462899006636-339e08d1844e", "Evening high-street frontage"],
    ]),
    owner_id: "o-331",
    created_at: "2026-08-27",
    view_count: 2210,
    enquiry_count: 51,
  },
  {
    id: "p-004",
    slug: "it-park-office-suite-andheri-east",
    title: "IT Park Office Suite, Andheri East",
    type: "office",
    purpose: "lease",
    city: "Mumbai",
    zone: "western",
    locality: "Andheri East",
    address: "MIDC, Andheri East, Mumbai 400093",
    price: null,
    rent_psf: 148,
    area_sqft: 7600,
    carpet_area_sqft: 5320,
    floor: "6th of 11",
    possession: "ready",
    furnishing: "fully_fitted",
    zoning: "IT / ITES",
    status: "published",
    featured: false,
    verified: true,
    amenities: [
      "110 workstations in situ",
      "3 meeting rooms",
      "Plug-and-play cabling",
      "Food court in campus",
      "8 min to Metro Line 1",
      "100% power backup",
    ],
    summary:
      "A fully fitted plug-and-play suite in the MIDC belt with 110 workstations retained from the outgoing tenant.",
    description: [
      "7,600 sq.ft. carpet-efficient suite in an established IT campus off Andheri–Kurla Road, handed over fully fitted with 110 workstations, three meeting rooms, a boardroom and a pantry retained from the outgoing occupier.",
      "Structured cabling, access control and the UPS room are all in working order, cutting a typical eight-week fit-out down to a two-week move-in.",
      "The campus is eight minutes from the Western Express Highway and the Marol Naka metro interchange, with an on-site food court, crèche and gym. Parking is allotted at 1:800.",
    ],
    media: media([
      ["photo-1531973576160-7125cd663d86", "Fitted office with workstation banks"],
      ["photo-1600880292203-757bb62b4baf", "Glazed meeting room with table seating"],
      ["photo-1504384308090-c894fdcc538d", "Desk detail in a fitted office"],
      ["photo-1497604401993-f2e922e5cb0a", "Office campus exterior"],
    ]),
    owner_id: "o-118",
    created_at: "2026-08-12",
    view_count: 1490,
    enquiry_count: 29,
  },
  {
    id: "p-005",
    slug: "industrial-shed-taloja-midc",
    title: "Industrial Shed with Power Load, Taloja MIDC",
    type: "industrial",
    purpose: "buy",
    city: "Mumbai",
    zone: "navi",
    locality: "Taloja MIDC",
    address: "Phase II, Taloja MIDC, Navi Mumbai 410208",
    price: 285_000_000,
    rent_psf: null,
    area_sqft: 46000,
    carpet_area_sqft: 44100,
    floor: "Ground",
    possession: "ready",
    furnishing: "bare_shell",
    zoning: "Industrial (MIDC notified)",
    status: "published",
    featured: true,
    verified: true,
    amenities: [
      "1,250 kVA sanctioned load",
      "EOT crane provision",
      "MPCB consent in place",
      "Effluent connection",
      "Workers' amenity block",
      "MIDC lease deed",
    ],
    summary:
      "A notified-estate shed with 1,250 kVA sanctioned load and MPCB consent already granted — rare in Taloja.",
    description: [
      "46,000 sq.ft. of built-up industrial space on a notified MIDC plot in Taloja Phase II, adjacent to an established chemical and engineering cluster and 11 km from the Mumbai–Pune Expressway entry at Kalamboli.",
      "1,250 kVA of sanctioned power load, EOT crane gantry provision along the main bay and a live effluent connection make this immediately usable for light-to-medium engineering.",
      "MPCB consent to operate has been granted and is transferable. Ownership documents, the MIDC lease deed and the latest NA order are available for review under NDA once an enquiry is qualified.",
    ],
    media: media([
      ["photo-1587293852726-70cdb56c2866", "Industrial shed interior with overhead structure"],
      ["photo-1577412647305-991150c7d163", "Industrial plant exterior"],
      ["photo-1580489944761-15a19d654956", "Manufacturing floor detail"],
    ]),
    owner_id: "o-402",
    created_at: "2026-07-30",
    view_count: 876,
    enquiry_count: 18,
  },
  {
    id: "p-006",
    slug: "managed-coworking-floor-powai",
    title: "Managed Co-working Floor, Powai",
    type: "coworking",
    purpose: "lease",
    city: "Mumbai",
    zone: "eastern",
    locality: "Powai",
    address: "Central Avenue, Hiranandani Gardens, Powai, Mumbai 400076",
    price: null,
    rent_psf: 132,
    area_sqft: 12400,
    carpet_area_sqft: 8680,
    floor: "9th of 14",
    possession: "ready",
    furnishing: "fully_fitted",
    zoning: "Commercial / IT",
    status: "published",
    featured: false,
    verified: true,
    amenities: [
      "220 managed seats",
      "Dedicated entry & branding",
      "Housekeeping included",
      "Enterprise-grade internet",
      "Phone booths & focus rooms",
      "Terrace café access",
    ],
    summary:
      "A private managed floor for 220 seats with your own entry and branding — priced all-in, per seat.",
    description: [
      "A full managed floor in Powai configured for 220 seats, taken as a private demise rather than shared desks — your own lift lobby entry, your own branding, and no shared common areas with other members.",
      "Pricing is all-inclusive: rent, fit-out amortisation, housekeeping, utilities, internet and helpdesk sit in a single monthly seat rate, which suits teams that want opex predictability during a scale-up.",
      "Terms run from 11 months to five years. The operator will reconfigure the layout to a tenant-supplied test fit at no cost on commitments over three years.",
    ],
    media: media([
      ["photo-1604328698692-f76ea9498e76", "Co-working lounge with communal tables"],
      ["photo-1521737604893-d14cc237f11d", "Team meeting in a bright workspace"],
      ["photo-1519389950473-47ba0277781c", "Collaborative desks with laptops"],
      ["photo-1497366754035-f200968a6e72", "Open-plan seating"],
    ]),
    owner_id: "o-155",
    created_at: "2026-08-29",
    view_count: 1320,
    enquiry_count: 33,
  },
  {
    id: "p-007",
    slug: "commercial-land-parcel-panvel",
    title: "Commercial Land Parcel, Panvel",
    type: "land",
    purpose: "buy",
    city: "Mumbai",
    zone: "thane",
    locality: "Panvel",
    address: "Sector 12, New Panvel, Navi Mumbai 410206",
    price: 940_000_000,
    rent_psf: null,
    area_sqft: 108900,
    carpet_area_sqft: 108900,
    floor: "—",
    possession: "ready",
    furnishing: "bare_shell",
    zoning: "Commercial, FSI 1.5",
    status: "published",
    featured: false,
    verified: true,
    amenities: [
      "2.5 acre contiguous parcel",
      "45 m approach road",
      "Clear marketable title",
      "NA order granted",
      "Corner plot, two frontages",
      "Airport corridor alignment",
    ],
    summary:
      "A 2.5-acre corner parcel with commercial NA granted and a 45 m approach — licence-ready for a mixed-use scheme.",
    description: [
      "A contiguous 2.5-acre corner parcel fronting a 45 m sector road in New Panvel, with non-agricultural conversion already granted for commercial development at FSI 1.5.",
      "Two road frontages give the site strong scheme flexibility for a retail podium with office or hospitality above. The parcel sits inside the Navi Mumbai International Airport influence notified area, with the Panvel–Karjat rail corridor to the east.",
      "Title is clear and marketable with an unbroken 30-year chain; the full due-diligence file including the NA order, 7/12 extract and the surveyor's demarcation report is released after enquiry qualification.",
    ],
    media: media([
      ["photo-1500382017468-9049fed747ef", "Open land parcel with clear horizon"],
      ["photo-1519567241046-7f570eee3ce6", "Aerial view of undeveloped land"],
      ["photo-1416339306562-f3d12fefd36f", "Site boundary and approach road"],
    ]),
    owner_id: "o-509",
    created_at: "2026-07-19",
    view_count: 654,
    enquiry_count: 12,
  },
  {
    id: "p-008",
    slug: "boutique-office-building-worli",
    title: "Boutique Office Building, Worli",
    type: "office",
    purpose: "buy",
    city: "Mumbai",
    zone: "central",
    locality: "Worli",
    address: "Dr Annie Besant Road, Worli, Mumbai 400018",
    price: 412_000_000,
    rent_psf: null,
    area_sqft: 24800,
    carpet_area_sqft: 18100,
    floor: "G + 4, whole building",
    possession: "ready",
    furnishing: "warm_shell",
    zoning: "Commercial (mixed)",
    status: "published",
    featured: false,
    verified: true,
    amenities: [
      "Whole-building ownership",
      "Two-level basement parking",
      "Independent naming rights",
      "Recently re-clad façade",
      "Passenger + service lifts",
      "In-situ tenant at 62%",
    ],
    summary:
      "A whole G+4 building off Annie Besant Road, income-producing at 62% occupancy with naming rights available.",
    description: [
      "A self-contained G+4 building of 24,800 sq.ft. on Dr Annie Besant Road, offered as a single ownership with full naming and signage rights — a rare product type in a micro-market dominated by strata sales.",
      "The façade was re-clad and the lifts replaced in 2024. Two basement levels give a parking ratio well ahead of the surrounding stock, and the Worli sea-link approach is four minutes away.",
      "62% of the building is let to an in-situ professional-services tenant on a lease with 41 months remaining, giving the buyer immediate income alongside vacant upper floors for self-use or re-letting.",
    ],
    media: media([
      ["photo-1486406146926-c627a92ad1ab", "Modern low-rise office building façade"],
      ["photo-1541888946425-d81bb19240f5", "Office building exterior detail"],
      ["photo-1497366216548-37526070297c", "Reception and lobby area"],
      ["photo-1568992687947-868a62a9f521", "Business district street view"],
    ]),
    owner_id: "o-288",
    created_at: "2026-08-04",
    view_count: 741,
    enquiry_count: 15,
  },
  {
    id: "p-009",
    slug: "cold-storage-facility-turbhe",
    title: "Cold Storage Facility, Turbhe",
    type: "warehouse",
    purpose: "lease",
    city: "Mumbai",
    zone: "navi",
    locality: "Turbhe",
    address: "MIDC Turbhe, Navi Mumbai 400705",
    price: null,
    rent_psf: 52,
    area_sqft: 38500,
    carpet_area_sqft: 36200,
    floor: "Ground",
    possession: "ready",
    furnishing: "fully_fitted",
    zoning: "Industrial / Cold chain",
    status: "published",
    featured: false,
    verified: true,
    amenities: [
      "−25°C to +4°C chambers",
      "Ammonia refrigeration plant",
      "Dock shelters with seals",
      "Backup gensets, N+1",
      "FSSAI-compliant build",
      "Anteroom & staging area",
    ],
    summary:
      "A live cold-chain facility beside the APMC market, with multi-temperature chambers and N+1 refrigeration redundancy.",
    description: [
      "38,500 sq.ft. of purpose-built cold storage across six chambers running from −25°C to +4°C, with an insulated anteroom and a temperature-controlled staging area between the chambers and the dock line.",
      "Refrigeration is on an ammonia plant with N+1 compressor redundancy and dual genset backup, so the cold chain holds through a grid outage without operator intervention.",
      "The location is minutes from the Vashi APMC complex and the Thane–Belapur road, which is why cold-chain operators pay a premium here. The outgoing operator will hand over with all chambers pulled down and validated.",
    ],
    media: media([
      ["photo-1553413077-190dd305871c", "Cold storage chamber with racking"],
      ["photo-1565610222536-ef125c59da2e", "Insulated warehouse aisle"],
      ["photo-1580674285054-bed31e145f59", "Docks with trailer bays"],
    ]),
    owner_id: "o-611",
    created_at: "2026-08-09",
    view_count: 512,
    enquiry_count: 11,
  },
  {
    id: "p-010",
    slug: "anchor-showroom-link-road-andheri",
    title: "Anchor Showroom Space, Link Road",
    type: "retail",
    purpose: "lease",
    city: "Mumbai",
    zone: "western",
    locality: "Andheri West",
    address: "New Link Road, Andheri West, Mumbai 400053",
    price: null,
    rent_psf: 240,
    area_sqft: 8900,
    carpet_area_sqft: 7600,
    floor: "Ground + First",
    possession: "shell_core",
    furnishing: "bare_shell",
    zoning: "Commercial retail",
    status: "published",
    featured: true,
    verified: true,
    amenities: [
      "Double-height ground floor",
      "68 ft frontage",
      "Metro entrance adjacency",
      "Dedicated customer parking",
      "Escalator provision",
      "Rear service access",
    ],
    summary:
      "Double-height anchor frontage on New Link Road, steps from a metro entrance, with escalator provision built in.",
    description: [
      "8,900 sq.ft. across ground and first floor with a double-height shopfront and 68 ft of frontage on New Link Road, directly opposite a Metro Line 2A entrance — one of the highest-visibility retail positions in the western suburbs.",
      "The slab is cut and reinforced for an escalator, and rear service access allows deliveries without crossing the customer entrance.",
      "Handed over shell and core. The landlord will contribute to the shopfront and escalator capex against a nine-year term with a five-year lock-in.",
    ],
    media: media([
      ["photo-1567449303078-57ad995bd17a", "Double-height showroom interior"],
      ["photo-1441986300917-64674bd600d8", "Retail frontage with glazing"],
      ["photo-1554435493-93422e8220c8", "Shopping concourse"],
    ]),
    owner_id: "o-724",
    created_at: "2026-08-25",
    view_count: 1688,
    enquiry_count: 42,
  },
  {
    id: "p-011",
    slug: "contiguous-tower-floors-lower-parel",
    title: "Contiguous Tower Floors, Lower Parel",
    type: "office",
    purpose: "lease",
    city: "Mumbai",
    zone: "central",
    locality: "Lower Parel",
    address: "Senapati Bapat Marg, Lower Parel, Mumbai 400013",
    price: null,
    rent_psf: 210,
    area_sqft: 43500,
    carpet_area_sqft: 30450,
    floor: "18th–20th of 26",
    possession: "under_construction",
    furnishing: "bare_shell",
    zoning: "Commercial (C-1)",
    status: "published",
    featured: false,
    verified: true,
    amenities: [
      "Three contiguous floors",
      "Interconnecting stair permitted",
      "Sea-facing on two sides",
      "Sky lobby at level 17",
      "EV charging bays",
      "Handover Q2 2027",
    ],
    summary:
      "Three stackable floors with an interconnecting stair permitted — built for a single-occupier headquarters.",
    description: [
      "43,500 sq.ft. across three contiguous floors in a tower under construction on Senapati Bapat Marg, with permission granted for an interconnecting stair between all three levels.",
      "Floors 18 to 20 sit above the surrounding roofline with sea views on the western and southern elevations, served by a sky lobby at level 17. Lower Parel station and the Elphinstone bridge are a six-minute walk.",
      "Handover is scheduled for Q2 2027 at bare shell. Early commitment secures the landlord's higher fit-out contribution and the right of first refusal on the two floors above.",
    ],
    media: media([
      ["photo-1582407947304-fd86f028f716", "Tower under construction against sky"],
      ["photo-1590247813693-5541d1c609fd", "High-rise commercial building"],
      ["photo-1497215728101-856f4ea42174", "Indicative fitted floor plate"],
      ["photo-1524758631624-e2822e304c36", "Breakout area indicative fit-out"],
    ]),
    owner_id: "o-133",
    created_at: "2026-08-15",
    view_count: 980,
    enquiry_count: 21,
  },
  {
    id: "p-012",
    slug: "flex-industrial-unit-wagle-estate-thane",
    title: "Flex Industrial Unit, Wagle Estate",
    type: "industrial",
    purpose: "lease",
    city: "Mumbai",
    zone: "thane",
    locality: "Wagle Estate",
    address: "Road No. 22, Wagle Industrial Estate, Thane West 400604",
    price: null,
    rent_psf: 58,
    area_sqft: 28000,
    carpet_area_sqft: 26800,
    floor: "Ground + office mezzanine",
    possession: "ready",
    furnishing: "warm_shell",
    zoning: "Industrial",
    status: "published",
    featured: false,
    verified: true,
    amenities: [
      "9 m clear height",
      "750 kVA load available",
      "Fitted office mezzanine",
      "Two dock + one grade door",
      "Fire hydrant system",
      "Ample truck circulation",
    ],
    summary:
      "A flex unit combining production space with a fitted office mezzanine, minutes from the Eastern Express Highway.",
    description: [
      "28,000 sq.ft. flex unit in Wagle Estate pairing a 9 m clear-height production hall with a fitted office mezzanine of 3,200 sq.ft. — a format that suits assembly, QC and back-office under one roof.",
      "750 kVA of load is available on application, and the unit has two dock doors plus one grade-level door onto a wide circulation apron sized for 40 ft trailers.",
      "Wagle Estate has shifted from heavy manufacturing to light industrial and studio use over the last decade, and the unit is four minutes from the Eastern Express Highway with Thane station a short auto ride away.",
    ],
    media: media([
      ["photo-1587293852726-70cdb56c2866", "Flex industrial hall interior"],
      ["photo-1577412647305-991150c7d163", "Industrial unit exterior"],
      ["photo-1504384308090-c894fdcc538d", "Office mezzanine workspace"],
    ]),
    owner_id: "o-318",
    created_at: "2026-08-20",
    view_count: 603,
    enquiry_count: 14,
  },
];

/** Only `published` rows are ever exposed to the public site. */
const publicProperties = properties.filter((p) => p.status === "published");

export function getPublishedProperties(): Property[] {
  return publicProperties;
}

export function getFeaturedProperties(limit = 6): Property[] {
  return publicProperties.filter((p) => p.featured).slice(0, limit);
}

export function getPropertyBySlug(slug: string): Property | undefined {
  return publicProperties.find((p) => p.slug === slug);
}

export function getSimilarProperties(property: Property, limit = 3): Property[] {
  const scored = publicProperties
    .filter((p) => p.id !== property.id)
    .map((p) => ({
      p,
      score:
        (p.type === property.type ? 3 : 0) +
        (p.locality === property.locality ? 2 : 0) +
        (p.zone === property.zone ? 1 : 0) +
        (p.purpose === property.purpose ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.p);
}

export interface PropertyFilters {
  q?: string;
  type?: string;
  /** Micro-market name, e.g. "Bandra Kurla Complex". */
  market?: string;
  zone?: string;
  purpose?: string;
  budget?: string;
  area?: string;
  possession?: string;
  sort?: (typeof SORT_OPTIONS)[number]["value"];
}

/** Effective comparison value for sorting/filtering across sale and lease stock. */
function priceValue(p: Property): number | null {
  if (p.price !== null) return p.price;
  if (p.rent_psf !== null) return p.rent_psf * p.area_sqft * 12;
  return null;
}

/**
 * Pure filter + sort over any property list, so the same predicates serve the
 * mock array and rows fetched from Supabase.
 */
export function applyFilters(
  list: Property[],
  filters: PropertyFilters,
): Property[] {
  const band = BUDGET_BANDS.find((b) => b.value === filters.budget);
  const areaBand = AREA_BANDS.find((a) => a.value === filters.area);
  const q = filters.q?.trim().toLowerCase();
  // A zone filter widens to every micro-market inside it.
  const zoneMarkets = filters.zone
    ? marketsInZone(filters.zone as Property["zone"])
    : null;

  const result = list.filter((p) => {
    if (filters.type && p.type !== filters.type) return false;
    if (filters.market && p.locality !== filters.market) return false;
    if (zoneMarkets && !zoneMarkets.includes(p.locality)) return false;
    if (filters.purpose && p.purpose !== filters.purpose) return false;
    if (filters.possession && p.possession !== filters.possession) return false;

    if (areaBand) {
      if (p.area_sqft < areaBand.min) return false;
      if (areaBand.max !== null && p.area_sqft > areaBand.max) return false;
    }

    if (band) {
      const value = priceValue(p);
      // Price-on-request stock stays visible: excluding it would hide the
      // highest-intent listings from a budget-filtered search.
      if (value !== null) {
        if (value < band.min) return false;
        if (band.max !== null && value > band.max) return false;
      }
    }

    if (q) {
      const haystack = [
        p.title,
        p.locality,
        p.address,
        p.summary,
        p.zoning,
        ...p.amenities,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  switch (filters.sort) {
    case "price_asc":
      return [...result].sort(
        (a, b) => (priceValue(a) ?? Infinity) - (priceValue(b) ?? Infinity),
      );
    case "price_desc":
      return [...result].sort(
        (a, b) => (priceValue(b) ?? -Infinity) - (priceValue(a) ?? -Infinity),
      );
    case "area_desc":
      return [...result].sort((a, b) => b.area_sqft - a.area_sqft);
    default:
      return [...result].sort((a, b) =>
        b.created_at.localeCompare(a.created_at),
      );
  }
}

export function filterProperties(filters: PropertyFilters): Property[] {
  return applyFilters(publicProperties, filters);
}
