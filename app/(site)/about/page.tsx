import type { Metadata } from "next";
import { Photo } from "@/components/ui/photo";
import { ButtonLink } from "@/components/ui/button";
import { Container, Kicker, Section, SectionHeading } from "@/components/ui/section";
import { faqs, processSteps, stats, trustPoints } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "About CommercialLink",
  description:
    "A residential and commercial property marketplace for the Mira Road to Dahanu Road corridor. Owners, brokers and developers list their own projects; we verify each one; buyers reach the lister directly.",
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

      <section className="border-b border-sand-200 bg-white py-12 sm:py-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Kicker className="mb-4">About the firm</Kicker>
            <h1 className="font-display text-[2rem] font-semibold leading-[1.1] tracking-[-0.03em] text-brand-900 sm:text-[2.75rem]">
              One line, done properly,{" "}
              <span className="text-brand-600">instead of a whole state done badly.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-500 sm:text-base">
              Search for a flat in Nalasopara on a national portal and six
              brokers have your number before you close the tab — none of whom
              hold the flat. We do the opposite: we cover one corridor, we check
              every project before it appears, and your enquiry goes to the one
              person who can actually show it to you.
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
                className={`relative overflow-hidden rounded-lg border border-sand-200 bg-sand-100 ${img.span}`}
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

      <section className="py-14 sm:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <SectionHeading
              kicker="What we actually do"
              title="A verified marketplace,"
              accent="not a lead broker."
            />
            <div className="space-y-4 text-[0.9375rem] leading-relaxed text-ink-500">
              <p>
                CommercialLink was set up in 2019 by three people who had spent a
                decade selling property on this line, and were tired of the same
                failure: a buyer and a seller both on the same corridor, both
                paying to be introduced to each other.
              </p>
              <p>
                So the model is simple. Owners, brokers and developers register
                and list their own projects — residential and commercial, from a
                1 BHK in Nalasopara to a shed in Tarapur. Our team verifies every
                one before it publishes, and a new project under construction
                cannot be listed at all without its MahaRERA number. Then the
                enquiries go to the lister, with their name on the listing and
                ours on the verification.
              </p>
              <p>
                We are not in the middle of the conversation, and we do not sell
                the same enquiry to six people. What we are accountable for is
                that what you are looking at is real, and that the person you
                reach is the person who holds it.
              </p>
            </div>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-sand-200 bg-sand-200 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white px-6 py-7 text-center">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block font-display text-[1.75rem] font-semibold leading-none tracking-[-0.02em] text-brand-800 tnum sm:text-[2rem]">
                    {stat.value}
                  </span>
                  <span className="mt-2.5 block text-[0.75rem] text-ink-500">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <Section className="border-y border-sand-200 bg-white">
        <Container>
          <SectionHeading
            kicker="Our principles"
            title="Four rules we don't"
            accent="bend."
            align="center"
          />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {trustPoints.map((point, i) => (
              <li
                key={point.title}
                className="rounded-lg border border-sand-200 bg-white p-6"
              >
                <span className="font-display text-[0.8125rem] font-bold tracking-[0.08em] text-brand-600 tnum">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-[1.0625rem] font-semibold tracking-[-0.01em] text-brand-900">
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

      <Section>
        <Container>
          <SectionHeading
            kicker="The process"
            title="What buying or renting here"
            accent="looks like."
            align="center"
          />
          <ol className="mt-10 grid gap-px overflow-hidden rounded-lg border border-sand-200 bg-sand-200 sm:grid-cols-2 lg:grid-cols-4">
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

      <Section id="faqs" className="scroll-mt-28 border-t border-sand-200 bg-white">
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
                  <details className="group/faq rounded-lg border border-sand-200 bg-white px-5 py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[0.9375rem] font-semibold tracking-tight text-brand-900 [&::-webkit-details-marker]:hidden">
                      {faq.q}
                      <span className="relative grid h-6 w-6 shrink-0 place-items-center rounded border border-sand-200 bg-sand-50 text-brand-700 transition-colors group-open/faq:border-brand-700 group-open/faq:bg-brand-700 group-open/faq:text-white">
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
                Talk to our team
              </ButtonLink>
              <ButtonLink href="/properties" variant="ghost" size="lg">
                Browse all projects
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
