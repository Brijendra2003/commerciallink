import Link from "next/link";
import { Arrow } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { PROPERTY_TYPE_ICON } from "@/components/ui/icons";
import { PROPERTY_TYPES, SEGMENT_LABEL } from "@/lib/data/taxonomy";
import { getPublishedProperties } from "@/lib/data/queries";
import { describeError } from "@/lib/log";

export async function AssetClasses() {
  // Counts are supporting detail; an unreachable database shows zeros, not an error.
  const all = await getPublishedProperties().catch((error) => {
    console.error("[home] listing counts unavailable:", describeError(error));
    return [];
  });

  // Types with live stock first, then the rest. Thirteen tiles is a lot to
  // scan, and an empty asset class is the least useful of them.
  const ordered = [...PROPERTY_TYPES].sort((a, b) => {
    const count = (v: string) => all.filter((p) => p.type === v).length;
    return count(b.value) - count(a.value);
  });

  return (
    <Section className="pt-16 sm:pt-20">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            kicker="Coverage"
            title="Residential and commercial,"
            accent="on one corridor."
            lead="From a 1 BHK in Nalasopara to a Tarapur shed — every asset class
              on the Mira Road to Dahanu Road line, in one place."
          />
          <Link
            href="/properties"
            className="group/btn inline-flex shrink-0 items-center gap-2 text-[0.8125rem] font-semibold text-brand-700 transition-colors hover:text-brand-800"
          >
            View all projects
            <Arrow />
          </Link>
        </div>

        <ul className="mt-10 grid gap-px overflow-hidden rounded-lg border border-sand-200 bg-sand-200 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((type) => {
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

                  <p className="mt-5 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-ink-300">
                    {SEGMENT_LABEL[type.segment]}
                  </p>
                  <h3 className="mt-1 font-display text-[1.0625rem] font-semibold tracking-[-0.01em] text-brand-900">
                    {type.label}
                  </h3>
                  <p className="mt-2 flex-1 text-[0.8125rem] leading-relaxed text-ink-500">
                    {type.blurb}
                  </p>

                  <span className="mt-5 inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-brand-700">
                    View projects
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
