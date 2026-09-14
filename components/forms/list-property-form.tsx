"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Consent,
  Field,
  Input,
  Select,
  SubmissionSuccess,
  Textarea,
} from "@/components/ui/field";
import { MICRO_MARKETS, PROPERTY_TYPES } from "@/lib/data/taxonomy";
import { submitPropertyListing } from "@/lib/actions";
import type { LeadSubmission } from "@/lib/types";

export function ListPropertyForm() {
  const [state, action, pending] = useActionState<LeadSubmission | null, FormData>(
    submitPropertyListing,
    null,
  );
  const [key, setKey] = useState(0);
  const errors = state?.fieldErrors ?? {};

  if (state?.ok) {
    return (
      <SubmissionSuccess
        message={state.message}
        reference={state.reference}
        onReset={() => setKey((k) => k + 1)}
      />
    );
  }

  return (
    <form key={key} action={action} className="space-y-5">
      <fieldset className="space-y-3.5">
        <legend className="kicker mb-3 text-clay-600">1 · The property</legend>

        <Field label="Property name or address" name="title">
          <Input name="title" placeholder="e.g. 4th floor, Sunteck Icon, BKC" />
        </Field>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field
            label="Property type"
            name="property_type"
            required
            error={errors.property_type}
          >
            <Select name="property_type" defaultValue="" required error={errors.property_type}>
              <option value="" disabled>
                Select a type
              </option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Sell or lease" name="purpose" required error={errors.purpose}>
            <Select name="purpose" defaultValue="" required error={errors.purpose}>
              <option value="" disabled>
                Select
              </option>
              <option value="lease">Lease it out</option>
              <option value="buy">Sell outright</option>
              <option value="either">Open to either</option>
            </Select>
          </Field>

          <Field label="Micro-market" name="market" required error={errors.market}>
            <Select name="market" defaultValue="" required error={errors.market}>
              <option value="" disabled>
                Select a micro-market
              </option>
              {MICRO_MARKETS.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Street or building"
            name="locality"
            hint="Helps us place it exactly."
          >
            <Input name="locality" placeholder="e.g. Road No. 22, Wagle Estate" />
          </Field>

          <Field
            label="Built-up area"
            name="area_sqft"
            required
            error={errors.area_sqft}
            hint="In sq.ft."
          >
            <Input
              name="area_sqft"
              inputMode="numeric"
              required
              placeholder="e.g. 18,400"
              error={errors.area_sqft}
            />
          </Field>

          <Field
            label="Price expectation"
            name="expectation"
            hint="Leave blank to list as price-on-request."
          >
            <Input name="expectation" placeholder="e.g. ₹285 per sq.ft. / month" />
          </Field>
        </div>

        <Field
          label="Anything we should know?"
          name="notes"
          hint="Tenancy status, approvals in hand, power load, restrictions, whether documents are ready."
        >
          <Textarea
            name="notes"
            rows={4}
            placeholder="Currently vacant since March. Fire NOC valid to 2028, OC in hand, willing to offer a fit-out contribution for a 9-year term…"
          />
        </Field>
      </fieldset>

      <fieldset className="space-y-3.5 border-t border-sand-200 pt-6">
        <legend className="kicker mb-3 text-clay-600">2 · About you</legend>

        <Field label="Full name" name="name" required error={errors.name}>
          <Input name="name" required autoComplete="name" placeholder="Your name" error={errors.name} />
        </Field>

        <div className="grid gap-3.5 sm:grid-cols-2">
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
          <Field label="Email" name="email" required error={errors.email}>
            <Input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              error={errors.email}
            />
          </Field>
        </div>

        <Consent error={errors.consent} />
      </fieldset>

      {state && !state.ok ? (
        <p role="alert" className="text-[0.8125rem] font-medium text-clay-700">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="w-full" arrow={!pending}>
        {pending ? "Submitting…" : "Submit Property for Review"}
      </Button>

      <p className="text-center text-[0.6875rem] leading-relaxed text-ink-300">
        Submitting creates a pending listing. Nothing goes live until our team
        has verified ownership documents with you.
      </p>
    </form>
  );
}
