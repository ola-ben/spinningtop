import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* Supabase connection — used both at build time and in the browser.

   Only the PUBLISHABLE key is used (it's built into the site's files, which is
   safe: Row Level Security in supabase/schema.sql + admin-access.sql decides
   what each visitor may do). Never put the secret key in this project's code.

   Env vars (.env.local):
     NEXT_PUBLIC_SUPABASE_URL              https://<project>.supabase.co
     NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  sb_publishable_… */

/** Public bucket for product and service photos. */
export const IMAGE_BUCKET = "catalogue";

// Written out in full so Next can inline them into the browser bundle.
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True when the site should read products/services from Supabase. */
export const supabaseReady = () => !!(URL && KEY);

let browserClient: SupabaseClient | null = null;

/**
 * The Supabase client. In the browser it's shared and remembers the admin's
 * sign-in; during the build it's a plain read-only client.
 */
export function db(): SupabaseClient {
  if (!supabaseReady()) throw new Error("Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / publishable key).");
  if (typeof window === "undefined") {
    return createClient(URL, KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  browserClient ??= createClient(URL, KEY, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: "spinningtop-auth" },
  });
  return browserClient;
}
