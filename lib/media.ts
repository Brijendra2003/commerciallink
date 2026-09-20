/**
 * Media rules shared by the browser uploader and the server that verifies what
 * it produced. Kept free of server-only imports so both sides use one source
 * for the caps — a limit enforced in only one place drifts.
 */

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 15 * 1024 * 1024;
export const MAX_PHOTOS = 12;
export const MAX_VIDEOS = 3;
export const MAX_FLOOR_PLANS = 4;

export type MediaKind = "image" | "video" | "floor_plan";

/** Sub-folder per media kind, inside the property's own folder. */
export const KIND_FOLDER: Record<MediaKind, string> = {
  image: "images",
  video: "videos",
  floor_plan: "floor-plans",
};

export const RESOURCE_TYPE: Record<MediaKind, "image" | "video"> = {
  image: "image",
  video: "video",
  floor_plan: "image",
};

export const LIMIT: Record<MediaKind, { bytes: number; count: number }> = {
  image: { bytes: MAX_IMAGE_BYTES, count: MAX_PHOTOS },
  video: { bytes: MAX_VIDEO_BYTES, count: MAX_VIDEOS },
  floor_plan: { bytes: MAX_IMAGE_BYTES, count: MAX_FLOOR_PLANS },
};

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

export function acceptAttribute(kind: MediaKind): string {
  return (kind === "video" ? ACCEPTED_VIDEO_TYPES : ACCEPTED_IMAGE_TYPES).join(",");
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** What the browser reports back after a direct upload, and what the server
 *  then re-checks against Cloudinary. */
export interface UploadedAsset {
  kind: MediaKind;
  publicId: string;
  resourceType: "image" | "video";
  format: string;
  bytes: number;
  width: number | null;
  height: number | null;
  duration: number | null;
}
