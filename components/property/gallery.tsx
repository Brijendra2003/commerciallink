"use client";

import { useState } from "react";
import { Photo } from "@/components/ui/photo";
import type { PropertyMedia } from "@/lib/types";

export function Gallery({
  media,
  title,
}: {
  media: PropertyMedia[];
  title: string;
}) {
  const images = media.filter((m) => m.type === "image");
  const [index, setIndex] = useState(0);

  if (images.length === 0) return null;

  const active = images[index];

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-4xl bg-brand-100 shadow-soft">
        <Photo
          key={active.id}
          publicId={active.cloudinary_public_id}
          alt={active.alt}
          sizes="(max-width: 1024px) 100vw, 760px"
          priority
          width={1400}
        />
        <span className="absolute bottom-4 right-4 rounded-full bg-brand-900/80 px-3 py-1.5 text-[0.6875rem] font-semibold text-sand-50 backdrop-blur-sm">
          {index + 1} / {images.length}
        </span>
      </div>

      {images.length > 1 ? (
        <ul className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((m, i) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`View image ${i + 1} of ${title}`}
                aria-current={i === index}
                className={`relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-brand-100 transition-all duration-200 ${
                  i === index
                    ? "ring-2 ring-clay-500 ring-offset-2 ring-offset-sand-50"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <Photo
                  publicId={m.cloudinary_public_id}
                  alt={m.alt}
                  sizes="160px"
                  width={400}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
