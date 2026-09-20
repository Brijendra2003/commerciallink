"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/site/logo";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { MailIcon, PhoneIcon } from "@/components/ui/icons";
import { navLinks, site } from "@/lib/data/site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Stop the page scrolling behind the open drawer.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50">
      {/* Utility bar — the desk's contact details, visible before a visitor
          has to go looking for them. */}
      <div className="hidden bg-brand-900 lg:block">
        <Container>
          <div className="flex h-9 items-center justify-between gap-6 text-[0.75rem]">
            <p className="text-sand-200/60">
              {site.region} · Office, retail, warehousing, industrial &amp; land
            </p>
            <div className="flex items-center gap-6">
              <a
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-1.5 text-sand-200/75 transition-colors hover:text-white"
              >
                <PhoneIcon className="h-3.5 w-3.5" />
                {site.phone}
              </a>
              <a
                href={`mailto:${site.email}`}
                className="flex items-center gap-1.5 text-sand-200/75 transition-colors hover:text-white"
              >
                <MailIcon className="h-3.5 w-3.5" />
                {site.email}
              </a>
            </div>
          </div>
        </Container>
      </div>

      <div className="border-b border-sand-200 bg-white">
        <Container>
          <div className="flex h-16 items-center justify-between gap-6">
            <Logo />

            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center">
                {navLinks.map((link) => {
                  const active =
                    pathname === link.href || pathname.startsWith(`${link.href}/`);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        className={`relative flex h-16 items-center px-3.5 text-[0.8125rem] font-semibold transition-colors ${
                          active
                            ? "text-brand-700"
                            : "text-ink-500 hover:text-brand-800"
                        }`}
                      >
                        {link.label}
                        {active ? (
                          <span className="absolute inset-x-2 bottom-0 h-[2px] bg-brand-700" />
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="hidden items-center gap-2.5 lg:flex">
              <Link
                href="/login"
                className="px-2 text-[0.8125rem] font-semibold text-ink-500 transition-colors hover:text-brand-800"
              >
                Log in
              </Link>
              <ButtonLink href="/properties" size="sm">
                Browse space
              </ButtonLink>
            </div>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid h-10 w-10 place-items-center rounded border border-sand-300 text-brand-900 lg:hidden"
            >
              <span className="relative block h-3 w-4">
                <span
                  className={`absolute left-0 block h-[1.6px] w-4 bg-current transition-transform duration-200 ${
                    open ? "top-[5px] rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 block h-[1.6px] w-4 bg-current transition-transform duration-200 ${
                    open ? "top-[5px] -rotate-45" : "top-[10px]"
                  }`}
                />
              </span>
            </button>
          </div>
        </Container>
      </div>

      {/* Navigating closes the drawer, so each link dismisses it on click
          rather than reacting to the pathname after the fact. */}
      <div
        id="mobile-nav"
        hidden={!open}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setOpen(false);
        }}
        className="border-b border-sand-200 bg-white lg:hidden"
      >
        <Container className="py-4">
          <ul className="flex flex-col divide-y divide-sand-200">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block py-3 text-[0.9375rem] font-semibold text-brand-900"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2.5">
            <ButtonLink href="/properties" size="lg" className="w-full">
              Browse space
            </ButtonLink>
            <ButtonLink href="/login" variant="ghost" size="lg" className="w-full">
              Log in
            </ButtonLink>
          </div>
          <div className="mt-5 flex flex-col gap-2 border-t border-sand-200 pt-4 text-[0.8125rem] text-ink-500">
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="font-semibold">
              {site.phone}
            </a>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </div>
        </Container>
      </div>
    </header>
  );
}
