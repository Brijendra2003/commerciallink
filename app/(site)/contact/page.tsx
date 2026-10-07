import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/forms/contact-form";
import { Container, Kicker } from "@/components/ui/section";
import {
  MailIcon,
  PhoneIcon,
  PinIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Speak to the CommercialLink team about a property between Mira Road and Dahanu Road, listing your own project, or a market question. Mon–Sat, 9:30 am – 7:00 pm IST.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const whatsappHref = `https://wa.me/${site.whatsapp.replace(/[^\d]/g, "")}`;

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <Kicker className="mb-4">Contact</Kicker>
            <h1 className="font-display text-[2rem] font-semibold leading-[1.1] tracking-[-0.03em] text-brand-900 sm:text-[2.5rem]">
              One number.{" "}
              <span className="text-brand-600">One person who answers.</span>
            </h1>
            <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-ink-500">
              No call centre, no ticket queue. Send a message and someone on our
              team picks it up the same working day. If you want to list a
              project and would rather not fill in a form, call us and we will
              add it for you over the phone.
            </p>

            <ul className="mt-9 space-y-3">
              <ContactRow
                icon={<PhoneIcon className="h-4 w-4" />}
                label="Call us"
                value={site.phone}
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                note={site.hours}
              />
              <ContactRow
                icon={<WhatsAppIcon className="h-4 w-4" />}
                label="WhatsApp"
                value={site.whatsapp}
                href={whatsappHref}
                note="Fastest for a quick question"
                external
              />
              <ContactRow
                icon={<MailIcon className="h-4 w-4" />}
                label="Email"
                value={site.email}
                href={`mailto:${site.email}`}
                note="Replies within one working day"
              />
              <ContactRow
                icon={<PinIcon className="h-4 w-4" />}
                label="Office"
                value={site.address}
                note="Visits by appointment"
              />
            </ul>

            <div className="mt-8 rounded-lg border border-sand-200 bg-white p-5">
              <p className="text-[0.875rem] font-semibold tracking-tight text-brand-900">
                Looking for something specific?
              </p>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-500">
                A written requirement gets a better answer than a general
                enquiry — it goes straight into our matching queue against
                off-market stock.
              </p>
              <Link
                href="/post-requirement"
                className="mt-3.5 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-brand-700 underline underline-offset-4 transition-colors hover:text-brand-800"
              >
                Submit a requirement instead
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-sand-200 bg-white p-6 shadow-soft sm:p-8">
            <h2 className="font-display text-[1.25rem] font-semibold leading-tight tracking-[-0.015em] text-brand-900">
              Send us a message
            </h2>
            <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-500">
              Everything here reaches a person, not an autoresponder.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
  note,
  external,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  note?: string;
  external?: boolean;
}) {
  const body = (
    <>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded border border-sand-200 bg-sand-50 text-brand-700">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[0.625rem] font-bold uppercase tracking-[0.14em] text-ink-300">
          {label}
        </span>
        <span className="mt-1 block text-[0.875rem] font-semibold tracking-tight text-brand-900">
          {value}
        </span>
        {note ? (
          <span className="mt-0.5 block text-[0.75rem] text-ink-300">{note}</span>
        ) : null}
      </span>
    </>
  );

  const className =
    "flex items-start gap-3.5 rounded-lg border border-sand-200 bg-white p-4 transition-colors";

  return (
    <li>
      {href ? (
        <a
          href={href}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className={`${className} hover:border-brand-600 hover:bg-sand-50`}
        >
          {body}
        </a>
      ) : (
        <div className={className}>{body}</div>
      )}
    </li>
  );
}
