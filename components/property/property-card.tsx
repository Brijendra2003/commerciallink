import Link from "next/link";
import { Photo } from "@/components/ui/photo";
import { Arrow } from "@/components/ui/button";
import { AreaIcon, PinIcon, ShieldIcon } from "@/components/ui/icons";
import { formatArea, formatPrice } from "@/lib/format";
import {
  POSSESSION_LABEL,
  PROJECT_CATEGORY_LABEL,
  PROPERTY_TYPE_LABEL,
  isLandType,
  purposeLabel,
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
    <article className="group/card relative flex h-full flex-col overflow-hidden rounded-lg border border-sand-200 bg-white transition-colors duration-150 hover:border-brand-600">
      <div className="relative aspect-[4/3] overflow-hidden bg-sand-100">
        {cover ? (
          <Photo
            publicId={cover.cloudinary_public_id}
            alt={cover.alt}
            sizes={sizes}
            priority={priority}
            width={800}
          />
        ) : null}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <div className="flex flex-col items-start gap-1.5">
            <span className="rounded bg-brand-900/90 px-2 py-1 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-white">
              {purposeLabel(property.purpose, property.segment)}
            </span>
            {/* A new project is the one category a buyer must not mistake for
                ready stock, so it is called out on the photograph itself. */}
            {property.category === "new_project" ? (
              <span className="rounded bg-white/95 px-2 py-1 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-brand-700">
                New project
              </span>
            ) : null}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {property.verified ? (
              <span className="flex items-center gap-1 rounded bg-white/95 px-2 py-1 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-brand-700">
                <ShieldIcon className="h-3 w-3" />
                Verified
              </span>
            ) : null}
            {property.featured ? (
              <span className="rounded bg-gold-100 px-2 py-1 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-gold-600">
                Featured
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-ink-300">
          {PROPERTY_TYPE_LABEL[property.type]} · {property.id}
        </p>

        <h3 className="mt-2 font-display text-[1rem] font-semibold leading-snug tracking-[-0.01em] text-brand-900">
          <Link
            href={`/properties/${property.slug}`}
            className="transition-colors after:absolute after:inset-0 group-hover/card:text-brand-700"
          >
            {property.title}
          </Link>
        </h3>

        <p className="mt-1.5 flex items-center gap-1.5 text-[0.8125rem] text-ink-500">
          <PinIcon className="h-3.5 w-3.5 shrink-0 text-ink-300" />
          {property.locality}
        </p>

        {/* Specification strip. A home buyer screens on BHK first; a
            commercial occupier has no BHK to screen on, so that slot carries
            the possession status instead. */}
        <dl className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-sand-200 pt-3.5 text-[0.75rem]">
          <div className="flex items-center gap-1.5">
            <AreaIcon className="h-3.5 w-3.5 shrink-0 text-ink-300" />
            <dt className="sr-only">Area</dt>
            <dd className="text-ink-500 tnum">{formatArea(property.area_sqft)}</dd>
          </div>
          <div>
            {property.segment === "residential" &&
            !isLandType(property.type) &&
            property.bedrooms ? (
              <>
                <dt className="sr-only">Configuration</dt>
                <dd className="text-ink-500 tnum">{property.bedrooms} BHK</dd>
              </>
            ) : (
              <>
                <dt className="sr-only">Possession</dt>
                <dd className="text-ink-500">
                  {POSSESSION_LABEL[property.possession]}
                </dd>
              </>
            )}
          </div>
          <div className="col-span-2">
            <dt className="sr-only">Category</dt>
            <dd className="text-ink-300">
              {PROJECT_CATEGORY_LABEL[property.category]}
              {property.rera_number ? ` · RERA ${property.rera_number}` : ""}
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-sand-200 pt-3.5">
          <div>
            <p
              className={`font-display text-[1.125rem] font-semibold leading-none tracking-[-0.01em] tnum ${
                price.gated ? "text-ink-500" : "text-brand-800"
              }`}
            >
              {price.value}
            </p>
            {price.unit ? (
              <p className="mt-1.5 text-[0.6875rem] text-ink-300">{price.unit}</p>
            ) : null}
          </div>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded border border-sand-200 text-brand-700 transition-colors duration-150 group-hover/card:border-brand-700 group-hover/card:bg-brand-700 group-hover/card:text-white">
            <Arrow />
          </span>
        </div>
      </div>
    </article>
  );
}
