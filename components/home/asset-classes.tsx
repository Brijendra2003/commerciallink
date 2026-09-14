import Link from "next/link";
import { Arrow } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { PROPERTY_TYPE_ICON } from "@/components/ui/icons";
import { PROPERTY_TYPES } from "@/lib/data/taxonomy";
import { getPublishedProperties } from "@/lib/data/queries";

export async function AssetClasses() {
  const all = await getPublishedProperties();

  return (
    <Section className="pt-6 sm:pt-8 lg:pt-10">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            kicker="What we broker"
            title="Six asset classes,"
            accent="one desk."
            lead="Each class is run by advisors who transact in it every week — not a
              generalist working from a listing feed."
          />
          <Link
            href="/properties"
            className="group/btn inline-flex shrink-0 items-center gap-2 text-[0.8125rem] font-semibold text-brand-800 transition-colors hover:text-clay-600"
          >
            View all properties
            <Arrow />
          </Link>
        </div>

        <ul className="mt-10 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {PROPERTY_TYPES.map((type) => {
            const Icon = PROPERTY_TYPE_ICON[type.value];
            const count = all.filter((p) => p.type === type.value).length;

            return (
              <li key={type.value}>
                <Link
                  href={`/properties?type=${type.value}`}
                  className="group/tile flex h-full flex-col rounded-3xl border border-brand-900/7 bg-white p-6 shadow-soft transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-brand-900/12 hover:shadow-lift"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700 transition-colors duration-300 group-hover/tile:bg-brand-800 group-hover/tile:text-clay-300">
                      <Icon className="h-[1.35rem] w-[1.35rem]" />
                    </span>
                    <span className="rounded-full bg-sand-100 px-2.5 py-1 text-[0.6875rem] font-semibold text-ink-500">
                      {count} live
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-[1.125rem] tracking-[-0.01em] text-brand-900">
                    {type.label}
                  </h3>
                  <p className="mt-2 flex-1 text-[0.8125rem] leading-relaxed text-ink-500">
                    {type.blurb}
                  </p>

                  <span className="mt-5 inline-flex items-center gap-1.5 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-clay-600">
                    Explore
                    <svg
                      viewBox="0 0 16 16"
                      className="h-3 w-3 transition-transform duration-200 group-hover/tile:translate-x-1"
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
