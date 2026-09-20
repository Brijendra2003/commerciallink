import { Container, Section, SectionHeading } from "@/components/ui/section";
import { processSteps } from "@/lib/data/site";

export function Process() {
  return (
    <Section className="border-y border-sand-200 bg-white">
      <Container>
        <SectionHeading
          kicker="Engagement process"
          title="Four stages, with a named advisor"
          accent="accountable at each one."
          align="center"
        />

        <ol className="mt-12 grid gap-px overflow-hidden rounded-lg border border-sand-200 bg-sand-200 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step) => (
            <li key={step.number} className="bg-white p-6">
              <span className="inline-flex h-7 items-center rounded border border-brand-100 bg-brand-50 px-2.5 font-display text-[0.75rem] font-bold tracking-[0.08em] text-brand-700 tnum">
                STEP {step.number}
              </span>
              <h3 className="mt-4 font-display text-[1.0625rem] font-semibold tracking-[-0.01em] text-brand-900">
                {step.title}
              </h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-500">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
