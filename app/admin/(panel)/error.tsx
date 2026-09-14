"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] render failed", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <span
        aria-hidden="true"
        className="mx-auto grid h-12 w-12 place-items-center rounded-full text-lg font-bold text-white"
        style={{ background: "var(--color-status-critical)" }}
      >
        !
      </span>
      <h1 className="mt-5 font-display text-[1.5rem] leading-tight tracking-[-0.02em] text-brand-900">
        This view didn&apos;t load.
      </h1>
      <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-500">
        Usually a dropped database connection. Retry, and if it persists check
        the Supabase project status and the service-role key in your
        environment.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-brand-900 px-5 py-2.5 text-[0.8125rem] font-semibold text-sand-50 transition-colors hover:bg-brand-800"
        >
          Retry
        </button>
        <a
          href="/admin"
          className="rounded-full border border-brand-900/15 px-5 py-2.5 text-[0.8125rem] font-semibold text-brand-900 transition-colors hover:bg-white"
        >
          Back to dashboard
        </a>
      </div>
      {error.digest ? (
        <p className="mt-6 text-[0.6875rem] text-ink-300">
          Reference {error.digest}
        </p>
      ) : null}
    </div>
  );
}
