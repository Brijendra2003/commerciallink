import type { Metadata } from "next";
import Link from "next/link";
import { Bullets, Clause, LegalPage } from "@/components/site/legal";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Privacy & DPDP Policy",
  description:
    "How CommercialLink collects, uses, stores and protects personal data under India's Digital Personal Data Protection Act, 2023.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      kicker="Legal"
      title="Privacy & DPDP policy"
      updated="20 September 2026"
      lead={`How ${site.name} collects, uses and protects personal data, and the rights you hold over it under India's Digital Personal Data Protection Act, 2023.`}
    >
      <Clause heading="Who we are">
        <p>
          {site.name} operates a commercial real estate advisory desk and this
          website, serving the {site.region}. Our office is at {site.address}. For
          anything in this policy, write to{" "}
          <a
            href={`mailto:${site.email}`}
            className="font-semibold text-brand-700 underline underline-offset-4"
          >
            {site.email}
          </a>{" "}
          or call {site.phone}.
        </p>
        <p>
          In DPDP terms we are the <strong>Data Fiduciary</strong> for the personal
          data described below, and you are the <strong>Data Principal</strong>.
        </p>
      </Clause>

      <Clause heading="What we collect">
        <Bullets
          items={[
            <>
              <strong>Enquiry and requirement forms:</strong> your name, company,
              phone number, email address and whatever you write in the message or
              brief.
            </>,
            <>
              <strong>Owner listing submissions:</strong> the above, plus the
              property details, commercial terms, photographs, video walkthroughs,
              floor plans and any brochure you upload.
            </>,
            <>
              <strong>Accounts:</strong> your name, company, phone and email, held
              against a login. Passwords are stored only as hashes by our
              authentication provider — we never see them.
            </>,
            <>
              <strong>Market Notes:</strong> the email address you subscribe with.
            </>,
            <>
              <strong>Technical data:</strong> a session cookie that keeps you
              signed in, and standard server logs including IP address, used to
              rate-limit form abuse.
            </>,
          ]}
        />
        <p>
          We do not run advertising or cross-site tracking cookies, and we do not
          sell personal data to anyone.
        </p>
      </Clause>

      <Clause heading="Why we process it">
        <Bullets
          items={[
            "To answer your enquiry and to match a requirement against available and off-market stock — the purpose you provided it for.",
            "To verify ownership before a listing publishes, which is a condition of every mandate we take.",
            "To operate your account, including password resets and email confirmation.",
            "To send Market Notes, only where you subscribed, and only until you unsubscribe.",
            "To keep records of transactions we have brokered, where retention is required by law.",
          ]}
        />
      </Clause>

      <Clause heading="The rule that shapes this platform">
        <p>
          Buyer and occupier contact details are visible to our advisory desk only.
          They are never shown to a property owner without your explicit agreement
          to an introduction. Owner phone numbers and email addresses are never
          published on a listing page. This is enforced by row-level security
          policies in the database, not only by what the interface chooses to
          display.
        </p>
      </Clause>

      <Clause heading="Who else handles your data">
        <p>
          We use a small number of processors, each bound to handle data only on our
          instructions:
        </p>
        <Bullets
          items={[
            <>
              <strong>Supabase</strong> — application database, authentication and
              private document storage.
            </>,
            <>
              <strong>Cloudinary</strong> — storage and delivery of listing
              photographs and video walkthroughs.
            </>,
            <>
              <strong>Vercel</strong> — application hosting and request logs.
            </>,
          ]}
        />
        <p>
          Some of these process data on servers outside India. We also disclose data
          where a court, regulator or law enforcement authority validly requires it.
        </p>
      </Clause>

      <Clause heading="How long we keep it">
        <Bullets
          items={[
            "Enquiries and requirements: up to 24 months after the last contact, then deleted or anonymised.",
            "Account and listing records: for as long as the account is open, and afterwards only where a completed transaction requires a record.",
            "Market Notes subscriptions: until you unsubscribe.",
            "Server logs: a rolling short window, for security and abuse prevention.",
          ]}
        />
      </Clause>

      <Clause heading="Your rights">
        <p>Under the DPDP Act you may ask us to:</p>
        <Bullets
          items={[
            "Confirm what personal data of yours we hold, and give you a summary of it.",
            "Correct anything inaccurate, complete anything incomplete, or update it.",
            "Erase it, where we no longer need it for the purpose you gave it for and no law requires us to keep it.",
            "Withdraw consent — for Market Notes, for being contacted about an enquiry, or for an introduction to an owner.",
            "Nominate another person to exercise these rights on your behalf.",
          ]}
        />
        <p>
          Write to{" "}
          <a
            href={`mailto:${site.email}`}
            className="font-semibold text-brand-700 underline underline-offset-4"
          >
            {site.email}
          </a>{" "}
          and we will respond within 30 days. If you are not satisfied with how we
          handle a request, you may complain to the Data Protection Board of India.
        </p>
      </Clause>

      <Clause heading="Security">
        <p>
          Data is encrypted in transit. Access to the advisory console is restricted
          to named staff accounts with role-based permissions, and the database
          enforces those permissions independently of the interface. Uploaded
          brochures are held in a private store and released only after an enquiry
          is qualified. No system is perfectly secure; if a breach affects you, we
          will notify you and the Board as the Act requires.
        </p>
      </Clause>

      <Clause heading="Children">
        <p>
          This is a commercial property service and is not directed at anyone under
          18. We do not knowingly process the personal data of children.
        </p>
      </Clause>

      <Clause heading="Changes">
        <p>
          When this policy changes we update the date at the top of this page. For a
          change that materially affects how we use your data, we will tell you
          directly. See also our{" "}
          <Link
            href="/terms"
            className="font-semibold text-brand-700 underline underline-offset-4"
          >
            terms of use
          </Link>
          .
        </p>
      </Clause>
    </LegalPage>
  );
}
