"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { updatePortalProfile, type PortalAuthState } from "@/lib/portal-actions";
import type { PortalSession } from "@/lib/portal";

export function ProfilePanel({ session }: { session: PortalSession }) {
  const [state, action, pending] = useActionState<PortalAuthState | null, FormData>(
    updatePortalProfile,
    null,
  );
  const errors = state?.fieldErrors ?? {};

  return (
    <section className="rounded-3xl border border-brand-900/8 bg-white p-5 shadow-soft">
      <h2 className="text-[0.9375rem] font-bold tracking-tight text-brand-900">
        Profile
      </h2>

      <form action={action} className="mt-4 space-y-3.5">
        <Field label="Full name" name="name" required error={errors.name}>
          <Input
            name="name"
            required
            defaultValue={session.name}
            autoComplete="name"
            error={errors.name}
          />
        </Field>

        <Field label="Company" name="company">
          <Input
            name="company"
            defaultValue={session.company ?? ""}
            autoComplete="organization"
            placeholder="Optional"
          />
        </Field>

        <Field label="Phone" name="phone" required error={errors.phone}>
          <Input
            name="phone"
            type="tel"
            required
            defaultValue={session.phone}
            autoComplete="tel"
            error={errors.phone}
          />
        </Field>

        <div>
          <p className="mb-1.5 text-[0.8125rem] font-semibold text-brand-900">
            Email
          </p>
          <p className="rounded-xl bg-sand-100 px-4 py-2.5 text-[0.8125rem] text-ink-500">
            {session.email}
          </p>
          <p className="mt-1.5 text-[0.6875rem] text-ink-300">
            Changing the address on an account needs the desk — it is tied to
            your verification record.
          </p>
        </div>

        {state ? (
          <p
            role="status"
            className={`text-[0.8125rem] font-medium ${
              state.ok ? "text-brand-700" : "text-clay-700"
            }`}
          >
            {state.message}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="ghost"
          disabled={pending}
          className="w-full"
        >
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </section>
  );
}
