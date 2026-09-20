"use client";

import { useRef, useState, useTransition } from "react";
import { Photo } from "@/components/ui/photo";
import {
  MediaUploader,
  newDraftRef,
  type MediaItem,
} from "@/components/ui/media-uploader";
import {
  attachPropertyMedia,
  deletePropertyMedia,
  reorderPropertyMedia,
  uploadPropertyMedia,
  type AdminActionState,
} from "@/lib/admin-actions";
import { videoPosterUrl } from "@/lib/format";
import type { MediaKind, UploadedAsset } from "@/lib/media";
import type { PropertyMedia } from "@/lib/types";

/**
 * Listing media: upload, remove and drag-to-reorder, each persisted straight
 * away through the admin server actions. Sits inside the listing <form>, so
 * every control here is type="button" and the file inputs carry no `name`.
 *
 * Photos, videos and floor plans go from the browser to Cloudinary and are
 * then filed under the listing's folder, the same path the public listing
 * form uses. The brochure still posts to the private Supabase bucket.
 */
export function MediaManager({
  propertyRef,
  media,
}: {
  propertyRef: string;
  media: PropertyMedia[];
}) {
  const [items, setItems] = useState(() =>
    media.filter((m) => m.type === "image").sort((a, b) => a.sort_order - b.sort_order),
  );
  // Resync when the server sends a fresh list (after upload or delete).
  const [source, setSource] = useState(media);
  if (source !== media) {
    setSource(media);
    setItems(media.filter((m) => m.type === "image").sort((a, b) => a.sort_order - b.sort_order));
  }

  const plans = media.filter((m) => m.type === "floor_plan");
  const videos = media.filter((m) => m.type === "video");
  const brochure = media.find((m) => m.type === "brochure");

  const [dragging, setDragging] = useState<number | null>(null);
  const [status, setStatus] = useState<AdminActionState | null>(null);
  const [pending, startTransition] = useTransition();

  const brochureInput = useRef<HTMLInputElement>(null);

  function run(task: () => Promise<AdminActionState>) {
    startTransition(async () => {
      setStatus(await task());
    });
  }

  function onBrochure(list: FileList | null, input: HTMLInputElement | null) {
    if (!list || list.length === 0) return;
    const chosen = Array.from(list);
    if (input) input.value = "";
    run(async () => {
      const data = new FormData();
      for (const file of chosen) data.append("files", file);
      return uploadPropertyMedia(propertyRef, "brochure", data);
    });
  }

  function attach(assets: UploadedAsset[]) {
    run(() => attachPropertyMedia(propertyRef, assets));
  }

  function drop(target: number) {
    if (dragging === null || dragging === target) return;
    const next = [...items];
    const [moved] = next.splice(dragging, 1);
    next.splice(target, 0, moved);
    setItems(next);
    setDragging(null);
    run(() => reorderPropertyMedia(propertyRef, next.map((m) => m.id)));
  }

  function remove(id: string, label: string) {
    if (!window.confirm(`Remove ${label}? This deletes the file.`)) return;
    run(() => deletePropertyMedia(propertyRef, id));
  }

  return (
    <div aria-busy={pending}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.75rem] text-ink-500">
          {items.length} photos · drag to reorder. The first is the listing cover.
        </p>
        <p
          aria-live="polite"
          className={`text-[0.75rem] font-medium ${status?.ok === false ? "text-clay-700" : "text-brand-700"}`}
        >
          {pending ? "Working…" : status?.message}
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {items.map((m, i) => (
          <li
            key={m.id}
            draggable={!pending}
            onDragStart={() => setDragging(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => drop(i)}
            onDragEnd={() => setDragging(null)}
            className={`group/media relative aspect-[4/3] cursor-grab overflow-hidden rounded border border-sand-200 bg-sand-100 transition-all active:cursor-grabbing ${
              dragging === i ? "opacity-40 ring-2 ring-brand-600" : ""
            }`}
          >
            <Photo publicId={m.cloudinary_public_id} alt={m.alt} sizes="200px" width={400} />
            {i === 0 ? (
              <span className="absolute left-2 top-2 rounded bg-sand-2005 px-2 py-0.5 text-[0.5625rem] font-bold uppercase tracking-wider text-white">
                Cover
              </span>
            ) : null}
            <RemoveButton label={`Remove photo ${i + 1}`} onClick={() => remove(m.id, `photo ${i + 1}`)} />
          </li>
        ))}

      </ul>

      <div className="mt-4">
        <AttachUploader kind="image" label="Add photographs" onAttach={attach} busy={pending} />
      </div>

      <div className="mt-4 rounded-lg border border-sand-200 bg-sand-50 p-4">
        <p className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-ink-300">
          Video walkthroughs · {videos.length}
        </p>
        {videos.length > 0 ? (
          <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {videos.map((m, i) => (
              <li
                key={m.id}
                className="group/media relative aspect-[4/3] overflow-hidden rounded border border-sand-200 bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={videoPosterUrl(m.cloudinary_public_id, 400)}
                  alt={m.alt}
                  className="h-full w-full object-cover"
                />
                <RemoveButton
                  label={`Remove video ${i + 1}`}
                  onClick={() => remove(m.id, `video ${i + 1}`)}
                />
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-3">
          <AttachUploader kind="video" label="Add a walkthrough" onAttach={attach} busy={pending} />
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-sand-200 bg-sand-50 p-4">
        <p className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-ink-300">
          Floor plans · {plans.length}
        </p>
        {plans.length > 0 ? (
          <ul className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
            {plans.map((m, i) => (
              <li key={m.id} className="group/media relative aspect-[4/3] overflow-hidden rounded border border-sand-200 bg-white">
                <Photo publicId={m.cloudinary_public_id} alt={m.alt} sizes="160px" width={400} className="object-contain!" />
                <RemoveButton label={`Remove floor plan ${i + 1}`} onClick={() => remove(m.id, `floor plan ${i + 1}`)} />
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-3">
          <AttachUploader kind="floor_plan" label="Add floor plans" onAttach={attach} busy={pending} />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-sand-200 pt-4">
          <span className="text-[0.8125rem] text-ink-500">
            {brochure
              ? "Brochure PDF attached — gated behind an enquiry."
              : "No brochure attached."}
          </span>
          <span className="flex shrink-0 gap-2">
            {brochure ? (
              <SmallButton disabled={pending} onClick={() => remove(brochure.id, "the brochure")}>
                Remove
              </SmallButton>
            ) : null}
            <SmallButton disabled={pending} onClick={() => brochureInput.current?.click()}>
              {brochure ? "Replace" : "Upload"}
            </SmallButton>
          </span>
          <input
            ref={brochureInput}
            type="file"
            accept="application/pdf"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => onBrochure(e.target.files, e.currentTarget)}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Uploads to Cloudinary, then hands the finished assets to the server the
 * moment the last one lands — staff should not have to press a second button
 * to confirm what they just dropped in.
 */
function AttachUploader({
  kind,
  label,
  onAttach,
  busy,
}: {
  kind: MediaKind;
  label: string;
  onAttach: (assets: UploadedAsset[]) => void;
  busy: boolean;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [draftRef] = useState(newDraftRef);

  return (
    <div aria-busy={busy}>
      <MediaUploader
        kind={kind}
        label={label}
        draftRef={draftRef}
        value={items}
        onChange={setItems}
        // Attach as soon as the batch lands — staff should not need a second
        // button to confirm what they just dropped in.
        onBatchComplete={(assets) => {
          setItems([]);
          onAttach(assets);
        }}
      />
    </div>
  );
}

function SmallButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded border border-sand-300 bg-white px-3 py-1.5 text-[0.6875rem] font-semibold text-brand-900 transition-colors hover:bg-sand-100 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-ink-500 opacity-100 transition-opacity hover:text-clay-700 sm:opacity-0 sm:group-hover/media:opacity-100 sm:focus:opacity-100"
    >
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M4 4l8 8M12 4l-8 8" />
      </svg>
    </button>
  );
}
