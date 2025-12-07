import { createClient } from "@supabase/supabase-js"

// Admin client med service role key - bruges til public endpoints som widget chat
// Bypasser RLS for at kunne læse agent data uden bruger session
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

