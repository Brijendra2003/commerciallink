import Link from "next/link";
import { PropertyCard } from "@/components/property/property-card";
import { ButtonLink } from "@/components/ui/button";
import { Container, SectionHeading } from "@/components/ui/section";
import { getPublishedProperties } from "@/lib/data/queries";
import { SEGMENT_LABEL } from "@/lib/data/taxonomy";
import { describeError } from "@/lib/log";
import type { Property } from "@/lib/types";

/**
 * Every live project, on the home page.
 *
 * The site used to show six featured mandates and send everyone else to
 * /properties. On a corridor-sized book that is the wrong trade: a visitor who
 * has to click through to see any stock at all has no reason to believe there
 * is stock. So the whole published set renders here, newest first, split by
 * segment so a home buyer is not scrolling past godowns.
 *
 * `PAGE_CAP` is a page-weight guard, not a product decision. If the book grows
 * past it the overflow is one click away on /properties, and that is the point
 * at which this section should become a paginated or infinite-scroll view.
 */
const PAGE_CAP = 48;

export async function AllProjects() {
  // The homepage is statically generated; a database outage at build or
  // revalidation time should drop this section, not take the page down.
  let all: Property[] = [];
  try {
    all = await getPublishedProperties();
  } catch (error) {
    console.error("[home] project list unavailable:", describeError(error));
  }

  if (all.length === 0) return null;

  const residential = all.filter((p) => p.segment === "residential");
  const commercial = all.filter((p) => p.segment !== "residential");
  const shown = all.slice(0, PAGE_CAP);
  const overflow = all.length - shown.length;

  return (
    <section id="projects" className="scroll-mt-24 bg-sand-50 py-14 sm:py-16 lg:py-20">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            kicker="All live projects"
            title="Everything we have on the market,"
            accent="right here."
            lead="Residential and commercial, from Mira Road to Dahanu Road. Every
              project is verified by our team before it appears."
          />

          <dl className="flex shrink-0 gap-px overflow-hidden rounded-lg border border-sand-200 bg-sand-200">
            {[
              { value: all.length, label: "Live projects" },
              { value: residential.length, label: SEGMENT_LABEL.residential },
              { value: commercial.length, label: SEGMENT_LABEL.commercial },
            ].map((item) => (
              <div key={item.label} className="bg-white px-5 py-3.5 text-center">
                <dd className="font-display text-[1.25rem] font-semibold leading-none text-brand-800 tnum">
                  {item.value}
                </dd>
                <dt className="mt-1.5 text-[0.6875rem] leading-tight text-ink-500">
                  {item.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>

        {/* Split only when both sides have stock — a single-segment book reads
            better as one uninterrupted grid than as one group and one gap. */}
        {residential.length > 0 && commercial.length > 0 ? (
          <>
            <Group
              heading="Residential"
              href="/properties?segment=residential"
              items={residential.slice(0, PAGE_CAP)}
            />
            <Group
              heading="Commercial"
              href="/properties?segment=commercial"
              items={commercial.slice(0, PAGE_CAP)}
            />
          </>
        ) : (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((property, i) => (
              <li key={property.id}>
                <PropertyCard property={property} priority={i < 3} />
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-sand-200 pt-8">
          <ButtonLink href="/properties" size="lg" arrow>
            {overflow > 0
              ? `Browse all ${all.length} projects`
              : "Search and filter all projects"}
          </ButtonLink>
          <p className="text-center text-[0.8125rem] text-ink-500">
            Not seeing what you need?{" "}
            <Link
              href="/post-requirement"
              className="font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-900"
            >
              Post your requirement
            </Link>{" "}
            and we will match it against projects that have not gone live yet.
          </p>
        </div>
      </Container>
    </section>
  );
}

function Group({
  heading,
  href,
  items,
}: {
  heading: string;
  href: string;
  items: Property[];
}) {
  return (
    <div className="mt-10">
      <div className="mb-4 flex items-end justify-between gap-3 border-b border-sand-200 pb-3">
        <h3 className="font-display text-[1.125rem] font-semibold tracking-[-0.015em] text-brand-900">
          {heading}
          <span className="ml-2 text-[0.8125rem] font-normal text-ink-300 tnum">
            {items.length}
          </span>
        </h3>
        <Link
          href={href}
          className="text-[0.75rem] font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-900"
        >
          Filter {heading.toLowerCase()}
        </Link>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((property, i) => (
          <li key={property.id}>
            <PropertyCard property={property} priority={i < 3} />
          </li>
        ))}
      </ul>
    </div>
  );
}
