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
  BUDGET_BANDS,
  MICRO_MARKETS,
  PROPERTY_TYPES,
  TIMELINES,
  ZONES,
} from "@/lib/data/taxonomy";
import { submitRequirement } from "@/lib/actions";
import type { LeadSubmission } from "@/lib/types";

export function RequirementForm() {
  const [state, action, pending] = useActionState<LeadSubmission | null, FormData>(
    submitRequirement,
    null,
  );
  const [dismissed, setDismissed] = useState<LeadSubmission | null>(null);
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

          <Field label="Buy or lease" name="purpose" required error={errors.purpose}>
            <Select name="purpose" defaultValue="" required error={errors.purpose}>
              <option value="" disabled>
                Select
              </option>
              <option value="lease">Lease / rent</option>
              <option value="buy">Buy outright</option>
            </Select>
          </Field>

          <Field
            label="Preferred micro-market"
            name="market"
            required
            error={errors.market}
          >
            <Select name="market" defaultValue="" required error={errors.market}>
              <option value="" disabled>
                Select a micro-market
              </option>
              <option value="flexible">Flexible across MMR</option>
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
            hint="Optional — list two or three more micro-markets."
          >
            <Input name="locality" placeholder="e.g. Lower Parel, Worli, Prabhadevi" />
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

          <Field label="Area required" name="area_sqft" hint="Carpet or built-up, in sq.ft.">
            <Input name="area_sqft" inputMode="numeric" placeholder="e.g. 12,000" />
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
          hint="Headcount, power load, dock requirement, expansion plans, board approvals — the more context, the better the match."
        >
          <Textarea
            name="notes"
            rows={4}
            placeholder="We're a 180-person engineering team moving out of a serviced office; need warm shell with 1:800 parking and a metro within 1 km…"
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
