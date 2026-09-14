"use client";

import { useTransition } from "react";
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
      className="ml-auto text-[0.75rem] font-semibold text-ink-500 underline underline-offset-4 transition-colors hover:text-clay-700 disabled:opacity-50"
    >
      {pending ? "Withdrawing…" : "Withdraw"}
    </button>
  );
}
