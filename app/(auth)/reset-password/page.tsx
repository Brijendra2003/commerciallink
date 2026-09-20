import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { Kicker } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Set a New Password",
  robots: { index: false, follow: false },
};

/**
 * Landing page for Supabase's password-recovery link. The link carries a
 * recovery token that @supabase/ssr exchanges for a short-lived session, so by
 * the time this renders the user is authenticated just long enough to set a
 * new password.
 */
export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-sm">
      <Kicker className="mb-3">Password recovery</Kicker>
      <h1 className="font-display text-[1.625rem] font-semibold leading-tight tracking-[-0.025em] text-brand-900">
        Set a new password
      </h1>
      <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-500">
        Reset links expire quickly. If this one has lapsed, request another from
        the sign-in screen.
      </p>

      <div className="mt-8">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
