"use client";

import { useState } from "react";
import { Photo } from "@/components/ui/photo";
import { videoPosterUrl, videoUrl } from "@/lib/format";
import type { PropertyMedia } from "@/lib/types";

/**
 * Photographs and video walkthroughs share one filmstrip: a video is another
 * slide rather than a separate widget, because an occupier scanning a listing
 * should not have to hunt for it.
 */
export function Gallery({ media, title }: { media: PropertyMedia[]; title: string }) {
  const slides = media.filter((m) => m.type === "image" || m.type === "video");
  const [index, setIndex] = useState(0);

  if (slides.length === 0) return null;

  const active = slides[Math.min(index, slides.length - 1)];
  const videoCount = slides.filter((m) => m.type === "video").length;

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-sand-200 bg-sand-100">
        {active.type === "video" ? (
          <video
            key={active.id}
            src={videoUrl(active.cloudinary_public_id)}
            poster={videoPosterUrl(active.cloudinary_public_id, 1400) || undefined}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full bg-brand-900 object-contain"
          >
            <track kind="captions" />
          </video>
        ) : (
          <>
            <Photo
              key={active.id}
              publicId={active.cloudinary_public_id}
              alt={active.alt}
              sizes="(max-width: 1024px) 100vw, 760px"
              priority
              width={1400}
            />
            <span className="absolute bottom-3 right-3 rounded bg-brand-900/75 px-2.5 py-1 text-[0.6875rem] font-semibold text-white tnum">
              {index + 1} / {slides.length}
            </span>
          </>
        )}
      </div>

      {slides.length > 1 ? (
        <ul className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {slides.map((m, i) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={
                  m.type === "video"
                    ? `Play video ${i + 1} of ${title}`
                    : `View image ${i + 1} of ${title}`
                }
                aria-current={i === index}
                className={`relative block aspect-[4/3] w-full overflow-hidden rounded border bg-sand-100 transition-opacity duration-150 ${
                  i === index
                    ? "border-brand-600 ring-1 ring-brand-600"
                    : "border-sand-200 opacity-75 hover:opacity-100"
                }`}
              >
                {m.type === "video" ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={videoPosterUrl(m.cloudinary_public_id, 400)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute inset-0 grid place-items-center bg-brand-900/35">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-brand-900">
                        <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden="true">
                          <path d="M5 3.5v9l8-4.5-8-4.5Z" fill="currentColor" />
                        </svg>
                      </span>
                    </span>
                  </>
                ) : (
                  <Photo
                    publicId={m.cloudinary_public_id}
                    alt={m.alt}
                    sizes="160px"
                    width={400}
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {videoCount > 0 ? (
        <p className="mt-2.5 text-[0.75rem] text-ink-300">
          Includes {videoCount} video walkthrough{videoCount === 1 ? "" : "s"}.
        </p>
      ) : null}
    </div>
  );
}
