import type {
  AdminUser,
  AuditEntry,
  Deal,
  Lead,
  LeadSource,
  LeadStatus,
  OwnerContact,
  Requirement,
} from "@/lib/admin-types";

/* ------------------------------------------------------------------ *
 * Labels & pipeline order
 * ------------------------------------------------------------------ */

/** Pipeline order matters — it drives the funnel, the Kanban and the ordinal ramp. */
export const LEAD_PIPELINE: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "site_visit",
  "negotiation",
  "won",
];

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  site_visit: "Site visit",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export const LEAD_SOURCE_LABEL: Record<LeadSource, string> = {
  organic: "Organic search",
  paid_ad: "Paid ads",
  referral: "Referral",
  whatsapp: "WhatsApp",
  brochure: "Brochure download",
  requirement: "Requirement listing",
};

/** Paid vs unpaid, for the acquisition split on the analytics page. */
export const PAID_SOURCES: LeadSource[] = ["paid_ad"];

export const admins: AdminUser[] = [
  {
    id: "a-1",
    name: "Nikhil Raut",
    initials: "NR",
    email: "nikhil@commerciallink.in",
    role: "super_admin",
    is_active: true,
    last_seen: "2026-09-05T09:14:00",
  },
  {
    id: "a-2",
    name: "Priya Nair",
    initials: "PN",
    email: "priya@commerciallink.in",
    role: "sales_exec",
    is_active: true,
    last_seen: "2026-09-05T08:52:00",
  },
  {
    id: "a-3",
    name: "Imran Shaikh",
    initials: "IS",
    email: "imran@commerciallink.in",
    role: "sales_exec",
    is_active: true,
    last_seen: "2026-09-04T18:31:00",
  },
  {
    id: "a-4",
    name: "Ananya Bose",
    initials: "AB",
    email: "ananya@commerciallink.in",
    role: "sales_exec",
    is_active: true,
    last_seen: "2026-09-05T09:40:00",
  },
  {
    id: "a-5",
    name: "Dev Kulkarni",
    initials: "DK",
    email: "dev@commerciallink.in",
    role: "content_editor",
    is_active: true,
    last_seen: "2026-09-03T15:07:00",
  },
  {
    id: "a-6",
    name: "Rhea Kapoor",
    initials: "RK",
    email: "rhea@commerciallink.in",
    role: "sales_exec",
    is_active: false,
    last_seen: "2026-06-21T11:20:00",
  },
];

export function adminById(id: string): AdminUser | undefined {
  return admins.find((a) => a.id === id);
}

/* ------------------------------------------------------------------ *
 * Leads
 * ------------------------------------------------------------------ */

function lead(
  id: string,
  buyer_name: string,
  buyer_company: string,
  property_id: string | null,
  requirement_id: string | null,
  source: LeadSource,
  status: LeadStatus,
  assigned_to: string,
  value_estimate: number,
  created_at: string,
  last_activity_at: string,
  message: string,
  activities: [type: Lead["activities"][number]["type"], note: string, by: string, at: string][],
): Lead {
  const digits = id.replace(/\D/g, "").padStart(4, "0");
  return {
    id,
    property_id,
    requirement_id,
    buyer_name,
    buyer_company,
    buyer_phone: `+91 9${digits}0 ${digits}12`,
    buyer_email: `${buyer_name.split(" ")[0].toLowerCase()}@${buyer_company
      .toLowerCase()
      .replace(/[^a-z]/g, "")
      .slice(0, 12)}.com`,
    source,
    status,
    assigned_to,
    message,
    value_estimate,
    created_at,
    last_activity_at,
    activities: activities.map((a, i) => ({
      id: `${id}-act-${i}`,
      lead_id: id,
      type: a[0],
      note: a[1],
      created_by: a[2],
      created_at: a[3],
    })),
  };
}

export const leads: Lead[] = [
  lead(
    "L-2041", "Rohan Mehta", "Arclight Technologies", "p-001", null, "organic", "negotiation", "a-2",
    62_800_000, "2026-08-19", "2026-09-04",
    "We're consolidating three offices into one BKC floor. 180 seats, need warm shell with a 6-month fit-out window.",
    [
      ["created", "Enquiry submitted via listing page.", "system", "2026-08-19"],
      ["call", "Spoke to Rohan. Board has signed off on BKC. Budget confirmed at ₹290/sqft ceiling.", "a-2", "2026-08-20"],
      ["site_visit", "Visited 14th floor with Rohan and their PM. Positive on the floor plate.", "a-2", "2026-08-28"],
      ["status_change", "Moved to Negotiation — landlord countered at ₹285 with 4 months rent-free.", "a-2", "2026-09-04"],
    ],
  ),
  lead(
    "L-2038", "Farhan Qureshi", "Nordwell Retail", "p-002", null, "referral", "site_visit", "a-3",
    28_700_000, "2026-08-23", "2026-09-03",
    "Need 90k sq.ft. warehousing near the Nashik highway by Q1. Racking to 12m.",
    [
      ["created", "Referral from Kotwal & Co.", "system", "2026-08-23"],
      ["call", "Qualified. Expansion is funded; decision with the COO.", "a-3", "2026-08-24"],
      ["email", "Sent Bhiwandi shortlist — 3 parks including ours.", "a-3", "2026-08-29"],
      ["site_visit", "Site visit scheduled for 11 Sept, 10:30am.", "a-3", "2026-09-03"],
    ],
  ),
  lead(
    "L-2047", "Sneha Iyer", "Kettle & Co.", "p-003", null, "paid_ad", "qualified", "a-4",
    7_500_000, "2026-08-30", "2026-09-04",
    "Looking at the Linking Road unit for our third outlet. Need the liquor licence position confirmed.",
    [
      ["created", "Enquiry from Google Ads campaign 'bandra-fnb-retail'.", "system", "2026-08-30"],
      ["call", "Two outlets running, third is funded. Confirmed licence is permissible on this address.", "a-4", "2026-09-02"],
      ["note", "Wants the mezzanine included in the demise — landlord is open.", "a-4", "2026-09-04"],
    ],
  ),
  lead(
    "L-2052", "Aditya Ranganathan", "Sahyadri Logistics", null, "R-118", "requirement", "new", "a-3",
    19_400_000, "2026-09-04", "2026-09-04",
    "Requirement: 40k+ sq.ft. warehousing in Panvel or Taloja, lease, within 3 months.",
    [["created", "Requirement listing submitted — no matching inventory at time of submission.", "system", "2026-09-04"]],
  ),
  lead(
    "L-2050", "Meera Joshi", "Lumen Diagnostics", "p-004", null, "organic", "contacted", "a-2",
    10_760_000, "2026-09-02", "2026-09-03",
    "Interested in the Andheri East fitted suite. We'd take the workstations as-is.",
    [
      ["created", "Enquiry submitted via listing page.", "system", "2026-09-02"],
      ["call", "Left voicemail.", "a-2", "2026-09-03"],
      ["whatsapp", "Sent brochure on WhatsApp — read, no reply yet.", "a-2", "2026-09-03"],
    ],
  ),
  lead(
    "L-2029", "Vikram Shetty", "Shetty Precision", "p-005", null, "organic", "won", "a-3",
    285_000_000, "2026-07-31", "2026-08-30",
    "Buying the Taloja shed. Need MPCB consent transfer confirmed before we go to the board.",
    [
      ["created", "Enquiry submitted via listing page.", "system", "2026-07-31"],
      ["call", "Qualified — cash buyer, no financing contingency.", "a-3", "2026-08-01"],
      ["site_visit", "Two visits with their plant head and a structural consultant.", "a-3", "2026-08-11"],
      ["note", "MPCB transfer confirmed by owner's consultant in writing.", "a-3", "2026-08-19"],
      ["status_change", "Won — agreement signed at ₹28.5 Cr.", "a-3", "2026-08-30"],
    ],
  ),
  lead(
    "L-2044", "Kabir Malhotra", "Northbridge Capital", "p-007", null, "brochure", "qualified", "a-2",
    94_000_000, "2026-08-27", "2026-09-01",
    "Downloaded the Panvel parcel brochure. Evaluating for a mixed-use scheme.",
    [
      ["created", "Brochure download — gated form completed.", "system", "2026-08-27"],
      ["call", "Fund has a Navi Mumbai airport-corridor mandate. Wants the NA order and demarcation report.", "a-2", "2026-08-29"],
      ["email", "NDA sent for the diligence file.", "a-2", "2026-09-01"],
    ],
  ),
  lead(
    "L-2049", "Tanvi Deshmukh", "Cobalt Studios", "p-006", null, "whatsapp", "contacted", "a-4",
    14_280_000, "2026-09-01", "2026-09-02",
    "220 seats in Powai — need to know if the operator will do a 3-year term.",
    [
      ["created", "WhatsApp enquiry to the desk number.", "system", "2026-09-01"],
      ["whatsapp", "Confirmed 3-year term is available at the quoted seat rate.", "a-4", "2026-09-02"],
    ],
  ),
  lead(
    "L-2035", "Harish Pillai", "Southgate Foods", "p-009", null, "referral", "site_visit", "a-4",
    15_780_000, "2026-08-21", "2026-09-02",
    "Cold chain expansion. Need to validate the ammonia plant redundancy.",
    [
      ["created", "Referral from an existing owner client.", "system", "2026-08-21"],
      ["call", "Qualified — three facilities already, this is the fourth.", "a-4", "2026-08-22"],
      ["site_visit", "Technical visit done with their refrigeration consultant. Awaiting report.", "a-4", "2026-09-02"],
    ],
  ),
  lead(
    "L-2053", "Nisha Agarwal", "Brightpath Education", null, "R-121", "requirement", "new", "a-2",
    8_900_000, "2026-09-05", "2026-09-05",
    "Requirement: 8–12k sq.ft. institutional-use office in Thane West, lease, immediate.",
    [["created", "Requirement listing submitted after an empty search.", "system", "2026-09-05"]],
  ),
  lead(
    "L-2046", "Gaurav Sethi", "Sethi Motors", "p-012", null, "paid_ad", "contacted", "a-3",
    10_750_000, "2026-08-29", "2026-09-01",
    "Wagle Estate flex unit — need 750 kVA confirmed before we shortlist.",
    [
      ["created", "Enquiry from Google Ads campaign 'thane-industrial'.", "system", "2026-08-29"],
      ["call", "Load availability confirmed with the park. Sending the sanction letter.", "a-3", "2026-09-01"],
    ],
  ),
  lead(
    "L-2031", "Deepa Krishnan", "Vantage Apparel", "p-010", null, "organic", "lost", "a-4",
    25_600_000, "2026-08-08", "2026-08-26",
    "Link Road showroom for a flagship. Escalator provision is essential.",
    [
      ["created", "Enquiry submitted via listing page.", "system", "2026-08-08"],
      ["call", "Qualified — flagship budget approved.", "a-4", "2026-08-10"],
      ["site_visit", "Visited. Liked the frontage, concerned about the capex on the shopfront.", "a-4", "2026-08-18"],
      ["status_change", "Lost — took a competing unit on Turner Road with a fitted shopfront.", "a-4", "2026-08-26"],
    ],
  ),
  lead(
    "L-2051", "Arjun Bhatt", "Helios Analytics", "p-011", null, "organic", "new", "a-2",
    54_800_000, "2026-09-03", "2026-09-03",
    "Lower Parel — are the three floors available as a single demise with the stair?",
    [["created", "Enquiry submitted via listing page.", "system", "2026-09-03"]],
  ),
  lead(
    "L-2048", "Ritu Chandra", "Chandra Exports", "p-008", null, "referral", "qualified", "a-2",
    41_200_000, "2026-08-31", "2026-09-03",
    "Whole-building purchase in Worli. Want the in-situ tenant's lease copy.",
    [
      ["created", "Referral from a channel partner.", "system", "2026-08-31"],
      ["call", "Qualified — buying for self-use plus the retained income.", "a-2", "2026-09-02"],
      ["email", "Requested the tenant lease and rent roll from the owner.", "a-2", "2026-09-03"],
    ],
  ),
  lead(
    "L-2054", "Sameer Kulkarni", "Fold Interiors", null, "R-123", "requirement", "new", "a-4",
    4_200_000, "2026-09-05", "2026-09-05",
    "Requirement: 3–5k sq.ft. creative studio space in Mumbai, lease, in 1–3 months.",
    [["created", "Requirement listing submitted from the navigation link.", "system", "2026-09-05"]],
  ),
  lead(
    "L-2042", "Leela Menon", "Ashwin Hospitality", "p-003", null, "brochure", "contacted", "a-4",
    6_240_000, "2026-08-25", "2026-08-31",
    "Downloaded the Linking Road brochure. Evaluating for a café-bar format.",
    [
      ["created", "Brochure download — gated form completed.", "system", "2026-08-25"],
      ["call", "Early stage. Following up after their board meeting on the 12th.", "a-4", "2026-08-31"],
    ],
  ),
  lead(
    "L-2026", "Anil Rao", "Rao Warehousing", "p-002", null, "organic", "won", "a-3",
    23_920_000, "2026-07-22", "2026-08-14",
    "Third-party logistics operator, needed 90k sq.ft. in Bhiwandi.",
    [
      ["created", "Enquiry submitted via listing page.", "system", "2026-07-22"],
      ["call", "Qualified immediately — existing 3PL with a signed client contract.", "a-3", "2026-07-23"],
      ["site_visit", "Visited twice, second time with the client's QA team.", "a-3", "2026-08-02"],
      ["status_change", "Won — 9-year lease signed at ₹26/sqft.", "a-3", "2026-08-14"],
    ],
  ),
  lead(
    "L-2045", "Pooja Sinha", "Verdant Wellness", "p-010", null, "paid_ad", "lost", "a-4",
    18_300_000, "2026-08-28", "2026-09-02",
    "Link Road showroom — budget didn't clear internally.",
    [
      ["created", "Enquiry from Google Ads campaign 'mumbai-retail-highstreet'.", "system", "2026-08-28"],
      ["call", "Qualified on need, not on budget. Ceiling is ₹180/sqft against a ₹240 ask.", "a-4", "2026-08-30"],
      ["status_change", "Lost — out of budget. Flagged for the next sub-₹200 unit we take on.", "a-4", "2026-09-02"],
    ],
  ),
  lead(
    "L-2036", "Yusuf Merchant", "Merchant & Sons", "p-005", null, "referral", "negotiation", "a-3",
    240_000_000, "2026-08-22", "2026-09-04",
    "Alternate buyer for the Taloja shed if the first falls through; also looking at Ambernath.",
    [
      ["created", "Referral from the property owner directly.", "system", "2026-08-22"],
      ["call", "Serious buyer, wants an Ambernath comparison before committing.", "a-3", "2026-08-25"],
      ["note", "Sent comparable transaction data for both MIDC estates.", "a-3", "2026-09-04"],
    ],
  ),
  lead(
    "L-2055", "Ishaan Verma", "Verma Cold Chain", null, "R-125", "requirement", "new", "a-3",
    12_600_000, "2026-09-05", "2026-09-05",
    "Requirement: cold storage, 25–40k sq.ft., Turbhe or Taloja, lease, immediate.",
    [["created", "Requirement listing submitted after viewing p-009.", "system", "2026-09-05"]],
  ),
  lead(
    "L-2039", "Alka Prasad", "Prasad Retail Group", "p-010", null, "organic", "qualified", "a-4",
    21_360_000, "2026-08-24", "2026-09-04",
    "Anchor showroom for a footwear brand. Ready to commit to 9 years for the right capex split.",
    [
      ["created", "Enquiry submitted via listing page.", "system", "2026-08-24"],
      ["call", "Qualified — 22 stores nationally, this would be their Mumbai flagship.", "a-4", "2026-08-26"],
      ["note", "Landlord open to a shopfront contribution. Drafting heads of terms.", "a-4", "2026-09-04"],
    ],
  ),
  lead(
    "L-2043", "Karthik Nambiar", "Zephyr Systems", "p-004", null, "whatsapp", "site_visit", "a-2",
    9_100_000, "2026-08-26", "2026-09-01",
    "Andheri East fitted suite — 110 workstations is close to what we need.",
    [
      ["created", "WhatsApp enquiry to the desk number.", "system", "2026-08-26"],
      ["call", "Qualified. Current lease expires 30 Nov, so timing works.", "a-2", "2026-08-27"],
      ["site_visit", "Visit done. Asked for a test fit at 130 seats.", "a-2", "2026-09-01"],
    ],
  ),
];

export function leadById(id: string): Lead | undefined {
  return leads.find((l) => l.id === id);
}

/* ------------------------------------------------------------------ *
 * Requirements
 * ------------------------------------------------------------------ */

export const requirements: Requirement[] = [
  {
    id: "R-118",
    buyer_name: "Aditya Ranganathan",
    buyer_company: "Sahyadri Logistics",
    buyer_phone: "+91 98200 21180",
    buyer_email: "aditya@sahyadrilogistics.com",
    property_type: "warehouse",
    city: "Mumbai",
    locality: "Bhiwandi / Panvel",
    budget_label: "₹26 – ₹34 / sq.ft. / month",
    area_sqft: 42000,
    purpose: "lease",
    timeline: "1 – 3 months",
    notes:
      "Needs 10m+ clear height and at least four docks. Client contract starts in January, so handover cannot slip past December.",
    status: "open",
    created_at: "2026-09-04",
    matched_property_ids: ["p-012"],
  },
  {
    id: "R-121",
    buyer_name: "Nisha Agarwal",
    buyer_company: "Brightpath Education",
    buyer_phone: "+91 98200 21210",
    buyer_email: "nisha@brightpath.edu.in",
    property_type: "office",
    city: "Mumbai",
    locality: "Thane West / Wagle Estate",
    budget_label: "₹90 – ₹120 / sq.ft. / month",
    area_sqft: 10000,
    purpose: "lease",
    timeline: "Immediate (within 30 days)",
    notes:
      "Institutional use — needs a landlord comfortable with a training-centre occupancy and a separate entrance for students.",
    status: "open",
    created_at: "2026-09-05",
    matched_property_ids: [],
  },
  {
    id: "R-123",
    buyer_name: "Sameer Kulkarni",
    buyer_company: "Fold Interiors",
    buyer_phone: "+91 98200 21230",
    buyer_email: "sameer@foldinteriors.com",
    property_type: "office",
    city: "Mumbai",
    locality: "Lower Parel / Dadar",
    budget_label: "₹1.5 – ₹2.5 L / month",
    area_sqft: 4000,
    purpose: "lease",
    timeline: "1 – 3 months",
    notes:
      "Creative studio — wants character space, mill compound or a converted floor. Not interested in a glass tower.",
    status: "open",
    created_at: "2026-09-05",
    matched_property_ids: [],
  },
  {
    id: "R-125",
    buyer_name: "Ishaan Verma",
    buyer_company: "Verma Cold Chain",
    buyer_phone: "+91 98200 21250",
    buyer_email: "ishaan@vermacoldchain.com",
    property_type: "warehouse",
    city: "Mumbai",
    locality: "Turbhe / Taloja MIDC",
    budget_label: "₹46 – ₹58 / sq.ft. / month",
    area_sqft: 32000,
    purpose: "lease",
    timeline: "Immediate (within 30 days)",
    notes:
      "Multi-temperature required, −25°C chambers essential. Will consider taking over an operating facility.",
    status: "matched",
    created_at: "2026-09-05",
    matched_property_ids: ["p-009"],
  },
  {
    id: "R-112",
    buyer_name: "Reena Sequeira",
    buyer_company: "Halcyon Partners",
    buyer_phone: "+91 98670 21120",
    buyer_email: "reena@halcyonpartners.in",
    property_type: "office",
    city: "Mumbai",
    locality: "BKC / Worli",
    budget_label: "₹250 – ₹300 / sq.ft. / month",
    area_sqft: 16000,
    purpose: "lease",
    timeline: "3 – 6 months",
    notes:
      "Boutique fund, 90 people. Wants a fitted floor or a landlord who will fund the fit-out against a longer term.",
    status: "matched",
    created_at: "2026-08-21",
    matched_property_ids: ["p-001", "p-011"],
  },
  {
    id: "R-104",
    buyer_name: "Manoj Thakur",
    buyer_company: "Thakur Distribution",
    buyer_phone: "+91 98330 21040",
    buyer_email: "manoj@thakurdist.com",
    property_type: "warehouse",
    city: "Mumbai",
    locality: "Bhiwandi",
    budget_label: "₹24 – ₹28 / sq.ft. / month",
    area_sqft: 85000,
    purpose: "lease",
    timeline: "1 – 3 months",
    notes: "Closed — took the Bhiwandi park unit under lead L-2026.",
    status: "closed",
    created_at: "2026-07-18",
    matched_property_ids: ["p-002"],
  },
];

export function requirementById(id: string): Requirement | undefined {
  return requirements.find((r) => r.id === id);
}

/* ------------------------------------------------------------------ *
 * Deals
 * ------------------------------------------------------------------ */

export const deals: Deal[] = [
  {
    id: "D-311", lead_id: "L-2029", property_id: "p-005",
    property_title: "Industrial Shed with Power Load, Taloja MIDC",
    client: "Shetty Precision", value: 285_000_000, commission_pct: 1.5,
    status: "won", closed_at: "2026-08-30", owner_id: "o-402",
    assigned_to: "a-3", payout_settled: false,
  },
  {
    id: "D-309", lead_id: "L-2026", property_id: "p-002",
    property_title: "Grade-A Logistics Warehouse, Bhiwandi",
    client: "Rao Warehousing", value: 28_704_000, commission_pct: 4,
    status: "won", closed_at: "2026-08-14", owner_id: "o-207",
    assigned_to: "a-3", payout_settled: true,
  },
  {
    id: "D-312", lead_id: "L-2041", property_id: "p-001",
    property_title: "Grade-A Office Floor, Bandra Kurla Complex",
    client: "Arclight Technologies", value: 62_928_000, commission_pct: 4,
    status: "in_progress", closed_at: null, owner_id: "o-114",
    assigned_to: "a-2", payout_settled: false,
  },
  {
    id: "D-313", lead_id: "L-2036", property_id: "p-005",
    property_title: "Industrial Shed with Power Load, Taloja MIDC",
    client: "Merchant & Sons", value: 240_000_000, commission_pct: 1.5,
    status: "in_progress", closed_at: null, owner_id: "o-402",
    assigned_to: "a-3", payout_settled: false,
  },
  {
    id: "D-305", lead_id: "L-2011", property_id: "p-004",
    property_title: "IT Park Office Suite, Andheri East",
    client: "Peregrine Software", value: 10_761_600, commission_pct: 4,
    status: "won", closed_at: "2026-07-19", owner_id: "o-118",
    assigned_to: "a-2", payout_settled: true,
  },
  {
    id: "D-301", lead_id: "L-1994", property_id: "p-008",
    property_title: "Boutique Office Building, Worli",
    client: "Sridhar Family Office", value: 196_000_000, commission_pct: 1.25,
    status: "won", closed_at: "2026-06-27", owner_id: "o-288",
    assigned_to: "a-2", payout_settled: true,
  },
  {
    id: "D-298", lead_id: "L-1981", property_id: "p-009",
    property_title: "Cold Storage Facility, Turbhe",
    client: "Konkan Freshline", value: 18_942_000, commission_pct: 4,
    status: "won", closed_at: "2026-05-30", owner_id: "o-611",
    assigned_to: "a-4", payout_settled: true,
  },
  {
    id: "D-310", lead_id: "L-2031", property_id: "p-010",
    property_title: "Anchor Showroom Space, Link Road",
    client: "Vantage Apparel", value: 25_632_000, commission_pct: 4,
    status: "lost", closed_at: "2026-08-26", owner_id: "o-724",
    assigned_to: "a-4", payout_settled: false,
  },
  {
    id: "D-294", lead_id: "L-1962", property_id: "p-003",
    property_title: "High-Street Retail Unit, Linking Road",
    client: "Baker's Dozen", value: 7_488_000, commission_pct: 4,
    status: "won", closed_at: "2026-04-22", owner_id: "o-331",
    assigned_to: "a-4", payout_settled: true,
  },
  {
    id: "D-290", lead_id: "L-1940", property_id: "p-011",
    property_title: "Contiguous Tower Floors, Lower Parel",
    client: "Cortex Capital", value: 109_620_000, commission_pct: 3,
    status: "won", closed_at: "2026-03-14", owner_id: "o-133",
    assigned_to: "a-2", payout_settled: true,
  },
];

/* ------------------------------------------------------------------ *
 * Owners
 * ------------------------------------------------------------------ */

export const owners: OwnerContact[] = [
  {
    id: "o-114", name: "Sanjay Kothari", company: "Kothari Realty LLP",
    phone: "+91 98200 11400", email: "sanjay@kotharirealty.in", city: "Mumbai",
    account_type: "broker", rera_number: "A51900001234",
    kyc_status: "verified", verified_at: "2026-03-11", property_ids: ["p-001"],
    notes: [
      { date: "2026-09-04", author: "Priya Nair", text: "Countered Arclight at ₹285 with 4 months rent-free. Will hold at that." },
      { date: "2026-08-28", author: "Priya Nair", text: "Approved the site visit for the 14th floor." },
    ],
  },
  {
    id: "o-207", name: "Deepak Bhandari", company: "Bhandari Logistics Parks",
    phone: "+91 98200 20700", email: "deepak@bhandariparks.com", city: "Mumbai",
    account_type: "developer", rera_number: "P99000031122",
    kyc_status: "verified", verified_at: "2026-01-19", property_ids: ["p-002"],
    notes: [
      { date: "2026-08-14", author: "Imran Shaikh", text: "Rao Warehousing lease signed. Brokerage invoice raised and settled." },
    ],
  },
  {
    id: "o-331", name: "Anita Phadke", company: "Phadke Estates",
    phone: "+91 98200 33100", email: "anita@phadkeestates.in", city: "Mumbai",
    account_type: "owner", rera_number: null,
    kyc_status: "verified", verified_at: "2026-02-04", property_ids: ["p-003"],
    notes: [
      { date: "2026-09-02", author: "Ananya Bose", text: "Confirmed a stepped rent is acceptable for an established F&B covenant." },
    ],
  },
  {
    id: "o-402", name: "Sunita Desai", company: "Desai Estates",
    phone: "+91 98200 40200", email: "sunita@desaiestates.in", city: "Mumbai",
    account_type: "owner", rera_number: null,
    kyc_status: "verified", verified_at: "2025-11-27", property_ids: ["p-005"],
    notes: [
      { date: "2026-08-30", author: "Imran Shaikh", text: "Agreement signed with Shetty Precision at ₹28.5 Cr. Payout pending." },
      { date: "2026-08-19", author: "Imran Shaikh", text: "MPCB transfer confirmed in writing by her consultant." },
    ],
  },
  {
    id: "o-509", name: "Harpreet Sandhu", company: "Sandhu Land Holdings",
    phone: "+91 98200 50900", email: "harpreet@sandhuholdings.in", city: "Mumbai",
    account_type: "owner", rera_number: null,
    kyc_status: "pending", verified_at: null, property_ids: ["p-007"],
    notes: [
      { date: "2026-09-01", author: "Priya Nair", text: "Chasing the mutation record — last item before KYC clears." },
    ],
  },
  {
    id: "o-611", name: "Bhavesh Patel", company: "Patel Cold Chain",
    phone: "+91 98200 61100", email: "bhavesh@patelcoldchain.com", city: "Mumbai",
    account_type: "owner", rera_number: null,
    kyc_status: "verified", verified_at: "2026-04-08", property_ids: ["p-009"],
    notes: [
      { date: "2026-09-05", author: "Imran Shaikh", text: "Open to a facility handover with chambers pulled down and validated." },
    ],
  },
  {
    id: "o-724", name: "Girish Hegde", company: "Hegde Properties",
    phone: "+91 98200 72400", email: "girish@hegdeproperties.in", city: "Mumbai",
    account_type: "broker", rera_number: "A51900004455",
    kyc_status: "verified", verified_at: "2026-05-16", property_ids: ["p-010"],
    notes: [
      { date: "2026-09-04", author: "Ananya Bose", text: "Will contribute to shopfront and escalator capex on a 9-year term." },
    ],
  },
  {
    id: "o-288", name: "Lakshmi Sridhar", company: "Sridhar Holdings",
    phone: "+91 98200 28800", email: "lakshmi@sridharholdings.in", city: "Mumbai",
    account_type: "owner", rera_number: null,
    kyc_status: "pending", verified_at: null, property_ids: ["p-008"],
    notes: [
      { date: "2026-09-03", author: "Priya Nair", text: "Requested the in-situ tenant lease copy and rent roll for Chandra Exports." },
    ],
  },
  {
    id: "o-118", name: "Rajiv Menon", company: "Menon Estates",
    phone: "+91 98200 11800", email: "rajiv@menonestates.in", city: "Mumbai",
    account_type: "owner", rera_number: null,
    kyc_status: "verified", verified_at: "2026-02-21", property_ids: ["p-004"],
    notes: [
      { date: "2026-09-01", author: "Priya Nair", text: "Happy to leave the workstations in situ for a tenant taking a 5-year term." },
    ],
  },
  {
    id: "o-133", name: "Ashwin Gokhale", company: "Gokhale Developers",
    phone: "+91 98200 13300", email: "ashwin@gokhaledev.in", city: "Mumbai",
    account_type: "developer", rera_number: "P99000077880",
    kyc_status: "verified", verified_at: "2026-06-02", property_ids: ["p-011"],
    notes: [
      { date: "2026-08-30", author: "Priya Nair", text: "Confirmed the interconnecting stair approval covers floors 18–20." },
    ],
  },
  {
    id: "o-155", name: "Zoya Merchant", company: "Merchant Workspace Co.",
    phone: "+91 98200 15500", email: "zoya@merchantworkspace.in", city: "Mumbai",
    account_type: "broker", rera_number: "A51900009901",
    kyc_status: "verified", verified_at: "2026-07-14", property_ids: ["p-006"],
    notes: [
      { date: "2026-09-02", author: "Ananya Bose", text: "Will hold the all-in seat rate for a 3-year commitment on the full floor." },
    ],
  },
  {
    id: "o-318", name: "Prakash Salvi", company: "Salvi Industrial Estates",
    phone: "+91 98200 31800", email: "prakash@salviestates.in", city: "Mumbai",
    account_type: "owner", rera_number: null,
    kyc_status: "pending", verified_at: null, property_ids: ["p-012"],
    notes: [
      { date: "2026-09-04", author: "Imran Shaikh", text: "Onboarded last week. Chasing the MIDC transfer letter before we publish." },
    ],
  },
];

export function ownerById(id: string): OwnerContact | undefined {
  return owners.find((o) => o.id === id);
}

/* ------------------------------------------------------------------ *
 * Audit log
 * ------------------------------------------------------------------ */

export const auditLog: AuditEntry[] = [
  { id: "au-1", actor: "Priya Nair", action: "Moved lead to Negotiation", target: "L-2041 · Arclight Technologies", created_at: "2026-09-04 17:22" },
  { id: "au-2", actor: "Dev Kulkarni", action: "Published listing", target: "p-006 · Managed Co-working Floor, Powai", created_at: "2026-09-04 15:08" },
  { id: "au-3", actor: "Nikhil Raut", action: "Approved owner submission", target: "p-012 · Flex Industrial Unit, Wagle Estate", created_at: "2026-09-04 11:47" },
  { id: "au-4", actor: "Ananya Bose", action: "Logged call", target: "L-2039 · Prasad Retail Group", created_at: "2026-09-04 10:15" },
  { id: "au-5", actor: "Imran Shaikh", action: "Marked deal Won", target: "D-311 · Shetty Precision", created_at: "2026-08-30 16:40" },
  { id: "au-6", actor: "Nikhil Raut", action: "Deactivated user", target: "Rhea Kapoor (sales_exec)", created_at: "2026-06-21 12:02" },
  { id: "au-7", actor: "Dev Kulkarni", action: "Updated SEO fields", target: "p-001 · Grade-A Office Floor, BKC", created_at: "2026-09-03 09:31" },
  { id: "au-8", actor: "Priya Nair", action: "Exported lead list (CSV)", target: "42 rows · filter: status=qualified", created_at: "2026-09-02 18:55" },
];

/* ------------------------------------------------------------------ *
 * Derived metrics
 * ------------------------------------------------------------------ */

/* All metrics take the lead list explicitly, so they work identically over the
   mock array and over rows fetched from Supabase. */

export function leadsByStatus(list: Lead[]): Record<LeadStatus, Lead[]> {
  const grouped = {} as Record<LeadStatus, Lead[]>;
  for (const status of [...LEAD_PIPELINE, "lost" as const]) {
    grouped[status] = list.filter((l) => l.status === status);
  }
  return grouped;
}

/**
 * Funnel counts are cumulative: a lead now in Negotiation was also Contacted
 * and Qualified on the way. Counting only the current stage would understate
 * every step and make the drop-off rates meaningless.
 */
export function funnelCounts(
  list: Lead[],
): { stage: LeadStatus; count: number }[] {
  const rank = (s: LeadStatus) =>
    s === "lost" ? -1 : LEAD_PIPELINE.indexOf(s);

  return LEAD_PIPELINE.map((stage, i) => ({
    stage,
    count: list.filter((l) => {
      // A lost lead still reached every stage up to where it died.
      if (l.status === "lost") {
        const reached = l.activities.some(
          (a) => a.type === "site_visit" || a.type === "status_change",
        )
          ? LEAD_PIPELINE.indexOf("site_visit")
          : LEAD_PIPELINE.indexOf("contacted");
        return reached >= i;
      }
      return rank(l.status) >= i;
    }).length,
  }));
}

export function leadsBySource(
  list: Lead[],
): { source: LeadSource; count: number }[] {
  return (Object.keys(LEAD_SOURCE_LABEL) as LeadSource[])
    .map((source) => ({
      source,
      count: list.filter((l) => l.source === source).length,
    }))
    .sort((a, b) => b.count - a.count);
}

/** Twelve months of lead volume, split paid vs unpaid. */
export const leadVolume = [
  { month: "Oct", organic: 21, paid: 9 },
  { month: "Nov", organic: 24, paid: 11 },
  { month: "Dec", organic: 18, paid: 8 },
  { month: "Jan", organic: 27, paid: 14 },
  { month: "Feb", organic: 31, paid: 13 },
  { month: "Mar", organic: 29, paid: 16 },
  { month: "Apr", organic: 34, paid: 15 },
  { month: "May", organic: 38, paid: 18 },
  { month: "Jun", organic: 36, paid: 21 },
  { month: "Jul", organic: 42, paid: 19 },
  { month: "Aug", organic: 47, paid: 23 },
  { month: "Sep", organic: 51, paid: 20 },
];

/** Closed brokerage revenue by month, in INR. */
export const revenueByMonth = [
  { month: "Oct", value: 1_480_000 },
  { month: "Nov", value: 2_240_000 },
  { month: "Dec", value: 960_000 },
  { month: "Jan", value: 2_810_000 },
  { month: "Feb", value: 1_920_000 },
  { month: "Mar", value: 3_288_600 },
  { month: "Apr", value: 299_520 },
  { month: "May", value: 757_680 },
  { month: "Jun", value: 2_450_000 },
  { month: "Jul", value: 430_464 },
  { month: "Aug", value: 5_423_160 },
  { month: "Sep", value: 1_180_000 },
];

export function pipelineValue(list: Lead[]): number {
  return list
    .filter((l) => !["won", "lost"].includes(l.status))
    .reduce((sum, l) => sum + l.value_estimate, 0);
}

export function conversionRate(list: Lead[]): number {
  const closed = list.filter((l) => ["won", "lost"].includes(l.status)).length;
  const won = list.filter((l) => l.status === "won").length;
  return closed === 0 ? 0 : (won / closed) * 100;
}

/** Lookup helpers built from a fetched list rather than the module-level mock. */
export function makeAdminLookup(list: AdminUser[]) {
  const map = new Map(list.map((a) => [a.id, a]));
  return (id: string) => map.get(id);
}

export function makeOwnerLookup(list: OwnerContact[]) {
  const map = new Map(list.map((o) => [o.id, o]));
  return (id: string) => map.get(id);
}
