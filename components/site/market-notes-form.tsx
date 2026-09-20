"use client";

import { useActionState } from "react";
import { Arrow } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { subscribeToMarketNotes } from "@/lib/actions";
import type { LeadSubmission } from "@/lib/types";

/** Footer subscribe form. Reports the outcome in place rather than navigating. */
export function MarketNotesForm() {
  const [state, action, pending] = useActionState<LeadSubmission | null, FormData>(
    subscribeToMarketNotes,
    null,
  );

  if (state?.ok) {
    return (
      <p
        role="status"
        className="mt-5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-3 text-[0.8125rem] leading-relaxed text-sand-200/80"
      >
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="mt-5" aria-label="Subscribe to market notes">
      <input type="hidden" name="source" value="footer" />
      <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 p-1.5 pl-3.5 transition-colors focus-within:border-brand-100/60">
        <label htmlFor="footer-email" className="sr-only">
          Work email
        </label>
        <input
          id="footer-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="Your work email"
          className="min-w-0 flex-1 bg-transparent text-[0.8125rem] text-white placeholder:text-sand-200/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending || undefined}
          aria-label={pending ? "Subscribing…" : "Subscribe"}
          className="group/btn grid h-8 w-8 shrink-0 place-items-center rounded bg-brand-600 text-white transition-colors hover:bg-brand-500 disabled:opacity-60"
        >
          {pending ? <Loader size="xs" /> : <Arrow />}
        </button>
      </div>

      {state && !state.ok ? (
        <p role="alert" className="mt-2 text-[0.75rem] font-medium text-clay-300">
          {state.message}
        </p>
      ) : (
        <p className="mt-2 text-[0.6875rem] text-sand-200/45">
          One email a quarter. Unsubscribe in a click.
        </p>
      )}
    </form>
  );
}
