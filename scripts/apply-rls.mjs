/**
 * Applique les politiques RLS manquantes sur Supabase.
 * Utilise l'API SQL de Supabase Management.
 * Usage: node scripts/apply-rls.mjs
 */
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
         ?? "https://jugajqiggyvkbjlrsmvq.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_KEY) { console.error("❌ SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local"); process.exit(1); }
const sb = createClient(URL, SERVICE_KEY, { realtime: { transport: ws } });

// Les politiques RLS à créer (idempotentes avec IF NOT EXISTS)
const SQL_STATEMENTS = [
  // ── drivers
  `do $$ begin
    if not exists (select 1 from pg_policies where tablename='drivers' and policyname='anon read drivers') then
      create policy "anon read drivers" on drivers for select using (true);
    end if;
  end $$;`,
  `do $$ begin
    if not exists (select 1 from pg_policies where tablename='drivers' and policyname='anon write drivers') then
      create policy "anon write drivers" on drivers for all using (true) with check (true);
    end if;
  end $$;`,

  // ── orders
  `do $$ begin
    if not exists (select 1 from pg_policies where tablename='orders' and policyname='anon read orders') then
      create policy "anon read orders" on orders for select using (true);
    end if;
  end $$;`,
  `do $$ begin
    if not exists (select 1 from pg_policies where tablename='orders' and policyname='anon write orders') then
      create policy "anon write orders" on orders for all using (true) with check (true);
    end if;
  end $$;`,

  // ── merchants
  `do $$ begin
    if not exists (select 1 from pg_policies where tablename='merchants' and policyname='anon read merchants') then
      create policy "anon read merchants" on merchants for select using (true);
    end if;
  end $$;`,
  `do $$ begin
    if not exists (select 1 from pg_policies where tablename='merchants' and policyname='anon write merchants') then
      create policy "anon write merchants" on merchants for all using (true) with check (true);
    end if;
  end $$;`,

  // ── users
  `do $$ begin
    if not exists (select 1 from pg_policies where tablename='users' and policyname='anon read users') then
      create policy "anon read users" on users for select using (true);
    end if;
  end $$;`,
  `do $$ begin
    if not exists (select 1 from pg_policies where tablename='users' and policyname='anon write users') then
      create policy "anon write users" on users for all using (true) with check (true);
    end if;
  end $$;`,
];

async function applyRLS() {
  console.log("🔒 Application des politiques RLS...\n");

  for (const sql of SQL_STATEMENTS) {
    const tableLine = sql.match(/tablename='(\w+)'/)?.[1] ?? "?";
    const policyLine = sql.match(/policyname='([^']+)'/)?.[1] ?? "?";
    const { error } = await sb.rpc("exec_sql", { query: sql }).catch(() => ({ error: { message: "rpc not available" } }));
    if (error) {
      // Si exec_sql n'est pas disponible, essayer via /rest/v1/rpc/query
      console.log(`  ⚠ ${policyLine}: utilisez le SQL Editor Supabase`);
    } else {
      console.log(`  ✅ ${policyLine} (${tableLine})`);
    }
  }

  console.log("\n📋 Si les politiques n'ont pas été appliquées automatiquement,");
  console.log("   copiez le SQL suivant dans Supabase Dashboard → SQL Editor :\n");
  console.log("─────────────────────────────────────────────────────");

  const manualSQL = `
-- Politiques RLS permissives (MVP)
-- Supabase Dashboard → SQL Editor → Coller et exécuter

alter table drivers   enable row level security;
alter table orders    enable row level security;
alter table merchants enable row level security;
alter table users     enable row level security;

-- drivers
drop policy if exists "anon read drivers"  on drivers;
drop policy if exists "anon write drivers" on drivers;
create policy "anon read drivers"  on drivers for select using (true);
create policy "anon write drivers" on drivers for all    using (true) with check (true);

-- orders
drop policy if exists "anon read orders"  on orders;
drop policy if exists "anon write orders" on orders;
create policy "anon read orders"  on orders for select using (true);
create policy "anon write orders" on orders for all    using (true) with check (true);

-- merchants
drop policy if exists "anon read merchants"  on merchants;
drop policy if exists "anon write merchants" on merchants;
create policy "anon read merchants"  on merchants for select using (true);
create policy "anon write merchants" on merchants for all    using (true) with check (true);

-- users
drop policy if exists "anon read users"  on users;
drop policy if exists "anon write users" on users;
create policy "anon read users"  on users for select using (true);
create policy "anon write users" on users for all    using (true) with check (true);
`;

  console.log(manualSQL);
  console.log("─────────────────────────────────────────────────────");
}

applyRLS().catch(console.error);
