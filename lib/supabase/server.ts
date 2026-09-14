import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabase/env";

/**
 * Request-scoped client for Server Components, Server Actions and Route
 * Handlers. It carries the caller's session cookie, so every query runs under
 * that user's RLS policies — anon for a public visitor, admin for signed-in
 * staff.
 */
export async function createClient() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Guard calls with isSupabaseConfigured.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // proxy.ts refreshes the session, so this is safe to swallow.
        }
      },
    },
  });
}
