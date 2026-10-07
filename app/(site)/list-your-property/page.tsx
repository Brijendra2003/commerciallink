import type { Metadata } from "next";
import Link from "next/link";
import { ListProjectForm } from "@/components/forms/list-project-form";
import { Photo } from "@/components/ui/photo";
import { ButtonLink } from "@/components/ui/button";
import { Container, Kicker, Section, SectionHeading } from "@/components/ui/section";
import { CheckIcon, ShieldIcon } from "@/components/ui/icons";
import { ACCOUNT_TYPES, REGION } from "@/lib/data/taxonomy";
import { ownerBenefits, site } from "@/lib/data/site";
import { getPortalSession } from "@/lib/portal";

export const metadata: Metadata = {
  title: "List Your Project — Residential & Commercial",
  description:
    "Owners, brokers and developers: list residential and commercial property from Mira Road to Dahanu Road. Enquiries on your project come straight to your dashboard.",
  alternates: { canonical: "/list-your-property" },
};

const onboarding = [
  {
    number: "01",
    title: "Create your account",
    body: "Register once as an owner, broker or developer. It takes a minute and it is what ties every project and every enquiry to you.",
  },
  {
    number: "02",
    title: "Add the project",
    body: "One short form — category, type, location, size, price and a few photographs. Our team fills in whatever you skip.",
  },
  {
    number: "03",
    title: "We verify it",
    body: "Our team checks the details and the ownership documents. A new project under construction needs its RERA number.",
  },
  {
    number: "04",
    title: "Live, and you work the leads",
    body: "The project publishes and every enquiry on it lands in your dashboard with the buyer's name and number.",
  },
];

export default async function ListYourPropertyPage() {
  const session = await getPortalSession();
  const lister =
    session?.role === "owner"
      ? {
          name: session.name,
          email: session.email,
          phone: session.phone,
          accountType: session.accountType ?? ("owner" as const),
        }
      : null;

  return (
    <>
      <section className="border-b border-sand-200 bg-white">
        <Container>
          <div className="grid items-center gap-10 py-12 sm:py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <div>
              <Kicker className="mb-4">For owners, brokers &amp; developers</Kicker>
              <h1 className="font-display text-[2rem] font-semibold leading-[1.1] tracking-[-0.03em] text-brand-900 sm:text-[2.5rem]">
                List your project.{" "}
                <span className="text-brand-600">Get the leads directly.</span>
              </h1>
              <p className="mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-ink-500">
                Residential or commercial, anywhere from {REGION}. Add the
                project in one short form, our team verifies it, and every
                enquiry a buyer sends reaches you with their name and number —
                in your own dashboard.
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
                  {lister ? "Add a project" : "Register and list"}
                </ButtonLink>
                <ButtonLink href="/contact" variant="ghost" size="lg">
                  Speak to our team
                </ButtonLink>
              </div>
            </div>

            <div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-sand-200 bg-sand-100">
                <Photo
                  publicId="photo-1486406146926-c627a92ad1ab"
                  alt="Residential towers at dusk"
                  sizes="(max-width: 1024px) 100vw, 520px"
                  priority
                  width={1000}
                />
              </div>

              <dl className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-sand-200 bg-sand-200">
                {[
                  { value: "₹0", label: "Cost to list" },
                  { value: "1 form", label: "No six-step wizard" },
                  { value: "Direct", label: "Leads to your dashboard" },
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
                Every project is verified by our team before it publishes. A new
                project under construction must carry a MahaRERA number.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section id="how" className="scroll-mt-28 bg-brand-900 py-14 sm:py-16">
        <Container>
          <SectionHeading
            kicker="How it works"
            title="Register, add the project,"
            accent="work your own leads."
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
          <div className="mx-auto max-w-3xl">
            {lister ? (
              <>
                <SectionHeading
                  kicker="Add a project"
                  title="One form. About two minutes."
                  lead="Only the essentials are required — everything else is
                    optional and our team completes it before the project goes
                    live."
                />

                <div className="mt-8 rounded-lg border border-sand-200 bg-white p-6 shadow-soft sm:p-8">
                  <ListProjectForm account={lister} />
                </div>
              </>
            ) : (
              <RegistrationGate signedIn={Boolean(session)} />
            )}

            <p className="mt-4 text-[0.75rem] leading-relaxed text-ink-300">
              Stuck anywhere? Call us on{" "}
              <a
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                className="font-semibold text-brand-700 underline underline-offset-4"
              >
                {site.phone}
              </a>
              , {site.hours}, and we will add the project for you over the phone.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}

/**
 * The gate.
 *
 * A project has to have an accountable person behind it: the admin
 * verification step is meaningless if the submitter is anonymous, and there is
 * nowhere to send the leads. So this page does not show the form to a visitor
 * who is not signed in on the supply side — it shows them what registering
 * gets them, and the two ways in.
 *
 * `signedIn` tells apart "no account" from "signed in with a buyer account",
 * which need different instructions.
 */
function RegistrationGate({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="rounded-lg border border-sand-200 bg-white p-7 shadow-soft sm:p-9">
      <Kicker className="mb-3">Step 01</Kicker>
      <h2 className="font-display text-[1.5rem] font-semibold leading-tight tracking-[-0.02em] text-brand-900">
        {signedIn
          ? "Your account is a buyer account"
          : "Create your free account to list"}
      </h2>
      <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-ink-500">
        {signedIn
          ? "Listing needs an owner, broker or developer account. Register one with a different email address and your projects and leads will live there."
          : "Registration takes a minute. It is what ties each project to you — and it is the only way we can route a buyer's enquiry to the right person."}
      </p>

      <ul className="mt-7 grid gap-5 sm:grid-cols-3">
        {ACCOUNT_TYPES.map((a) => (
          <li key={a.value} className="rounded-lg border border-sand-200 bg-sand-50 p-4">
            <h3 className="text-[0.875rem] font-semibold tracking-tight text-brand-900">
              {a.label}
            </h3>
            <p className="mt-1.5 text-[0.75rem] leading-relaxed text-ink-500">
              {a.blurb}
            </p>
          </li>
        ))}
      </ul>

      <dl className="mt-7 space-y-3 border-t border-sand-200 pt-6">
        {[
          [
            "Your projects in one place",
            "Add, edit and withdraw listings yourself, and see views on each one.",
          ],
          [
            "Every enquiry, with contact details",
            "A buyer who enquires on your project shows up under Leads with their name, phone and message.",
          ],
          [
            "A verification badge buyers trust",
            "Our team checks each project before it publishes, so your listing carries the verified mark.",
          ],
        ].map(([title, body]) => (
          <div key={title} className="flex items-start gap-2.5">
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <div>
              <dt className="text-[0.8125rem] font-semibold text-brand-900">
                {title}
              </dt>
              <dd className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink-500">
                {body}
              </dd>
            </div>
          </div>
        ))}
      </dl>

      <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-sand-200 pt-6">
        <ButtonLink href="/signup?role=owner" size="lg" arrow>
          Register to list
        </ButtonLink>
        {!signedIn ? (
          <Link
            href="/login?next=/list-your-property"
            className="rounded-lg border border-sand-300 bg-white px-6 py-3 text-sm font-semibold text-brand-900 transition-colors hover:bg-sand-100"
          >
            I already have an account
          </Link>
        ) : null}
      </div>
    </div>
  );
}
