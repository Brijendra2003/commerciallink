"use client";

import Image from "next/image";
import { useState } from "react";
import { imageUrl } from "@/lib/format";

/**
 * next/image wrapper that degrades to a tinted plate instead of a broken-image
 * glyph. Property photography is remote (Cloudinary in production, Unsplash
 * here), so a single 404 should never leave a hole in a listing grid.
 */
export function Photo({
  publicId,
  alt,
  className = "",
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
  width = 1200,
}: {
  publicId: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  width?: number;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-brand-100 ${className}`}
        role="img"
        aria-label={alt}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-10 w-10 text-brand-500/45"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 21h18M5 21V5.5A1.5 1.5 0 0 1 6.5 4h7A1.5 1.5 0 0 1 15 5.5V21M15 10h3.5A1.5 1.5 0 0 1 20 11.5V21M8 8h4M8 12h4M8 16h4" />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={imageUrl(publicId, width)}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
