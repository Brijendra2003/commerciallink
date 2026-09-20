"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

/**
 * Submit controls that read their own form's status instead of taking a
 * prop. Needed where the pending state is not in reach of the caller: a
 * `next/form` search (which navigates rather than running an action) and
 * the plain server-action forms rendered from server components.
 *
 * Must be a descendant of the <form> it submits — that is how
 * `useFormStatus` finds it.
 */

export function SubmitButton({
  children,
  pendingLabel,
  idleIcon,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "type" | "loading"> & {
  /** Replaces the label while the form is in flight. */
  pendingLabel?: string;
  /** Leading glyph for the resting state — the pending mark takes its slot. */
  idleIcon?: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} {...props}>
      {!pending && idleIcon ? idleIcon : null}
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}

/**
 * The same, for the places that are styled as a bare link or a small chip
 * rather than as a Button — the sidebar's sign-out, for one.
 */
export function SubmitControl({
  children,
  pendingLabel,
  className = "",
  loaderSize = "xs",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  loaderSize?: "xs" | "sm";
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      className={className}
    >
      {pending ? <Loader size={loaderSize} /> : null}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
