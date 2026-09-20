"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { compressImage } from "@/lib/image-compress";
import { createUploadTicket, discardUpload } from "@/lib/upload-actions";
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  LIMIT,
  RESOURCE_TYPE,
  acceptAttribute,
  formatBytes,
  type MediaKind,
  type UploadedAsset,
} from "@/lib/media";

/**
 * Uploads listing media straight to Cloudinary and reports back the stored
 * asset. The file never passes through a server action, so a 15 MB video is
 * not bounded by the request body limit, and the owner sees real progress
 * instead of one long pending submit.
 */

export interface MediaItem {
  id: string;
  name: string;
  size: number;
  preview: string | null;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
  asset?: UploadedAsset;
}

export function completedAssets(items: MediaItem[]): UploadedAsset[] {
  return items
    .filter((i) => i.status === "done" && i.asset)
    .map((i) => i.asset as UploadedAsset);
}

export function isUploading(...lists: MediaItem[][]): boolean {
  return lists.some((list) => list.some((i) => i.status === "uploading"));
}

function localId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Groups one submission's uploads into a single Cloudinary draft folder. The
 * server validates this shape before it reaches a folder path, and mints its
 * own if it does not match.
 */
export function newDraftRef(): string {
  const bytes = new Uint8Array(6);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  return `d-${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

/** XHR rather than fetch: only XHR reports upload progress. */
function put(
  endpoint: string,
  form: FormData,
  onProgress: (pct: number) => void,
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText) as Record<string, unknown>;
        if (xhr.status >= 200 && xhr.status < 300) resolve(body);
        else {
          const error = body.error as { message?: string } | undefined;
          reject(new Error(error?.message ?? `Upload failed (${xhr.status}).`));
        }
      } catch {
        reject(new Error(`Upload failed (${xhr.status}).`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.onabort = () => reject(new Error("Upload cancelled."));
    xhr.send(form);
  });
}

export function MediaUploader({
  kind,
  label,
  hint,
  required = false,
  error,
  showCover = false,
  draftRef,
  value,
  onChange,
  onBatchComplete,
}: {
  kind: MediaKind;
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  showCover?: boolean;
  /** Shared across the pickers on one form, so all of its files land together. */
  draftRef: string;
  value: MediaItem[];
  /** Takes an updater, so async upload callbacks always see the latest list. */
  onChange: Dispatch<SetStateAction<MediaItem[]>>;
  /** Fired when a batch finishes with every file uploaded. */
  onBatchComplete?: (assets: UploadedAsset[]) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // Batch bookkeeping. Only ever touched from event handlers and async upload
  // callbacks, never during render.
  const inFlight = useRef(0);
  const batch = useRef<UploadedAsset[]>([]);

  const limit = LIMIT[kind];
  const isVideo = kind === "video";

  function update(id: string, patch: Partial<MediaItem>) {
    onChange((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  function settle(asset?: UploadedAsset) {
    if (asset) batch.current.push(asset);
    inFlight.current -= 1;
    if (inFlight.current > 0) return;

    const finished = batch.current;
    batch.current = [];
    if (finished.length > 0) onBatchComplete?.(finished);
  }

  // Object URLs are revoked when the component unmounts, not per removal, so a
  // preview stays valid while its tile animates away.
  useEffect(() => {
    const urls = value.map((i) => i.preview).filter((u): u is string => Boolean(u));
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function send(item: MediaItem, file: File) {
    const ticket = await createUploadTicket({ kind, draftRef });

    if (!ticket.ok) {
      update(item.id, { status: "error", error: ticket.message });
      settle();
      return;
    }

    const form = new FormData();
    for (const [key, val] of Object.entries(ticket.fields)) form.set(key, val);
    form.set("file", file);

    try {
      const body = await put(ticket.endpoint, form, (pct) =>
        update(item.id, { progress: pct }),
      );

      const publicId = String(body.public_id ?? "");
      if (!publicId) throw new Error("Cloudinary did not return a file id.");

      const asset: UploadedAsset = {
        kind,
        publicId,
        resourceType: RESOURCE_TYPE[kind],
        format: String(body.format ?? ""),
        bytes: Number(body.bytes ?? file.size),
        width: body.width == null ? null : Number(body.width),
        height: body.height == null ? null : Number(body.height),
        duration: body.duration == null ? null : Number(body.duration),
      };

      update(item.id, {
        status: "done",
        progress: 100,
        size: asset.bytes,
        asset,
      });
      settle(asset);
    } catch (cause) {
      update(item.id, {
        status: "error",
        error: cause instanceof Error ? cause.message : "Upload failed.",
      });
      settle();
    }
  }

  async function accept(list: FileList | null) {
    if (!list || list.length === 0) return;
    setLocalError(null);

    const room = limit.count - value.length;
    if (room <= 0) {
      setLocalError(`You can attach up to ${limit.count} ${label.toLowerCase()}.`);
      return;
    }

    const chosen = Array.from(list).slice(0, room);
    if (chosen.length < list.length) {
      setLocalError(`Only the first ${room} were added — the limit is ${limit.count}.`);
    }

    for (const raw of chosen) {
      const allowed = isVideo ? ACCEPTED_VIDEO_TYPES : ACCEPTED_IMAGE_TYPES;
      if (!allowed.includes(raw.type)) {
        setLocalError(
          isVideo
            ? `"${raw.name}" is not an MP4, MOV or WebM video.`
            : `"${raw.name}" is not a JPG, PNG or WebP image.`,
        );
        continue;
      }

      // Images are re-encoded to fit the cap; a video cannot be transcoded in
      // the browser, so an oversized one is refused with its actual size.
      const file = isVideo ? raw : await compressImage(raw, limit.bytes);

      if (file.size > limit.bytes) {
        setLocalError(
          isVideo
            ? `"${raw.name}" is ${formatBytes(raw.size)} — videos must be ${formatBytes(limit.bytes)} or smaller. Trim it, or upload a shorter walkthrough.`
            : `"${raw.name}" is still ${formatBytes(file.size)} after compression — the limit is ${formatBytes(limit.bytes)}.`,
        );
        continue;
      }

      const item: MediaItem = {
        id: localId(),
        name: raw.name,
        size: file.size,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: "uploading",
      };

      onChange((prev) => [...prev, item]);
      inFlight.current += 1;
      void send(item, file);
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(item: MediaItem) {
    onChange((prev) => prev.filter((i) => i.id !== item.id));
    setLocalError(null);
    // Uploaded but discarded: take it back off Cloudinary rather than leaving
    // an orphan in the draft folder.
    if (item.asset) {
      void discardUpload({ publicId: item.asset.publicId, kind });
    }
  }

  function move(index: number, delta: number) {
    onChange((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function retry(item: MediaItem) {
    setLocalError(null);
    // The original File is gone once the tile rendered, so a retry drops the
    // failed tile and re-opens the picker rather than silently doing nothing.
    onChange((prev) => prev.filter((i) => i.id !== item.id));
    inputRef.current?.click();
  }

  const shownError = localError ?? error;
  const full = value.length >= limit.count;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={inputId} className="block text-[0.8125rem] font-semibold text-ink-700">
          {label}
          {required ? (
            <span aria-hidden="true" className="ml-0.5 text-clay-600">
              *
            </span>
          ) : null}
        </label>
        <span className="text-[0.6875rem] text-ink-300 tnum">
          {value.length}/{limit.count} · max {formatBytes(limit.bytes)} each
        </span>
      </div>

      {value.length > 0 ? (
        <ul
          className={`mb-3 grid gap-2.5 ${
            isVideo ? "sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-3"
          }`}
        >
          {value.map((item, i) => (
            <li
              key={item.id}
              className="group/tile relative overflow-hidden rounded-lg border border-sand-200 bg-sand-100"
            >
              <div className="relative aspect-[4/3]">
                {item.preview && isVideo ? (
                  <video
                    src={item.preview}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : item.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.preview}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}

                {item.status === "uploading" ? (
                  <div className="absolute inset-0 grid place-items-center bg-sand-1005">
                    <div className="w-3/4">
                      <div className="h-1 overflow-hidden rounded-full bg-white/30">
                        <div
                          className="h-full bg-white transition-[width] duration-200"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-center text-[0.625rem] font-semibold text-white tnum">
                        {item.progress}%
                      </p>
                    </div>
                  </div>
                ) : null}

                {item.status === "error" ? (
                  <div className="absolute inset-0 grid place-items-center bg-clay-700/85 p-2 text-center">
                    <p className="text-[0.625rem] font-semibold leading-snug text-white">
                      {item.error}
                    </p>
                  </div>
                ) : null}

                {showCover && i === 0 && item.status === "done" ? (
                  <span className="absolute left-1.5 top-1.5 rounded bg-sand-2005 px-2 py-0.5 text-[0.5625rem] font-bold uppercase tracking-wider text-white">
                    Cover
                  </span>
                ) : null}

                {item.status === "done" ? (
                  <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-status-good text-white">
                    <svg
                      viewBox="0 0 16 16"
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m3.5 8.5 3 3 6-6.5" />
                    </svg>
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-1 border-t border-sand-200 bg-white px-2 py-1.5">
                <span className="min-w-0 flex-1 truncate text-[0.625rem] text-ink-500">
                  {item.name}
                  <span className="ml-1 text-ink-300 tnum">{formatBytes(item.size)}</span>
                </span>

                {item.status === "error" ? (
                  <IconButton label="Try another file" onClick={() => retry(item)}>
                    ↻
                  </IconButton>
                ) : null}
                {value.length > 1 && item.status === "done" ? (
                  <>
                    <IconButton
                      label="Move earlier"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                    >
                      ←
                    </IconButton>
                    <IconButton
                      label="Move later"
                      onClick={() => move(i, 1)}
                      disabled={i === value.length - 1}
                    >
                      →
                    </IconButton>
                  </>
                ) : null}
                <IconButton label={`Remove ${item.name}`} onClick={() => remove(item)}>
                  ×
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {!full ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void accept(e.dataTransfer.files);
          }}
        >
          <label
            htmlFor={inputId}
            className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
              dragging
                ? "border-brand-600 bg-brand-50"
                : shownError
                  ? "border-clay-500"
                  : "border-sand-300 hover:border-brand-500"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-ink-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {isVideo ? (
                <>
                  <rect x="2.5" y="6" width="13" height="12" rx="2" />
                  <path d="m15.5 12 6-3.5v11l-6-3.5" />
                </>
              ) : (
                <>
                  <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" />
                  <path d="M3.5 15v3a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-3" />
                </>
              )}
            </svg>
            <span className="text-[0.8125rem] font-semibold text-brand-900">
              {isVideo ? "Add a video walkthrough" : "Add files"}
              <span className="font-normal text-ink-500"> or drop them here</span>
            </span>
            <span className="text-[0.6875rem] text-ink-300">
              {isVideo
                ? `MP4, MOV or WebM · up to ${formatBytes(limit.bytes)} each`
                : `JPG, PNG or WebP · resized automatically to ${formatBytes(limit.bytes)}`}
            </span>
          </label>
        </div>
      ) : null}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={acceptAttribute(kind)}
        multiple={limit.count > 1}
        className="sr-only"
        onChange={(e) => void accept(e.target.files)}
      />

      {shownError ? (
        <p role="alert" className="mt-1.5 text-[0.75rem] font-medium text-clay-700">
          {shownError}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[0.75rem] leading-relaxed text-ink-300">{hint}</p>
      ) : null}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid h-5 w-5 shrink-0 place-items-center rounded border border-sand-200 text-[0.6875rem] text-ink-500 transition-colors hover:border-ink-300 hover:text-brand-800 disabled:opacity-35"
    >
      {children}
    </button>
  );
}
