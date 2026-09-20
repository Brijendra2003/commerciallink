"use client";

import { useTransition } from "react";
import { Loader } from "@/components/ui/loader";
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
      aria-busy={pending || undefined}
      className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-ink-500 underline underline-offset-4 transition-colors hover:text-clay-700 disabled:opacity-50"
    >
      {pending ? <Loader size="xs" /> : null}
      {pending ? "Closing…" : "Close"}
    </button>
  );
}
