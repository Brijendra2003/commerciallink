import type { Metadata } from "next";
import Link from "next/link";
import { PropertyCard } from "@/components/property/property-card";
import { FilterBar, type Filters } from "@/components/listings/filter-bar";
import { ButtonLink } from "@/components/ui/button";
import { Container, Kicker } from "@/components/ui/section";
import { SearchIcon } from "@/components/ui/icons";
import { filterProperties } from "@/lib/data/queries";
import { PROPERTY_TYPE_LABEL, ZONE_LABEL } from "@/lib/data/taxonomy";
import type { PropertyType, Zone } from "@/lib/types";

export const metadata: Metadata = {
  title: "Commercial Properties for Lease & Sale",
  description:
    "Browse verified office, retail, warehouse, industrial, land and co-working mandates across the Mumbai Metropolitan Region — BKC, Lower Parel, Andheri, Powai, Thane, Navi Mumbai, Bhiwandi and Panvel.",
  alternates: { canonical: "/properties" },
};

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;

  const filters: Filters = {
    q: one(sp.q),
    type: one(sp.type),
    market: one(sp.market),
    zone: one(sp.zone),
    purpose: one(sp.purpose),
    budget: one(sp.budget),
    area: one(sp.area),
    possession: one(sp.possession),
    sort: one(sp.sort) || "newest",
  };

  const results = await filterProperties(filters);

  // A filtered view gets a heading that reads like the search, which is what
  // makes these URLs usable as long-tail landing pages.
  const typeLabel = filters.type
    ? PROPERTY_TYPE_LABEL[filters.type as PropertyType]
    : null;
  const place =
    filters.market ||
    (filters.zone ? ZONE_LABEL[filters.zone as Zone] : null) ||
    "Mumbai";
  const heading = [
    typeLabel ?? "Commercial property",
    filters.purpose === "lease" ? "for lease" : filters.purpose === "buy" ? "for sale" : null,
    `in ${place}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <section className="border-b border-sand-200 bg-white pb-8 pt-9 sm:pb-10 sm:pt-12">
        <Container>
          <Kicker className="mb-3">Live mandates</Kicker>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="max-w-2xl font-display text-[1.875rem] font-semibold leading-[1.12] tracking-[-0.025em] text-brand-900 sm:text-[2.25rem]">
                {heading}
              </h1>
              <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-ink-500">
                Every listing sits inside the MMR and is verified for title and
                approvals. Contact details stay with our desk — submit an enquiry
                and a named advisor responds.
              </p>
            </div>
            <p className="shrink-0 rounded-lg border border-sand-200 bg-sand-50 px-4 py-2.5 text-[0.8125rem] text-ink-500">
              <span className="font-display text-[1.25rem] font-semibold text-brand-800 tnum">
                {results.length}
              </span>{" "}
              {results.length === 1 ? "property" : "properties"} matched
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-9 sm:py-11">
        <FilterBar initial={filters} />

        {results.length > 0 ? (
          <>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((property, i) => (
                <li key={property.id}>
                  <PropertyCard property={property} priority={i < 3} />
                </li>
              ))}
            </ul>

            <div className="mt-10 rounded-lg border border-sand-200 bg-white px-7 py-8 text-center">
              <h2 className="font-display text-[1.1875rem] font-semibold tracking-[-0.015em] text-brand-900">
                Not seeing the right fit?
              </h2>
              <p className="mx-auto mt-2.5 max-w-md text-[0.875rem] leading-relaxed text-ink-500">
                About a third of what we transact is off-market. Submit your
                requirement and we will match it against stock that never
                reaches this page.
              </p>
              <div className="mt-6">
                <ButtonLink href="/post-requirement" arrow>
                  Submit a requirement
                </ButtonLink>
              </div>
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </Container>
    </>
  );
}

/**
 * The empty result is the highest-value moment on this page — the visitor has
 * stated intent and found nothing. It converts into a requirement, not a dead end.
 */
function EmptyState() {
  return (
    <div className="mt-8 rounded-lg border border-sand-200 bg-white px-7 py-12 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-lg border border-sand-200 bg-sand-50 text-brand-700">
        <SearchIcon className="h-5 w-5" />
      </span>
      <h2 className="mt-6 font-display text-[1.375rem] font-semibold leading-tight tracking-[-0.02em] text-brand-900">
        No live listing matches that brief
      </h2>
      <p className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed text-ink-500">
        That is worth telling us about. Submit the requirement and our desk will
        work it against off-market mandates, upcoming completions and owner
        stock that has not gone live.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <ButtonLink href="/post-requirement" size="lg" arrow>
          Submit a requirement
        </ButtonLink>
        <Link
          href="/properties"
          className="rounded-lg border border-sand-300 bg-white px-6 py-3 text-sm font-semibold text-brand-900 transition-colors hover:bg-sand-100"
        >
          Clear all filters
        </Link>
      </div>
    </div>
  );
}
