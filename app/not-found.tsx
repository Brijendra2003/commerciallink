import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { ButtonLink } from "@/components/ui/button";
import { Container, Kicker } from "@/components/ui/section";

/**
 * The root not-found renders under the root layout, so it carries the public
 * chrome itself rather than inheriting it from the (site) group.
 */
export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="py-20 sm:py-24">
          <Container>
            <div className="mx-auto max-w-lg text-center">
              <Kicker className="mb-4">Error 404</Kicker>
              <h1 className="font-display text-[2rem] font-semibold leading-[1.1] tracking-[-0.03em] text-brand-900 sm:text-[2.5rem]">
                This page is off the market.
              </h1>
              <p className="mt-5 text-[0.9375rem] leading-relaxed text-ink-500">
                The page you were after has moved, or the listing has been let,
                sold or withdrawn. Our desk usually has something comparable.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <ButtonLink href="/properties" size="lg" arrow>
                  Browse properties
                </ButtonLink>
                <ButtonLink href="/post-requirement" variant="ghost" size="lg">
                  Submit a requirement
                </ButtonLink>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
