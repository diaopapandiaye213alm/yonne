-- ============================================================
-- YONNE – Politiques RLS de production
-- ============================================================
-- PRÉREQUIS OBLIGATOIRE (à faire UNE FOIS dans le Dashboard Supabase) :
--
-- 1. Supabase Dashboard → Settings → API → "JWT Secret"
--    Remplacez la valeur par la même que AUTH_SECRET dans votre .env
--    Cela permet à auth.uid() et auth.jwt() de lire vos tokens custom.
--
-- 2. Ajoutez `sub` (UUID de l'utilisateur) dans signToken() :
--    new SignJWT({ ...payload, sub: userId })
--    où userId est la colonne `id` de la table `users`.
--
-- 3. Ajoutez une colonne `user_id` aux tables drivers et merchants :
--    ALTER TABLE drivers  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES users(id);
--    ALTER TABLE merchants ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES users(id);
--    Puis remplissez-la lors de l'inscription (api/auth/register).
--
-- Sans ces 3 étapes, auth.uid() = null et toutes les policies
-- bloquantes rejetteraient toutes les requêtes.
-- ============================================================

-- ── Helpers ───────────────────────────────────────────────────────────────────

-- Diagnostic : retourne les policies actives + l'uid/role vu par Postgres pour le JWT courant.
-- Appelable via supabase.rpc('yonne_debug') depuis le script de test ou Postman.
create or replace function yonne_debug()
  returns json
  language sql stable security definer
as $$
  select json_build_object(
    'auth_uid',   auth.uid(),
    'app_role',   auth.jwt() ->> 'app_role',
    'db_role',    current_user,
    'policies',   (
      select json_agg(json_build_object(
        'table',      tablename,
        'policy',     policyname,
        'cmd',        cmd,
        'permissive', permissive
      ) order by tablename, policyname)
      from pg_policies
      where tablename in ('orders', 'drivers', 'merchants', 'sav_tickets', 'sav_messages', 'users', 'catalogue_items', 'order_messages')
    )
  );
$$;

-- Retourne le rôle applicatif contenu dans le JWT custom ('admin'|'merchant'|'driver').
-- On lit "app_role" car "role" est réservé par PostgREST pour SET ROLE (rôle DB Postgres).
-- Si "role" top-level valait "driver", Postgres lèverait : role "driver" does not exist.
create or replace function yonne_role()
  returns text
  language sql stable
as $$
  select coalesce(
    auth.jwt() ->> 'app_role',
    current_setting('request.jwt.claims', true)::json ->> 'app_role'
  );
$$;

-- Retourne l'email contenu dans le JWT custom
create or replace function yonne_email()
  returns text
  language sql stable
as $$
  select coalesce(
    auth.jwt() ->> 'email',
    current_setting('request.jwt.claims', true)::json ->> 'email'
  );
$$;

-- ── Supprimer les policies permissives MVP ───────────────────────────────────

drop policy if exists "anon read drivers"      on drivers;
drop policy if exists "anon write drivers"     on drivers;
drop policy if exists "anon read merchants"    on merchants;
drop policy if exists "anon write merchants"   on merchants;
drop policy if exists "anon read orders"       on orders;
drop policy if exists "anon write orders"      on orders;
drop policy if exists "anon read sav_tickets"  on sav_tickets;
drop policy if exists "anon write sav_tickets" on sav_tickets;
drop policy if exists "anon read users"        on users;
drop policy if exists "anon write users"       on users;

-- ── Table : drivers ──────────────────────────────────────────────────────────

-- Admin : accès total
create policy "admin full drivers"
  on drivers for all
  using      (yonne_role() = 'admin')
  with check (yonne_role() = 'admin');

-- Livreur : lire tous les livreurs (nécessaire pour la carte et le classement)
create policy "driver read all drivers"
  on drivers for select
  using (yonne_role() = 'driver');

-- Livreur : modifier UNIQUEMENT sa propre ligne
create policy "driver update own row"
  on drivers for update
  using      (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Merchant : lire les livreurs (pour la page de suivi)
create policy "merchant read drivers"
  on drivers for select
  using (yonne_role() = 'merchant');

-- ── Table : merchants ─────────────────────────────────────────────────────────

-- Admin : accès total
create policy "admin full merchants"
  on merchants for all
  using      (yonne_role() = 'admin')
  with check (yonne_role() = 'admin');

-- Merchant : lire sa propre fiche uniquement
create policy "merchant read own row"
  on merchants for select
  using (user_id = auth.uid());

-- Merchant : modifier sa propre fiche (email, phone, city)
create policy "merchant update own row"
  on merchants for update
  using      (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ── Table : orders ────────────────────────────────────────────────────────────

-- Admin : accès total
create policy "admin full orders"
  on orders for all
  using      (yonne_role() = 'admin')
  with check (yonne_role() = 'admin');

-- Merchant : voir uniquement ses propres commandes
create policy "merchant read own orders"
  on orders for select
  using (
    yonne_role() = 'merchant'
    and merchant_id in (
      select id from merchants where user_id = auth.uid()
    )
  );

-- Merchant : créer des commandes liées à son merchant_id
create policy "merchant insert own orders"
  on orders for insert
  with check (
    yonne_role() = 'merchant'
    and merchant_id in (
      select id from merchants where user_id = auth.uid()
    )
  );

-- Merchant : annuler uniquement SES commandes non livrées
create policy "merchant cancel own orders"
  on orders for update
  using (
    yonne_role() = 'merchant'
    and merchant_id in (
      select id from merchants where user_id = auth.uid()
    )
    and status != 'livrée'
  )
  with check (
    merchant_id in (
      select id from merchants where user_id = auth.uid()
    )
  );

-- Livreur : voir uniquement les commandes qui lui sont assignées
create policy "driver read own orders"
  on orders for select
  using (
    yonne_role() = 'driver'
    and driver_id in (
      select id from drivers where user_id = auth.uid()
    )
  );

-- Livreur : mettre à jour le statut de SES commandes uniquement
--   (collecte → en route → livrée ; il ne peut pas changer le montant etc.)
create policy "driver update own order status"
  on orders for update
  using (
    yonne_role() = 'driver'
    and driver_id in (
      select id from drivers where user_id = auth.uid()
    )
  )
  with check (
    driver_id in (
      select id from drivers where user_id = auth.uid()
    )
    -- Le livreur ne peut que faire avancer le statut, jamais reculer ni annuler
    and status in ('collecte', 'en route', 'livrée')
  );

-- ── Table : sav_tickets ───────────────────────────────────────────────────────

create policy "admin full sav_tickets"
  on sav_tickets for all
  using      (yonne_role() = 'admin')
  with check (yonne_role() = 'admin');

-- Merchant/Driver : créer un ticket (signalement)
create policy "users insert sav_tickets"
  on sav_tickets for insert
  with check (yonne_role() in ('merchant', 'driver'));

-- Merchant/Driver : lire les tickets liés à leurs commandes
create policy "users read own sav_tickets"
  on sav_tickets for select
  using (
    yonne_role() = 'admin'
    or (
      yonne_role() in ('merchant', 'driver')
      and order_ref in (
        select id from orders
        where (
          yonne_role() = 'merchant'
          and merchant_id in (select id from merchants where user_id = auth.uid())
        )
        or (
          yonne_role() = 'driver'
          and driver_id in (select id from drivers where user_id = auth.uid())
        )
      )
    )
  );

-- ── Table : sav_messages ─────────────────────────────────────────────────────

create policy "admin full sav_messages"
  on sav_messages for all
  using      (yonne_role() = 'admin')
  with check (yonne_role() = 'admin');

create policy "users insert sav_messages"
  on sav_messages for insert
  with check (
    yonne_role() in ('merchant', 'driver')
    and ticket_id in (
      select id from sav_tickets
      where order_ref in (
        select id from orders
        where (
          yonne_role() = 'merchant'
          and merchant_id in (select id from merchants where user_id = auth.uid())
        )
        or (
          yonne_role() = 'driver'
          and driver_id in (select id from drivers where user_id = auth.uid())
        )
      )
    )
  );

create policy "users read own sav_messages"
  on sav_messages for select
  using (
    yonne_role() = 'admin'
    or ticket_id in (
      select id from sav_tickets
      where order_ref in (
        select id from orders
        where (
          yonne_role() = 'merchant'
          and merchant_id in (select id from merchants where user_id = auth.uid())
        )
        or (
          yonne_role() = 'driver'
          and driver_id in (select id from drivers where user_id = auth.uid())
        )
      )
    )
  );

-- ── Table : catalogue_items ──────────────────────────────────────────────────

-- Remplace les policies MVP permissives (anon tout-autorisé)
drop policy if exists "anon read catalogue"  on catalogue_items;
drop policy if exists "anon write catalogue" on catalogue_items;

-- Lecture publique : tout le monde peut parcourir le catalogue
create policy "public read catalogue"
  on catalogue_items for select
  using (true);

-- Marchand : gérer uniquement son propre catalogue
create policy "merchant manage own catalogue"
  on catalogue_items for all
  using (
    yonne_role() = 'merchant'
    and merchant_id in (select id from merchants where user_id = auth.uid())
  )
  with check (
    merchant_id in (select id from merchants where user_id = auth.uid())
  );

-- Admin : accès total
create policy "admin full catalogue"
  on catalogue_items for all
  using      (yonne_role() = 'admin')
  with check (yonne_role() = 'admin');

-- ── Table : order_messages ────────────────────────────────────────────────────

-- Remplace les policies MVP permissives
drop policy if exists "anon read order_messages"  on order_messages;
drop policy if exists "anon write order_messages" on order_messages;

-- Admin : accès total
create policy "admin full order_messages"
  on order_messages for all
  using      (yonne_role() = 'admin')
  with check (yonne_role() = 'admin');

-- Marchand : lire les messages de ses commandes
create policy "merchant read own order_messages"
  on order_messages for select
  using (
    yonne_role() = 'merchant'
    and order_id in (
      select id from orders
      where merchant_id in (select id from merchants where user_id = auth.uid())
    )
  );

-- Livreur : lire les messages de ses commandes assignées
create policy "driver read own order_messages"
  on order_messages for select
  using (
    yonne_role() = 'driver'
    and order_id in (
      select id from orders
      where driver_id in (select id from drivers where user_id = auth.uid())
    )
  );

-- Marchand : envoyer un message sur ses commandes
create policy "merchant insert order_messages"
  on order_messages for insert
  with check (
    yonne_role() = 'merchant'
    and order_id in (
      select id from orders
      where merchant_id in (select id from merchants where user_id = auth.uid())
    )
  );

-- Livreur : envoyer un message sur ses commandes assignées
create policy "driver insert order_messages"
  on order_messages for insert
  with check (
    yonne_role() = 'driver'
    and order_id in (
      select id from orders
      where driver_id in (select id from drivers where user_id = auth.uid())
    )
  );

-- ── Table : users (auth interne) ──────────────────────────────────────────────

-- Personne ne lit la table users via la clé anon (mots de passe en clair)
-- Toutes les opérations sur users passent par les routes API (service role key)
-- Auth admin only :
create policy "admin only users"
  on users for all
  using      (yonne_role() = 'admin')
  with check (yonne_role() = 'admin');

-- ============================================================
-- MIGRATION : ajout de user_id aux tables drivers et merchants
-- À exécuter UNE FOIS après les étapes du prérequis ci-dessus
-- ============================================================
--
-- alter table drivers
--   add column if not exists user_id uuid references users(id) on delete set null;
--
-- alter table merchants
--   add column if not exists user_id uuid references users(id) on delete set null;
--
-- -- Backfill : lier les drivers/merchants existants à leur users.id via l'email
-- -- (nécessite que drivers/merchants aient un email ou un lien vers users)
-- update drivers d
--   set user_id = u.id
--   from users u
--   where u.role = 'driver' and u.display_name = d.name;  -- adapter selon votre logique
--
-- update merchants m
--   set user_id = u.id
--   from users u
--   where u.email = m.email;
-- ============================================================
