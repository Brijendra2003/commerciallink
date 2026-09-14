import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { admins } from "@/lib/data/crm";
import type { AdminRole } from "@/lib/admin-types";

export interface AdminSession {
  id: string;
  authUserId: string | null;
  name: string;
  initials: string;
  email: string;
  role: AdminRole;
  /** True when there are no Supabase credentials and the panel is unlocked. */
  demo: boolean;
}

/**
 * The signed-in staff member, or null. Deduped per request with React `cache`
 * so a layout and its pages share one round trip.
 *
 * With no Supabase credentials the panel runs in demo mode as the seeded super
 * admin — the app stays explorable out of the box, and every gate switches on
 * the moment `.env.local` is filled in.
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  if (!isSupabaseConfigured) {
    const fallback = admins[0];
    return {
      id: fallback.id,
      authUserId: null,
      name: fallback.name,
      initials: fallback.initials,
      email: fallback.email,
      role: fallback.role,
      demo: true,
    };
  }

  const supabase = await createClient();

  // Same reasoning as the portal: an unreachable auth service resolves to
  // "not signed in" rather than throwing through the layout.
  let user;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    console.error("[auth] session check failed", error);
    return null;
  }

  if (!user) return null;

  const { data: staff } = await supabase
    .from("admin_users")
    .select("id, name, initials, email, role, is_active")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  // Authenticated but not staff — e.g. a buyer who typed /admin.
  if (!staff || !staff.is_active) return null;

  return {
    id: staff.id,
    authUserId: user.id,
    name: staff.name,
    initials: staff.initials,
    email: staff.email,
    role: staff.role,
    demo: false,
  };
});

const RANK: Record<AdminRole, number> = {
  content_editor: 1,
  sales_exec: 2,
  super_admin: 3,
};

export function hasRole(session: AdminSession, ...allowed: AdminRole[]) {
  return allowed.includes(session.role);
}

export function atLeast(session: AdminSession, role: AdminRole) {
  return RANK[session.role] >= RANK[role];
}
