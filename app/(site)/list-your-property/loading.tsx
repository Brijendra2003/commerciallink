import { Container } from "@/components/ui/section";

/**
 * The wizard is rendered per-request — it looks up the signed-in owner so it
 * can pre-fill their details — so this is a real wait. Mirrors the two-column
 * shell, step rail beside the form, rather than replacing the page wholesale.
 *
 * Deliberately scoped to this route: a blanket fallback over the public group
 * would put a spinner in front of the static pages, which are prerendered and
 * arrive complete.
 */
export default function LoadingListingForm() {
  return (
    <Container className="py-9 sm:py-12">
      <div className="h-2.5 w-28 animate-pulse rounded bg-sand-200" />
      <div className="mt-4 h-9 w-3/4 max-w-xl animate-pulse rounded bg-sand-200" />
      <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded bg-sand-100" />

      <div className="mt-9 grid gap-8 lg:grid-cols-[13rem_1fr] lg:gap-10">
        <ul className="hidden space-y-3 lg:block">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="h-6 w-6 shrink-0 animate-pulse rounded-full bg-sand-200" />
              <span className="h-3 w-24 animate-pulse rounded bg-sand-100" />
            </li>
          ))}
        </ul>
        <div className="space-y-4 rounded-lg border border-sand-200 bg-white p-5 sm:p-7">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-28 animate-pulse rounded bg-sand-200" />
              <div className="mt-2 h-10 w-full animate-pulse rounded bg-sand-100" />
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only" role="status">
        Loading the listing form…
      </span>
    </Container>
  );
}
