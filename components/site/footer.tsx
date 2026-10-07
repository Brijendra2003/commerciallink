import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { MarketNotesForm } from "@/components/site/market-notes-form";
import { Container } from "@/components/ui/section";
import { MailIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
import { site } from "@/lib/data/site";
import { PROPERTY_TYPES } from "@/lib/data/taxonomy";

const columns = [
  {
    title: "Explore",
    links: [
      { href: "/properties", label: "All projects" },
      { href: "/properties?segment=residential", label: "Residential" },
      { href: "/properties?segment=commercial", label: "Commercial" },
      { href: "/properties?category=new_project", label: "New projects" },
      { href: "/properties?category=resale", label: "Resale & owner property" },
      { href: "/post-requirement", label: "Post a requirement" },
    ],
  },
  {
    title: "Your Account",
    links: [
      { href: "/dashboard", label: "My dashboard" },
      { href: "/list-your-property", label: "List your project" },
      { href: "/signup?role=owner", label: "Register as an owner" },
      { href: "/signup?role=broker", label: "Register as a broker" },
      { href: "/signup?role=developer", label: "Register as a developer" },
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
              {site.tagline} Owners, brokers and developers list their projects
              here; we verify each one, and buyers reach the lister directly.
            </p>
            <ul className="mt-6 space-y-3 text-[0.8125rem] text-sand-200/70">
              <li className="flex items-start gap-2.5">
                <PinIcon className="mt-px h-4 w-4 shrink-0 text-brand-100" />
                <span>{site.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <PhoneIcon className="h-4 w-4 shrink-0 text-brand-100" />
                <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-sand-50">
                  {site.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MailIcon className="h-4 w-4 shrink-0 text-brand-100" />
                <a href={`mailto:${site.email}`} className="hover:text-sand-50">
                  {site.email}
                </a>
              </li>
            </ul>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="kicker text-brand-100">{col.title}</h3>
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
            <h3 className="kicker text-brand-100">Market Notes</h3>
            <p className="mt-5 text-[0.875rem] leading-relaxed text-sand-200/65">
              Quarterly price and rent benchmarks for every station area from
              Mira Road to Dahanu Road. No listings, no sales pitch.
            </p>
            <MarketNotesForm />

            <div className="mt-7">
              <h3 className="kicker text-brand-100">By Asset Class</h3>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {PROPERTY_TYPES.map((t) => (
                  <li key={t.value}>
                    <Link
                      href={`/properties?type=${t.value}`}
                      className="inline-block rounded border border-white/15 px-2.5 py-1 text-[0.6875rem] font-medium text-sand-200/70 transition-colors hover:border-brand-100/50 hover:text-white"
                    >
                      {t.short}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-7 text-[0.75rem] text-sand-200/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Â© {new Date().getFullYear()} {site.name}. RERA-registered advisory.
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
              <Link href="/privacy" className="hover:text-sand-200">
                Privacy &amp; DPDP policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-sand-200">
                Terms of use
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
