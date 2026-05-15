// Server-side uniquement — ne jamais importer dans un composant client.
//
// Contrairement à lib/supabase.ts (clé anon seule, auth.uid() = null),
// ce client injecte le JWT yonne_session dans Authorization: Bearer <token>.
// Résultat : Supabase lit sub → auth.uid() et app_role → yonne_role(),
// ce qui active les politiques RLS par utilisateur (driver/merchant).
//
// Usage : une instance par requête (factory, pas singleton).
//   const db = await supabaseAuthed();
//   const { data } = await db.from("orders").select("*");
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const url     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function supabaseAuthed() {
  const token = (await cookies()).get("yonne_session")?.value ?? "";
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth:   { persistSession: false },
  });
}
