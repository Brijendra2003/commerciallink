"use client";

import { startTransition, useActionState, useEffect, type FormEvent, type ReactNode } from "react";
import { Loader } from "@/components/ui/loader";
import { updateProperty, type AdminActionState } from "@/lib/admin-actions";

const PROPERTY_FORM_ID = "property-edit";

/**
 * Wraps the server-rendered editor fields in a form. Submission is dispatched
 * manually so a validation error does not reset every field (React resets
 * forms that submit through the `action` prop).
 */
export function PropertyEditForm({
  propertyRef,
  children,
}: {
  propertyRef: string;
  children: ReactNode;
}) {
  const [state, action, pending] = useActionState<AdminActionState | null, FormData>(
    updateProperty,
    null,
  );

  // Surface field errors next to their inputs without making every server-
  // rendered field a client component.
  useEffect(() => {
    const form = document.getElementById(PROPERTY_FORM_ID);
    if (!form) return;
    form.querySelectorAll("[data-field-error]").forEach((el) => el.remove());
    form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));

    for (const [name, message] of Object.entries(state?.fieldErrors ?? {})) {
      const input = form.querySelector<HTMLElement>(`[name="${name}"]`);
      if (!input) continue;
      input.setAttribute("aria-invalid", "true");
      const p = document.createElement("p");
      p.dataset.fieldError = "";
      p.className = "mt-1.5 text-[0.75rem] font-medium text-clay-700";
      p.textContent = message;
      input.insertAdjacentElement("afterend", p);
    }
    const first = form.querySelector<HTMLElement>("[aria-invalid]");
    first?.focus();
  }, [state]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => action(data));
  }

  return (
    <form id={PROPERTY_FORM_ID} onSubmit={onSubmit} noValidate>
      <input type="hidden" name="ref" value={propertyRef} />

      <div
        className="sticky top-2 z-20 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sand-200 bg-white/95 px-4 py-3 shadow-soft backdrop-blur"
        aria-live="polite"
      >
        <p
          className={`flex items-center gap-2 text-[0.8125rem] font-medium ${
            state ? (state.ok ? "text-brand-700" : "text-clay-700") : "text-ink-300"
          }`}
        >
          {pending ? <Loader size="xs" className="text-brand-600" /> : null}
          {pending ? "Saving…" : state?.message ?? "Edit the fields below, then save."}
        </p>
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending || undefined}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-5 py-2 text-[0.8125rem] font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
        >
          {pending ? <Loader size="xs" /> : null}
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>

      {children}
    </form>
  );
}
