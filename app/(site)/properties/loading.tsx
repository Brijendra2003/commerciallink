import { Container } from "@/components/ui/section";

/**
 * Streamed while the filtered query runs. Matching the real grid's geometry
 * keeps the layout from jumping when results land.
 */
export default function LoadingProperties() {
  return (
    <>
      <section className="border-b border-brand-900/8 bg-sand-100 pb-9 pt-10 sm:pb-11 sm:pt-14">
        <Container>
          <div className="h-3 w-28 animate-pulse rounded-full bg-brand-900/10" />
          <div className="mt-4 h-9 w-2/3 max-w-lg animate-pulse rounded-lg bg-brand-900/10" />
          <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded-full bg-brand-900/5" />
        </Container>
      </section>

      <Container className="py-9 sm:py-11">
        <div className="h-[13rem] animate-pulse rounded-4xl bg-white/70 shadow-soft" />
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li
              key={i}
              className="overflow-hidden rounded-4xl border border-brand-900/7 bg-white shadow-soft"
            >
              <div className="aspect-[4/3] animate-pulse bg-brand-100" />
              <div className="space-y-3 p-5">
                <div className="h-2.5 w-20 animate-pulse rounded-full bg-brand-900/10" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-brand-900/10" />
                <div className="h-3 w-3/5 animate-pulse rounded-full bg-brand-900/5" />
                <div className="h-6 w-24 animate-pulse rounded bg-brand-900/10" />
              </div>
            </li>
          ))}
        </ul>
      </Container>

      <span className="sr-only" role="status">
        Loading properties…
      </span>
    </>
  );
}
