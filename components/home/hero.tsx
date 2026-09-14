import Form from "next/form";
import { Photo } from "@/components/ui/photo";
import { ButtonLink, Button } from "@/components/ui/button";
import { Container, Kicker } from "@/components/ui/section";
import { Blob } from "@/components/ui/wave";
import { SearchIcon, ShieldIcon } from "@/components/ui/icons";
import {
  AREA_BANDS,
  BUDGET_BANDS,
  MICRO_MARKETS,
  PROPERTY_TYPES,
  ZONE_LABEL,
} from "@/lib/data/taxonomy";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-10 pt-8 sm:pt-12 lg:pb-16">
      <Blob className="-left-40 -top-32 h-[26rem] w-[26rem] opacity-70" />
      <Blob
        className="-right-32 top-24 h-[22rem] w-[22rem] opacity-60"
        color="var(--color-brand-100)"
      />

      <Container className="relative">
        <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_1fr] lg:gap-14">
          <div className="rise-in">
            <Kicker className="mb-5">
              Mumbai Metropolitan Region · 26 micro-markets
            </Kicker>

            <h1 className="font-display text-[2.4rem] leading-[1.06] tracking-[-0.03em] text-brand-900 sm:text-[3.15rem] lg:text-[3.65rem]">
              Mumbai commercial space,
              <br />
              <span className="accent-underline italic text-brand-700">
                brokered properly.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-[0.9375rem] leading-relaxed text-ink-500 sm:text-base">
              1,240 verified mandates from Nariman Point to Panvel — every one
              checked for title and approvals before it reaches this page. One
              advisor holds your search from first shortlist to fit-out handover.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/properties" size="lg" arrow>
                Browse Properties
              </ButtonLink>
              <ButtonLink href="/post-requirement" variant="ghost" size="lg">
                Post a Requirement
              </ButtonLink>
            </div>

            <p className="mt-7 flex items-start gap-2.5 text-[0.75rem] leading-relaxed text-ink-500">
              <ShieldIcon className="mt-px h-4 w-4 shrink-0 text-brand-500" />
              <span className="max-w-sm">
                Owner contact details are never published. Enquiries route
                through our desk, which is exactly why owners give us the good
                stock first.
              </span>
            </p>
          </div>

          {/* Image collage — the organic overlapping arrangement from the
              reference boards, rebuilt with commercial subject matter. */}
          <div className="relative lg:h-[30rem]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2.5rem_2.5rem_2.5rem_5rem] shadow-lift lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[86%]">
              <Photo
                publicId="photo-1497366754035-f200968a6e72"
                alt="Grade-A office floor plate with glazed meeting rooms"
                sizes="(max-width: 1024px) 100vw, 480px"
                priority
                width={1100}
              />
            </div>

            <div className="absolute -bottom-6 left-0 hidden h-40 w-40 overflow-hidden rounded-[2rem_3.5rem_2rem_2rem] border-[6px] border-sand-50 shadow-lift lg:block xl:h-48 xl:w-48">
              <Photo
                publicId="photo-1553413077-190dd305871c"
                alt="Grade-A warehouse interior with pallet racking"
                sizes="200px"
                width={500}
              />
            </div>

            <div className="absolute -left-2 top-8 hidden rounded-3xl bg-brand-900 px-5 py-4 text-sand-50 shadow-lift lg:block">
              <p className="font-display text-2xl leading-none">38 mn</p>
              <p className="mt-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-sand-200/60">
                sq.ft. transacted
              </p>
            </div>
          </div>
        </div>

        {/* Search bar — the primary conversion surface on the page. */}
        <Form
          action="/properties"
          className="relative mt-12 rounded-[1.75rem] border border-brand-900/8 bg-white p-3 shadow-lift sm:mt-14 sm:rounded-full sm:p-2.5"
        >
          <div className="grid gap-2 sm:grid-cols-[1.15fr_1fr_1fr_1fr_auto] sm:items-center sm:gap-0 sm:divide-x sm:divide-sand-200">
            <SearchCell label="Micro-market">
              <select name="market" className="hero-select" defaultValue="">
                <option value="">Anywhere in MMR</option>
                {MICRO_MARKETS.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name} · {ZONE_LABEL[m.zone]}
                  </option>
                ))}
              </select>
            </SearchCell>

            <SearchCell label="Property type">
              <select name="type" className="hero-select" defaultValue="">
                <option value="">All types</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </SearchCell>

            <SearchCell label="Budget">
              <select name="budget" className="hero-select" defaultValue="">
                <option value="">Any budget</option>
                {BUDGET_BANDS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </SearchCell>

            <SearchCell label="Area">
              <select name="area" className="hero-select" defaultValue="">
                <option value="">Any size</option>
                {AREA_BANDS.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </SearchCell>

            <div className="sm:pl-2.5">
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                <SearchIcon className="h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
        </Form>
      </Container>
    </section>
  );
}

function SearchCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl px-4 py-2.5 transition-colors hover:bg-sand-100/70 sm:rounded-none sm:px-5 sm:py-1.5 sm:first:pl-6">
      <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-ink-300">
        {label}
      </p>
      {children}
    </div>
  );
}
