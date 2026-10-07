import { ButtonLink } from "@/components/ui/button";
import { Container, Kicker } from "@/components/ui/section";

/**
 * The "didn't find a match" catch — Section 4.2 of the brief. It exists to turn
 * a would-be bounce into a captured requirement rather than a lost visitor.
 */
export function RequirementBand() {
  return (
    <section className="border-t border-sand-200 bg-white py-14 sm:py-16">
      <Container>
        <div className="rounded-lg border border-brand-800 bg-brand-900 px-7 py-9 sm:px-10 sm:py-11">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <Kicker tone="light">Nothing matching your brief?</Kicker>
              <h2 className="mt-3 font-display text-[1.5rem] font-semibold leading-[1.15] tracking-[-0.025em] text-white sm:text-[1.875rem]">
                Tell us what you need and we will go and find it.
              </h2>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-sand-200/75">
                We match written briefs against projects still in verification,
                upcoming launches along the line, and stock listers have not put
                up yet. A requirement stays with our team — no lister sees it
                until there is something worth showing you.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
              <ButtonLink
                href="/post-requirement"
                variant="light"
                size="lg"
                arrow
                className="justify-center"
              >
                Submit a requirement
              </ButtonLink>
              <ButtonLink
                href="/contact"
                size="lg"
                className="justify-center border border-white/25 bg-transparent text-white hover:bg-white/10"
              >
                Speak to our team
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
