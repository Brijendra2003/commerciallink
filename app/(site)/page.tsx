import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { AssetClasses } from "@/components/home/asset-classes";
import { Featured } from "@/components/home/featured";
import { AllProjects } from "@/components/home/all-projects";
import { Trust } from "@/components/home/trust";
import { Process } from "@/components/home/process";
import { Testimonials } from "@/components/home/testimonials";
import { OwnerCta } from "@/components/home/owner-cta";
import { RequirementBand } from "@/components/home/requirement-band";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: `${site.name} — Residential & Commercial Property, Mira Road to Dahanu Road`,
  description:
    "Verified flats, villas, plots, shops, offices and godowns from Mira Road to Dahanu Road. New projects, ready to move and resale — listed by owners, brokers and developers.",
  alternates: { canonical: "/" },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: site.name,
  description: site.description,
  url: site.url,
  email: site.email,
  telephone: site.phone,
  // The corridor, station to station, rather than a single city.
  areaServed: [
    "Mira Road",
    "Bhayandar",
    "Naigaon",
    "Vasai",
    "Nalasopara",
    "Virar",
    "Saphale",
    "Palghar",
    "Boisar",
    "Dahanu Road",
  ].map((name) => ({
    "@type": "Place",
    name,
    containedInPlace: { "@type": "State", name: "Maharashtra" },
  })),
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address,
    addressLocality: "Mira Road",
    postalCode: "401107",
    addressCountry: "IN",
  },
};

// Featured listings: admin edits revalidate immediately; this catches the rest.
export const revalidate = 300;

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Hero />
      <AssetClasses />
      <Featured />
      {/* The full book, not just the featured six. */}
      <AllProjects />
      <Trust />
      <Process />
      <Testimonials />
      <OwnerCta />
      <RequirementBand />
    </>
  );
}
