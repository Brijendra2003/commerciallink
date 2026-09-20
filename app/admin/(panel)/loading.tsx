import { LoadingPanel } from "@/components/ui/loader";

/**
 * Covers every console section: each one queries Supabase on arrival, so
 * moving between them is a real wait rather than an instant swap.
 *
 * Header geometry is reproduced so the page does not jump when the data
 * lands — only the body below it is replaced.
 */
export default function LoadingPanelSection() {
  return (
    <div>
      <div className="mb-6 border-b border-sand-200 pb-5">
        <div className="h-2.5 w-24 animate-pulse rounded bg-sand-200" />
        <div className="mt-3.5 h-7 w-56 animate-pulse rounded bg-sand-200" />
      </div>
      <div className="rounded-lg border border-sand-200 bg-white">
        <LoadingPanel label="Loading…" />
      </div>
    </div>
  );
}
