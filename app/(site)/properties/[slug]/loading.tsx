import { Container } from "@/components/ui/section";

/**
 * Streamed while the listing and its media are fetched. Mirrors the detail
 * layout — gallery left, enquiry rail right — so the page settles into place
 * instead of reflowing around the form.
 */
export default function LoadingListing() {
  return (
    <Container className="py-8 sm:py-10">
      <div className="h-2.5 w-52 animate-pulse rounded bg-sand-200" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.55fr_1fr] lg:gap-10">
        <div>
          <div className="aspect-[16/10] animate-pulse rounded-lg border border-sand-200 bg-sand-100" />
          <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] animate-pulse rounded border border-sand-200 bg-sand-100"
              />
            ))}
          </div>
          <div className="mt-8 space-y-3">
            <div className="h-8 w-3/4 animate-pulse rounded bg-sand-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-sand-100" />
          </div>
        </div>
        <div className="h-[26rem] animate-pulse rounded-lg border border-sand-200 bg-white" />
      </div>
      <span className="sr-only" role="status">
        Loading this listing…
      </span>
    </Container>
  );
}
