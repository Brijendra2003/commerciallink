import Link from "next/link";
import { Arrow } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { PROPERTY_TYPE_ICON } from "@/components/ui/icons";
import { PROPERTY_TYPES } from "@/lib/data/taxonomy";
import { getPublishedProperties } from "@/lib/data/queries";
import { describeError } from "@/lib/log";

export async function AssetClasses() {
  // Counts are supporting detail; an unreachable database shows zeros, not an error.
  const all = await getPublishedProperties().catch((error) => {
    console.error("[home] listing counts unavailable:", describeError(error));
    return [];
  });

  return (
    <Section className="pt-16 sm:pt-20">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            kicker="Coverage"
            title="Six asset classes,"
            accent="one advisory desk."
            lead="Each class is run by advisors who transact in it weekly — not a
              generalist working from a listing feed."
          />
          <Link
            href="/properties"
            className="group/btn inline-flex shrink-0 items-center gap-2 text-[0.8125rem] font-semibold text-brand-700 transition-colors hover:text-brand-800"
          >
            View all properties
            <Arrow />
          </Link>
        </div>

        <ul className="mt-10 grid gap-px overflow-hidden rounded-lg border border-sand-200 bg-sand-200 sm:grid-cols-2 lg:grid-cols-3">
          {PROPERTY_TYPES.map((type) => {
            const Icon = PROPERTY_TYPE_ICON[type.value];
            const count = all.filter((p) => p.type === type.value).length;

            return (
              <li key={type.value}>
                <Link
                  href={`/properties?type=${type.value}`}
                  className="group/tile flex h-full flex-col bg-white p-6 transition-colors duration-150 hover:bg-sand-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded border border-sand-200 bg-sand-50 text-brand-700 transition-colors duration-150 group-hover/tile:border-brand-100 group-hover/tile:bg-brand-50">
                      <Icon className="h-[1.25rem] w-[1.25rem]" />
                    </span>
                    <span className="rounded border border-sand-200 px-2 py-0.5 text-[0.6875rem] font-semibold text-ink-500 tnum">
                      {count} live
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-[1.0625rem] font-semibold tracking-[-0.01em] text-brand-900">
                    {type.label}
                  </h3>
                  <p className="mt-2 flex-1 text-[0.8125rem] leading-relaxed text-ink-500">
                    {type.blurb}
                  </p>

                  <span className="mt-5 inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-brand-700">
                    View listings
                    <svg
                      viewBox="0 0 16 16"
                      className="h-3 w-3 transition-transform duration-150 group-hover/tile:translate-x-0.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M2.5 8h11m0 0-4.2-4.2M13.5 8l-4.2 4.2" />
                    </svg>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
