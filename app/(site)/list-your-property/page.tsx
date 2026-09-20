import type { Metadata } from "next";
import { ListPropertyForm } from "@/components/forms/list-property-form";
import { Photo } from "@/components/ui/photo";
import { Container, Kicker, Section, SectionHeading } from "@/components/ui/section";
import { WaveTop, WaveBottom } from "@/components/ui/wave";
import { CheckIcon } from "@/components/ui/icons";
import { ownerBenefits } from "@/lib/data/site";
import { getPortalSession } from "@/lib/portal";

export const metadata: Metadata = {
  title: "List Your Commercial Property",
  description:
    "List office, retail, warehouse, industrial or land with CommercialLink. Your contact details stay private, buyers are qualified before introduction, and photography is on us.",
  alternates: { canonical: "/list-your-property" },
};

const onboarding = [
  {
    number: "01",
    title: "Submit the property",
    body: "Fill the form below with the specifications, commercials and a few photos. It creates a pending listing on our side.",
  },
  {
    number: "02",
    title: "Verification call",
    body: "Our onboarding team calls to confirm details and collect ownership documents — title, OC, approvals, tax receipts.",
  },
  {
    number: "03",
    title: "Photography & write-up",
    body: "We commission professional photography, floor plans and a brochure at our cost, and draft the listing copy.",
  },
  {
    number: "04",
    title: "Live, and worked",
    body: "The listing publishes, and enquiries land with a named advisor who qualifies each one before it reaches you.",
  },
];

export default async function ListYourPropertyPage() {
  const session = await getPortalSession();
  const owner =
    session?.role === "owner"
      ? { name: session.name, email: session.email, phone: session.phone }
      : null;

  return (
    <>
      <section className="relative overflow-hidden py-12 sm:py-16">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <div>
              <Kicker className="mb-4">For owners &amp; developers</Kicker>
              <h1 className="font-display text-[2.1rem] leading-[1.1] tracking-[-0.03em] text-brand-900 sm:text-[2.8rem]">
                List your space.
                <br />
                <span className="accent-underline italic text-brand-700">
                  Keep your number private.
                </span>
              </h1>
              <p className="mt-5 max-w-lg text-[0.9375rem] leading-relaxed text-ink-500">
                Public listing sites hand your phone number to everyone who
                scrolls past. We do the opposite: enquiries land with our desk,
                get qualified on budget, timeline and decision authority, and
                only then reach you.
              </p>

              <ul className="mt-8 grid gap-x-7 gap-y-5 sm:grid-cols-2">
                {ownerBenefits.map((b) => (
                  <li key={b.title}>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 shrink-0 text-clay-500" />
                      <h2 className="text-[0.875rem] font-bold tracking-tight text-brand-900">
                        {b.title}
                      </h2>
                    </div>
                    <p className="mt-2 pl-6 text-[0.8125rem] leading-relaxed text-ink-500">
                      {b.body}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem_5rem_2.5rem_2.5rem] shadow-lift">
                <Photo
                  publicId="photo-1486406146926-c627a92ad1ab"
                  alt="Commercial building exterior at dusk"
                  sizes="(max-width: 1024px) 100vw, 460px"
                  priority
                  width={1000}
                />
              </div>
              <div className="absolute -bottom-5 -left-3 rounded-3xl border-[6px] border-sand-50 bg-white px-6 py-5 shadow-lift sm:left-6">
                <p className="font-display text-[1.75rem] leading-none text-brand-900">
                  ₹0
                </p>
                <p className="mt-2 max-w-[11rem] text-[0.75rem] leading-relaxed text-ink-500">
                  to list. We are paid only on a completed transaction.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <WaveTop fill="var(--color-brand-900)" />
      <section id="how" className="scroll-mt-20 bg-brand-900 pb-6">
        <Container>
          <SectionHeading
            kicker="How onboarding works"
            title="From submission to live listing,"
            accent="in about a week."
            align="center"
            tone="light"
          />
          <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {onboarding.map((step) => (
              <li key={step.number}>
                <span className="grid h-[3.1rem] w-[3.1rem] place-items-center rounded-full border border-sand-200/20 font-display text-[1rem] text-clay-300">
                  {step.number}
                </span>
                <h3 className="mt-5 font-display text-[1.0625rem] tracking-[-0.01em] text-sand-50">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-sand-200/65">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
      <WaveBottom fill="var(--color-brand-900)" />

      <Section id="submit" className="scroll-mt-20 pt-6">
        <Container>
          <div className="mx-auto max-w-2xl">
            <SectionHeading
              kicker="Submit a property"
              title="Tell us about the space."
              accent="We'll take it from there."
              lead="Nothing publishes until we have spoken to you and verified the
                documents. This form creates a pending listing, not a live one."
              align="center"
            />
            <div className="mt-10 rounded-4xl border border-brand-900/8 bg-white p-6 shadow-lift sm:p-9">
              <ListPropertyForm owner={owner} />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
