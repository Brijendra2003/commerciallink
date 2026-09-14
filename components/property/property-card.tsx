import Link from "next/link";
import { Photo } from "@/components/ui/photo";
import { Arrow } from "@/components/ui/button";
import { AreaIcon, PinIcon, ShieldIcon } from "@/components/ui/icons";
import { formatArea, formatPrice } from "@/lib/format";
import {
  POSSESSION_LABEL,
  PROPERTY_TYPE_LABEL,
  PURPOSE_LABEL,
} from "@/lib/data/taxonomy";
import type { Property } from "@/lib/types";

export function PropertyCard({
  property,
  priority = false,
  sizes = "(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 360px",
}: {
  property: Property;
  priority?: boolean;
  sizes?: string;
}) {
  const price = formatPrice(property);
  const cover = property.media.find((m) => m.type === "image");

  return (
    <article className="group/card relative flex h-full flex-col overflow-hidden rounded-4xl border border-brand-900/7 bg-white shadow-soft transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-brand-900/12 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-100">
        {cover ? (
          <Photo
            publicId={cover.cloudinary_public_id}
            alt={cover.alt}
            sizes={sizes}
            priority={priority}
            width={800}
            className="transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.04]"
          />
        ) : null}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3.5">
          <span className="rounded-full bg-brand-900/85 px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-sand-50 backdrop-blur-sm">
            {PURPOSE_LABEL[property.purpose]}
          </span>
          {property.verified ? (
            <span className="flex items-center gap-1 rounded-full bg-white/92 px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-brand-700 backdrop-blur-sm">
              <ShieldIcon className="h-3 w-3" />
              Verified
            </span>
          ) : null}
        </div>

        {property.featured ? (
          <span className="absolute bottom-3.5 left-3.5 rounded-full bg-clay-500 px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-white">
            Featured
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="kicker text-clay-600">
          {PROPERTY_TYPE_LABEL[property.type]}
        </p>

        <h3 className="mt-2 font-display text-[1.0625rem] leading-snug tracking-[-0.01em] text-brand-900">
          <Link href={`/properties/${property.slug}`} className="after:absolute after:inset-0">
            {property.title}
          </Link>
        </h3>

        <p className="mt-2 flex items-center gap-1.5 text-[0.8125rem] text-ink-500">
          <PinIcon className="h-3.5 w-3.5 shrink-0 text-ink-300" />
          {property.locality}, {property.city}
        </p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-sand-200 pt-4 text-[0.75rem] text-ink-500">
          <span className="flex items-center gap-1.5">
            <AreaIcon className="h-3.5 w-3.5 text-ink-300" />
            {formatArea(property.area_sqft)}
          </span>
          <span className="text-ink-300">·</span>
          <span>{POSSESSION_LABEL[property.possession]}</span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p
              className={`font-display text-[1.25rem] leading-none tracking-[-0.01em] ${
                price.gated ? "text-ink-500" : "text-brand-800"
              }`}
            >
              {price.value}
            </p>
            {price.unit ? (
              <p className="mt-1.5 text-[0.6875rem] text-ink-300">{price.unit}</p>
            ) : null}
          </div>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sand-100 text-brand-800 transition-colors duration-300 group-hover/card:bg-clay-500 group-hover/card:text-white">
            <Arrow className="group-hover/card:translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
