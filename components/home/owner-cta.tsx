import { Photo } from "@/components/ui/photo";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { CheckIcon } from "@/components/ui/icons";
import { ownerBenefits } from "@/lib/data/site";

export function OwnerCta() {
  return (
    <Section>
      <Container>
        <div className="overflow-hidden rounded-lg border border-sand-200 bg-white shadow-soft">
          <div className="grid lg:grid-cols-[1fr_0.85fr]">
            <div className="p-8 sm:p-11 lg:p-14">
              <SectionHeading
                kicker="For owners, brokers & developers"
                title="Got a property on this line?"
                accent="List it in two minutes."
                lead="One short form, no six-step wizard. Our team verifies it,
                  it goes live, and every enquiry a buyer sends lands in your
                  dashboard with their name and number."
              />

              <ul className="mt-8 grid gap-x-7 gap-y-5 sm:grid-cols-2">
                {ownerBenefits.map((b) => (
                  <li key={b.title}>
                    <div className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 shrink-0 text-brand-600" />
                      <h3 className="text-[0.875rem] font-semibold tracking-tight text-brand-900">
                        {b.title}
                      </h3>
                    </div>
                    <p className="mt-2 pl-6 text-[0.8125rem] leading-relaxed text-ink-500">
                      {b.body}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <ButtonLink href="/signup?role=owner" size="lg" arrow>
                  Register and list
                </ButtonLink>
                <ButtonLink href="/list-your-property" variant="ghost" size="lg">
                  How it works
                </ButtonLink>
              </div>

              <p className="mt-5 text-[0.75rem] text-ink-300">
                Free to list. You will need an account — it is what ties the
                project, and its enquiries, to you.
              </p>
            </div>

            <div className="relative min-h-[16rem] border-t border-sand-200 bg-sand-100 lg:min-h-full lg:border-l lg:border-t-0">
              <Photo
                publicId="photo-1497604401993-f2e922e5cb0a"
                alt="Owner reviewing enquiries on a laptop"
                sizes="(max-width: 1024px) 100vw, 420px"
                width={900}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-900/55 via-brand-900/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7">
                <p className="font-display text-[1.25rem] font-semibold leading-tight text-white">
                  Leads, not lead-gen
                </p>
                <p className="mt-1.5 text-[0.75rem] text-sand-200/80">
                  Name, phone number and message — in your dashboard, the moment
                  a buyer sends it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
