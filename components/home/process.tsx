import { Container, Section, SectionHeading } from "@/components/ui/section";
import { processSteps } from "@/lib/data/site";

export function Process() {
  return (
    <Section className="bg-sand-100">
      <Container>
        <SectionHeading
          kicker="How a search runs"
          title="Four steps, and a named advisor"
          accent="on every one."
          align="center"
        />

        <ol className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {/* Connector rail behind the numbered markers on wide screens. */}
          <span
            aria-hidden="true"
            className="absolute left-0 right-0 top-[1.65rem] hidden h-px bg-gradient-to-r from-transparent via-brand-900/15 to-transparent lg:block"
          />

          {processSteps.map((step) => (
            <li key={step.number} className="relative">
              <span className="relative z-10 grid h-[3.3rem] w-[3.3rem] place-items-center rounded-full border-[5px] border-sand-100 bg-brand-800 font-display text-[1.0625rem] text-clay-300">
                {step.number}
              </span>
              <h3 className="mt-5 font-display text-[1.0625rem] tracking-[-0.01em] text-brand-900">
                {step.title}
              </h3>
              <p className="mt-2.5 max-w-xs text-[0.8125rem] leading-relaxed text-ink-500">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
