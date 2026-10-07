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
import {
  BHK_OPTIONS,
  BUDGET_BANDS,
  MICRO_MARKETS,
  SEGMENTS,
  TIMELINES,
  ZONES,
  typesInSegment,
} from "@/lib/data/taxonomy";
import { submitRequirement } from "@/lib/actions";
import type { LeadSubmission, PropertySegment } from "@/lib/types";

export function RequirementForm() {
  const [state, action, pending] = useActionState<LeadSubmission | null, FormData>(
    submitRequirement,
    null,
  );
  const [dismissed, setDismissed] = useState<LeadSubmission | null>(null);
  // Which half of the book the brief is for. It narrows the type list and
  // decides whether a BHK question makes any sense.
  const [segment, setSegment] = useState<PropertySegment>("residential");
  const residential = segment === "residential";
  const errors = state?.fieldErrors ?? {};

  if (state?.ok && state !== dismissed) {
    return (
      <SubmissionSuccess
        message={state.message}
        reference={state.reference}
        onReset={() => setDismissed(state)}
      />
    );
  }

  return (
    <form key={dismissed?.reference ?? "form"} action={action} className="space-y-5">
      <fieldset className="space-y-3.5">
        <legend className="mb-3.5 flex w-full items-center gap-2.5 border-b border-sand-200 pb-2.5 text-[0.8125rem] font-semibold text-brand-900">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-700 text-[0.625rem] font-bold text-white tnum">
            1
          </span>
          Requirement
        </legend>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {SEGMENTS.map((s) => (
            <label
              key={s.value}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-sand-300 bg-white p-3.5 text-[0.875rem] font-semibold tracking-tight text-brand-900 transition-colors has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50"
            >
              <input
                type="radio"
                name="segment"
                value={s.value}
                checked={segment === s.value}
                onChange={() => setSegment(s.value)}
                className="control-box rounded-full"
              />
              {s.label}
            </label>
          ))}
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field
            label="Property type"
            name="property_type"
            required
            error={errors.property_type}
          >
            <Select
              name="property_type"
              defaultValue=""
              // Remount on segment change so the stale selection cannot
              // survive into a list that no longer contains it.
              key={segment}
              required
              error={errors.property_type}
            >
              <option value="" disabled>
                Select a type
              </option>
              {typesInSegment(segment).map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label={residential ? "Buy or rent" : "Buy or lease"}
            name="purpose"
            required
            error={errors.purpose}
          >
            <Select name="purpose" defaultValue="" required error={errors.purpose}>
              <option value="" disabled>
                Select
              </option>
              <option value="lease">{residential ? "Rent" : "Lease / rent"}</option>
              <option value="buy">Buy outright</option>
            </Select>
          </Field>

          <Field
            label="Preferred station area"
            name="market"
            required
            error={errors.market}
          >
            <Select name="market" defaultValue="" required error={errors.market}>
              <option value="" disabled>
                Select a station area
              </option>
              <option value="flexible">
                Flexible — anywhere Mira Road to Dahanu Road
              </option>
              {ZONES.map((zone) => (
                <optgroup key={zone.value} label={zone.label}>
                  {MICRO_MARKETS.filter((m) => m.zone === zone.value).map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </Field>

          <Field
            label="Other areas you'd consider"
            name="locality"
            hint="Optional — list two or three more station areas."
          >
            <Input name="locality" placeholder="e.g. Nalasopara West, Virar East" />
          </Field>

          <Field label="Budget" name="budget">
            <Select name="budget" defaultValue="">
              <option value="">Not fixed yet</option>
              {BUDGET_BANDS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </Select>
          </Field>

          {residential ? (
            <Field label="Configuration" name="bhk">
              <Select name="bhk" defaultValue="">
                <option value="">Any</option>
                {BHK_OPTIONS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}

          <Field label="Area required" name="area_sqft" hint="Carpet or built-up, in sq.ft.">
            <Input
              name="area_sqft"
              inputMode="numeric"
              placeholder={residential ? "e.g. 750" : "e.g. 12,000"}
            />
          </Field>
        </div>

        <Field label="Timeline" name="timeline">
          <Select name="timeline" defaultValue="">
            <option value="">Not decided</option>
            {TIMELINES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Anything else we should know?"
          name="notes"
          hint="Floor preference, vastu, loan status, distance from the station, power load — the more context, the better the match."
        >
          <Textarea
            name="notes"
            rows={4}
            placeholder={
              residential
                ? "Family of four, need a 2 BHK within ten minutes' walk of the station, loan pre-approved, east-facing if possible…"
                : "Need a godown of about 8,000 sq.ft. with truck access off the highway and a current fire NOC…"
            }
          />
        </Field>
      </fieldset>

      <fieldset className="space-y-3.5 border-t border-sand-200 pt-6">
        <legend className="mb-3.5 flex w-full items-center gap-2.5 border-b border-sand-200 pb-2.5 text-[0.8125rem] font-semibold text-brand-900">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-700 text-[0.625rem] font-bold text-white tnum">
            2
          </span>
          Where to reach you
        </legend>

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
        </div>

        <Consent error={errors.consent} />
      </fieldset>

      {state && !state.ok ? (
        <p role="alert" className="text-[0.8125rem] font-medium text-clay-700">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" size="lg" loading={pending} className="w-full" arrow>
        {pending ? "Submitting…" : "Submit Requirement"}
      </Button>
    </form>
  );
}
