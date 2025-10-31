import { createClient } from "@supabase/supabase-js";

// Server-side client using service role for admin operations
export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error("Missing Supabase env var: NEXT_PUBLIC_SUPABASE_URL");
  }

  // Use service role key if available (for admin operations)
  // Otherwise use anon key (for regular operations)
  const key = serviceKey || anonKey;

  if (!key) {
    throw new Error("Missing Supabase env var: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

// Client for user-specific operations (uses anon key with Clerk user context)
export function createUserSupabaseClient(clerkUserId: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase env vars");
  }

  // In a real implementation, you'd create a JWT token with the clerk user ID
  // For now, we'll use the service role key on the server and handle auth in app logic
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
