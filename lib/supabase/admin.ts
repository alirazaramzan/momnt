import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * WARNING: SERVICE ROLE CLIENT. SERVER ONLY.
 *
 * This client uses SUPABASE_SERVICE_ROLE_KEY and BYPASSES Row Level Security.
 * Never import this file from a Client Component, a "use client" file,
 * or any module that ends up in the browser bundle.
 * The `server-only` import above makes the build fail if that happens.
 *
 * Use it only for trusted server tasks (admin actions, webhooks, seed scripts)
 * after you have checked the caller's role yourself.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase admin client is missing URL or service role key.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
