"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import {
  requestPortalPasswordReset,
  signInPortalUser,
  type PortalAuthState,
} from "@/lib/portal-actions";

export function PortalLoginForm({
  next,
  configured,
}: {
  next: string;
  configured: boolean;
}) {
  const [mode, setMode] = useState<"signin" | "reset">("signin");
  const [state, action, pending] = useActionState<PortalAuthState | null, FormData>(
    signInPortalUser,
    null,
  );
  const [resetState, resetAction, resetPending] = useActionState<
    PortalAuthState | null,
    FormData
  >(requestPortalPasswordReset, null);

  if (mode === "reset") {
    return (
      <form action={resetAction} className="space-y-4">
        <p className="text-[0.875rem] leading-relaxed text-ink-500">
          Enter the email on your account and we&apos;ll send a time-limited
          reset link.
        </p>

        <Field label="Email" name="reset-email" required>
          <Input
            id="reset-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
          />
        </Field>

        {resetState ? (
          <p
            role="status"
            className={`text-[0.8125rem] font-medium ${
              resetState.ok ? "text-brand-700" : "text-clay-700"
            }`}
          >
            {resetState.message}
          </p>
        ) : null}

        <Button type="submit" size="lg" disabled={resetPending} className="w-full">
          {resetPending ? "Sending…" : "Send reset link"}
        </Button>

        <button
          type="button"
          onClick={() => setMode("signin")}
          className="w-full text-center text-[0.75rem] font-semibold text-ink-500 underline underline-offset-4 transition-colors hover:text-brand-800"
        >
          Back to sign in
        </button>
      </form>
    );
  }

  return (
    <form action={action} className="space-y-3.5">
      <input type="hidden" name="next" value={next} />

      <Field label="Email" name="email" required>
        <Input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
        />
      </Field>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <label
            htmlFor="password"
            className="text-[0.8125rem] font-semibold text-brand-900"
          >
            Password<span className="ml-0.5 text-clay-600">*</span>
          </label>
          <button
            type="button"
            onClick={() => setMode("reset")}
            className="text-[0.75rem] font-semibold text-brand-700 underline underline-offset-4 transition-colors hover:text-brand-800"
          >
            Forgot password?
          </button>
        </div>
        <Input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />
      </div>

      {state && !state.ok ? (
        <p role="alert" className="text-[0.8125rem] font-medium text-clay-700">
          {state.message}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="w-full"
        arrow={!pending}
      >
        {pending ? "Signing in…" : "Log In"}
      </Button>

      <p className="pt-1 text-center text-[0.8125rem] text-ink-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-brand-700 underline underline-offset-4 transition-colors hover:text-brand-800"
        >
          Create one
        </Link>
      </p>

      {!configured ? (
        <p className="mt-2 rounded-2xl bg-sand-100 px-4 py-3 text-center text-[0.6875rem] leading-relaxed text-ink-300">
          Accounts need Supabase credentials. Without them the site runs in demo
          mode — see the README to connect a project.
        </p>
      ) : null}
    </form>
  );
}
