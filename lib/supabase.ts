import { createClient } from "@supabase/supabase-js";

// The schema lives in supabase/schema.sql. Keeping this client untyped avoids
// shipping generated database types and makes first-time setup straightforward.
let client: any;

/** Server-only database client. The service-role key must never use NEXT_PUBLIC_. */
export function getSupabase(): any {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Supabase now issues sb_secret_ keys. Keep legacy support for projects
  // still using the older service_role key name.
  const key =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in Vercel before deploying.",
    );
  }
  client = createClient<any>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}
