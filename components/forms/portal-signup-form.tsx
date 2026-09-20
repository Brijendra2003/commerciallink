"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { OfficeIcon, SearchIcon } from "@/components/ui/icons";
import { signUpPortalUser, type PortalAuthState } from "@/lib/portal-actions";

const ROLES = [
  {
    value: "buyer",
    title: "I'm looking for a property",
    body: "Track enquiries, shortlist space and post requirements.",
    Icon: SearchIcon,
  },
  {
    value: "owner",
    title: "I want to list a property",
    body: "Submit listings, see views and enquiry counts, manage documents.",
    Icon: OfficeIcon,
  },
] as const;

export function PortalSignupForm({
  defaultRole,
  configured,
}: {
  defaultRole: "owner" | "buyer";
  configured: boolean;
}) {
  const [state, action, pending] = useActionState<PortalAuthState | null, FormData>(
    signUpPortalUser,
    null,
  );
  const [role, setRole] = useState<"owner" | "buyer">(defaultRole);
  const errors = state?.fieldErrors ?? {};

  // Confirmation-pending is a success state with no redirect, so it gets its
  // own panel rather than a green line under a form the user must not resubmit.
  if (state?.ok) {
    return (
      <div className="rounded-3xl border border-brand-100 bg-brand-50 p-7 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-700 text-sand-50">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="5.5" width="18" height="13" rx="2" />
            <path d="m3.6 7 8.4 6 8.4-6" />
          </svg>
        </span>
        <p className="mt-4 font-display text-[1.0625rem] font-semibold text-brand-900">
          Check your inbox
        </p>
        <p className="mx-auto mt-2 max-w-sm text-[0.875rem] leading-relaxed text-ink-500">
          {state.message}
        </p>
        <Link
          href="/login"
          className="mt-5 inline-block text-[0.8125rem] font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-800"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <fieldset>
        <legend className="mb-2.5 text-[0.8125rem] font-semibold text-ink-700">
          I am here to…
        </legend>
        <div className="grid gap-2.5">
          {ROLES.map((r) => (
            <label
              key={r.value}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-sand-300 bg-white p-4 transition-colors has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50"
            >
              <input
                type="radio"
                name="role"
                value={r.value}
                checked={role === r.value}
                onChange={() => setRole(r.value)}
                className="control-box mt-0.5 rounded-full"
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-[0.875rem] font-semibold tracking-tight text-brand-900">
                  <r.Icon className="h-4 w-4 text-brand-600" />
                  {r.title}
                </span>
                <span className="mt-1 block text-[0.75rem] leading-relaxed text-ink-500">
                  {r.body}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Full name" name="name" required error={errors.name}>
        <Input
          name="name"
          required
          autoComplete="name"
          placeholder="Your name"
          error={errors.name}
        />
      </Field>

      <Field
        label={role === "owner" ? "Company or firm" : "Company"}
        name="company"
        hint="Optional."
      >
        <Input name="company" autoComplete="organization" placeholder="Optional" />
      </Field>

      <Field label="Phone" name="phone" required error={errors.phone}>
        <Input
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="+91 98XXX XXXXX"
          error={errors.phone}
        />
      </Field>

      <Field label="Work email" name="email" required error={errors.email}>
        <Input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          error={errors.email}
        />
      </Field>

      <Field
        label="Password"
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

      <div>
        <label className="flex cursor-pointer items-start gap-2.5 text-[0.75rem] leading-relaxed text-ink-500">
          <input
            type="checkbox"
            name="terms"
            className="control-box mt-0.5"
          />
          <span>
            I agree to the terms of use and the DPDP-compliant privacy policy.
            We verify your email before a listing or requirement can be
            submitted.
          </span>
        </label>
        {errors.terms ? (
          <p role="alert" className="mt-1.5 text-[0.75rem] font-medium text-clay-700">
            {errors.terms}
          </p>
        ) : null}
      </div>

      {state && !state.ok ? (
        <p role="alert" className="text-[0.8125rem] font-medium text-clay-700">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" size="lg" loading={pending} className="w-full" arrow>
        {pending ? "Creating account…" : "Create Account"}
      </Button>

      <p className="pt-1 text-center text-[0.8125rem] text-ink-500">
        Already registered?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-700 underline underline-offset-4 transition-colors hover:text-brand-800"
        >
          Log in
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
