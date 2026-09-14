import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { Arrow } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { MailIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
import { site } from "@/lib/data/site";
import { PROPERTY_TYPES } from "@/lib/data/taxonomy";

const columns = [
  {
    title: "Explore",
    links: [
      { href: "/properties", label: "All properties" },
      { href: "/properties?purpose=lease", label: "For lease" },
      { href: "/properties?purpose=buy", label: "For sale" },
      { href: "/post-requirement", label: "Post a requirement" },
      { href: "/about", label: "About the desk" },
    ],
  },
  {
    title: "Your Account",
    links: [
      { href: "/dashboard", label: "My dashboard" },
      { href: "/list-your-property", label: "List your property" },
      { href: "/signup?role=owner", label: "Create owner account" },
      { href: "/signup?role=buyer", label: "Create buyer account" },
      { href: "/login", label: "Log in" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-brand-900 text-sand-200">
      <Container className="py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div>
            <Logo tone="light" />
            <p className="mt-5 max-w-xs text-[0.875rem] leading-relaxed text-sand-200/65">
              {site.tagline} We hold the relationship on both sides of a
              transaction so neither party has to work a phone list.
            </p>
            <ul className="mt-6 space-y-3 text-[0.8125rem] text-sand-200/70">
              <li className="flex items-start gap-2.5">
                <PinIcon className="mt-px h-4 w-4 shrink-0 text-clay-300" />
                <span>{site.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <PhoneIcon className="h-4 w-4 shrink-0 text-clay-300" />
                <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-sand-50">
                  {site.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MailIcon className="h-4 w-4 shrink-0 text-clay-300" />
                <a href={`mailto:${site.email}`} className="hover:text-sand-50">
                  {site.email}
                </a>
              </li>
            </ul>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="kicker text-clay-300">{col.title}</h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-[0.875rem] text-sand-200/70 transition-colors hover:text-sand-50"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="kicker text-clay-300">Market Notes</h3>
            <p className="mt-5 text-[0.875rem] leading-relaxed text-sand-200/65">
              Quarterly rent benchmarks and absorption data for the MMR
              markets. No listings, no sales pitch.
            </p>
            <form className="mt-5" aria-label="Subscribe to market notes">
              <div className="flex items-center gap-2 rounded-full border border-sand-200/18 bg-white/6 p-1.5 pl-4 transition-colors focus-within:border-clay-300/60">
                <label htmlFor="footer-email" className="sr-only">
                  Work email
                </label>
                <input
                  id="footer-email"
                  type="email"
                  name="email"
                  required
                  placeholder="Your work email"
                  className="min-w-0 flex-1 bg-transparent text-[0.8125rem] text-sand-50 placeholder:text-sand-200/40 focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="group/btn grid h-8 w-8 shrink-0 place-items-center rounded-full bg-clay-500 text-white transition-colors hover:bg-clay-600"
                >
                  <Arrow />
                </button>
              </div>
            </form>

            <div className="mt-7">
              <h3 className="kicker text-clay-300">By Asset Class</h3>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {PROPERTY_TYPES.map((t) => (
                  <li key={t.value}>
                    <Link
                      href={`/properties?type=${t.value}`}
                      className="inline-block rounded-full border border-sand-200/15 px-3 py-1.5 text-[0.6875rem] font-medium text-sand-200/70 transition-colors hover:border-clay-300/50 hover:text-sand-50"
                    >
                      {t.short}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-sand-200/12 pt-7 text-[0.75rem] text-sand-200/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. RERA-registered advisory.
            All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link href="/about#faqs" className="hover:text-sand-200">
                FAQs
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-sand-200">
                Contact
              </Link>
            </li>
            <li>
              <span className="cursor-default">Privacy &amp; DPDP policy</span>
            </li>
            <li>
              <span className="cursor-default">Terms of use</span>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
