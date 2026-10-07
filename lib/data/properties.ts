import type {
  ProjectCategory,
  Property,
  PropertyMedia,
  PropertyType,
  Purpose,
} from "@/lib/types";
import {
  AREA_BANDS,
  BUDGET_BANDS,
  marketsInZone,
  segmentForType,
  zoneForMarket,
  type SORT_OPTIONS,
} from "@/lib/data/taxonomy";

/**
 * Stand-in for the `properties` + `property_media` tables, used whenever
 * Supabase credentials are absent. Every read below is a pure function over
 * this array, mirroring the Supabase queries in lib/data/queries.ts one for
 * one.
 *
 * All stock sits on the Western line between Mira Road and Dahanu Road —
 * `city` is constant and `locality` carries the station micro-market that
 * buyers actually search on. Both sides of the book are represented: a
 * residential listing and a commercial one differ only in `segment`,
 * `type` and which optional fields are populated.
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
      alt: "Project brochure",
      sort_order: 99,
    });
  }
  return images;
}

/**
 * The fields a seed listing must state. Everything else is derived or
 * defaulted by `listing()` below, which keeps this dataset readable as a
 * table rather than as thirty near-identical object literals.
 */
type Seed = {
  id: string;
  slug: string;
  title: string;
  type: PropertyType;
  category: ProjectCategory;
  purpose: Purpose;
  locality: string;
  address: string;
  area_sqft: number;
  summary: string;
  description: string[];
  media: PropertyMedia[];
  owner_id: string;
  created_at: string;
  view_count: number;
  enquiry_count: number;
} & Partial<Property>;

function listing(seed: Seed): Property {
  const segment = segmentForType(seed.type);
  const zone = zoneForMarket(seed.locality);
  if (!zone) {
    // A typo in a locality name would otherwise silently drop the listing out
    // of every zone-filtered view.
    throw new Error(`Unknown micro-market in mock data: ${seed.locality}`);
  }

  return {
    city: "Mumbai",
    zone,
    segment,
    price: null,
    rent_psf: null,
    carpet_area_sqft: Math.round(seed.area_sqft * 0.72),
    floor: "—",
    possession: seed.category === "new_project" ? "under_construction" : "ready",
    furnishing: segment === "residential" ? "unfurnished" : "bare_shell",
    zoning: "",
    status: "published",
    featured: false,
    verified: true,
    amenities: [],
    rera_number: null,
    review_status: "approved",
    review_note: null,
    reviewed_at: seed.created_at,
    meta_title: null,
    meta_description: null,
    ...seed,
  };
}

export const properties: Property[] = [
  /* ============================ Residential ========================= */
  listing({
    id: "p-001",
    slug: "2-bhk-sunrise-heights-mira-road-east",
    title: "2 BHK in Sunrise Heights, Mira Road East",
    type: "apartment",
    category: "ready_to_move",
    purpose: "buy",
    locality: "Mira Road East",
    address: "Sunrise Heights, Beverly Park Road, Mira Road East 401107",
    building_name: "Sunrise Heights",
    pincode: "401107",
    price: 8_200_000,
    area_sqft: 1050,
    carpet_area_sqft: 745,
    floor: "7th of 14",
    bedrooms: 2,
    bathrooms: 2,
    balconies: 1,
    furnishing: "semi_furnished",
    featured: true,
    amenities: [
      "Lift",
      "24x7 security & CCTV",
      "Power backup",
      "Covered car parking",
      "Children's play area",
      "Walking distance to station",
    ],
    summary:
      "A bright, cross-ventilated 2 BHK eight minutes' walk from Mira Road station, in a maintained 2016 building with OC in hand.",
    description: [
      "A 745 sq.ft. carpet 2 BHK on the seventh floor of a fourteen-storey tower, with a double-aspect living room, modular kitchen and a utility balcony off the second bedroom. The flat has been owner-occupied since possession and is sold with the wardrobes and the kitchen fitted.",
      "Sunrise Heights sits on the Beverly Park access road, an eight-minute walk from the east exit of Mira Road station and two minutes from the Kashimira bus stop. Society amenities include a covered play area, one allotted parking slot and a generator backing the lifts and common lighting.",
    ],
    media: media([
      ["photo-1560448204-e02f11c3d0e2", "Living room with natural light"],
      ["photo-1560185007-cde436f6a4d0", "Modular kitchen"],
      ["photo-1522708323590-d24dbb6b0267", "Bedroom with wardrobe"],
      ["photo-1568605114967-8130f3a36994", "Residential tower exterior"],
    ]),
    owner_id: "o-114",
    created_at: "2026-09-21",
    view_count: 2140,
    enquiry_count: 46,
  }),

  listing({
    id: "p-002",
    slug: "3-bhk-greenscape-residency-virar-west",
    title: "3 BHK in Greenscape Residency, Virar West",
    type: "apartment",
    category: "new_project",
    purpose: "buy",
    locality: "Virar West",
    address: "Greenscape Residency, Agashi Road, Virar West 401303",
    building_name: "Greenscape Residency",
    pincode: "401303",
    rera_number: "P99000051284",
    price: 7_450_000,
    area_sqft: 1180,
    carpet_area_sqft: 820,
    floor: "11th of 22",
    bedrooms: 3,
    bathrooms: 2,
    balconies: 2,
    possession: "under_construction",
    possession_by: "2027-12-31",
    furnishing: "unfurnished",
    featured: true,
    amenities: [
      "Lift",
      "Clubhouse / society office",
      "Gymnasium",
      "Swimming pool",
      "Children's play area",
      "Garden / open space",
      "Covered car parking",
      "Power backup",
    ],
    summary:
      "An under-construction 3 BHK in a RERA-registered township on Agashi Road, with possession committed for December 2027.",
    description: [
      "An 820 sq.ft. carpet 3 BHK in the second of four towers at Greenscape Residency, a MahaRERA-registered scheme on Agashi Road. The layout puts all three bedrooms on an external wall and carries two balconies — one off the living room, one off the master.",
      "The project is registered under MahaRERA number P99000051284, with construction currently at the eleventh slab and possession committed for December 2027. A construction-linked payment plan is available, and the developer is offering a stamp-duty contribution on bookings in the current phase.",
    ],
    media: media([
      ["photo-1545324418-cc1a3fa10c00", "Township towers under construction"],
      ["photo-1502005097973-6a7082348e28", "Show-flat living room"],
      ["photo-1583608205776-bfd35f0d9f83", "Show-flat bedroom"],
      ["photo-1571939228382-b2f2b585ce15", "Clubhouse swimming pool"],
    ]),
    owner_id: "o-221",
    created_at: "2026-09-18",
    view_count: 3860,
    enquiry_count: 118,
  }),

  listing({
    id: "p-003",
    slug: "1-bhk-resale-nalasopara-west",
    title: "1 BHK Resale Flat, Nalasopara West",
    type: "apartment",
    category: "resale",
    purpose: "buy",
    locality: "Nalasopara West",
    address: "Shanti Nagar, Nalasopara West 401203",
    pincode: "401203",
    price: 3_150_000,
    area_sqft: 580,
    carpet_area_sqft: 420,
    floor: "3rd of 7",
    bedrooms: 1,
    bathrooms: 1,
    balconies: 1,
    property_age_years: 11,
    amenities: ["Lift", "24x7 security & CCTV", "Water supply 24x7", "Walking distance to station"],
    summary:
      "A clean 1 BHK in a registered society in Shanti Nagar, twelve minutes from Nalasopara station, with clear title and no dues.",
    description: [
      "A 420 sq.ft. carpet 1 BHK on the third floor of a seven-storey registered society, held by the same family since 2015. The flat is in good order — vitrified flooring, a granite kitchen platform and a repainted interior — and comes with the share certificate and the latest tax receipt.",
      "Shanti Nagar is a twelve-minute walk from the west side of Nalasopara station, with the Achole Road market and two schools inside a kilometre. Society NOC for transfer is confirmed and there are no outstanding maintenance dues.",
    ],
    media: media([
      ["photo-1554995207-c18c203602cb", "Living room"],
      ["photo-1556909212-d5b604d0c90d", "Kitchen platform"],
      ["photo-1600585154340-be6161a56a0c", "Bedroom"],
    ]),
    owner_id: "o-307",
    created_at: "2026-09-14",
    view_count: 1680,
    enquiry_count: 71,
  }),

  listing({
    id: "p-004",
    slug: "row-house-naigaon-east",
    title: "3 BHK Row House, Naigaon East",
    type: "row_house",
    category: "ready_to_move",
    purpose: "buy",
    locality: "Naigaon East",
    address: "Devdaya Nagar Township, Naigaon East 401208",
    building_name: "Devdaya Nagar",
    pincode: "401208",
    price: 11_800_000,
    area_sqft: 1680,
    carpet_area_sqft: 1310,
    floor: "Ground + 1",
    bedrooms: 3,
    bathrooms: 3,
    balconies: 2,
    furnishing: "semi_furnished",
    amenities: [
      "Covered car parking",
      "Garden / open space",
      "24x7 security & CCTV",
      "Power backup",
      "Clubhouse / society office",
    ],
    summary:
      "A ground-plus-one row house in a gated township, with a private garden strip and parking for two cars.",
    description: [
      "A 1,310 sq.ft. carpet row house arranged over ground and first floor, with the living, kitchen and a guest bedroom below and two bedrooms with attached bathrooms above. A nine-foot garden strip runs along the front with tandem parking for two cars.",
      "Devdaya Nagar is a gated township off the Naigaon East station road with a society office, a landscaped central court and round-the-clock manned security. Possession is immediate and the OC is on file.",
    ],
    media: media([
      ["photo-1568605114967-8130f3a36994", "Row house frontage"],
      ["photo-1600607687939-ce8a6c25118c", "Double-height living area"],
      ["photo-1600566753086-00f18fb6b3ea", "Upper-floor bedroom"],
    ]),
    owner_id: "o-114",
    created_at: "2026-09-09",
    view_count: 940,
    enquiry_count: 23,
  }),

  listing({
    id: "p-005",
    slug: "sea-facing-bungalow-dahanu-road",
    title: "Sea-facing Bungalow, Dahanu Road",
    type: "bungalow",
    category: "resale",
    purpose: "buy",
    locality: "Dahanu Road",
    address: "Chikhale Beach Road, Dahanu Road 401602",
    pincode: "401602",
    price: 21_500_000,
    area_sqft: 3200,
    carpet_area_sqft: 2680,
    floor: "Ground + 1",
    bedrooms: 4,
    bathrooms: 4,
    balconies: 3,
    furnishing: "furnished",
    featured: true,
    amenities: [
      "Garden / open space",
      "Covered car parking",
      "Power backup",
      "Water supply 24x7",
      "24x7 security & CCTV",
    ],
    summary:
      "A four-bedroom bungalow on a 6,000 sq.ft. plot off Chikhale beach, sold furnished with a chikoo orchard at the rear.",
    description: [
      "A 2,680 sq.ft. carpet bungalow on a 6,000 sq.ft. freehold plot, two hundred metres from Chikhale beach. Four bedrooms, all en-suite, with a wraparound verandah on the ground floor and a first-floor terrace facing west over the water.",
      "The property is sold furnished and includes a mature chikoo orchard of about forty trees at the rear, a borewell with a treatment unit and a 15 kVA generator. The 7/12 extract is clear and the plot carries NA residential sanction.",
    ],
    media: media([
      ["photo-1600596542815-ffad4c1539a9", "Bungalow exterior from the garden"],
      ["photo-1600607687920-4e2a09cf159d", "Living room with verandah doors"],
      ["photo-1600563438938-a9a27216b4f5", "First-floor terrace"],
      ["photo-1416339306562-f3d12fefd36f", "Garden and orchard"],
    ]),
    owner_id: "o-412",
    created_at: "2026-08-30",
    view_count: 2260,
    enquiry_count: 38,
  }),

  listing({
    id: "p-006",
    slug: "2-bhk-rental-bhayandar-west",
    title: "2 BHK on Rent, Bhayandar West",
    type: "apartment",
    category: "ready_to_move",
    purpose: "lease",
    locality: "Bhayandar West",
    address: "Jesal Park, Bhayandar West 401101",
    building_name: "Shanti Apartments",
    pincode: "401101",
    rent_psf: 24,
    area_sqft: 870,
    carpet_area_sqft: 620,
    floor: "5th of 8",
    bedrooms: 2,
    bathrooms: 2,
    balconies: 1,
    furnishing: "semi_furnished",
    security_deposit_months: 3,
    lock_in_months: 11,
    maintenance_psf: 2.5,
    available_from: "2026-11-01",
    amenities: ["Lift", "24x7 security & CCTV", "Covered car parking", "Water supply 24x7"],
    summary:
      "A semi-furnished 2 BHK in Jesal Park on an eleven-month term, available from November.",
    description: [
      "A 620 sq.ft. carpet 2 BHK on the fifth floor in Jesal Park, let semi-furnished with wardrobes, fans, lights, a modular kitchen and a geyser in both bathrooms. One covered parking slot is included.",
      "Standard eleven-month leave-and-licence with a three-month deposit. The owner prefers a family or a working couple, and the society permits registered agreements only. Available from the first of November.",
    ],
    media: media([
      ["photo-1502005097973-6a7082348e28", "Living room"],
      ["photo-1600121848594-d8644e57abab", "Bedroom"],
      ["photo-1556909212-d5b604d0c90d", "Kitchen"],
    ]),
    owner_id: "o-307",
    created_at: "2026-09-25",
    view_count: 1310,
    enquiry_count: 58,
  }),

  listing({
    id: "p-007",
    slug: "na-residential-plot-saphale",
    title: "NA Residential Plot, Saphale",
    type: "plot",
    category: "resale",
    purpose: "buy",
    locality: "Saphale",
    address: "Survey 118/2, Saphale East, Palghar 401102",
    pincode: "401102",
    price: 4_600_000,
    area_sqft: 5400,
    carpet_area_sqft: 5400,
    zoning: "NA — Residential (R-1)",
    possession: "ready",
    amenities: ["Road-facing frontage", "Water supply 24x7"],
    summary:
      "A 5,400 sq.ft. NA-sanctioned plot in an approved layout at Saphale East, with a 9 m approach road.",
    description: [
      "A corner plot of 5,400 sq.ft. inside a sanctioned residential layout, with the NA order, layout approval and demarcation report all in place. The approach road is nine metres wide and tarred up to the plot line.",
      "Electricity and the village water line are at the boundary. The 7/12 extract shows a single owner with no encumbrance, and the plot is suitable for a ground-plus-two bungalow under the current R-1 sanction.",
    ],
    media: media(
      [
        ["photo-1500382017468-9049fed747ef", "Open plot with approach road"],
        ["photo-1416339306562-f3d12fefd36f", "Surrounding layout"],
      ],
      false,
    ),
    owner_id: "o-412",
    created_at: "2026-08-24",
    view_count: 760,
    enquiry_count: 19,
  }),

  listing({
    id: "p-008",
    slug: "4-bhk-penthouse-vasai-road-west",
    title: "4 BHK Penthouse, Vasai Road West",
    type: "penthouse",
    category: "ready_to_move",
    purpose: "buy",
    locality: "Vasai Road West",
    address: "Evershine Towers, Ambadi Road, Vasai Road West 401202",
    building_name: "Evershine Towers",
    pincode: "401202",
    price: 18_900_000,
    area_sqft: 2450,
    carpet_area_sqft: 1880,
    floor: "18th of 18",
    bedrooms: 4,
    bathrooms: 4,
    balconies: 3,
    furnishing: "furnished",
    amenities: [
      "Lift",
      "Covered car parking",
      "Gymnasium",
      "Swimming pool",
      "Clubhouse / society office",
      "Power backup",
      "24x7 security & CCTV",
    ],
    summary:
      "A top-floor duplex penthouse on Ambadi Road with a 600 sq.ft. private terrace and two allotted parking slots.",
    description: [
      "A duplex penthouse across the seventeenth and eighteenth floors, 1,880 sq.ft. carpet plus a 600 sq.ft. private terrace facing west. Four bedrooms, a separate family lounge on the upper level and a fully fitted island kitchen.",
      "Evershine Towers is a 2019 completion on Ambadi Road with a clubhouse, a 25 m pool and a gym, eleven minutes by road from Vasai Road station. Two covered parking slots are allotted to the unit.",
    ],
    media: media([
      ["photo-1600607687939-ce8a6c25118c", "Double-height living room"],
      ["photo-1600566753190-17f0baa2a6c3", "Island kitchen"],
      ["photo-1600563438938-a9a27216b4f5", "Private terrace at dusk"],
      ["photo-1545324418-cc1a3fa10c00", "Tower exterior"],
    ]),
    owner_id: "o-221",
    created_at: "2026-09-05",
    view_count: 1890,
    enquiry_count: 31,
  }),

  /* ============================ Commercial ========================== */
  listing({
    id: "p-009",
    slug: "station-road-shop-mira-road-east",
    title: "Station Road Shop, Mira Road East",
    type: "retail",
    category: "resale",
    purpose: "lease",
    locality: "Mira Road East",
    address: "Shop 4, Rameshwar Complex, Station Road, Mira Road East 401107",
    building_name: "Rameshwar Complex",
    pincode: "401107",
    rent_psf: 185,
    area_sqft: 420,
    carpet_area_sqft: 390,
    floor: "Ground",
    furnishing: "warm_shell",
    security_deposit_months: 6,
    lock_in_months: 24,
    zoning: "Commercial — retail permitted",
    featured: true,
    amenities: [
      "Road-facing frontage",
      "Walking distance to station",
      "Power backup",
      "Washrooms within premises",
      "24x7 security & CCTV",
    ],
    summary:
      "A 420 sq.ft. ground-floor shop with 14 ft of glazed frontage on Station Road, three minutes from the east exit.",
    description: [
      "A ground-floor retail unit with fourteen feet of continuous glazed frontage directly on Station Road, handed over warm shell with a rolling shutter, a toilet and a 10 kVA sanctioned load. Mezzanine rights of 160 sq.ft. are included.",
      "Footfall here is station-driven and heaviest between six and ten in the evening. The complex already houses a pharmacy, a bakery and a mobile retailer. Owner wants a 24-month lock-in and a six-month deposit.",
    ],
    media: media([
      ["photo-1441986300917-64674bd600d8", "Shop frontage on Station Road"],
      ["photo-1567449303078-57ad995bd17a", "Interior shell with shutter"],
      ["photo-1604328698692-f76ea9498e76", "Street elevation"],
    ]),
    owner_id: "o-114",
    created_at: "2026-09-23",
    view_count: 1520,
    enquiry_count: 44,
  }),

  listing({
    id: "p-010",
    slug: "godown-vasai-industrial-estate",
    title: "Godown with Loading Bay, Vasai Road East",
    type: "warehouse",
    category: "ready_to_move",
    purpose: "lease",
    locality: "Vasai Road East",
    address: "Gala 7, Vasai Industrial Estate, Vasai Road East 401208",
    pincode: "401208",
    rent_psf: 22,
    area_sqft: 14_500,
    carpet_area_sqft: 14_100,
    floor: "Ground",
    furnishing: "bare_shell",
    security_deposit_months: 6,
    lock_in_months: 36,
    ceiling_height_ft: 24,
    power_load_kva: 80,
    parking_slots: 6,
    zoning: "Industrial / Warehousing",
    amenities: [
      "Loading / unloading access",
      "Fire NOC & sprinklers",
      "24x7 security & CCTV",
      "Power backup",
      "Road-facing frontage",
    ],
    summary:
      "A 14,500 sq.ft. RCC godown inside Vasai Industrial Estate with 24 ft clear height and a truck-level loading bay.",
    description: [
      "An RCC-framed godown with a twenty-four-foot clear height, a 6 T/sqm floor and a single truck-level loading bay with a 12 m turning apron. Fire sprinklers are installed and the NOC is current.",
      "The estate gate is manned round the clock with a weighbridge on site, and the Vasai–Virar link road reaches the Mumbai–Ahmedabad highway in under twenty minutes. Owner is open to a 36-month lock-in on a nine-year structure.",
    ],
    media: media([
      ["photo-1553413077-190dd305871c", "Godown interior with clear span"],
      ["photo-1587293852726-70cdb56c2866", "Loading bay"],
      ["photo-1601597111158-2fceff292cdc", "Estate approach road"],
    ]),
    owner_id: "o-508",
    created_at: "2026-09-16",
    view_count: 1120,
    enquiry_count: 27,
  }),

  listing({
    id: "p-011",
    slug: "industrial-shed-tarapur-midc",
    title: "Industrial Shed with Power Load, Tarapur MIDC",
    type: "industrial",
    category: "resale",
    purpose: "buy",
    locality: "Tarapur MIDC",
    address: "Plot J-42, Tarapur MIDC, Boisar, Palghar 401506",
    pincode: "401506",
    price: 42_000_000,
    area_sqft: 28_000,
    carpet_area_sqft: 26_400,
    floor: "Ground",
    furnishing: "bare_shell",
    ceiling_height_ft: 28,
    power_load_kva: 650,
    parking_slots: 12,
    zoning: "MIDC Industrial — MPCB consent in place",
    featured: true,
    amenities: [
      "Loading / unloading access",
      "Fire NOC & sprinklers",
      "Power backup",
      "Water supply 24x7",
      "24x7 security & CCTV",
    ],
    summary:
      "A 28,000 sq.ft. shed on a 1.2-acre MIDC plot at Tarapur, with 650 kVA sanctioned load and a transferable MPCB consent.",
    description: [
      "A clear-span shed of 28,000 sq.ft. on a 1.2-acre MIDC plot, with a twenty-eight-foot eaves height, an EOT crane gantry rated to 10 T and a separate 2,400 sq.ft. office and canteen block.",
      "Sanctioned power load is 650 kVA with a dedicated transformer yard, and the MPCB consent to operate is current and transferable for the existing red-category use. The MIDC lease runs to 2068 and assignment is pre-approved in principle.",
    ],
    media: media([
      ["photo-1581093450021-4a7360e9a6b5", "Shed interior with crane gantry"],
      ["photo-1565610222536-ef125c59da2e", "Plot frontage"],
      ["photo-1504384308090-c894fdcc538d", "Office block"],
    ]),
    owner_id: "o-508",
    created_at: "2026-09-02",
    view_count: 1410,
    enquiry_count: 22,
  }),

  listing({
    id: "p-012",
    slug: "office-suite-business-park-bhayandar-east",
    title: "Fitted Office Suite, Bhayandar East",
    type: "office",
    category: "ready_to_move",
    purpose: "lease",
    locality: "Bhayandar East",
    address: "4th floor, Navkar Business Park, Bhayandar East 401105",
    building_name: "Navkar Business Park",
    pincode: "401105",
    rent_psf: 68,
    area_sqft: 3600,
    carpet_area_sqft: 2880,
    floor: "4th of 9",
    furnishing: "fully_fitted",
    security_deposit_months: 6,
    lock_in_months: 36,
    maintenance_psf: 9,
    parking_slots: 4,
    power_load_kva: 60,
    zoning: "Commercial — IT/ITeS permitted",
    amenities: [
      "Lift",
      "Power backup",
      "Covered car parking",
      "Washrooms within premises",
      "High-speed fibre ready",
      "Walking distance to station",
      "24x7 security & CCTV",
    ],
    summary:
      "A fitted 48-seat office on the fourth floor of Navkar Business Park, plug-and-play with cabins, a server room and fibre in place.",
    description: [
      "A 2,880 sq.ft. carpet suite fitted out for forty-eight workstations, with four cabins, a ten-seat boardroom, a server room on a separate UPS circuit and a pantry. Furniture, air-conditioning and the structured cabling stay with the premises.",
      "Navkar Business Park is a six-minute walk from Bhayandar station's east exit, with four covered parking slots allotted to the floor and a 60 kVA sanctioned load backed by common-area DG. Available on a 5+4 structure with a 36-month lock-in.",
    ],
    media: media([
      ["photo-1497366754035-f200968a6e72", "Open-plan workstation bank"],
      ["photo-1497366811353-6870744d04b2", "Glazed cabins"],
      ["photo-1524758631624-e2822e304c36", "Breakout and pantry"],
      ["photo-1582407947304-fd86f028f716", "Building exterior"],
    ]),
    owner_id: "o-221",
    created_at: "2026-09-11",
    view_count: 1640,
    enquiry_count: 35,
  }),

  listing({
    id: "p-013",
    slug: "showroom-unit-nalasopara-east",
    title: "Double-height Showroom, Nalasopara East",
    type: "retail",
    category: "new_project",
    purpose: "buy",
    locality: "Nalasopara East",
    address: "Sai Commercial Hub, Tivri Road, Nalasopara East 401209",
    building_name: "Sai Commercial Hub",
    pincode: "401209",
    rera_number: "P99000068917",
    price: 13_400_000,
    area_sqft: 1250,
    carpet_area_sqft: 980,
    floor: "Ground + Mezzanine",
    possession: "under_construction",
    possession_by: "2027-06-30",
    furnishing: "bare_shell",
    ceiling_height_ft: 18,
    zoning: "Commercial — retail and showroom",
    amenities: [
      "Road-facing frontage",
      "Lift",
      "Power backup",
      "Covered car parking",
      "Fire NOC & sprinklers",
    ],
    summary:
      "An under-construction double-height showroom on Tivri Road, RERA-registered with possession committed for June 2027.",
    description: [
      "A ground-plus-mezzanine showroom with an eighteen-foot double-height front bay and 980 sq.ft. of carpet across both levels. Handed over bare shell with the shopfront glazing, a toilet and a sanctioned 20 kVA load.",
      "Sai Commercial Hub is registered under MahaRERA number P99000068917, on the Tivri Road approach to Nalasopara East station. Construction is at the fourth slab with possession committed for June 2027, and the developer is offering a construction-linked plan.",
    ],
    media: media([
      ["photo-1441986300917-64674bd600d8", "Showroom frontage render"],
      ["photo-1567449303078-57ad995bd17a", "Double-height interior"],
      ["photo-1601597111158-2fceff292cdc", "Site under construction"],
    ]),
    owner_id: "o-221",
    created_at: "2026-08-28",
    view_count: 980,
    enquiry_count: 26,
  }),

  listing({
    id: "p-014",
    slug: "commercial-land-parcel-boisar-east",
    title: "Highway-facing Commercial Parcel, Boisar East",
    type: "land",
    category: "resale",
    purpose: "buy",
    locality: "Boisar East",
    address: "Survey 64/1, Boisar–Tarapur Road, Palghar 401501",
    pincode: "401501",
    price: 33_000_000,
    area_sqft: 48_000,
    carpet_area_sqft: 48_000,
    zoning: "Commercial — godown and showroom permitted, FSI 1.0",
    amenities: ["Road-facing frontage", "Water supply 24x7"],
    summary:
      "A 48,000 sq.ft. parcel with 140 ft of frontage on the Boisar–Tarapur road, zoned for godown and showroom use.",
    description: [
      "A single-owner parcel of 48,000 sq.ft. with about 140 feet of frontage on the Boisar–Tarapur road, zoned commercial at an FSI of 1.0 and cleared for godown and showroom development.",
      "The 7/12 extract is clear with no tenancy entry, the NA order is in hand and the demarcation has been re-surveyed this year. An 11 kV line runs along the frontage and the Boisar station road is 2.4 km away.",
    ],
    media: media(
      [
        ["photo-1500382017468-9049fed747ef", "Parcel with highway frontage"],
        ["photo-1462899006636-339e08d1844e", "Aerial view of the plot"],
      ],
      false,
    ),
    owner_id: "o-412",
    created_at: "2026-08-19",
    view_count: 670,
    enquiry_count: 14,
  }),

  listing({
    id: "p-015",
    slug: "coworking-desks-vasai-road-west",
    title: "Managed Desks & Cabins, Vasai Road West",
    type: "coworking",
    category: "ready_to_move",
    purpose: "lease",
    locality: "Vasai Road West",
    address: "2nd floor, Pearl Plaza, Ambadi Road, Vasai Road West 401202",
    building_name: "Pearl Plaza",
    pincode: "401202",
    rent_psf: 52,
    area_sqft: 2200,
    carpet_area_sqft: 1760,
    floor: "2nd of 6",
    furnishing: "fully_fitted",
    security_deposit_months: 2,
    lock_in_months: 11,
    parking_slots: 3,
    amenities: [
      "Lift",
      "Power backup",
      "High-speed fibre ready",
      "Washrooms within premises",
      "Covered car parking",
      "24x7 security & CCTV",
    ],
    summary:
      "Thirty managed desks and four private cabins on Ambadi Road, on flexible eleven-month terms with everything included.",
    description: [
      "A managed floor offering thirty open desks and four four-seat private cabins, with a meeting room, a pantry and a phone booth. Pricing is all-inclusive of electricity, internet, housekeeping and the meeting-room allowance.",
      "Pearl Plaza is on Ambadi Road, a seven-minute auto ride from Vasai Road station. Terms run eleven months with a two-month deposit; single cabins can be taken on a three-month commitment.",
    ],
    media: media([
      ["photo-1497215728101-856f4ea42174", "Open desk area"],
      ["photo-1497604401993-f2e922e5cb0a", "Private cabin"],
      ["photo-1497366216548-37526070297c", "Meeting room"],
    ]),
    owner_id: "o-508",
    created_at: "2026-09-07",
    view_count: 1230,
    enquiry_count: 40,
  }),

  listing({
    id: "p-016",
    slug: "2-bhk-palghar-west-new-launch",
    title: "2 BHK in Shree Siddhi Enclave, Palghar West",
    type: "apartment",
    category: "new_project",
    purpose: "buy",
    locality: "Palghar West",
    address: "Shree Siddhi Enclave, Mahim Road, Palghar West 401404",
    building_name: "Shree Siddhi Enclave",
    pincode: "401404",
    rera_number: "P99000072455",
    price: 4_950_000,
    area_sqft: 890,
    carpet_area_sqft: 625,
    floor: "6th of 12",
    bedrooms: 2,
    bathrooms: 2,
    balconies: 1,
    possession: "under_construction",
    possession_by: "2028-03-31",
    amenities: [
      "Lift",
      "Covered car parking",
      "Children's play area",
      "Garden / open space",
      "Power backup",
      "24x7 security & CCTV",
    ],
    summary:
      "A RERA-registered 2 BHK on Mahim Road, Palghar West, with possession committed for March 2028 and a subvention plan available.",
    description: [
      "A 625 sq.ft. carpet 2 BHK on the sixth floor of a twelve-storey tower on Mahim Road, with a west-facing living room, a utility balcony and provision for a washing machine point off the kitchen.",
      "The project is registered under MahaRERA number P99000072455. Excavation and the first four slabs are complete, with possession committed for March 2028. A subvention plan is available on bookings in the launch phase.",
    ],
    media: media([
      ["photo-1545324418-cc1a3fa10c00", "Tower under construction"],
      ["photo-1554995207-c18c203602cb", "Show-flat living room"],
      ["photo-1600585154340-be6161a56a0c", "Show-flat bedroom"],
    ]),
    owner_id: "o-221",
    created_at: "2026-09-27",
    view_count: 2480,
    enquiry_count: 83,
  }),
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
        // A residential buyer is never shown a godown as "similar".
        (p.segment === property.segment ? 4 : 0) +
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
  /** "residential" | "commercial". Empty means both. */
  segment?: string;
  type?: string;
  /** New project / ready to move / resale. */
  category?: string;
  /** Station micro-market name, e.g. "Virar West". */
  market?: string;
  zone?: string;
  purpose?: string;
  budget?: string;
  area?: string;
  /** Minimum bedroom count, as a string. "5" means 5 and above. */
  bhk?: string;
  possession?: string;
  sort?: (typeof SORT_OPTIONS)[number]["value"];
}

/** Effective comparison value for sorting/filtering across sale and rental stock. */
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
  const minBhk = filters.bhk ? Number(filters.bhk) : null;
  // A zone filter widens to every micro-market inside it.
  const zoneMarkets = filters.zone
    ? marketsInZone(filters.zone as Property["zone"])
    : null;

  const result = list.filter((p) => {
    if (filters.segment && p.segment !== filters.segment) return false;
    if (filters.type && p.type !== filters.type) return false;
    if (filters.category && p.category !== filters.category) return false;
    if (filters.market && p.locality !== filters.market) return false;
    if (zoneMarkets && !zoneMarkets.includes(p.locality)) return false;
    if (filters.purpose && p.purpose !== filters.purpose) return false;
    if (filters.possession && p.possession !== filters.possession) return false;

    // "3 BHK" means three bedrooms or more — a buyer filtering on 3 wants the
    // 4 BHK shown too. Stock with no bedroom count (land, godowns) drops out.
    if (minBhk !== null) {
      if (p.bedrooms == null) return false;
      if (p.bedrooms < minBhk) return false;
    }

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
        p.building_name ?? "",
        p.rera_number ?? "",
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
