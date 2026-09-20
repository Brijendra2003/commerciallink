import { Container } from "@/components/ui/section";

/**
 * Streamed while the filtered query runs. Matching the real grid's geometry
 * keeps the layout from jumping when results land.
 */
export default function LoadingProperties() {
  return (
    <>
      {/* Geometry mirrors the loaded page: white header band, hairline
          borders and 6px radii, so nothing shifts when results arrive. */}
      <section className="border-b border-sand-200 bg-white pb-8 pt-9 sm:pb-10 sm:pt-12">
        <Container>
          <div className="h-3 w-28 animate-pulse rounded bg-sand-200" />
          <div className="mt-4 h-9 w-2/3 max-w-lg animate-pulse rounded bg-sand-200" />
          <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded bg-sand-100" />
        </Container>
      </section>

      <Container className="py-9 sm:py-11">
        <div className="h-[13rem] animate-pulse rounded-lg border border-sand-200 bg-white" />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li
              key={i}
              className="overflow-hidden rounded-lg border border-sand-200 bg-white"
            >
              <div className="aspect-[4/3] animate-pulse bg-sand-100" />
              <div className="space-y-3 p-4">
                <div className="h-2.5 w-20 animate-pulse rounded bg-sand-200" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-sand-200" />
                <div className="h-3 w-3/5 animate-pulse rounded bg-sand-100" />
                <div className="h-6 w-24 animate-pulse rounded bg-sand-200" />
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
