import type { Metadata } from "next";
import { ListPropertyForm } from "@/components/forms/list-property-form";
import { Photo } from "@/components/ui/photo";
import { ButtonLink } from "@/components/ui/button";
import { Container, Kicker, Section, SectionHeading } from "@/components/ui/section";
import { CheckIcon, ShieldIcon } from "@/components/ui/icons";
import { ownerBenefits, site } from "@/lib/data/site";
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
    body: "Complete the staged form below with specifications, commercials and photographs. It creates a pending listing on our side.",
  },
  {
    number: "02",
    title: "Verification call",
    body: "Our onboarding team confirms the details and collects ownership documents — title, OC, approvals and tax receipts.",
  },
  {
    number: "03",
    title: "Photography & write-up",
    body: "We commission professional photography, floor plans and a brochure at our cost, and draft the listing copy for your approval.",
  },
  {
    number: "04",
    title: "Live, and worked",
    body: "The listing publishes and enquiries route to a named advisor who qualifies each one before it reaches you.",
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
      <section className="border-b border-sand-200 bg-white">
        <Container>
          <div className="grid items-center gap-10 py-12 sm:py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <div>
              <Kicker className="mb-4">For owners &amp; developers</Kicker>
              <h1 className="font-display text-[2rem] font-semibold leading-[1.1] tracking-[-0.03em] text-brand-900 sm:text-[2.5rem]">
                List your space.{" "}
                <span className="text-brand-600">Keep your number private.</span>
              </h1>
              <p className="mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-ink-500">
                Public listing sites publish your phone number to everyone who
                scrolls past. We do the opposite: enquiries reach our desk, are
                qualified on budget, timeline and decision authority, and only
                then reach you.
              </p>

              <ul className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {ownerBenefits.map((b) => (
                  <li key={b.title}>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 shrink-0 text-brand-600" />
                      <h2 className="text-[0.875rem] font-semibold tracking-tight text-brand-900">
                        {b.title}
                      </h2>
                    </div>
                    <p className="mt-2 pl-6 text-[0.8125rem] leading-relaxed text-ink-500">
                      {b.body}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ButtonLink href="#submit" size="lg" arrow>
                  Start a submission
                </ButtonLink>
                <ButtonLink href="/contact" variant="ghost" size="lg">
                  Speak to onboarding
                </ButtonLink>
              </div>
            </div>

            <div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-sand-200 bg-sand-100">
                <Photo
                  publicId="photo-1486406146926-c627a92ad1ab"
                  alt="Commercial building exterior at dusk"
                  sizes="(max-width: 1024px) 100vw, 520px"
                  priority
                  width={1000}
                />
              </div>

              <dl className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-sand-200 bg-sand-200">
                {[
                  { value: "₹0", label: "Cost to list" },
                  { value: "~1 week", label: "Submission to live" },
                  { value: "412", label: "Deals closed" },
                ].map((item) => (
                  <div key={item.label} className="bg-white px-4 py-3.5 text-center">
                    <dd className="font-display text-[1.125rem] font-semibold leading-none text-brand-800 tnum">
                      {item.value}
                    </dd>
                    <dt className="mt-1.5 text-[0.6875rem] leading-tight text-ink-500">
                      {item.label}
                    </dt>
                  </div>
                ))}
              </dl>

              <p className="mt-3 flex items-start gap-2 rounded-lg border border-sand-200 bg-sand-50 px-4 py-3 text-[0.75rem] leading-relaxed text-ink-500">
                <ShieldIcon className="mt-px h-4 w-4 shrink-0 text-brand-600" />
                We are paid a brokerage fee only on a completed transaction.
                Listing, photography and the brochure are at our cost.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section id="how" className="scroll-mt-28 bg-brand-900 py-14 sm:py-16">
        <Container>
          <SectionHeading
            kicker="Onboarding process"
            title="From submission to live listing,"
            accent="in about a week."
            align="center"
            tone="light"
          />
          <ol className="mt-10 grid gap-px overflow-hidden rounded-lg border border-brand-800 bg-brand-800 sm:grid-cols-2 lg:grid-cols-4">
            {onboarding.map((step) => (
              <li key={step.number} className="bg-brand-900 p-6">
                <span className="font-display text-[0.75rem] font-bold tracking-[0.12em] text-brand-100 tnum">
                  STEP {step.number}
                </span>
                <h3 className="mt-3 font-display text-[1.0625rem] font-semibold tracking-[-0.01em] text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-sand-200/70">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <Section id="submit" className="scroll-mt-28">
        <Container>
          <div className="mx-auto max-w-4xl">
            <SectionHeading
              kicker="Property submission"
              title="Six steps, about eight minutes."
              lead="Nothing publishes until we have spoken to you and verified the
                documents. This form creates a pending listing, not a live one."
            />

            <div className="mt-8 rounded-lg border border-sand-200 bg-white p-6 shadow-soft sm:p-8">
              <ListPropertyForm owner={owner} />
            </div>

            <p className="mt-4 text-[0.75rem] leading-relaxed text-ink-300">
              Questions before you start? Call the onboarding desk on{" "}
              <a
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                className="font-semibold text-brand-700 underline underline-offset-4"
              >
                {site.phone}
              </a>
              , {site.hours}.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
