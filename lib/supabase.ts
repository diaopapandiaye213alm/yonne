import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// eslint-disable-next-line prefer-const
export let supabase = createClient(url, key);

// Called by SupabaseProvider on mount so that all Zustand stores that import
// `supabase` automatically use the authenticated client (live ES-module binding).
export function setGlobalAuthToken(token: string) {
  supabase = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth:   { persistSession: false },
  });
}
