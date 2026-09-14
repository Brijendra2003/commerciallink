import { Photo } from "@/components/ui/photo";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { CheckIcon } from "@/components/ui/icons";
import { stats, trustPoints } from "@/lib/data/site";

export function Trust() {
  return (
    <Section>
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.92fr_1fr] lg:items-center lg:gap-16">
          {/* Overlapping image pair with the arched crop the references use. */}
          <div className="relative">
            <div className="relative aspect-[5/6] overflow-hidden rounded-[12rem_12rem_2.5rem_2.5rem] shadow-lift sm:max-w-md">
              <Photo
                publicId="photo-1556761175-b413da4baf72"
                alt="Advisory team reviewing a floor plan in a meeting room"
                sizes="(max-width: 1024px) 100vw, 440px"
                width={900}
              />
            </div>

            <div className="absolute -right-2 bottom-8 hidden w-52 rounded-3xl border-[6px] border-sand-50 bg-white p-5 shadow-lift sm:block lg:-right-6">
              <p className="kicker text-clay-600">Median</p>
              <p className="mt-2 font-display text-[1.75rem] leading-none text-brand-900">
                3.9 hrs
              </p>
              <p className="mt-2 text-[0.75rem] leading-relaxed text-ink-500">
                to first advisor callback on a new enquiry.
              </p>
            </div>
          </div>

          <div>
            <SectionHeading
              kicker="Why the desk sits in the middle"
              title="A listing board sells attention. We"
              accent="sell outcomes."
              lead="Buyers get one advisor who knows the whole market. Owners get a
                filter between them and every speculative caller. That is the
                trade, and it is why our mandates convert."
            />

            <ul className="mt-9 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {trustPoints.map((point) => (
                <li key={point.title}>
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    <h3 className="text-[0.9375rem] font-bold tracking-tight text-brand-900">
                      {point.title}
                    </h3>
                  </div>
                  <p className="mt-2.5 pl-[2.15rem] text-[0.8125rem] leading-relaxed text-ink-500">
                    {point.body}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-9">
              <ButtonLink href="/about" variant="ghost" arrow>
                How we work
              </ButtonLink>
            </div>
          </div>
        </div>

        {/* Stats band */}
        <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-4xl border border-brand-900/8 bg-brand-900/8 sm:mt-20 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-sand-100 px-6 py-8 text-center">
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
    </Section>
  );
}
