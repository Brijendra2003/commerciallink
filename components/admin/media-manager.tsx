"use client";

import { useState } from "react";
import { Photo } from "@/components/ui/photo";
import type { PropertyMedia } from "@/lib/types";

/**
 * Cloudinary media manager. Reorder is local state here; in production the drop
 * handler writes `sort_order` back to `property_media`, and uploads go through
 * a signed, time-limited upload preset rather than a raw API key.
 */
export function MediaManager({ media }: { media: PropertyMedia[] }) {
  const [items, setItems] = useState(
    media.filter((m) => m.type === "image").sort((a, b) => a.sort_order - b.sort_order),
  );
  const [dragging, setDragging] = useState<number | null>(null);

  const brochure = media.find((m) => m.type === "brochure");

  function drop(target: number) {
    if (dragging === null || dragging === target) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragging, 1);
      next.splice(target, 0, moved);
      return next;
    });
    setDragging(null);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[0.75rem] text-ink-500">
          {items.length} images · drag to reorder. The first is the listing
          cover.
        </p>
        <button
          type="button"
          className="rounded-full border border-brand-900/15 px-3.5 py-1.5 text-[0.6875rem] font-semibold text-brand-900 transition-colors hover:bg-sand-100"
        >
          Upload
        </button>
      </div>

      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {items.map((m, i) => (
          <li
            key={m.id}
            draggable
            onDragStart={() => setDragging(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => drop(i)}
            onDragEnd={() => setDragging(null)}
            className={`group/media relative aspect-[4/3] cursor-grab overflow-hidden rounded-xl bg-brand-100 ring-offset-2 ring-offset-white transition-all active:cursor-grabbing ${
              dragging === i ? "opacity-40 ring-2 ring-clay-500" : ""
            }`}
          >
            <Photo
              publicId={m.cloudinary_public_id}
              alt={m.alt}
              sizes="200px"
              width={400}
            />
            {i === 0 ? (
              <span className="absolute left-2 top-2 rounded-full bg-brand-900/85 px-2 py-0.5 text-[0.5625rem] font-bold uppercase tracking-wider text-sand-50">
                Cover
              </span>
            ) : null}
            <button
              type="button"
              aria-label={`Remove image ${i + 1}`}
              onClick={() =>
                setItems((prev) => prev.filter((x) => x.id !== m.id))
              }
              className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-ink-500 opacity-0 transition-opacity hover:text-clay-700 group-hover/media:opacity-100"
            >
              <svg
                viewBox="0 0 16 16"
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </li>
        ))}

        <li>
          <button
            type="button"
            className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-sand-300 text-ink-300 transition-colors hover:border-clay-300 hover:text-clay-600"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="text-[0.6875rem] font-semibold">Add</span>
          </button>
        </li>
      </ul>

      <div className="mt-4 rounded-2xl border border-sand-200 bg-sand-50 p-4">
        <p className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-ink-300">
          Documents
        </p>
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <span className="text-[0.8125rem] text-ink-500">
            {brochure
              ? "Brochure PDF attached — gated behind an enquiry."
              : "No brochure attached."}
          </span>
          <button
            type="button"
            className="shrink-0 rounded-full border border-brand-900/15 bg-white px-3.5 py-1.5 text-[0.6875rem] font-semibold text-brand-900 transition-colors hover:bg-sand-100"
          >
            {brochure ? "Replace" : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
