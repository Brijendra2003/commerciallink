"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { requirePortalSession } from "@/lib/portal";

export interface PortalAuthState {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+]?[\d\s-]{8,15}$/;

function text(data: FormData, key: string): string {
  return String(data.get(key) ?? "").trim();
}

const NOT_CONFIGURED: PortalAuthState = {
  ok: false,
  message:
    "Accounts need Supabase credentials. Add them to .env.local and restart — see the README.",
};

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/* ------------------------------------------------------------------ *
 * Sign up
 * ------------------------------------------------------------------ */

export async function signUpPortalUser(
  _prev: PortalAuthState | null,
  data: FormData,
): Promise<PortalAuthState> {
  if (!isSupabaseConfigured) return NOT_CONFIGURED;

  const role = text(data, "role") === "owner" ? "owner" : "buyer";
  const name = text(data, "name");
  // Lower-cased: profiles are unique on email (0003_listing_details.sql).
  const email = text(data, "email").toLowerCase();
  const phone = text(data, "phone");
  const password = String(data.get("password") ?? "");
  const company = text(data, "company");

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Please enter your full name.";
  if (!EMAIL.test(email)) fieldErrors.email = "Please enter a valid email address.";
  if (!PHONE.test(phone)) fieldErrors.phone = "Please enter a valid phone number.";
  if (password.length < 8) {
    fieldErrors.password = "Use at least 8 characters.";
  } else if (!/\d/.test(password)) {
    fieldErrors.password = "Include at least one number.";
  }
  if (data.get("terms") !== "on") {
    fieldErrors.terms = "Please accept the terms to continue.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors };
  }

  const supabase = await createClient();
  const { data: auth, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
      emailRedirectTo: `${siteUrl()}/dashboard`,
    },
  });

  if (error) {
    // Supabase returns a generic message for an already-registered address
    // when confirmations are on; surface something actionable either way.
    return {
      ok: false,
      message:
        error.message.toLowerCase().includes("registered")
          ? "That email already has an account. Try signing in instead."
          : error.message,
    };
  }

  if (!auth.user) {
    return { ok: false, message: "Could not create the account. Please try again." };
  }

  // Create the profile row with the service-role client: at this moment the
  // user may not have a session yet (email confirmation pending), so the
  // self-insert RLS policy would not apply.
  const admin = createAdminClient();
  const base = {
    auth_user_id: auth.user.id,
    name,
    email,
    phone,
    company: company || null,
  };

  // Branch rather than parameterise the table name: owners carry columns
  // buyers don't, so a dynamic `.from(table)` widens the payload to a union
  // and stops typechecking either shape properly.
  const { error: profileError } =
    role === "owner"
      ? await admin
          .from("owners")
          .upsert(
            { ...base, city: "Mumbai", kyc_status: "pending" as const },
            { onConflict: "email" },
          )
      : await admin.from("buyers").upsert(base, { onConflict: "email" });

  if (profileError) {
    console.error("[portal] profile insert failed", profileError);
    return {
      ok: false,
      message: "Your login was created but the profile failed. Please contact the desk.",
    };
  }

  // With email confirmation enabled there is no session yet.
  if (!auth.session) {
    return {
      ok: true,
      message: `Check ${email} for a confirmation link. Once confirmed you can sign in.`,
    };
  }

  redirect("/dashboard");
}

/* ------------------------------------------------------------------ *
 * Sign in / out
 * ------------------------------------------------------------------ */

const SAFE_NEXT = /^\/(dashboard|properties|post-requirement|list-your-property)(?:\/[\w\-/]*)?(?:\?[\w=&%\-.+]*)?$/;

export async function signInPortalUser(
  _prev: PortalAuthState | null,
  data: FormData,
): Promise<PortalAuthState> {
  if (!isSupabaseConfigured) return NOT_CONFIGURED;

  const email = text(data, "email");
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
    // Vague on purpose — distinguishing "no such user" from "wrong password"
    // hands out a list of valid addresses.
    return { ok: false, message: "Those credentials didn't work." };
  }

  // Staff belong in /admin, not here.
  const { data: staff } = await supabase
    .from("admin_users")
    .select("id")
    .eq("auth_user_id", auth.user.id)
    .maybeSingle();

  if (staff) redirect("/admin");

  const requested = text(data, "next");
  redirect(SAFE_NEXT.test(requested) ? requested : "/dashboard");
}

export async function signOutPortalUser() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}

/* ------------------------------------------------------------------ *
 * Password recovery
 * ------------------------------------------------------------------ */

export async function requestPortalPasswordReset(
  _prev: PortalAuthState | null,
  data: FormData,
): Promise<PortalAuthState> {
  if (!isSupabaseConfigured) return NOT_CONFIGURED;

  const email = text(data, "email");
  if (!EMAIL.test(email)) {
    return { ok: false, message: "Enter a valid email address." };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/reset-password`,
  });

  // Always the same answer — a differing one confirms which addresses exist.
  return {
    ok: true,
    message: "If that address has an account, a reset link is on its way.",
  };
}

export async function updatePortalPassword(
  _prev: PortalAuthState | null,
  data: FormData,
): Promise<PortalAuthState> {
  if (!isSupabaseConfigured) return NOT_CONFIGURED;

  const password = String(data.get("password") ?? "");
  const confirm = String(data.get("confirm") ?? "");

  if (password.length < 8 || !/\d/.test(password)) {
    return {
      ok: false,
      message: "Use at least 8 characters including a number.",
      fieldErrors: { password: "Use at least 8 characters including a number." },
    };
  }
  if (password !== confirm) {
    return {
      ok: false,
      message: "Those passwords don't match.",
      fieldErrors: { confirm: "Those passwords don't match." },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return {
      ok: false,
      message: "That reset link has expired. Request a new one.",
    };
  }

  redirect("/dashboard");
}

/* ------------------------------------------------------------------ *
 * Profile & requirements
 * ------------------------------------------------------------------ */

export async function updatePortalProfile(
  _prev: PortalAuthState | null,
  data: FormData,
): Promise<PortalAuthState> {
  if (!isSupabaseConfigured) return NOT_CONFIGURED;

  // Re-verify inside the action; the layout check is not enough on its own.
  const session = await requirePortalSession();

  const name = text(data, "name");
  const phone = text(data, "phone");
  const company = text(data, "company");

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Please enter your full name.";
  if (!PHONE.test(phone)) fieldErrors.phone = "Please enter a valid phone number.";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from(session.role === "owner" ? "owners" : "buyers")
    .update({ name, phone, company: company || null })
    .eq("id", session.profileId);

  if (error) {
    return { ok: false, message: "Could not save those changes." };
  }

  revalidatePath("/dashboard");
  return { ok: true, message: "Profile updated." };
}

export async function closeRequirement(requirementId: string) {
  if (!isSupabaseConfigured) return;

  const session = await requirePortalSession("buyer");
  const supabase = await createClient();

  // The RLS policy scopes this to the caller's own briefs; the explicit
  // buyer_id filter makes the intent obvious at the call site too.
  await supabase
    .from("requirements")
    .update({ status: "closed" })
    .eq("id", requirementId)
    .eq("buyer_id", session.profileId);

  revalidatePath("/dashboard");
}

export async function withdrawListing(propertyId: string) {
  if (!isSupabaseConfigured) return;

  const session = await requirePortalSession("owner");
  const supabase = await createClient();

  // Only pending submissions can be pulled — a published listing is under
  // mandate and comes down by talking to the desk.
  await supabase
    .from("properties")
    .update({ status: "archived" })
    .eq("id", propertyId)
    .eq("owner_id", session.profileId)
    .eq("status", "pending_review");

  revalidatePath("/dashboard");
}
