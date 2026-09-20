"use client";

import { useEffect } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container, Kicker } from "@/components/ui/section";
import { PhoneIcon, WhatsAppIcon } from "@/components/ui/icons";
import { site } from "@/lib/data/site";

/**
 * If the listings database is unreachable the page still has to do its job —
 * so the fallback leads with the two channels that do not depend on it.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[site] render failed", error);
  }, [error]);

  const whatsapp = `https://wa.me/${site.whatsapp.replace(/[^\d]/g, "")}`;

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <Kicker className="mb-4">Something went wrong</Kicker>
          <h1 className="font-display text-[1.875rem] font-semibold leading-[1.12] tracking-[-0.03em] text-brand-900 sm:text-[2.25rem]">
            We can&apos;t load listings right now
          </h1>
          <p className="mt-5 text-[0.9375rem] leading-relaxed text-ink-500">
            This is on us, not you. The desk is still open — call or message and
            an advisor will work your brief directly.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-6 py-3 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-brand-800"
            >
              <PhoneIcon className="h-4 w-4" />
              {site.phone}
            </a>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-brand-900/15 px-7 py-3.5 text-[0.9375rem] font-semibold text-brand-900 transition-colors hover:bg-white"
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp the desk
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="text-[0.8125rem] font-semibold text-ink-500 underline underline-offset-4 transition-colors hover:text-brand-800"
            >
              Try again
            </button>
            <span aria-hidden="true" className="text-ink-300">
              ·
            </span>
            <ButtonLink href="/" variant="ghost" size="sm">
              Back to home
            </ButtonLink>
          </div>

          {error.digest ? (
            <p className="mt-8 text-[0.6875rem] text-ink-300">
              Reference {error.digest}
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
