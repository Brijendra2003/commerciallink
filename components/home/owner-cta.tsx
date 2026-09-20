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
                kicker="For owners & developers"
                title="Own commercial space?"
                accent="List it privately."
                lead="Your number never appears on the site. We qualify every buyer
                  before an introduction, so you spend your time on offers, not
                  on tyre-kickers."
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
                <ButtonLink href="/list-your-property" size="lg" arrow>
                  List Your Property
                </ButtonLink>
                <ButtonLink href="/contact" variant="ghost" size="lg">
                  Speak to onboarding
                </ButtonLink>
              </div>

              <p className="mt-5 text-[0.75rem] text-ink-300">
                Free to list. We are paid a brokerage fee only when a
                transaction completes.
              </p>
            </div>

            <div className="relative min-h-[16rem] border-t border-sand-200 bg-sand-100 lg:min-h-full lg:border-l lg:border-t-0">
              <Photo
                publicId="photo-1497604401993-f2e922e5cb0a"
                alt="Commercial office campus exterior"
                sizes="(max-width: 1024px) 100vw, 420px"
                width={900}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-900/55 via-brand-900/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7">
                <p className="font-display text-[1.25rem] font-semibold leading-tight text-white tnum">
                  412 deals closed
                </p>
                <p className="mt-1.5 text-[0.75rem] text-sand-200/80">
                  Across office, retail, warehousing and industrial since 2019.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
