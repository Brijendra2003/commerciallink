"use client";

import { useTransition } from "react";
import { closeRequirement } from "@/lib/portal-actions";

export function CloseRequirementButton({
  requirementId,
}: {
  requirementId: string;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (
          !window.confirm(
            "Close this requirement? We'll stop sourcing against it.",
          )
        ) {
          return;
        }
        start(() => {
          void closeRequirement(requirementId);
        });
      }}
      className="text-[0.75rem] font-semibold text-ink-500 underline underline-offset-4 transition-colors hover:text-clay-700 disabled:opacity-50"
    >
      {pending ? "Closing…" : "Close"}
    </button>
  );
}
