"use client";

import { useTransition } from "react";
import { Loader } from "@/components/ui/loader";
import { relistListing, withdrawListing } from "@/lib/portal-actions";

/**
 * Takes a project off the market, or puts a withdrawn one back in the queue.
 *
 * Both directions live here because they are the same button in the same slot
 * on the dashboard row — only the label and the confirmation differ.
 */
export function WithdrawButton({
  propertyId,
  live = false,
}: {
  propertyId: string;
  /** A published project needs a firmer confirmation than a pending one. */
  live?: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const message = live
          ? "Take this project off the site? Buyers will no longer see it. You can relist it later."
          : "Withdraw this submission? It leaves the verification queue and will not publish.";
        if (!window.confirm(message)) return;
        start(() => {
          void withdrawListing(propertyId);
        });
      }}
      aria-busy={pending || undefined}
      className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-ink-500 underline underline-offset-4 transition-colors hover:text-clay-700 disabled:opacity-50"
    >
      {pending ? <Loader size="xs" /> : null}
      {pending ? "Removing…" : live ? "Take off market" : "Withdraw"}
    </button>
  );
}

export function RelistButton({ propertyId }: { propertyId: string }) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(() => {
          void relistListing(propertyId);
        })
      }
      aria-busy={pending || undefined}
      className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-brand-700 underline underline-offset-4 transition-colors hover:text-brand-900 disabled:opacity-50"
    >
      {pending ? <Loader size="xs" /> : null}
      {pending ? "Relisting…" : "Relist"}
    </button>
  );
}
