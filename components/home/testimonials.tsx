import { Container, Section, SectionHeading } from "@/components/ui/section";
import { QuoteMark } from "@/components/ui/icons";
import { testimonials } from "@/lib/data/site";

export function Testimonials() {
  return (
    <Section className="bg-sand-100 pt-0">
      <Container>
        <SectionHeading
          kicker="Kind words"
          title="What occupiers and owners"
          accent="tell us."
          align="center"
        />

        <ul className="mt-11 grid gap-5 lg:grid-cols-3">
          {testimonials.map((t) => (
            <li
              key={t.name}
              className="flex flex-col rounded-4xl border border-brand-900/7 bg-white p-7 shadow-soft"
            >
              <QuoteMark className="h-6 w-8 text-clay-300" />
              <blockquote className="mt-5 flex-1 text-[0.9375rem] leading-relaxed text-ink-700">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-sand-200 pt-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-800 text-[0.75rem] font-bold tracking-wide text-clay-300">
                  {t.initials}
                </span>
                <span>
                  <span className="block text-[0.875rem] font-bold tracking-tight text-brand-900">
                    {t.name}
                  </span>
                  <span className="block text-[0.75rem] text-ink-500">
                    {t.role}
                  </span>
                </span>
              </figcaption>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
