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
import { ShieldIcon } from "@/components/ui/icons";
import { submitEnquiry } from "@/lib/actions";
import type { LeadSubmission } from "@/lib/types";

const INTENTS = [
  { value: "request_details", label: "Request full details" },
  { value: "site_visit", label: "Schedule a site visit" },
  { value: "callback", label: "Request a callback" },
  { value: "brochure", label: "Download the brochure" },
];

export function EnquiryForm({
  propertyId,
  propertyTitle,
  defaultIntent = "request_details",
  compact = false,
}: {
  propertyId: string;
  propertyTitle: string;
  defaultIntent?: string;
  compact?: boolean;
}) {
  const [state, action, pending] = useActionState<LeadSubmission | null, FormData>(
    submitEnquiry,
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
    <form key={dismissed?.reference ?? "form"} action={action} className="space-y-3.5">
      <input type="hidden" name="property_id" value={propertyId} />
      <input type="hidden" name="source" value="listing_enquiry" />

      {!compact ? (
        <div>
          <h2 className="font-display text-[1.35rem] leading-tight tracking-[-0.015em] text-brand-900">
            Enquire about this property
          </h2>
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-500">
            An advisor calls you back — usually within four working hours — with
            the full document set and current commercial terms.
          </p>
        </div>
      ) : null}

      <Field label="What would you like to do?" name="intent">
        <Select name="intent" defaultValue={defaultIntent}>
          {INTENTS.map((i) => (
            <option key={i.value} value={i.value}>
              {i.label}
            </option>
          ))}
        </Select>
      </Field>

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

      <Field label="Preferred contact time" name="preferred_time">
        <Select name="preferred_time" defaultValue="">
          <option value="">Any time during business hours</option>
          <option value="morning">Morning (9:30 am – 12 pm)</option>
          <option value="afternoon">Afternoon (12 pm – 4 pm)</option>
          <option value="evening">Evening (4 pm – 7 pm)</option>
        </Select>
      </Field>

      <Field label="Message" name="message">
        <Textarea
          name="message"
          rows={3}
          placeholder={`Anything specific about ${propertyTitle}? Timeline, headcount, fit-out needs…`}
        />
      </Field>

      <Consent error={errors.consent} />

      {state && !state.ok ? (
        <p role="alert" className="text-[0.8125rem] font-medium text-clay-700">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="w-full" arrow={!pending}>
        {pending ? "Sending…" : "Send Enquiry"}
      </Button>

      <p className="flex items-start gap-2 text-[0.6875rem] leading-relaxed text-ink-300">
        <ShieldIcon className="mt-px h-3.5 w-3.5 shrink-0 text-brand-500" />
        Your details go to our advisory desk only. We never pass them to the
        property owner without asking you first.
      </p>
    </form>
  );
}
