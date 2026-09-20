import "server-only";

import { createHash, randomUUID } from "node:crypto";

/**
 * Cloudinary media pipeline.
 *
 * Listing photos and videos are uploaded **straight from the browser** to
 * Cloudinary against a short-lived signature minted here. Nothing large touches
 * the server action body, which is what makes 15 MB videos viable at all — a
 * serverless request body is capped well below that on most hosts.
 *
 * Because the browser talks to Cloudinary directly, an upload result it reports
 * back is untrusted input. `verifyAsset` re-reads every claimed public_id from
 * the Admin API before a row is written, so size, type and folder are taken
 * from Cloudinary rather than from the client.
 */

import {
  KIND_FOLDER,
  LIMIT,
  MAX_FLOOR_PLANS,
  MAX_PHOTOS,
  MAX_VIDEOS,
  RESOURCE_TYPE,
  type MediaKind,
} from "@/lib/media";

/** Everything this account stores for listings lives under one root folder. */
export const MEDIA_ROOT = "All Properties Assets";

/** Uploads land here first and are filed into the property's folder on submit,
 *  so an abandoned form never leaves debris beside real listings. */
export const DRAFT_ROOT = `${MEDIA_ROOT}/_drafts`;

function readConfig() {
  const url = process.env.CLOUDINARY_URL ?? "";
  const parsed = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/.exec(url.trim());

  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_NAME ||
    parsed?.[3] ||
    "";
  const apiKey = process.env.CLOUDINARY_API_KEY || parsed?.[1] || "";
  // The project's .env.local spells this CLOUDINARY_API_SECRETE; both are read
  // so a corrected variable name keeps working.
  const apiSecret =
    process.env.CLOUDINARY_API_SECRET ||
    process.env.CLOUDINARY_API_SECRETE ||
    parsed?.[2] ||
    "";

  return { cloudName, apiKey, apiSecret };
}

export const cloudinaryConfig = readConfig();

export const isCloudinaryConfigured = Boolean(
  cloudinaryConfig.cloudName && cloudinaryConfig.apiKey && cloudinaryConfig.apiSecret,
);

/** Cloudinary treats these as path separators or wildcards — strip them. */
function sanitiseSegment(value: string, fallback: string): string {
  const cleaned = value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 60)
    .trim();
  return cleaned || fallback;
}

/**
 * The property's own folder, e.g.
 * `All Properties Assets/Grade-A office floor Sunteck Icon (PRP-2026-419883)`.
 *
 * The reference is part of the name so two listings with the same title never
 * share a folder, and so an operator can map a folder back to a row.
 */
export function propertyFolder(title: string, ref: string): string {
  const name = sanitiseSegment(title, "Untitled listing");
  return `${MEDIA_ROOT}/${name} (${sanitiseSegment(ref, "unreferenced")})`;
}

/** Where a kind's files sit inside a property folder. */
export function kindFolder(base: string, kind: MediaKind): string {
  return `${base}/${KIND_FOLDER[kind]}`;
}

/** A draft reference, issued when the form is opened and reused on submit. */
export function draftReference(): string {
  return `d-${randomUUID().slice(0, 12)}`;
}

/** Draft refs are echoed by the client, so they are validated before use in a
 *  folder path. */
export function isDraftReference(value: string): boolean {
  return /^d-[0-9a-f]{12}$/.test(value);
}

export function draftFolder(draftRef: string, kind: MediaKind): string {
  return `${DRAFT_ROOT}/${draftRef}/${KIND_FOLDER[kind]}`;
}

export function signParams(params: Record<string, string | number>): string {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1")
    .update(payload + cloudinaryConfig.apiSecret)
    .digest("hex");
}

function authHeader(): string {
  const raw = `${cloudinaryConfig.apiKey}:${cloudinaryConfig.apiSecret}`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
}

export interface VerifiedAsset {
  publicId: string;
  resourceType: "image" | "video";
  format: string;
  bytes: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  folder: string;
}

/**
 * Reads an asset back from Cloudinary. Returns null when it does not exist,
 * which is also what a fabricated public_id produces.
 */
export async function verifyAsset(
  publicId: string,
  resourceType: "image" | "video",
): Promise<VerifiedAsset | null> {
  const endpoint =
    `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}` +
    `/resources/${resourceType}/upload/${encodeURIComponent(publicId)}`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      headers: { Authorization: authHeader() },
      cache: "no-store",
    });
  } catch (error) {
    console.error("[cloudinary] resource lookup failed", error);
    return null;
  }

  if (!response.ok) return null;

  const body = (await response.json()) as {
    public_id?: string;
    format?: string;
    bytes?: number;
    width?: number;
    height?: number;
    duration?: number;
    asset_folder?: string;
    folder?: string;
  };

  if (!body.public_id) return null;

  return {
    publicId: body.public_id,
    resourceType,
    format: body.format ?? "",
    bytes: body.bytes ?? 0,
    width: body.width ?? null,
    height: body.height ?? null,
    duration: body.duration ?? null,
    folder: body.asset_folder ?? body.folder ?? body.public_id.split("/").slice(0, -1).join("/"),
  };
}

export interface IntakeAsset extends VerifiedAsset {
  kind: MediaKind;
}

/**
 * Turns the `media` field the browser posts into assets read back from
 * Cloudinary. Everything the client claims — size, type, location — is
 * discarded in favour of what the Admin API reports, and anything outside the
 * draft area is refused outright.
 */
export async function verifySubmittedMedia(
  raw: string,
): Promise<{ assets: IntakeAsset[]; error?: string }> {
  if (!raw.trim()) return { assets: [] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { assets: [], error: "We couldn't read the uploaded files. Please re-add them." };
  }
  if (!Array.isArray(parsed)) {
    return { assets: [], error: "We couldn't read the uploaded files. Please re-add them." };
  }

  const total = MAX_PHOTOS + MAX_VIDEOS + MAX_FLOOR_PLANS;
  if (parsed.length > total) {
    return { assets: [], error: `Attach at most ${total} files.` };
  }

  const claims: { kind: MediaKind; publicId: string }[] = [];
  const counts: Record<string, number> = {};

  for (const entry of parsed) {
    const item = entry as { kind?: unknown; publicId?: unknown };
    const kind = item.kind as MediaKind;
    const publicId = typeof item.publicId === "string" ? item.publicId : "";

    if (!kind || !(kind in KIND_FOLDER) || !publicId) {
      return { assets: [], error: "One of the uploaded files is not recognised. Please re-add it." };
    }
    if (!publicId.startsWith(`${DRAFT_ROOT}/`)) {
      return { assets: [], error: "One of the uploaded files is not recognised. Please re-add it." };
    }

    counts[kind] = (counts[kind] ?? 0) + 1;
    if (counts[kind] > LIMIT[kind].count) {
      return { assets: [], error: `Attach at most ${LIMIT[kind].count} files of that type.` };
    }
    claims.push({ kind, publicId });
  }

  const resolved = await Promise.all(
    claims.map(async (claim) => {
      const asset = await verifyAsset(claim.publicId, RESOURCE_TYPE[claim.kind]);
      return asset ? { ...asset, kind: claim.kind } : null;
    }),
  );

  const assets: IntakeAsset[] = [];
  for (const asset of resolved) {
    if (!asset) {
      return {
        assets: [],
        error: "An uploaded file is no longer available. Please re-add it and submit again.",
      };
    }
    if (asset.bytes > LIMIT[asset.kind].bytes) {
      return {
        assets: [],
        error: `"${asset.publicId.split("/").pop()}" is larger than the ${
          asset.kind === "video" ? "15 MB video" : "2 MB image"
        } limit.`,
      };
    }
    assets.push(asset);
  }

  return { assets };
}

/**
 * Files verified draft assets under the property's own folder. Returns the
 * new public_ids in the same order; a failed move keeps the original id so a
 * listing never loses its media over a housekeeping step.
 */
export async function fileUnderProperty(
  assets: IntakeAsset[],
  title: string,
  ref: string,
): Promise<IntakeAsset[]> {
  const base = propertyFolder(title, ref);
  const seen: Record<string, number> = {};

  const moved: IntakeAsset[] = [];
  for (const asset of assets) {
    const index = (seen[asset.kind] = (seen[asset.kind] ?? 0) + 1);
    const folder = kindFolder(base, asset.kind);
    const target = `${folder}/${asset.kind.replace("_", "-")}-${String(index).padStart(2, "0")}`;

    const publicId = await renameAsset(asset.publicId, target, asset.resourceType);
    // Second call: the Media Library tree keys off asset_folder, so without
    // this the file stays visible under _drafts however its id reads.
    await moveAssetFolder(publicId, folder, asset.resourceType);

    moved.push({ ...asset, publicId, folder });
  }
  return moved;
}

/** Best-effort removal. Used to roll back a failed submission and to clean up
 *  assets the owner removed from the form before submitting. */
export async function destroyAsset(
  publicId: string,
  resourceType: "image" | "video",
): Promise<boolean> {
  // Every parameter other than file, api_key and signature has to be signed —
  // omitting `invalidate` from the digest makes Cloudinary reject the call.
  const params = {
    invalidate: "true",
    public_id: publicId,
    timestamp: Math.floor(Date.now() / 1000),
  };

  const form = new FormData();
  for (const [key, value] of Object.entries(params)) form.set(key, String(value));
  form.set("api_key", cloudinaryConfig.apiKey);
  form.set("signature", signParams(params));

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/destroy`,
      { method: "POST", body: form, cache: "no-store" },
    );
    if (!response.ok) {
      console.error("[cloudinary] destroy rejected", publicId, await response.text());
      return false;
    }
    const body = (await response.json()) as { result?: string };
    return body.result === "ok";
  } catch (error) {
    console.error("[cloudinary] destroy failed", error);
    return false;
  }
}

/**
 * Removes a draft folder once its files have been filed elsewhere. Cloudinary
 * keeps empty folders, so without this `_drafts` would grow one entry per
 * submission forever. Best-effort: it fails harmlessly if files remain.
 */
export async function deleteDraftFolder(draftRef: string): Promise<void> {
  if (!isDraftReference(draftRef)) return;

  const encode = (path: string) => path.split("/").map(encodeURIComponent).join("/");
  // Sub-folders have to go before their parent.
  const folders = [
    ...Object.values(KIND_FOLDER).map((k) => `${DRAFT_ROOT}/${draftRef}/${k}`),
    `${DRAFT_ROOT}/${draftRef}`,
  ];

  for (const folder of folders) {
    try {
      await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/folders/${encode(folder)}`,
        { method: "DELETE", headers: { Authorization: authHeader() }, cache: "no-store" },
      );
    } catch {
      // A leftover empty folder is cosmetic; never fail a submission over it.
    }
  }
}

export async function destroyAssets(
  assets: { publicId: string; resourceType: "image" | "video" }[],
): Promise<void> {
  await Promise.all(assets.map((a) => destroyAsset(a.publicId, a.resourceType)));
}

/**
 * Moves an asset in the Media Library tree.
 *
 * This account uses Cloudinary's dynamic folders, where the tree follows an
 * asset's `asset_folder` and not its public_id — a rename on its own changes
 * the id while leaving the file sitting in the folder it was uploaded to.
 * Filing an asset therefore takes both calls.
 */
export async function moveAssetFolder(
  publicId: string,
  assetFolder: string,
  resourceType: "image" | "video",
): Promise<boolean> {
  const body = new FormData();
  body.set("asset_folder", assetFolder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}` +
        `/resources/${resourceType}/upload/${encodeURIComponent(publicId)}`,
      { method: "POST", headers: { Authorization: authHeader() }, body, cache: "no-store" },
    );
    if (!response.ok) {
      console.error("[cloudinary] asset_folder move failed", publicId, await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("[cloudinary] asset_folder move failed", error);
    return false;
  }
}

/**
 * Renames an already-uploaded asset. Used on submit: media is uploaded to a
 * draft folder, then filed under the property's real folder once the listing
 * row exists and the final title is known.
 */
export async function renameAsset(
  fromPublicId: string,
  toPublicId: string,
  resourceType: "image" | "video",
): Promise<string> {
  if (fromPublicId === toPublicId) return fromPublicId;

  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    from_public_id: fromPublicId,
    overwrite: "true",
    timestamp,
    to_public_id: toPublicId,
  };

  const form = new FormData();
  for (const [key, value] of Object.entries(params)) form.set(key, String(value));
  form.set("api_key", cloudinaryConfig.apiKey);
  form.set("signature", signParams(params));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/rename`,
    { method: "POST", body: form, cache: "no-store" },
  );

  if (!response.ok) {
    // A failed move is cosmetic — the asset is still usable where it landed.
    console.error("[cloudinary] rename failed", fromPublicId, await response.text());
    return fromPublicId;
  }

  const body = (await response.json()) as { public_id?: string };
  return body.public_id ?? fromPublicId;
}
