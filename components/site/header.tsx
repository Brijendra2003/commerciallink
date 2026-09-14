"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/site/logo";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { navLinks } from "@/lib/data/site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Stop the page scrolling behind the open drawer.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-brand-900/8 bg-sand-50/88 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <Container>
        <div className="flex h-[4.5rem] items-center justify-between gap-6">
          <Logo />

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => {
                const active =
                  pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={`relative rounded-full px-3.5 py-2 text-[0.8125rem] font-semibold tracking-tight transition-colors ${
                        active
                          ? "text-brand-800"
                          : "text-ink-500 hover:text-brand-800"
                      }`}
                    >
                      {link.label}
                      {active ? (
                        <span className="absolute inset-x-3.5 -bottom-0.5 h-[2px] rounded-full bg-clay-500" />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/login"
              className="rounded-full px-3.5 py-2 text-[0.8125rem] font-semibold text-ink-500 transition-colors hover:text-brand-800"
            >
              Log in
            </Link>
            <ButtonLink href="/properties" size="sm" arrow>
              Browse Space
            </ButtonLink>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-10 w-10 place-items-center rounded-full border border-brand-900/12 text-brand-900 lg:hidden"
          >
            <span className="relative block h-3 w-4">
              <span
                className={`absolute left-0 block h-[1.6px] w-4 rounded bg-current transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  open ? "top-[5px] rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 block h-[1.6px] w-4 rounded bg-current transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  open ? "top-[5px] -rotate-45" : "top-[10px]"
                }`}
              />
            </span>
          </button>
        </div>
      </Container>

      {/* Navigating closes the drawer, so each link dismisses it on click
          rather than reacting to the pathname after the fact. */}
      <div
        id="mobile-nav"
        hidden={!open}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setOpen(false);
        }}
        className="border-t border-brand-900/8 bg-sand-50 lg:hidden"
      >
        <Container className="py-5">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-xl px-3 py-3 text-[0.9375rem] font-semibold text-brand-900 transition-colors hover:bg-brand-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2.5 border-t border-brand-900/8 pt-4">
            <ButtonLink href="/properties" size="lg" arrow className="w-full">
              Browse Space
            </ButtonLink>
            <ButtonLink href="/login" variant="ghost" size="lg" className="w-full">
              Log in
            </ButtonLink>
          </div>
        </Container>
      </div>
    </header>
  );
}
