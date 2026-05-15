// Server-side uniquement — ne jamais importer dans un composant client.
// Utilise la service role key qui bypass toutes les politiques RLS.
// Nécessaire pour les routes /api/auth/* qui tournent avant qu'un JWT soit présent.
import { createClient } from "@supabase/supabase-js";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!key && process.env.NODE_ENV !== "test") {
  console.warn("[supabase-admin] SUPABASE_SERVICE_ROLE_KEY manquant — les routes auth échoueront.");
}

export const supabaseAdmin = createClient(url, key, {
  auth: {
    autoRefreshToken: false,
    persistSession:   false,
  },
});
