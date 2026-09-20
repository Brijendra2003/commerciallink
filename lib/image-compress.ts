/**
 * Browser-side image downsizing.
 *
 * Phone photos run 4–12 MB and listing media is capped at 2 MB per image, so
 * without this almost every real submission would be rejected. Each pass drops
 * the long edge and the JPEG quality until the encode fits, rather than
 * guessing a single quality that is wrong in both directions.
 */

const PASSES: { maxEdge: number; quality: number }[] = [
  { maxEdge: 2400, quality: 0.86 },
  { maxEdge: 2000, quality: 0.8 },
  { maxEdge: 1700, quality: 0.74 },
  { maxEdge: 1400, quality: 0.68 },
  { maxEdge: 1200, quality: 0.6 },
];

async function encode(
  bitmap: ImageBitmap,
  maxEdge: number,
  quality: number,
  name: string,
): Promise<File | null> {
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality),
  );
  if (!blob) return null;

  return new File([blob], name.replace(/\.[^.]+$/, "") + ".jpg", {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

/**
 * Returns a file at or under `maxBytes`, or the smallest encode achieved if
 * even the last pass overshoots — the caller reports that as a rejection with
 * the real size, which is more useful than a silent upload failure.
 */
export async function compressImage(
  file: File,
  maxBytes: number,
): Promise<File> {
  if (!file.type.startsWith("image/") || typeof createImageBitmap !== "function") {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  try {
    // Already small and no bigger than the largest pass would make it.
    if (file.size <= maxBytes && Math.max(bitmap.width, bitmap.height) <= PASSES[0].maxEdge) {
      return file;
    }

    let best = file;
    for (const pass of PASSES) {
      const candidate = await encode(bitmap, pass.maxEdge, pass.quality, file.name);
      if (!candidate) break;
      if (candidate.size < best.size) best = candidate;
      if (candidate.size <= maxBytes) return candidate;
    }
    return best;
  } finally {
    bitmap.close();
  }
}
