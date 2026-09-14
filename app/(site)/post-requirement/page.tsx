import type { Metadata } from "next";
import { RequirementForm } from "@/components/forms/requirement-form";
import { Container, Kicker } from "@/components/ui/section";
import { Blob } from "@/components/ui/wave";
import { CheckIcon, ShieldIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Post Your Requirement",
  description:
    "Can't find the right commercial space? Send us the brief and our desk matches it against off-market mandates, upcoming completions and unlisted owner stock.",
  alternates: { canonical: "/post-requirement" },
};

const promises = [
  "Matched against off-market mandates, not just what is on this site",
  "A named advisor calls you back within two working days",
  "Your contact details are never shared with property owners",
  "No fee to post, and no obligation to transact",
];

export default function PostRequirementPage() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-16">
      <Blob className="-right-40 -top-32 h-[26rem] w-[26rem] opacity-60" />
      <Blob
        className="-left-32 bottom-0 h-[20rem] w-[20rem] opacity-50"
        color="var(--color-brand-100)"
      />

      <Container className="relative">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <div className="lg:sticky lg:top-[5.5rem] lg:self-start">
            <Kicker className="mb-4">Didn&apos;t find a match?</Kicker>
            <h1 className="font-display text-[2.1rem] leading-[1.1] tracking-[-0.03em] text-brand-900 sm:text-[2.7rem]">
              Tell us the brief.
              <br />
              <span className="accent-underline italic text-brand-700">
                We&apos;ll go find it.
              </span>
            </h1>
            <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-ink-500">
              Roughly a third of what we transact never appears as a public
              listing — owners hand it to us quietly, and it moves before it
              would ever reach a search page. A written brief is how you get
              access to that.
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

            <div className="mt-9 rounded-3xl border border-brand-900/8 bg-white p-6 shadow-soft">
              <ShieldIcon className="h-5 w-5 text-brand-600" />
              <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-500">
                <span className="font-bold text-brand-900">
                  Requirements are confidential.
                </span>{" "}
                When we take your brief to an owner we describe the requirement,
                not the company — useful if you are moving before you have told
                the market, or a landlord.
              </p>
            </div>
          </div>

          <div className="rounded-4xl border border-brand-900/8 bg-white p-6 shadow-lift sm:p-9">
            <RequirementForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
