import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { AssetClasses } from "@/components/home/asset-classes";
import { Featured } from "@/components/home/featured";
import { Trust } from "@/components/home/trust";
import { Process } from "@/components/home/process";
import { Testimonials } from "@/components/home/testimonials";
import { OwnerCta } from "@/components/home/owner-cta";
import { RequirementBand } from "@/components/home/requirement-band";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: `${site.name} — Commercial Property for Lease & Sale in Mumbai`,
  description:
    "Verified office, retail, warehouse, industrial and land mandates across the Mumbai Metropolitan Region. One advisory desk from shortlist to handover.",
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
  areaServed: {
    "@type": "City",
    name: "Mumbai",
    containedInPlace: { "@type": "State", name: "Maharashtra" },
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Unit 704, Trade Centre, Bandra Kurla Complex",
    addressLocality: "Mumbai",
    postalCode: "400051",
    addressCountry: "IN",
  },
};

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
      <Trust />
      <Process />
      <Testimonials />
      <OwnerCta />
      <RequirementBand />
    </>
  );
}
