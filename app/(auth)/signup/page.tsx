import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PortalSignupForm } from "@/components/forms/portal-signup-form";
import { Kicker } from "@/components/ui/section";
import { getPortalSession } from "@/lib/portal";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Create an Account",
  description:
    "Create a CommercialLink account as a buyer to track enquiries, or as an owner, broker or developer to list residential and commercial projects.",
  robots: { index: false, follow: true },
};

const SIGNUP_ROLES = ["buyer", "owner", "broker", "developer"] as const;
type SignupRole = (typeof SIGNUP_ROLES)[number];

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getPortalSession();
  if (session) redirect("/dashboard");

  const sp = await searchParams;
  const requested = Array.isArray(sp.role) ? sp.role[0] : sp.role;

  return (
    <div className="mx-auto max-w-sm">
      <Kicker className="mb-3">Create an account</Kicker>
      <h1 className="font-display text-[1.625rem] font-semibold leading-tight tracking-[-0.025em] text-brand-900">
        Create your account
      </h1>
      <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-500">
        Registration is what ties a project to an accountable lister and an
        enquiry to a real buyer — which is why nothing here is anonymous.
      </p>

      <div className="mt-8">
        <PortalSignupForm
          defaultRole={
            SIGNUP_ROLES.includes(requested as SignupRole)
              ? (requested as SignupRole)
              : "buyer"
          }
          configured={isSupabaseConfigured}
        />
      </div>
    </div>
  );
}
