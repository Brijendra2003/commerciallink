import type { Metadata } from "next";
import { RequirementForm } from "@/components/forms/requirement-form";
import { Container, Kicker } from "@/components/ui/section";
import { CheckIcon, ShieldIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Post Your Requirement",
  description:
    "Can't find the right home or commercial space between Mira Road and Dahanu Road? Send us the brief and our team matches it against projects still in verification and stock that has not gone live.",
  alternates: { canonical: "/post-requirement" },
};

const promises = [
  "Matched against upcoming launches and stock that is not live yet",
  "Our team calls you back within two working days",
  "A requirement stays with us — no lister sees your number",
  "No fee to post, and no obligation to transact",
];

export default function PostRequirementPage() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <div className="lg:sticky lg:top-[5.5rem] lg:self-start">
            <Kicker className="mb-4">Didn&apos;t find a match?</Kicker>
            <h1 className="font-display text-[2rem] font-semibold leading-[1.1] tracking-[-0.03em] text-brand-900 sm:text-[2.5rem]">
              Send us the brief.{" "}
              <span className="text-brand-600">We will source against it.</span>
            </h1>
            <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-ink-500">
              Plenty on this corridor never reaches a search page — a launch
              still in verification, a resale an owner has mentioned but not
              listed, a tower about to open bookings. A written brief is how you
              get in front of that.
            </p>

            <ul className="mt-8 space-y-3.5">
              {promises.map((p) => (
                <li key={p} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">
                    <CheckIcon className="h-3 w-3" />
                  </span>
                  <span className="text-[0.875rem] leading-relaxed text-ink-500">
                    {p}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-lg border border-sand-200 bg-white p-5">
              <ShieldIcon className="h-5 w-5 text-brand-600" />
              <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-500">
                <span className="font-semibold text-brand-900">
                  A requirement is not an enquiry.
                </span>{" "}
                An enquiry on a project goes to that lister. A requirement stays
                with our team: when we take it to an owner we describe what is
                wanted, not who is asking, and your number is not passed on
                until you have seen something you like.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-sand-200 bg-white p-6 shadow-soft sm:p-8">
            <RequirementForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
