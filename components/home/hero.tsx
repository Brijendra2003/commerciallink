import Form from "next/form";
import { Photo } from "@/components/ui/photo";
import { ButtonLink } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Container } from "@/components/ui/section";
import { SearchIcon, ShieldIcon } from "@/components/ui/icons";
import {
  AREA_BANDS,
  BUDGET_BANDS,
  MICRO_MARKETS,
  PROPERTY_TYPES,
  ZONES,
} from "@/lib/data/taxonomy";

/** Credibility markers, stated as facts rather than decoration. */
const credentials = [
  { value: "1,240", label: "Verified mandates" },
  { value: "38 mn", label: "Sq.ft. transacted" },
  { value: "26", label: "MMR micro-markets" },
  { value: "3.9 hrs", label: "Median first response" },
];

export function Hero() {
  return (
    <section className="border-b border-sand-200 bg-white">
      <Container>
        <div className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-20">
          <div className="rise-in">
            <p className="inline-flex items-center gap-2 rounded border border-sand-200 bg-sand-50 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-500">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-status-good"
              />
              RERA-registered advisory · Mumbai Metropolitan Region
            </p>

            <h1 className="mt-5 font-display text-[2.125rem] font-semibold leading-[1.08] tracking-[-0.03em] text-brand-900 sm:text-[2.75rem] lg:text-[3.125rem]">
              Commercial real estate advisory for the{" "}
              <span className="text-brand-600">Mumbai market</span>
            </h1>

            <p className="mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-ink-500 sm:text-base">
              1,240 mandates across office, retail, warehousing, industrial and
              land — each checked for title and approvals before publication. A
              named advisor holds your transaction from shortlist to handover.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/properties" size="lg" arrow>
                Browse properties
              </ButtonLink>
              <ButtonLink href="/post-requirement" variant="ghost" size="lg">
                Submit a requirement
              </ButtonLink>
            </div>

            <p className="mt-7 flex items-start gap-2.5 border-t border-sand-200 pt-6 text-[0.8125rem] leading-relaxed text-ink-500">
              <ShieldIcon className="mt-px h-4 w-4 shrink-0 text-brand-600" />
              <span className="max-w-lg">
                Owner contact details are never published. Every enquiry is
                qualified by our desk on budget, timeline and decision authority
                before an introduction is made.
              </span>
            </p>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-sand-200 bg-sand-100 shadow-soft">
              <Photo
                publicId="photo-1497366754035-f200968a6e72"
                alt="Grade-A office floor plate with glazed meeting rooms"
                sizes="(max-width: 1024px) 100vw, 560px"
                priority
                width={1100}
              />
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-sand-200 bg-sand-200 sm:grid-cols-4">
              {credentials.map((item) => (
                <div key={item.label} className="bg-white px-4 py-3.5">
                  <dd className="font-display text-[1.125rem] font-semibold leading-none tracking-[-0.01em] text-brand-800 tnum">
                    {item.value}
                  </dd>
                  <dt className="mt-1.5 text-[0.6875rem] leading-tight text-ink-500">
                    {item.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Search rail — the primary conversion surface on the page. */}
        <Form
          action="/properties"
          className="relative -mb-7 rounded-lg border border-sand-200 bg-white p-2 shadow-lift"
        >
          <div className="grid gap-2 sm:grid-cols-[1.15fr_1fr_1fr_1fr_auto] sm:items-center sm:gap-0 sm:divide-x sm:divide-sand-200">
            <SearchCell label="Micro-market">
              <select name="market" className="hero-select" defaultValue="">
                <option value="">Anywhere in MMR</option>
                {/* Grouped by corridor — the flat list runs to eighty markets. */}
                {ZONES.map((zone) => (
                  <optgroup key={zone.value} label={zone.label}>
                    {MICRO_MARKETS.filter((m) => m.zone === zone.value).map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </optgroup>
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

            <div className="sm:pl-2">
              {/* The search navigates rather than running an action, so the
                  button reads the form's own status for its pending mark. */}
              <SubmitButton
                size="lg"
                className="w-full sm:w-auto"
                idleIcon={<SearchIcon className="h-4 w-4" />}
                pendingLabel="Searching…"
              >
                Search
              </SubmitButton>
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
    <div className="rounded px-3.5 py-2 transition-colors hover:bg-sand-50 sm:rounded-none sm:px-4 sm:py-1.5 sm:first:pl-4">
      <p className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-ink-300">
        {label}
      </p>
      {children}
    </div>
  );
}
