import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// _client is a module-level reference updated by setGlobalAuthToken.
// All code should call getSupabase() rather than capturing a reference at import
// time, so they always receive the current authenticated instance.
// This is safe in a browser context (one JS runtime per tab).
// Server-side Route Handlers must use lib/supabase-admin.ts instead.
let _client = createClient(url, key, { auth: { persistSession: false } });

export function getSupabase() {
  return _client;
}

// Called synchronously by SupabaseProvider during render so that all Zustand
// stores' getSupabase() calls already return the authenticated client before
// any child useEffects fire.
export function setGlobalAuthToken(token: string) {
  _client = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth:   { persistSession: false },
  });
}

// Resets to the anonymous client (called on logout).
export function clearGlobalAuthToken() {
  _client = createClient(url, key, { auth: { persistSession: false } });
}

// Named export kept for files that already import { supabase }.
// It is a live-binding alias: reassigning _client is visible to importers.
export { _client as supabase };
