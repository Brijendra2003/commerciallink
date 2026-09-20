import { Photo } from "@/components/ui/photo";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section, SectionHeading } from "@/components/ui/section";
import { CheckIcon } from "@/components/ui/icons";
import { stats, trustPoints } from "@/lib/data/site";

export function Trust() {
  return (
    <Section>
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1fr] lg:items-center lg:gap-16">
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-sand-200 bg-sand-100">
              <Photo
                publicId="photo-1556761175-b413da4baf72"
                alt="Advisory team reviewing a floor plan in a meeting room"
                sizes="(max-width: 1024px) 100vw, 480px"
                width={900}
              />
            </div>

            <div className="mt-3 rounded-lg border border-sand-200 bg-white p-5">
              <p className="kicker text-brand-600">Median response time</p>
              <p className="mt-2 font-display text-[1.5rem] font-semibold leading-none text-brand-900 tnum">
                3.9 hours
              </p>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-500">
                To first advisor callback on a new enquiry, measured across the
                last four quarters.
              </p>
            </div>
          </div>

          <div>
            <SectionHeading
              kicker="The advisory model"
              title="A listing board sells attention."
              accent="We are accountable for outcomes."
              lead="Occupiers get one advisor who knows the whole market. Owners get a
                filter between them and every speculative caller. That is the
                trade, and it is why our mandates convert."
            />

            <ul className="mt-9 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {trustPoints.map((point) => (
                <li key={point.title}>
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                      <CheckIcon className="h-3 w-3" />
                    </span>
                    <h3 className="text-[0.9375rem] font-semibold tracking-tight text-brand-900">
                      {point.title}
                    </h3>
                  </div>
                  <p className="mt-2.5 pl-[1.875rem] text-[0.8125rem] leading-relaxed text-ink-500">
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

        {/* Track record — a plain figures band, no ornament. */}
        <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-sand-200 bg-sand-200 sm:mt-16 lg:grid-cols-4">
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
    </Section>
  );
}
