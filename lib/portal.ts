import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type PortalRole = "owner" | "buyer";

export interface PortalSession {
  role: PortalRole;
  /** `owners.id` or `buyers.id`. */
  profileId: string;
  authUserId: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  /** Owners only. */
  kycStatus?: "verified" | "pending" | "rejected";
  emailVerified: boolean;
}

/**
 * The signed-in buyer or owner, or null. Deduped per request so a layout and
 * its pages share one round trip.
 *
 * A single auth user can hold at most one profile per side; the role is
 * whichever profile row exists, checked owner-first.
 */
export const getPortalSession = cache(
  async (): Promise<PortalSession | null> => {
    if (!isSupabaseConfigured) return null;

    const supabase = await createClient();

    // A Supabase outage must not take the login page down with it — treat an
    // unreachable auth service as "not signed in" and let the gate do its job.
    let user;
    try {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch (error) {
      console.error("[portal] session check failed", error);
      return null;
    }

    if (!user) return null;

    const [{ data: owner }, { data: buyer }] = await Promise.all([
      supabase
        .from("owners")
        .select("id, name, email, phone, company, kyc_status")
        .eq("auth_user_id", user.id)
        .maybeSingle(),
      supabase
        .from("buyers")
        .select("id, name, email, phone, company")
        .eq("auth_user_id", user.id)
        .maybeSingle(),
    ]);

    const emailVerified = Boolean(user.email_confirmed_at);

    if (owner) {
      return {
        role: "owner",
        profileId: owner.id,
        authUserId: user.id,
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        company: owner.company,
        kycStatus: owner.kyc_status,
        emailVerified,
      };
    }

    if (buyer) {
      return {
        role: "buyer",
        profileId: buyer.id,
        authUserId: user.id,
        name: buyer.name,
        email: buyer.email,
        phone: buyer.phone,
        company: buyer.company,
        emailVerified,
      };
    }

    // Authenticated with no profile row — a staff account, or a signup that
    // died between createUser and the profile insert. Not a portal user.
    return null;
  },
);

/**
 * Guard for Server Actions. The production checklist is explicit that a proxy
 * or layout check is not enough: every action re-verifies for itself.
 */
export async function requirePortalSession(
  role?: PortalRole,
): Promise<PortalSession> {
  const session = await getPortalSession();
  if (!session) throw new Error("Not signed in.");
  if (role && session.role !== role) {
    throw new Error("This account does not have access to that.");
  }
  return session;
}
