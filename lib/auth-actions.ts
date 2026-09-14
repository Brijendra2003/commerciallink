"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export interface AuthState {
  ok: boolean;
  message: string;
}

const SAFE_NEXT = /^\/admin(?:\/[\w\-/]*)?(?:\?[\w=&%\-.]*)?$/;

export async function signIn(
  _prev: AuthState | null,
  data: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      message:
        "Supabase is not configured, so the panel is already open in demo mode. Add credentials to .env.local to enable sign-in.",
    };
  }

  const email = String(data.get("email") ?? "").trim();
  const password = String(data.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { data: auth, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !auth.user) {
    // Deliberately vague: distinguishing "no such user" from "wrong password"
    // hands an attacker a list of valid staff addresses.
    return { ok: false, message: "Those credentials didn't work." };
  }

  // Authenticating is not the same as being staff. A buyer account must not
  // land inside the CRM, so check membership before we let the redirect run.
  const { data: staff } = await supabase
    .from("admin_users")
    .select("id, is_active")
    .eq("auth_user_id", auth.user.id)
    .maybeSingle();

  if (!staff || !staff.is_active) {
    await supabase.auth.signOut();
    return {
      ok: false,
      message: "That account does not have access to the admin panel.",
    };
  }

  await supabase
    .from("admin_users")
    .update({ last_seen: new Date().toISOString() })
    .eq("id", staff.id);

  const requested = String(data.get("next") ?? "");
  // Only ever redirect within /admin — an open redirect here would be a
  // phishing vector straight off the login page.
  redirect(SAFE_NEXT.test(requested) ? requested : "/admin");
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

export async function sendPasswordReset(
  _prev: AuthState | null,
  data: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Supabase is not configured." };
  }

  const email = String(data.get("email") ?? "").trim();
  if (!email) return { ok: false, message: "Enter your email address." };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/admin/reset-password`,
  });

  // Always report success — a differing response would confirm which
  // addresses are registered.
  return {
    ok: true,
    message: "If that address belongs to a staff account, a reset link is on its way.",
  };
}
