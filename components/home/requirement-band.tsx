import { ButtonLink } from "@/components/ui/button";
import { Container, Kicker } from "@/components/ui/section";
import { Blob } from "@/components/ui/wave";

/**
 * The "didn't find a match" catch — Section 4.2 of the brief. It exists to turn
 * a would-be bounce into a captured requirement rather than a lost visitor.
 */
export function RequirementBand() {
  return (
    <section className="pb-20 sm:pb-24">
      <Container>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-clay-500 px-8 py-11 sm:px-12 sm:py-14 lg:px-16">
          <Blob
            className="-right-16 -top-24 h-72 w-72 opacity-40"
            color="var(--color-clay-300)"
          />
          <Blob
            className="-bottom-28 left-1/3 h-64 w-64 opacity-25"
            color="#ffffff"
          />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <Kicker className="text-white/70">
                Didn&apos;t find what you&apos;re looking for?
              </Kicker>
              <h2 className="mt-3 font-display text-[1.85rem] leading-[1.12] tracking-[-0.025em] text-white sm:text-[2.35rem]">
                Tell us the brief.
                <br />
                <span className="italic text-clay-100">We&apos;ll go find it.</span>
              </h2>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-white/85">
                Post your requirement and we match it against off-market
                mandates, upcoming completions and owner stock that has not gone
                live yet. Your details stay with our desk — owners never see
                them.
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
                Post Your Requirement
              </ButtonLink>
              <ButtonLink
                href="/contact"
                size="lg"
                className="justify-center border border-white/35 bg-transparent text-white shadow-none hover:bg-white/12"
              >
                Or call the desk
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
