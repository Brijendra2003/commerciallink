/**
 * The app runs in two modes:
 *
 *  - **Live** — Supabase env vars are present, so every read and write goes to
 *    Postgres under RLS.
 *  - **Demo** — no credentials, so the typed mock data in lib/data/* is served
 *    instead and form submissions are logged rather than inserted.
 *
 * This keeps the project runnable the moment it is cloned, and flips to live
 * data the moment `.env.local` is filled in — no code change.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

/** Server-only. Never import this into a Client Component. */
export function serviceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. It is required for admin-side writes.",
    );
  }
  return key;
}
