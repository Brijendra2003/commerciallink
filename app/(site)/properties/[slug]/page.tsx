import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/property/gallery";
import { Photo } from "@/components/ui/photo";
import { PropertyCard } from "@/components/property/property-card";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { Container, Kicker } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import {
  AreaIcon,
  CalendarIcon,
  CheckIcon,
  DocumentIcon,
  PinIcon,
  ShieldIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";
import {
  getPropertyBySlug,
  getPublishedSlugs,
  getSimilarProperties,
} from "@/lib/data/queries";
import { formatArea, formatDate, formatPrice, imageUrl } from "@/lib/format";
import {
  FURNISHING_LABEL,
  POSSESSION_LABEL,
  PROPERTY_TYPE_LABEL,
  PURPOSE_LABEL,
} from "@/lib/data/taxonomy";
import { site } from "@/lib/data/site";

// Admin edits revalidate immediately; this catches changes made elsewhere.
export const revalidate = 300;

export async function generateStaticParams() {
  // Prerender whatever is published at build time; anything added later still
  // renders on demand. Falls back to the seeded catalogue in demo mode.
  try {
    const slugs = await getPublishedSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    // A build should not fail because the database blinked — the pages just
    // render on demand instead.
    console.error("[build] could not list slugs to prerender", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) return { title: "Property not found" };

  const cover = property.media.find((m) => m.type === "image");

  return {
    title: property.meta_title || `${property.title}, Mumbai`,
    description: property.meta_description || property.summary,
    alternates: { canonical: `/properties/${property.slug}` },
    openGraph: {
      title: `${property.title} — ${PURPOSE_LABEL[property.purpose]}`,
      description: property.summary,
      images: cover
        ? [{ url: imageUrl(cover.cloudinary_public_id, 1200), alt: cover.alt }]
        : undefined,
    },
  };
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) notFound();

  const price = formatPrice(property);
  const similar = await getSimilarProperties(property, 3);
  const cover = property.media.find((m) => m.type === "image");

  const inr = (n: number) => n.toLocaleString("en-IN");
  const floorLabel =
    property.floor && property.floor !== "—"
      ? property.total_floors
        ? `${property.floor} of ${property.total_floors}`
        : property.floor
      : null;

  // Optional specs render only when the listing has them.
  const specs = [
    { label: "Built-up area", value: formatArea(property.area_sqft) },
    { label: "Carpet area", value: formatArea(property.carpet_area_sqft) },
    { label: "Floor", value: floorLabel },
    { label: "Possession", value: POSSESSION_LABEL[property.possession] },
    { label: "Handover condition", value: FURNISHING_LABEL[property.furnishing] },
    { label: "Zoning", value: property.zoning || null },
    { label: "Asset class", value: PROPERTY_TYPE_LABEL[property.type] },
    {
      label: "Maintenance",
      value: property.maintenance_psf != null ? `₹${inr(property.maintenance_psf)} / sq.ft. / mo` : null,
    },
    {
      label: "Security deposit",
      value: property.security_deposit_months != null ? `${property.security_deposit_months} months` : null,
    },
    {
      label: "Lock-in",
      value: property.lock_in_months != null ? `${property.lock_in_months} months` : null,
    },
    {
      label: "Parking",
      value: property.parking_slots != null ? `${inr(property.parking_slots)} slots` : null,
    },
    {
      label: "Power load",
      value: property.power_load_kva != null ? `${inr(property.power_load_kva)} kVA` : null,
    },
    {
      label: "Ceiling height",
      value: property.ceiling_height_ft != null ? `${property.ceiling_height_ft} ft` : null,
    },
    {
      label: "Building age",
      value:
        property.property_age_years != null
          ? property.property_age_years === 0
            ? "New construction"
            : `${property.property_age_years} years`
          : null,
    },
    {
      label: "Available from",
      value: property.available_from ? formatDate(property.available_from) : null,
    },
    { label: "Listed", value: formatDate(property.created_at) },
  ].filter((s): s is { label: string; value: string } => Boolean(s.value));

  const floorPlans = property.media.filter((m) => m.type === "floor_plan");

  // RealEstateListing structured data — Section 8 of the brief.
  const listingSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.summary,
    url: `${site.url}/properties/${property.slug}`,
    datePosted: property.created_at,
    image: cover ? imageUrl(cover.cloudinary_public_id, 1200) : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: property.city,
      addressCountry: "IN",
    },
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.area_sqft,
      unitCode: "FTK",
    },
    ...(property.price !== null
      ? {
          offers: {
            "@type": "Offer",
            price: property.price,
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
    broker: { "@type": "RealEstateAgent", name: site.name, url: site.url },
  };

  const whatsappHref = `https://wa.me/${site.whatsapp.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
    `Hi CommercialLink — I'd like details on "${property.title}" (${property.id}).`,
  )}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema) }}
      />

      <Container className="py-7 sm:py-9">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-[0.75rem] text-ink-300">
            <li>
              <Link href="/" className="transition-colors hover:text-brand-700">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/properties" className="transition-colors hover:text-brand-700">
                Properties
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={`/properties?zone=${property.zone}`}
                className="transition-colors hover:text-brand-700"
              >
                {property.city}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-ink-500">{property.locality}</li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.55fr_1fr] lg:gap-12">
          {/* ---- Main column ---- */}
          <div>
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="rounded bg-brand-900 px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-white">
                {PURPOSE_LABEL[property.purpose]}
              </span>
              <span className="rounded border border-brand-100 bg-brand-50 px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-brand-700">
                {PROPERTY_TYPE_LABEL[property.type]}
              </span>
              {property.verified ? (
                <span className="flex items-center gap-1.5 rounded border border-gold-500/35 bg-gold-100 px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-gold-600">
                  <ShieldIcon className="h-3 w-3" />
                  Documents verified
                </span>
              ) : null}
            </div>

            <h1 className="font-display text-[1.75rem] font-semibold leading-[1.12] tracking-[-0.025em] text-brand-900 sm:text-[2.125rem]">
              {property.title}
            </h1>

            <p className="mt-3.5 flex items-center gap-2 text-[0.9375rem] text-ink-500">
              <PinIcon className="h-4 w-4 shrink-0 text-ink-300" />
              {property.address}
            </p>

            <div className="mt-8">
              <Gallery media={property.media} title={property.title} />
            </div>

            <section className="mt-10">
              <Kicker className="mb-3">The brief</Kicker>
              <p className="font-display text-[1.0625rem] font-medium leading-relaxed tracking-[-0.01em] text-brand-900">
                {property.summary}
              </p>
              <div className="mt-5 space-y-4">
                {property.description.map((para, i) => (
                  <p key={i} className="text-[0.9375rem] leading-relaxed text-ink-500">
                    {para}
                  </p>
                ))}
              </div>
            </section>

            <section className="mt-10">
              <Kicker className="mb-4">Key specifications</Kicker>
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-sand-200 bg-sand-200 sm:grid-cols-4">
                {specs.map((spec) => (
                  <div key={spec.label} className="bg-white px-4 py-4">
                    <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-300">
                      {spec.label}
                    </dt>
                    <dd className="mt-1.5 text-[0.875rem] font-semibold tracking-tight text-brand-900">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            {floorPlans.length > 0 ? (
              <section className="mt-10">
                <Kicker className="mb-4">Floor plans</Kicker>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {floorPlans.map((m) => (
                    <li
                      key={m.id}
                      className="relative aspect-[4/3] overflow-hidden rounded-lg border border-sand-200 bg-white"
                    >
                      <Photo
                        publicId={m.cloudinary_public_id}
                        alt={m.alt}
                        sizes="(max-width: 640px) 100vw, 380px"
                        width={900}
                        className="object-contain!"
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {property.amenities.length > 0 ? (
              <section className="mt-10">
                <Kicker className="mb-4">Amenities &amp; provisions</Kicker>
                <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {property.amenities.map((a) => (
                    <li
                      key={a}
                      className="flex items-center gap-2.5 text-[0.875rem] text-ink-500"
                    >
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                        <CheckIcon className="h-3 w-3" />
                      </span>
                      {a}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="mt-10 rounded-lg border border-sand-200 bg-white p-6">
              <div className="flex items-start gap-3">
                <DocumentIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <div>
                  <h2 className="text-[0.9375rem] font-semibold tracking-tight text-brand-900">
                    Document pack available on enquiry
                  </h2>
                  <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-500">
                    Title chain, approvals, floor plans and the brochure are
                    released once an enquiry is qualified — a condition of our
                    mandate with the owner, and the reason owners give us the
                    stock in the first place.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <a
                      href="#enquire"
                      className="rounded-lg bg-brand-700 px-5 py-2.5 text-[0.8125rem] font-semibold text-white transition-colors hover:bg-brand-800"
                    >
                      Request the pack
                    </a>
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-sand-300 bg-white px-5 py-2.5 text-[0.8125rem] font-semibold text-brand-900 transition-colors hover:bg-sand-100"
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                      Ask on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ---- Sticky enquiry rail ---- */}
          <div className="lg:relative">
            <div
              id="enquire"
              className="lg:sticky lg:top-[5.5rem] scroll-mt-24"
            >
              <div className="rounded-lg border border-sand-200 bg-white p-6 shadow-soft">
                <div className="mb-6 border-b border-sand-200 pb-6">
                  <p className="text-[0.6875rem] font-bold uppercase tracking-[0.13em] text-ink-300">
                    {property.purpose === "lease" ? "Asking rent" : "Asking price"}
                  </p>
                  <p
                    className={`mt-2 font-display text-[1.75rem] font-semibold leading-none tracking-[-0.02em] tnum ${
                      price.gated ? "text-ink-500" : "text-brand-800"
                    }`}
                  >
                    {price.value}
                  </p>
                  {price.unit ? (
                    <p className="mt-2 text-[0.75rem] text-ink-300">{price.unit}</p>
                  ) : null}

                  <div className="mt-5 flex items-center gap-4 text-[0.75rem] text-ink-500">
                    <span className="flex items-center gap-1.5">
                      <AreaIcon className="h-3.5 w-3.5 text-ink-300" />
                      {formatArea(property.area_sqft)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5 text-ink-300" />
                      {POSSESSION_LABEL[property.possession]}
                    </span>
                  </div>
                </div>

                <EnquiryForm
                  propertyId={property.id}
                  propertyTitle={property.title}
                  compact
                />
              </div>
            </div>
          </div>
        </div>
      </Container>

      {similar.length > 0 ? (
        <section className="border-t border-sand-200 bg-white py-14 sm:py-16">
          <Container>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Kicker className="mb-3">Comparable stock</Kicker>
                <h2 className="font-display text-[1.375rem] font-semibold leading-tight tracking-[-0.02em] text-brand-900 sm:text-[1.75rem]">
                  Similar space we are{" "}
                  <span className="text-brand-600">also holding.</span>
                </h2>
              </div>
              <ButtonLink href="/properties" variant="ghost" arrow>
                All properties
              </ButtonLink>
            </div>

            <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((p) => (
                <li key={p.id}>
                  <PropertyCard property={p} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}
    </>
  );
}
