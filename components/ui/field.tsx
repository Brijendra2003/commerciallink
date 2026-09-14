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
        className="mb-1.5 block text-[0.8125rem] font-semibold text-brand-900"
      >
        {label}
        {required ? <span className="ml-0.5 text-clay-500">*</span> : null}
      </label>
      {children}
      {error ? (
        <p
          id={`${name}-error`}
          role="alert"
          className="mt-1.5 text-[0.75rem] font-medium text-clay-700"
        >
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[0.75rem] text-ink-300">{hint}</p>
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
        <input
          type="checkbox"
          name="consent"
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-sand-300 accent-clay-500"
        />
        <span>
          I agree to be contacted by CommercialLink about this enquiry. My
          details are held under the firm&apos;s DPDP-compliant retention policy
          and are never shared with property owners without my consent.
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
    <div className="rounded-3xl border border-brand-100 bg-brand-50 p-7 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-700 text-sand-50">
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
      <p className="mt-4 font-display text-lg text-brand-900">
        You&apos;re on our desk.
      </p>
      <p className="mx-auto mt-2 max-w-sm text-[0.875rem] leading-relaxed text-ink-500">
        {message}
      </p>
      {reference ? (
        <p className="mt-4 inline-block rounded-full bg-white px-4 py-1.5 text-[0.75rem] font-semibold tracking-wide text-brand-700">
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
