import { Container, Section, SectionHeading } from "@/components/ui/section";
import { QuoteMark } from "@/components/ui/icons";
import { testimonials } from "@/lib/data/site";

export function Testimonials() {
  return (
    <Section>
      <Container>
        <SectionHeading
          kicker="Client references"
          title="What occupiers and owners"
          accent="say about the desk."
          align="center"
        />

        <ul className="mt-10 grid gap-4 lg:grid-cols-3">
          {testimonials.map((t) => (
            <li
              key={t.name}
              className="flex flex-col rounded-lg border border-sand-200 bg-white p-6"
            >
              <QuoteMark className="h-5 w-7 text-brand-100" />
              <blockquote className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-ink-700">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-sand-200 pt-5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded bg-brand-800 text-[0.6875rem] font-bold tracking-wide text-white">
                  {t.initials}
                </span>
                <span>
                  <span className="block text-[0.875rem] font-semibold tracking-tight text-brand-900">
                    {t.name}
                  </span>
                  <span className="block text-[0.75rem] text-ink-500">{t.role}</span>
                </span>
              </figcaption>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
