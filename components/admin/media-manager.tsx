"use client";

import { useRef, useState, useTransition } from "react";
import { Photo } from "@/components/ui/photo";
import {
  deletePropertyMedia,
  reorderPropertyMedia,
  uploadPropertyMedia,
  type AdminActionState,
} from "@/lib/admin-actions";
import { compressImage } from "@/lib/image-compress";
import type { PropertyMedia } from "@/lib/types";

type Kind = "image" | "floor_plan" | "brochure";

/**
 * Listing media: upload, remove and drag-to-reorder, each persisted straight
 * away through the admin server actions. Sits inside the listing <form>, so
 * every control here is type="button" and the file inputs carry no `name`.
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
  const brochure = media.find((m) => m.type === "brochure");

  const [dragging, setDragging] = useState<number | null>(null);
  const [status, setStatus] = useState<AdminActionState | null>(null);
  const [pending, startTransition] = useTransition();

  const photoInput = useRef<HTMLInputElement>(null);
  const planInput = useRef<HTMLInputElement>(null);
  const brochureInput = useRef<HTMLInputElement>(null);

  function run(task: () => Promise<AdminActionState>) {
    startTransition(async () => {
      setStatus(await task());
    });
  }

  function onFiles(kind: Kind, list: FileList | null, input: HTMLInputElement | null) {
    if (!list || list.length === 0) return;
    const chosen = Array.from(list);
    if (input) input.value = "";
    run(async () => {
      const data = new FormData();
      for (const file of chosen) {
        data.append("files", kind === "brochure" ? file : await compressImage(file));
      }
      return uploadPropertyMedia(propertyRef, kind, data);
    });
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
            className={`group/media relative aspect-[4/3] cursor-grab overflow-hidden rounded-xl bg-brand-100 transition-all active:cursor-grabbing ${
              dragging === i ? "opacity-40 ring-2 ring-brand-600" : ""
            }`}
          >
            <Photo publicId={m.cloudinary_public_id} alt={m.alt} sizes="200px" width={400} />
            {i === 0 ? (
              <span className="absolute left-2 top-2 rounded-full bg-brand-900/85 px-2 py-0.5 text-[0.5625rem] font-bold uppercase tracking-wider text-sand-50">
                Cover
              </span>
            ) : null}
            <RemoveButton label={`Remove photo ${i + 1}`} onClick={() => remove(m.id, `photo ${i + 1}`)} />
          </li>
        ))}

        <li>
          <button
            type="button"
            disabled={pending}
            onClick={() => photoInput.current?.click()}
            className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-sand-300 text-ink-300 transition-colors hover:border-brand-500 hover:text-brand-700 disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="text-[0.6875rem] font-semibold">Add photos</span>
          </button>
          <input
            ref={photoInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => onFiles("image", e.target.files, e.currentTarget)}
          />
        </li>
      </ul>

      <div className="mt-4 rounded-2xl border border-sand-200 bg-sand-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-ink-300">
            Floor plans · {plans.length}
          </p>
          <SmallButton disabled={pending} onClick={() => planInput.current?.click()}>
            Upload
          </SmallButton>
          <input
            ref={planInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => onFiles("floor_plan", e.target.files, e.currentTarget)}
          />
        </div>
        {plans.length > 0 ? (
          <ul className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
            {plans.map((m, i) => (
              <li key={m.id} className="group/media relative aspect-[4/3] overflow-hidden rounded-xl bg-white">
                <Photo publicId={m.cloudinary_public_id} alt={m.alt} sizes="160px" width={400} className="object-contain!" />
                <RemoveButton label={`Remove floor plan ${i + 1}`} onClick={() => remove(m.id, `floor plan ${i + 1}`)} />
              </li>
            ))}
          </ul>
        ) : null}

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
            onChange={(e) => onFiles("brochure", e.target.files, e.currentTarget)}
          />
        </div>
      </div>
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
