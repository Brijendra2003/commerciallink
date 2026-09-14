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
import { submitContact } from "@/lib/actions";
import type { LeadSubmission } from "@/lib/types";

export function ContactForm() {
  const [state, action, pending] = useActionState<LeadSubmission | null, FormData>(
    submitContact,
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
    <form key={key} action={action} className="space-y-3.5">
      <Field label="I'm getting in touch as" name="subject">
        <Select name="subject" defaultValue="occupier">
          <option value="occupier">An occupier looking for space</option>
          <option value="owner">An owner or developer with space</option>
          <option value="investor">An investor</option>
          <option value="partner">A channel partner or IPC</option>
          <option value="other">Something else</option>
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

      <Field label="How can we help?" name="message" required error={errors.message}>
        <Textarea
          name="message"
          rows={5}
          required
          placeholder="Tell us what you're working on…"
          error={errors.message}
        />
      </Field>

      <Consent error={errors.consent} />

      {state && !state.ok ? (
        <p role="alert" className="text-[0.8125rem] font-medium text-clay-700">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="w-full" arrow={!pending}>
        {pending ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
