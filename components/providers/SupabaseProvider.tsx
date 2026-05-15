"use client";
// Fournit un client Supabase authentifié (JWT injecté) à tous les composants clients.
// Le token est lu côté serveur dans chaque layout et passé en prop — jamais stocké
// dans localStorage, jamais exposé à XSS (cookie httpOnly conservé).
import { createContext, useContext, useMemo } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const Ctx = createContext<SupabaseClient | null>(null);

export function SupabaseProvider({
  token,
  children,
}: {
  token: string;
  children: React.ReactNode;
}) {
  const client = useMemo(
    () =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth:   { persistSession: false },
        }
      ),
    [token]
  );

  return <Ctx.Provider value={client}>{children}</Ctx.Provider>;
}

// À utiliser dans tout composant client à la place de `import { supabase } from "@/lib/supabase"`.
// auth.uid() et yonne_role() seront correctement résolus par les policies RLS.
export function useSupabaseAuthed(): SupabaseClient {
  const client = useContext(Ctx);
  if (!client) throw new Error("useSupabaseAuthed() appelé hors de <SupabaseProvider>");
  return client;
}
