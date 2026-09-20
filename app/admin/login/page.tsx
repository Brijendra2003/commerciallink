import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/site/logo";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Admin Sign In",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // With no credentials there is nothing to sign into — the panel is open in
  // demo mode, so send visitors straight there rather than to a dead form.
  if (!isSupabaseConfigured) redirect("/admin");

  const sp = await searchParams;
  const next = Array.isArray(sp.next) ? sp.next[0] : sp.next;

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-900 px-5 py-12">
      <div className="w-full max-w-[26rem]">
        <div className="mb-8 flex justify-center">
          <Logo tone="light" />
        </div>

        <div className="rounded-lg border border-sand-200 bg-white p-7 shadow-lift sm:p-8">
          <p className="kicker text-brand-600">Advisory desk</p>
          <h1 className="mt-3 font-display text-[1.5rem] font-semibold leading-tight tracking-[-0.02em] text-brand-900">
            Sign in to the admin console
          </h1>
          <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-ink-500">
            Staff accounts only. Buyer and owner logins use the public site.
          </p>

          <div className="mt-7">
            <LoginForm next={next ?? ""} />
          </div>
        </div>

        <p className="mt-6 text-center text-[0.75rem] text-sand-200/55">
          Not staff?{" "}
          <Link
            href="/"
            className="font-semibold text-brand-100 underline underline-offset-4 hover:text-white"
          >
            Back to the public site
          </Link>
        </p>
      </div>
    </div>
  );
}
