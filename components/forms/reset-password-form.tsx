"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { updatePortalPassword, type PortalAuthState } from "@/lib/portal-actions";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState<PortalAuthState | null, FormData>(
    updatePortalPassword,
    null,
  );
  const errors = state?.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-3.5">
      <Field
        label="New password"
        name="password"
        required
        error={errors.password}
        hint="At least 8 characters, with one number."
      >
        <Input
          name="password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.password}
        />
      </Field>

      <Field label="Confirm password" name="confirm" required error={errors.confirm}>
        <Input
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.confirm}
        />
      </Field>

      {state && !state.ok ? (
        <p role="alert" className="text-[0.8125rem] font-medium text-clay-700">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="w-full" arrow={!pending}>
        {pending ? "Saving…" : "Save Password"}
      </Button>

      <p className="pt-1 text-center text-[0.8125rem] text-ink-500">
        <Link
          href="/login"
          className="font-semibold text-clay-600 underline underline-offset-4 hover:text-clay-700"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
