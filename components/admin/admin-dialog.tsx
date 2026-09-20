"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Modal shell for the console's short create/edit forms. Uses the native
 * <dialog> element so focus trapping, Escape and the backdrop come from the
 * platform rather than from hand-rolled key handling.
 */
export function AdminDialog({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        // Clicking the backdrop lands on the dialog element itself.
        if (e.target === ref.current) onClose();
      }}
      className="w-[min(30rem,calc(100vw-2rem))] rounded-lg border border-sand-200 bg-white p-0 text-ink-900 shadow-lift backdrop:bg-brand-900/45"
    >
      <div className="flex items-start justify-between gap-4 border-b border-sand-200 px-5 py-4">
        <div>
          <h2 className="font-display text-[1.0625rem] font-semibold tracking-[-0.01em] text-brand-900">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-500">
              {description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid h-7 w-7 shrink-0 place-items-center rounded border border-sand-200 text-ink-500 transition-colors hover:bg-sand-100"
        >
          ×
        </button>
      </div>
      <div className="px-5 py-5">{children}</div>
    </dialog>
  );
}

export function DialogActions({
  onCancel,
  submitLabel,
  pending,
}: {
  onCancel: () => void;
  submitLabel: string;
  pending: boolean;
}) {
  return (
    <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-sand-200 pt-4">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-sand-300 px-4 py-2 text-[0.8125rem] font-semibold text-brand-900 transition-colors hover:bg-sand-100"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-700 px-4 py-2 text-[0.8125rem] font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </div>
  );
}

export function DialogStatus({ state }: { state: { ok: boolean; message: string } | null }) {
  if (!state || state.ok) return null;
  return (
    <p
      role="alert"
      className="mt-3 rounded border border-clay-100 bg-clay-50 px-3 py-2 text-[0.75rem] font-medium text-clay-700"
    >
      {state.message}
    </p>
  );
}
