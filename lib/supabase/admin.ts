import "server-only";

import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { SUPABASE_URL, serviceRoleKey } from "@/lib/supabase/env";

/**
 * Service-role client. Bypasses RLS, so it is used only where a public,
 * unauthenticated visitor legitimately needs to write a row the anon role
 * cannot read back — enquiry and requirement capture.
 *
 * `server-only` makes importing this from a Client Component a build error.
 *
 * The return type is annotated rather than inferred: without it TypeScript
 * widens the client's schema generic and every `.from()` call degrades to
 * `never`.
 */
export function createAdminClient(): SupabaseClient<Database> {
  return createSupabaseClient<Database>(SUPABASE_URL, serviceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
