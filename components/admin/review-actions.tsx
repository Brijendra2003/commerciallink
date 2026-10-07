"use client";

import { useState, useTransition } from "react";
import { Loader } from "@/components/ui/loader";
import { reviewProperty } from "@/lib/admin-actions";

/**
 * Approve / reject / request-changes controls for a submitted project.
 *
 * Approving is a one-click action because it is the common case and the
 * reviewer has just read the listing. The other two open a note field first:
 * a rejection a lister cannot act on is worse than no rejection at all, so
 * `reviewProperty` refuses them without one.
 *
 * These live outside the main edit <form> — they are a decision about the
 * listing, not an edit to it, and nesting forms is invalid HTML anyway.
 */
export function ReviewActions({
  propertyRef,
  compact = false,
}: {
  propertyRef: string;
  /** The queue row variant: buttons only, no surrounding panel. */
  compact?: boolean;
}) {
  const [pending, start] = useTransition();
  const [asking, setAsking] = useState<"rejected" | "changes_requested" | null>(
    null,
  );
  const [note, setNote] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  function decide(
    outcome: "approved" | "rejected" | "changes_requested",
    withNote?: string,
  ) {
    setResult(null);
    start(async () => {
      const r = await reviewProperty(propertyRef, outcome, withNote);
      setResult(r);
      if (r.ok) {
        setAsking(null);
        setNote("");
      }
    });
  }

  return (
    <div className={compact ? "" : "space-y-3"}>
      {asking ? (
        <div className={compact ? "w-full" : ""}>
          <label
            htmlFor={`note-${propertyRef}`}
            className="mb-1.5 block text-[0.75rem] font-semibold text-ink-700"
          >
            {asking === "rejected"
              ? "Why are you rejecting it?"
              : "What does the lister need to change?"}
          </label>
          <textarea
            id={`note-${propertyRef}`}
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={1000}
            placeholder={
              asking === "rejected"
                ? "Could not verify ownership — the agreement does not match the name on the account."
                : "Please add the RERA certificate and two photographs of the actual flat, not the brochure render."
            }
            className="field-input resize-y"
          />
          <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-ink-300">
            The lister sees this on their dashboard.
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={pending || note.trim().length === 0}
              onClick={() => decide(asking, note)}
              aria-busy={pending || undefined}
              className="inline-flex items-center gap-2 rounded-lg bg-clay-600 px-4 py-2 text-[0.75rem] font-semibold text-white transition-colors hover:bg-clay-700 disabled:opacity-50"
            >
              {pending ? <Loader size="xs" /> : null}
              {asking === "rejected" ? "Reject listing" : "Send back"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAsking(null);
                setNote("");
              }}
              className="text-[0.75rem] font-semibold text-ink-500 underline underline-offset-4 hover:text-brand-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => decide("approved")}
            aria-busy={pending || undefined}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2 text-[0.75rem] font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
          >
            {pending ? <Loader size="xs" /> : null}
            Approve &amp; publish
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setAsking("changes_requested")}
            className="rounded-lg border border-sand-300 px-4 py-2 text-[0.75rem] font-semibold text-ink-700 transition-colors hover:bg-sand-100 disabled:opacity-60"
          >
            Request changes
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setAsking("rejected")}
            className="rounded-lg border border-clay-100 px-4 py-2 text-[0.75rem] font-semibold text-clay-700 transition-colors hover:bg-clay-50 disabled:opacity-60"
          >
            Reject
          </button>
        </div>
      )}

      {result ? (
        <p
          role="status"
          className={`${compact ? "mt-2 " : ""}text-[0.75rem] font-medium ${
            result.ok ? "text-brand-700" : "text-clay-700"
          }`}
        >
          {result.message}
        </p>
      ) : null}
    </div>
  );
}
