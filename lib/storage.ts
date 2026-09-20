import "server-only";

import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Upload validation and Storage writes for listing media. Buckets are created
 * by supabase/migrations/0003_listing_details.sql.
 *
 * The browser's reported MIME type is not trusted: every file is sniffed by its
 * leading bytes, so a renamed executable cannot be stored as "photo.jpg".
 */

export const MEDIA_BUCKET = "property-media";
export const DOCUMENT_BUCKET = "property-documents";

/** Matches the product-wide cap in lib/media.ts and the bucket's own limit. */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_PDF_BYTES = 12 * 1024 * 1024;
export const MAX_PHOTOS = 12;
export const MAX_FLOOR_PLANS = 4;

type Kind = "jpeg" | "png" | "webp" | "pdf";

const EXT: Record<Kind, string> = { jpeg: "jpg", png: "png", webp: "webp", pdf: "pdf" };
const MIME: Record<Kind, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
};

function sniff(bytes: Uint8Array): Kind | null {
  const at = (i: number, ...sig: number[]) => sig.every((b, j) => bytes[i + j] === b);
  if (at(0, 0xff, 0xd8, 0xff)) return "jpeg";
  if (at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "png";
  if (at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) return "webp";
  if (at(0, 0x25, 0x50, 0x44, 0x46)) return "pdf";
  return null;
}

/** Non-empty File entries for a form key. An empty `<input type=file>` posts a
 *  zero-byte File, which is filtered out here. */
export function files(data: FormData, key: string): File[] {
  return data
    .getAll(key)
    .filter((v): v is File => typeof v === "object" && v !== null && "size" in v && v.size > 0);
}

export interface ValidatedFile {
  bytes: Uint8Array;
  kind: Kind;
  name: string;
}

export async function validateFiles(
  list: File[],
  { accept, maxBytes, maxCount, label }: {
    accept: "image" | "pdf";
    maxBytes: number;
    maxCount: number;
    label: string;
  },
): Promise<{ files: ValidatedFile[]; error?: string }> {
  if (list.length > maxCount) {
    return { files: [], error: `Attach at most ${maxCount} ${label}.` };
  }

  const out: ValidatedFile[] = [];
  for (const file of list) {
    if (file.size > maxBytes) {
      return {
        files: [],
        error: `"${file.name}" is larger than ${Math.round(maxBytes / 1024 / 1024)} MB.`,
      };
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = sniff(bytes);
    const ok = accept === "pdf" ? kind === "pdf" : kind !== null && kind !== "pdf";
    if (!kind || !ok) {
      return {
        files: [],
        error:
          accept === "pdf"
            ? `"${file.name}" is not a PDF.`
            : `"${file.name}" is not a JPG, PNG or WebP image.`,
      };
    }
    out.push({ bytes, kind, name: file.name });
  }
  return { files: out };
}

/** Uploads to `<bucket>/<folder>/<uuid>.<ext>` and returns the object path. */
export async function upload(
  supabase: SupabaseClient<Database>,
  bucket: string,
  folder: string,
  file: ValidatedFile,
): Promise<string> {
  const path = `${folder}/${randomUUID()}.${EXT[file.kind]}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file.bytes, {
    contentType: MIME[file.kind],
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export function publicUrl(supabase: SupabaseClient<Database>, path: string): string {
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Inverse of publicUrl — the object path for a stored media URL, or null for
 *  references that do not live in our bucket (e.g. seeded Unsplash ids). */
export function pathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
}
