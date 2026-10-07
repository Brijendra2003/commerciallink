import { PropertyCard } from "@/components/property/property-card";
import { ButtonLink } from "@/components/ui/button";
import { Container, SectionHeading } from "@/components/ui/section";
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
    <section className="border-y border-brand-800 bg-brand-900 py-14 sm:py-16 lg:py-20">
      <Container>
        <SectionHeading
          kicker="Featured"
          title="Projects worth a look"
          accent="this week."
          lead="Picked by our team from the live book — new launches, ready
            possession and resale, all verified before publication."
          align="center"
          tone="light"
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((property, i) => (
            <PropertyCard key={property.id} property={property} priority={i < 3} />
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-white/10 pt-8">
          <ButtonLink href="#projects" variant="light" size="lg" arrow>
            See every live project
          </ButtonLink>
          <p className="text-center text-[0.8125rem] text-sand-200/60">
            Own a property on this line?{" "}
            <a
              href="/list-your-property"
              className="font-semibold text-white underline underline-offset-4 hover:text-brand-100"
            >
              List it in two minutes
            </a>{" "}
            and take the enquiries yourself.
          </p>
        </div>
      </Container>
    </section>
  );
}
