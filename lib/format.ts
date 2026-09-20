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
 * Media references come in three shapes:
 *
 *  - a Cloudinary public_id with folders (`All Properties Assets/… /images/photo-01`)
 *    — everything uploaded through the listing form;
 *  - an absolute URL — legacy uploads served from Supabase Storage;
 *  - a bare Unsplash photo id — the seeded demo catalogue.
 */
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

/** Public ids carry spaces and brackets, so each segment is encoded. */
function encodePublicId(publicId: string): string {
  return publicId.split("/").map(encodeURIComponent).join("/");
}

function isCloudinaryId(publicId: string): boolean {
  return Boolean(CLOUD_NAME) && publicId.includes("/");
}

export function imageUrl(publicId: string, width = 1200): string {
  if (/^https?:\/\//.test(publicId)) return publicId;
  if (isCloudinaryId(publicId)) {
    return (
      `https://res.cloudinary.com/${CLOUD_NAME}/image/upload` +
      `/f_auto,q_auto,c_limit,w_${width}/${encodePublicId(publicId)}`
    );
  }
  return `https://images.unsplash.com/${publicId}?auto=format&fit=crop&w=${width}&q=75`;
}

/** Streamable MP4 rendition of an uploaded walkthrough. */
export function videoUrl(publicId: string): string {
  if (/^https?:\/\//.test(publicId)) return publicId;
  return (
    `https://res.cloudinary.com/${CLOUD_NAME}/video/upload` +
    `/f_auto,q_auto/${encodePublicId(publicId)}.mp4`
  );
}

/** Still frame two seconds in, used as the poster before playback starts. */
export function videoPosterUrl(publicId: string, width = 1200): string {
  if (/^https?:\/\//.test(publicId)) return "";
  return (
    `https://res.cloudinary.com/${CLOUD_NAME}/video/upload` +
    `/so_2,f_auto,q_auto,c_limit,w_${width}/${encodePublicId(publicId)}.jpg`
  );
}
