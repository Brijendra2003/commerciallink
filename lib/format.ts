import type { Property } from "@/lib/types";

const inr = new Intl.NumberFormat("en-IN");

/** Indian market convention: lakh below a crore, crore above. */
export function formatINR(value: number): string {
  if (value >= 10_000_000) {
    const cr = value / 10_000_000;
    return `₹${cr % 1 === 0 ? cr : cr.toFixed(2).replace(/\.?0+$/, "")} Cr`;
  }
  if (value >= 100_000) {
    const lakh = value / 100_000;
    return `₹${lakh % 1 === 0 ? lakh : lakh.toFixed(2).replace(/\.?0+$/, "")} L`;
  }
  return `₹${inr.format(value)}`;
}

export function formatArea(sqft: number): string {
  return `${inr.format(sqft)} sq.ft.`;
}

/**
 * Headline price for a card or detail page. Returns "Price on request" for
 * gated listings — the soft gate described in Section 2.3 of the brief.
 */
export function formatPrice(property: Property): {
  value: string;
  unit: string | null;
  gated: boolean;
} {
  if (property.purpose === "lease" && property.rent_psf !== null) {
    return {
      value: `₹${inr.format(property.rent_psf)}`,
      unit: "per sq.ft. / month",
      gated: false,
    };
  }
  if (property.price !== null) {
    return { value: formatINR(property.price), unit: null, gated: false };
  }
  return { value: "Price on request", unit: null, gated: true };
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Media references are either an absolute URL (uploads served from Supabase
 * Storage) or a bare Unsplash photo id (the seeded catalogue).
 */
export function imageUrl(publicId: string, width = 1200): string {
  if (/^https?:\/\//.test(publicId)) return publicId;
  return `https://images.unsplash.com/${publicId}?auto=format&fit=crop&w=${width}&q=75`;
}
