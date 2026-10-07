import type { ReactNode } from "react";

export function Field({
  label,
  name,
  error,
  hint,
  required,
  className = "",
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="mb-1.5 block text-[0.8125rem] font-semibold text-ink-700"
      >
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-clay-600">
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p
          id={`${name}-error`}
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 text-[0.75rem] font-medium text-clay-700"
        >
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            className="mt-px h-3.5 w-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          >
            <circle cx="8" cy="8" r="6.4" />
            <path d="M8 5v3.6M8 11h.01" />
          </svg>
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[0.75rem] leading-relaxed text-ink-300">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({
  name,
  error,
  ...props
}: React.ComponentProps<"input"> & { name: string; error?: string }) {
  return (
    <input
      id={name}
      name={name}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${name}-error` : undefined}
      className={`field-input ${error ? "border-clay-500" : ""}`}
      {...props}
    />
  );
}

export function Textarea({
  name,
  error,
  ...props
}: React.ComponentProps<"textarea"> & { name: string; error?: string }) {
  return (
    <textarea
      id={name}
      name={name}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${name}-error` : undefined}
      className={`field-input resize-y ${error ? "border-clay-500" : ""}`}
      {...props}
    />
  );
}

export function Select({
  name,
  error,
  children,
  ...props
}: React.ComponentProps<"select"> & { name: string; error?: string }) {
  return (
    <select
      id={name}
      name={name}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${name}-error` : undefined}
      className={`field-input ${error ? "border-clay-500" : ""}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Consent({ error }: { error?: string }) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-2.5 text-[0.75rem] leading-relaxed text-ink-500">
        <input type="checkbox" name="consent" className="control-box mt-0.5" />
        <span>
          I agree to be contacted about this enquiry by CommercialLink and by
          the verified lister of the project. My details are held under the
          firm&apos;s DPDP-compliant retention policy and are never sold or
          passed to anyone else.
        </span>
      </label>
      {error ? (
        <p role="alert" className="mt-1.5 text-[0.75rem] font-medium text-clay-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Post-submission panel. Replaces the form so the outcome is unambiguous. */
export function SubmissionSuccess({
  message,
  reference,
  onReset,
}: {
  message: string;
  reference?: string;
  onReset?: () => void;
}) {
  return (
    <div className="rounded-lg border border-brand-100 bg-brand-50 p-7 text-center">
      <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-brand-700 text-white">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      </span>
      <p className="mt-4 font-display text-[1.0625rem] font-semibold text-brand-900">
        Submission received
      </p>
      <p className="mx-auto mt-2 max-w-sm text-[0.875rem] leading-relaxed text-ink-500">
        {message}
      </p>
      {reference ? (
        <p className="mt-4 inline-block rounded border border-brand-100 bg-white px-3 py-1.5 text-[0.75rem] font-semibold tracking-wide text-brand-700 tnum">
          Reference {reference}
        </p>
      ) : null}
      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          className="mt-5 block w-full text-[0.75rem] font-semibold text-ink-500 underline underline-offset-4 transition-colors hover:text-brand-800"
        >
          Submit another
        </button>
      ) : null}
    </div>
  );
}
