import Form from "next/form";
import { Photo } from "@/components/ui/photo";
import { ButtonLink } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Container } from "@/components/ui/section";
import { SearchIcon, ShieldIcon } from "@/components/ui/icons";
import {
  BUDGET_BANDS,
  MICRO_MARKETS,
  PROJECT_CATEGORIES,
  SEGMENTS,
  ZONES,
  typesInSegment,
} from "@/lib/data/taxonomy";

/** Credibility markers, stated as facts rather than decoration. */
const credentials = [
  { value: "40", label: "Station areas covered" },
  { value: "2 min", label: "To list a project" },
  { value: "100%", label: "Verified before listing" },
  { value: "Direct", label: "Leads to the lister" },
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
              RERA-compliant listings · Mira Road to Dahanu Road
            </p>

            <h1 className="mt-5 font-display text-[2.125rem] font-semibold leading-[1.08] tracking-[-0.03em] text-brand-900 sm:text-[2.75rem] lg:text-[3.125rem]">
              Homes and commercial space on the{" "}
              <span className="text-brand-600">Western line</span>
            </h1>

            <p className="mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-ink-500 sm:text-base">
              Flats, villas, plots, shops, offices and godowns from Mira Road
              to Dahanu Road — new projects, ready possession and resale. Every
              project is verified by our team, and your enquiry reaches the
              owner, broker or developer who listed it.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/properties" size="lg" arrow>
                Browse all projects
              </ButtonLink>
              <ButtonLink href="/list-your-property" variant="ghost" size="lg">
                List your project
              </ButtonLink>
            </div>

            <p className="mt-7 flex items-start gap-2.5 border-t border-sand-200 pt-6 text-[0.8125rem] leading-relaxed text-ink-500">
              <ShieldIcon className="mt-px h-4 w-4 shrink-0 text-brand-600" />
              <span className="max-w-lg">
                Nothing publishes on this site until our team has checked it. A
                new project under construction cannot be listed at all without
                its MahaRERA registration number.
              </span>
            </p>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-sand-200 bg-sand-100 shadow-soft">
              <Photo
                publicId="photo-1545324418-cc1a3fa10c00"
                alt="Residential towers on the Western line corridor"
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
          <div className="grid gap-2 sm:grid-cols-[0.9fr_1fr_1.15fr_1fr_1fr_auto] sm:items-center sm:gap-0 sm:divide-x sm:divide-sand-200">
            <SearchCell label="Looking for">
              <select name="segment" className="hero-select" defaultValue="">
                <option value="">Everything</option>
                {SEGMENTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </SearchCell>

            <SearchCell label="Category">
              <select name="category" className="hero-select" defaultValue="">
                <option value="">Any category</option>
                {PROJECT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </SearchCell>

            <SearchCell label="Station area">
              <select name="market" className="hero-select" defaultValue="">
                <option value="">Mira Road – Dahanu Road</option>
                {/* Grouped by belt — the flat list runs to forty stations. */}
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
                {SEGMENTS.map((s) => (
                  <optgroup key={s.value} label={s.label}>
                    {typesInSegment(s.value).map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </optgroup>
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
