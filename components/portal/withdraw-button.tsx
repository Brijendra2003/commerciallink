"use client";

import { useTransition } from "react";
import { Loader } from "@/components/ui/loader";
import { withdrawListing } from "@/lib/portal-actions";

export function WithdrawButton({ propertyId }: { propertyId: string }) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (
          !window.confirm(
            "Withdraw this submission? It leaves the review queue and will not publish.",
          )
        ) {
          return;
        }
        start(() => {
          void withdrawListing(propertyId);
        });
      }}
      aria-busy={pending || undefined}
      className="ml-auto inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-ink-500 underline underline-offset-4 transition-colors hover:text-clay-700 disabled:opacity-50"
    >
      {pending ? <Loader size="xs" /> : null}
      {pending ? "Withdrawing…" : "Withdraw"}
    </button>
  );
}
