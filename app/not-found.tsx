import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { ButtonLink } from "@/components/ui/button";
import { Container, Kicker } from "@/components/ui/section";
import { Blob } from "@/components/ui/wave";

/**
 * The root not-found renders under the root layout, so it carries the public
 * chrome itself rather than inheriting it from the (site) group.
 */
export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden py-20 sm:py-28">
          <Blob className="-right-32 -top-20 h-[22rem] w-[22rem] opacity-60" />
          <Container className="relative">
            <div className="mx-auto max-w-lg text-center">
              <Kicker className="mb-4">404</Kicker>
              <h1 className="font-display text-[2.1rem] leading-[1.1] tracking-[-0.03em] text-brand-900 sm:text-[2.75rem]">
                This one&apos;s off the market —{" "}
                <span className="italic text-brand-700">or never was.</span>
              </h1>
              <p className="mt-5 text-[0.9375rem] leading-relaxed text-ink-500">
                The page you were after has moved, or the listing has been let,
                sold or withdrawn. Our desk usually has something comparable.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <ButtonLink href="/properties" size="lg" arrow>
                  Browse Properties
                </ButtonLink>
                <ButtonLink href="/post-requirement" variant="ghost" size="lg">
                  Post a Requirement
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
