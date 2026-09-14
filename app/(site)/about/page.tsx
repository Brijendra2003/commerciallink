import type { Metadata } from "next";
import { Photo } from "@/components/ui/photo";
import { ButtonLink } from "@/components/ui/button";
import { Container, Kicker, Section, SectionHeading } from "@/components/ui/section";
import { WaveTop, WaveBottom } from "@/components/ui/wave";
import { faqs, processSteps, stats, trustPoints } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "About the Desk",
  description:
    "CommercialLink is a controlled commercial real estate marketplace. We hold the relationship on both sides of a transaction so neither party has to work a phone list.",
  alternates: { canonical: "/about" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="py-12 sm:py-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Kicker className="mb-4">About the desk</Kicker>
            <h1 className="font-display text-[2.1rem] leading-[1.1] tracking-[-0.03em] text-brand-900 sm:text-[3rem]">
              A marketplace works better
              <br />
              <span className="accent-underline italic text-brand-700">
                with someone in the middle.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-500 sm:text-base">
              Most property portals are classifieds: they publish a number and
              step back. That works for a two-bedroom flat. It fails for a
              46,000 sq.ft. industrial shed where the buyer needs the MPCB
              consent checked, the owner needs to know the buyer can fund it, and
              somebody has to hold the negotiation together for four months.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:mt-14 sm:grid-cols-3">
            {[
              {
                id: "photo-1568992687947-868a62a9f521",
                alt: "Business district skyline",
                span: "sm:col-span-2 aspect-[16/10]",
              },
              {
                id: "photo-1573164713988-8665fc963095",
                alt: "Advisor reviewing documents at a desk",
                span: "aspect-[16/10] sm:aspect-auto",
              },
            ].map((img) => (
              <div
                key={img.id}
                className={`relative overflow-hidden rounded-4xl bg-brand-100 shadow-soft ${img.span}`}
              >
                <Photo
                  publicId={img.id}
                  alt={img.alt}
                  sizes="(max-width: 640px) 100vw, 50vw"
                  width={1200}
                />
              </div>
            ))}
          </div>
        </Container>
      </section>

      <WaveTop fill="var(--color-sand-100)" />
      <section className="bg-sand-100 pb-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <SectionHeading
              kicker="What we actually do"
              title="We are a brokerage"
              accent="wearing a portal."
            />
            <div className="space-y-4 text-[0.9375rem] leading-relaxed text-ink-500">
              <p>
                CommercialLink was set up in 2019 by three advisors who had spent
                a decade between an IPC and a regional brokerage, and were tired
                of the same failure: good stock sitting unlet because it was
                being marketed by people who had never walked the floor.
              </p>
              <p>
                So the model is deliberately narrow. We take a limited number of
                mandates in one city, verify every one before it publishes,
                and route every enquiry through a named advisor who is
                accountable for it end to end. Owner numbers do not appear on the
                site. Buyer details do not reach owners without permission.
              </p>
              <p>
                That is a slower business than an open listing board. It is also
                the reason a fifth of our mandates come from owners who
                previously listed elsewhere, and why our average time from
                enquiry to first site visit is under nine days.
              </p>
            </div>
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-4xl border border-brand-900/10 bg-brand-900/10 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-sand-50 px-6 py-8 text-center">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block font-display text-[2rem] leading-none tracking-[-0.02em] text-brand-800 sm:text-[2.4rem]">
                    {stat.value}
                  </span>
                  <span className="mt-2.5 block text-[0.75rem] font-medium text-ink-500">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>
      <WaveBottom fill="var(--color-sand-100)" />

      <Section className="pt-4">
        <Container>
          <SectionHeading
            kicker="Our principles"
            title="Four rules we don't"
            accent="bend."
            align="center"
          />
          <ul className="mt-11 grid gap-5 sm:grid-cols-2">
            {trustPoints.map((point, i) => (
              <li
                key={point.title}
                className="rounded-4xl border border-brand-900/8 bg-white p-7 shadow-soft"
              >
                <span className="font-display text-[0.875rem] text-clay-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-[1.125rem] tracking-[-0.01em] text-brand-900">
                  {point.title}
                </h3>
                <p className="mt-2.5 text-[0.875rem] leading-relaxed text-ink-500">
                  {point.body}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section className="bg-sand-100 pt-0">
        <Container>
          <SectionHeading
            kicker="The process"
            title="What working with us"
            accent="looks like."
            align="center"
          />
          <ol className="mt-11 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {processSteps.map((step) => (
              <li key={step.number}>
                <span className="grid h-[3.1rem] w-[3.1rem] place-items-center rounded-full bg-brand-800 font-display text-[1rem] text-clay-300">
                  {step.number}
                </span>
                <h3 className="mt-5 font-display text-[1.0625rem] tracking-[-0.01em] text-brand-900">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-ink-500">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section id="faqs" className="scroll-mt-20 pt-0">
        <Container>
          <div className="mx-auto max-w-3xl">
            <SectionHeading
              kicker="Questions"
              title="The things people"
              accent="always ask."
              align="center"
            />
            <ul className="mt-10 space-y-3">
              {faqs.map((faq) => (
                <li key={faq.q}>
                  <details className="group/faq rounded-3xl border border-brand-900/8 bg-white px-6 py-5 shadow-soft transition-colors open:bg-white">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[0.9375rem] font-bold tracking-tight text-brand-900 [&::-webkit-details-marker]:hidden">
                      {faq.q}
                      <span className="relative grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sand-100 text-brand-800 transition-colors group-open/faq:bg-clay-500 group-open/faq:text-white">
                        <span className="absolute h-[1.5px] w-3 rounded bg-current" />
                        <span className="absolute h-3 w-[1.5px] rounded bg-current transition-transform duration-300 group-open/faq:scale-y-0" />
                      </span>
                    </summary>
                    <p className="mt-4 text-[0.875rem] leading-relaxed text-ink-500">
                      {faq.a}
                    </p>
                  </details>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href="/contact" size="lg" arrow>
                Talk to the desk
              </ButtonLink>
              <ButtonLink href="/properties" variant="ghost" size="lg">
                Browse properties
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
