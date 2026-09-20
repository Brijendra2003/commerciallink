import type { Metadata } from "next";
import Link from "next/link";
import { Bullets, Clause, LegalPage } from "@/components/site/legal";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms on which CommercialLink provides this website, listing submissions, enquiries and advisory services.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      kicker="Legal"
      title="Terms of use"
      updated="20 September 2026"
      lead={`The terms on which ${site.name} provides this website and the services reached through it. Using the site means you accept them.`}
    >
      <Clause heading="What this service is">
        <p>
          {site.name} is a commercial real estate advisory desk. We take mandates
          from owners and developers, publish listings we have verified, and
          introduce qualified occupiers and buyers. We act as an intermediary and
          adviser. We are not a party to any lease or sale concluded between an
          owner and a buyer or tenant.
        </p>
      </Clause>

      <Clause heading="Listing information">
        <p>
          Every listing is checked against the documents the owner provides before
          it publishes. Even so, areas, rents, prices, floor plates, approvals and
          availability are indicative and can change without notice. Nothing on this
          site is an offer or a representation capable of acceptance.
        </p>
        <p>
          Before committing to a transaction you should carry out your own
          inspection, title diligence and professional verification. We accept no
          liability for a decision taken solely on the basis of a listing page.
        </p>
      </Clause>

      <Clause heading="If you submit a property">
        <p>By submitting a listing you confirm that:</p>
        <Bullets
          items={[
            "You own the property or are authorised by the owner to market it.",
            "The details, commercial terms and documents you provide are accurate and current.",
            "You have the right to share every photograph, video and plan you upload, and you grant us a licence to use them to market the property while the mandate is live.",
            "Nothing uploaded infringes a third party's rights or contains personal data of other people without their consent.",
          ]}
        />
        <p>
          A submission creates a pending listing, not a live one. Nothing publishes
          until our onboarding team has spoken to you and verified ownership
          documents, and we may decline any submission.
        </p>
      </Clause>

      <Clause heading="Media you upload">
        <p>
          Images are limited to 2 MB each and video walkthroughs to 15 MB each.
          Images are resized in your browser before upload. We may re-shoot, crop,
          compress, retouch or re-caption media for presentation, and we commission
          professional photography at our cost for listings we take to market.
        </p>
      </Clause>

      <Clause heading="Accounts">
        <p>
          You are responsible for what happens under your login and for keeping your
          password confidential. Tell us immediately if you believe an account has
          been compromised. We may suspend an account that is used to post false
          listings, to harvest contact details, or to abuse the enquiry forms.
        </p>
      </Clause>

      <Clause heading="Acceptable use">
        <Bullets
          items={[
            "Do not scrape, crawl or bulk-copy listings, or attempt to extract owner or buyer contact details.",
            "Do not submit properties you have no right to market, or enquiries you have no intention of pursuing.",
            "Do not attempt to bypass access controls, probe the platform for vulnerabilities without our written permission, or disrupt the service.",
          ]}
        />
      </Clause>

      <Clause heading="Fees">
        <p>
          Listing a property is free. Brokerage is payable only on a completed
          transaction, on the terms set out in the mandate letter signed with the
          owner. Nothing on this website varies that letter; where the two differ,
          the mandate letter governs.
        </p>
      </Clause>

      <Clause heading="Intellectual property">
        <p>
          The site, its design, written content and the arrangement of the listings
          belong to {site.name}. Media supplied by an owner remains theirs, licensed
          to us as described above. You may not reproduce any of it commercially
          without written permission.
        </p>
      </Clause>

      <Clause heading="Liability">
        <p>
          The site is provided on an &ldquo;as is&rdquo; basis. To the extent
          permitted by law we exclude liability for indirect or consequential loss,
          and for loss of profit, opportunity or anticipated savings, arising from
          use of this website. Nothing here excludes liability that cannot lawfully
          be excluded, including for fraud.
        </p>
      </Clause>

      <Clause heading="Governing law">
        <p>
          These terms are governed by the laws of India. The courts at Mumbai have
          exclusive jurisdiction over any dispute arising from them.
        </p>
      </Clause>

      <Clause heading="Contact">
        <p>
          Questions about these terms:{" "}
          <a
            href={`mailto:${site.email}`}
            className="font-semibold text-brand-700 underline underline-offset-4"
          >
            {site.email}
          </a>{" "}
          or {site.phone}, {site.hours}. How we handle personal data is set out in
          our{" "}
          <Link
            href="/privacy"
            className="font-semibold text-brand-700 underline underline-offset-4"
          >
            privacy &amp; DPDP policy
          </Link>
          .
        </p>
      </Clause>
    </LegalPage>
  );
}
