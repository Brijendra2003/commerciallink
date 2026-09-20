import type { ReactNode } from "react";
import { Container, Kicker } from "@/components/ui/section";

/** Shared chrome for the policy pages: a title block and a readable measure. */
export function LegalPage({
  kicker,
  title,
  updated,
  lead,
  children,
}: {
  kicker: string;
  title: string;
  updated: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <>
      <section className="border-b border-sand-200 bg-white py-12 sm:py-14">
        <Container>
          <div className="max-w-3xl">
            <Kicker className="mb-4">{kicker}</Kicker>
            <h1 className="font-display text-[1.875rem] font-semibold leading-[1.12] tracking-[-0.03em] text-brand-900 sm:text-[2.25rem]">
              {title}
            </h1>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-500">{lead}</p>
            <p className="mt-5 inline-block rounded border border-sand-200 bg-sand-50 px-3 py-1.5 text-[0.75rem] text-ink-500">
              Last updated {updated}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-14">
        <Container>
          <div className="max-w-3xl space-y-8">{children}</div>
        </Container>
      </section>
    </>
  );
}

export function Clause({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-[1.125rem] font-semibold tracking-[-0.01em] text-brand-900">
        {heading}
      </h2>
      <div className="mt-3 space-y-3 text-[0.9375rem] leading-relaxed text-ink-500">
        {children}
      </div>
    </section>
  );
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5">
          <span
            aria-hidden="true"
            className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-600"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
