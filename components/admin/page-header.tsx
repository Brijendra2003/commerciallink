import type { ReactNode } from "react";

export function PageHeader({
  title,
  lead,
  action,
}: {
  title: string;
  lead?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-[1.5rem] leading-tight tracking-[-0.02em] text-brand-900 sm:text-[1.75rem]">
          {title}
        </h1>
        {lead ? (
          <p className="mt-1.5 max-w-2xl text-[0.8125rem] leading-relaxed text-ink-500">
            {lead}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 gap-2">{action}</div> : null}
    </header>
  );
}

export function Panel({
  title,
  action,
  children,
  className = "",
  padded = true,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={`rounded-3xl border border-brand-900/8 bg-white shadow-soft ${className}`}
    >
      {title ? (
        <header className="flex items-center justify-between gap-3 border-b border-sand-200 px-5 py-4">
          <h2 className="text-[0.9375rem] font-bold tracking-tight text-brand-900">
            {title}
          </h2>
          {action}
        </header>
      ) : null}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}
