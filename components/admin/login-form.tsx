"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { sendPasswordReset, signIn, type AuthState } from "@/lib/auth-actions";

export function LoginForm({ next }: { next: string }) {
  const [mode, setMode] = useState<"signin" | "reset">("signin");
  const [state, action, pending] = useActionState<AuthState | null, FormData>(
    signIn,
    null,
  );
  const [resetState, resetAction, resetPending] = useActionState<
    AuthState | null,
    FormData
  >(sendPasswordReset, null);

  if (mode === "reset") {
    return (
      <form action={resetAction} className="space-y-4">
        <p className="text-[0.8125rem] leading-relaxed text-ink-500">
          Enter your staff email and we&apos;ll send a time-limited reset link.
        </p>

        <Field label="Work email" name="reset-email" required>
          <Input
            name="email"
            id="reset-email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@commerciallink.in"
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
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <Field label="Work email" name="email" required>
        <Input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@commerciallink.in"
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

      <Button type="submit" size="lg" disabled={pending} className="w-full" arrow={!pending}>
        {pending ? "Signing in…" : "Sign In"}
      </Button>
    </form>
  );
}
