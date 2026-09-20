import { PropertyCard } from "@/components/property/property-card";
import { ButtonLink } from "@/components/ui/button";
import { Container, SectionHeading } from "@/components/ui/section";
import { WaveTop, WaveBottom } from "@/components/ui/wave";
import { getFeaturedProperties } from "@/lib/data/queries";
import { describeError } from "@/lib/log";

export async function Featured() {
  // The homepage is statically generated; a database outage at build or
  // revalidation time should drop this section, not take the page down.
  let featured: Awaited<ReturnType<typeof getFeaturedProperties>> = [];
  try {
    featured = await getFeaturedProperties(6);
  } catch (error) {
    console.error("[home] featured listings unavailable:", describeError(error));
  }

  if (featured.length === 0) return null;

  return (
    <>
      <WaveTop fill="var(--color-brand-900)" />
      <section className="bg-brand-900 pb-4">
        <Container>
          <SectionHeading
            kicker="Current mandates"
            title="Space we are actively"
            accent="taking to market."
            lead="A slice of what is live right now. Each one is under an exclusive or
              co-exclusive mandate, with documents verified before publication."
            align="center"
            tone="light"
          />

          <div className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((property, i) => (
              <PropertyCard
                key={property.id}
                property={property}
                priority={i < 3}
              />
            ))}
          </div>

          <div className="mt-11 flex flex-col items-center gap-4">
            <ButtonLink href="/properties" variant="light" size="lg" arrow>
              See all live listings
            </ButtonLink>
            <p className="text-center text-[0.8125rem] text-sand-200/55">
              Roughly a third of what we transact never gets listed.{" "}
              <a
                href="/post-requirement"
                className="font-semibold text-clay-300 underline underline-offset-4 hover:text-clay-100"
              >
                Post a requirement
              </a>{" "}
              to see off-market stock.
            </p>
          </div>
        </Container>
      </section>
      <WaveBottom fill="var(--color-brand-900)" />
    </>
  );
}
