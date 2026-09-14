import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPortalSession } from "@/lib/portal";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · CommercialLink" },
  robots: { index: false, follow: false },
};

/**
 * proxy.ts has already established that a session exists. This confirms the
 * signed-in user actually has a buyer or owner profile — a staff account, or a
 * signup that half-completed, does not belong here.
 */
export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  if (!isSupabaseConfigured) {
    // Nothing to sign into in demo mode; the login screen explains why.
    redirect("/login");
  }

  const session = await getPortalSession();
  if (!session) redirect("/login?next=/dashboard");

  return <>{children}</>;
}
