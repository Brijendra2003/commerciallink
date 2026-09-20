import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PortalLoginForm } from "@/components/forms/portal-login-form";
import { Kicker } from "@/components/ui/section";
import { getPortalSession } from "@/lib/portal";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Log In",
  description:
    "Log in to your CommercialLink account to track enquiries, manage requirements, or update your property listings.",
  robots: { index: false, follow: true },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getPortalSession();
  if (session) redirect("/dashboard");

  const sp = await searchParams;
  const next = Array.isArray(sp.next) ? sp.next[0] : sp.next;

  return (
    <div className="mx-auto max-w-sm">
      <Kicker className="mb-3">Welcome back</Kicker>
      <h1 className="font-display text-[1.625rem] font-semibold leading-tight tracking-[-0.025em] text-brand-900">
        Log in to your account
      </h1>
      <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-500">
        Buyers land on their enquiries and requirements. Owners land on their
        listings dashboard.
      </p>

      <div className="mt-8">
        <PortalLoginForm next={next ?? ""} configured={isSupabaseConfigured} />
      </div>

      <p className="mt-8 border-t border-sand-200 pt-5 text-center text-[0.75rem] text-ink-300">
        Staff sign in at{" "}
        <a
          href="/admin/login"
          className="font-semibold underline underline-offset-4 hover:text-ink-500"
        >
          /admin/login
        </a>
      </p>
    </div>
  );
}
