import type { Metadata } from "next";
import Link from "next/link";
import { Bullets, Clause, LegalPage } from "@/components/site/legal";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms on which CommercialLink provides this website, project listings, enquiries and verification.",
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
          {site.name} is a residential and commercial property marketplace for
          the corridor from {site.region}. Registered owners, brokers and
          developers list their own projects; we verify each one before it
          publishes; and enquiries buyers send on a project are passed to the
          lister of that project. We act as a platform and verifier. We are not
          a party to any sale, lease or leave-and-licence agreement concluded
          between a lister and a buyer or tenant, and we do not hold money for
          either side.
        </p>
      </Clause>

      <Clause heading="Listing information">
        <p>
          Every listing is checked against the documents the lister provides
          before it publishes, and a project described as a new project under
          construction must carry a valid MahaRERA registration number. Even so,
          areas, prices, rents, approvals, possession dates and availability are
          indicative and can change without notice. Nothing on this site is an
          offer or a representation capable of acceptance.
        </p>
        <p>
          A RERA number shown on a listing is the number the lister supplied. You
          should verify it yourself on the MahaRERA portal before you pay any
          booking amount.
        </p>
        <p>
          Before committing to a transaction you should carry out your own
          inspection, title diligence and professional verification. We accept no
          liability for a decision taken solely on the basis of a listing page.
        </p>
      </Clause>

      <Clause heading="If you list a project">
        <p>
          You need a registered owner, broker or developer account to list. By
          submitting a project you confirm that:
        </p>
        <Bullets
          items={[
            "You own the property or are authorised by the owner to market it.",
            "The details, prices, terms and documents you provide are accurate and current.",
            "Where the project is a new project under construction, it is registered with MahaRERA and the number you have given is that registration.",
            "You have the right to share every photograph, video and plan you upload, and you grant us a licence to use them to market the property while the listing is live.",
            "Nothing uploaded infringes a third party's rights or contains personal data of other people without their consent.",
          ]}
        />
        <p>
          A submission creates a project pending verification, not a live
          listing. Nothing publishes until our team has verified it, and we may
          decline or withdraw any submission. We may also remove a listing at
          any time if we believe it is inaccurate or that the lister is not
          entitled to market the property.
        </p>
      </Clause>

      <Clause heading="Enquiries and lister obligations">
        <p>
          An enquiry a buyer sends on your project is passed to you with their
          name, phone number, email address and message, so that you can respond
          to it. In respect of that data you are a Data Fiduciary in your own
          right under the Digital Personal Data Protection Act, 2023. You agree
          to use it only to respond to that enquiry about that project, not to
          add the person to a marketing list, and never to sell or pass it to
          anyone else. Accounts found doing so are suspended and their listings
          removed.
        </p>
      </Clause>

      <Clause heading="Media you upload">
        <p>
          Images are limited to 2 MB each and video walkthroughs to 15 MB each.
          Images are resized in your browser before upload. We may crop,
          compress, retouch or re-caption media for presentation. Photographs
          must be of the property being listed; a brochure render of an
          under-construction project must be identifiable as a render.
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
            "Do not scrape, crawl or bulk-copy listings, or attempt to extract lister or buyer contact details.",
            "Do not submit properties you have no right to market, or enquiries you have no intention of pursuing.",
            "Do not use a lead received through this platform for anything other than responding to that enquiry.",
            "Do not attempt to bypass access controls, probe the platform for vulnerabilities without our written permission, or disrupt the service.",
          ]}
        />
      </Clause>

      <Clause heading="Fees">
        <p>
          Listing a project is free, and there is no fee to search, enquire or
          post a requirement. Where we are separately engaged on a transaction,
          brokerage is payable only on completion and on the terms of the letter
          signed for that engagement; nothing on this website varies that
          letter, and where the two differ the letter governs.
        </p>
        <p>
          Any brokerage, booking amount or other charge a lister asks you for is
          a matter between you and that lister. We are not a party to it and do
          not collect it.
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
