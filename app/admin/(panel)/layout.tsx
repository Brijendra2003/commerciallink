import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/shell";
import { getAdminSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * The gated panel. proxy.ts has already proved a session exists; this is where
 * we confirm the signed-in user is actually staff, and hand the resolved
 * identity to the shell.
 *
 * Every query these pages make runs under the admin-role RLS policies — the
 * only role permitted to read buyer and owner contact fields.
 */
export default async function PanelLayout({
  children,
}: LayoutProps<"/admin">) {
  const session = await getAdminSession();

  if (!session) {
    // Authenticated but not staff, or the session lapsed between proxy and
    // render. Either way, back to the login screen.
    redirect(isSupabaseConfigured ? "/admin/login" : "/");
  }

  return <AdminShell session={session}>{children}</AdminShell>;
}
