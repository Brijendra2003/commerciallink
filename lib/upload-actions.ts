"use server";

import { headers } from "next/headers";
import {
  cloudinaryConfig,
  destroyAsset,
  draftFolder,
  draftReference,
  isCloudinaryConfigured,
  isDraftReference,
  signParams,
  verifyAsset,
} from "@/lib/cloudinary";
import { LIMIT, RESOURCE_TYPE, type MediaKind } from "@/lib/media";

/**
 * Signature minting for browser-to-Cloudinary uploads.
 *
 * The signature is scoped to one folder and expires with Cloudinary's own
 * timestamp window, so a leaked ticket cannot be used to write anywhere else
 * in the account.
 */

const KINDS: MediaKind[] = ["image", "video", "floor_plan"];

/** Per-IP ceiling on tickets. A ticket is cheap, but it authorises an upload,
 *  so a scripted loop should not be able to mint them without bound. */
const RECENT = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60;

async function throttled(): Promise<boolean> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "local").split(",")[0]!.trim();
  const now = Date.now();
  const hits = (RECENT.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  RECENT.set(ip, hits);

  if (RECENT.size > 5_000) {
    for (const [key, times] of RECENT) {
      if (times.every((t) => now - t >= WINDOW_MS)) RECENT.delete(key);
    }
  }
  return hits.length > MAX_PER_WINDOW;
}

export interface UploadTicket {
  ok: true;
  /** Endpoint the browser POSTs the file to. */
  endpoint: string;
  /** Form fields that must accompany the file, exactly as given. */
  fields: Record<string, string>;
  draftRef: string;
  maxBytes: number;
}

export type UploadTicketResult = UploadTicket | { ok: false; message: string };

export async function createUploadTicket(input: {
  kind: MediaKind;
  draftRef?: string;
}): Promise<UploadTicketResult> {
  if (!isCloudinaryConfigured) {
    return {
      ok: false,
      message:
        "Media uploads are not configured on this deployment. Add the Cloudinary keys to .env.local.",
    };
  }

  if (!KINDS.includes(input.kind)) {
    return { ok: false, message: "Unsupported media type." };
  }

  if (await throttled()) {
    return { ok: false, message: "Too many uploads at once. Wait a minute and try again." };
  }

  const draftRef =
    input.draftRef && isDraftReference(input.draftRef) ? input.draftRef : draftReference();

  const resourceType = RESOURCE_TYPE[input.kind];
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = draftFolder(draftRef, input.kind);

  // Every signed parameter is returned to the caller verbatim: the signature
  // only matches if Cloudinary receives exactly this set. `asset_folder` is
  // what places the file in the Media Library tree on a dynamic-folders
  // account; `folder` sets the public_id prefix.
  const signed: Record<string, string | number> = {
    asset_folder: folder,
    folder,
    timestamp,
  };
  const signature = signParams(signed);

  return {
    ok: true,
    endpoint: `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/upload`,
    fields: {
      asset_folder: folder,
      folder,
      timestamp: String(timestamp),
      api_key: cloudinaryConfig.apiKey,
      signature,
    },
    draftRef,
    maxBytes: LIMIT[input.kind].bytes,
  };
}

/**
 * Removes an asset the owner deleted from the form before submitting. Scoped
 * to the draft area so this can never be pointed at a published listing's
 * media.
 */
export async function discardUpload(input: {
  publicId: string;
  kind: MediaKind;
}): Promise<{ ok: boolean }> {
  if (!isCloudinaryConfigured) return { ok: false };
  if (!KINDS.includes(input.kind)) return { ok: false };

  const resourceType = RESOURCE_TYPE[input.kind];
  const asset = await verifyAsset(input.publicId, resourceType);
  if (!asset) return { ok: false };

  if (!asset.publicId.startsWith("All Properties Assets/_drafts/")) {
    console.warn("[upload] refused to discard a non-draft asset", asset.publicId);
    return { ok: false };
  }

  return { ok: await destroyAsset(asset.publicId, resourceType) };
}
