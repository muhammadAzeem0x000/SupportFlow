import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicEnv, getServiceRoleKey } from "@/lib/env";
import type { Database } from "@/lib/database.types";

export function createAdminClient() {
  return createClient<Database>(publicEnv.NEXT_PUBLIC_SUPABASE_URL, getServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
