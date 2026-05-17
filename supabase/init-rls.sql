-- ============================================================
-- YONNE — Initialisation RLS
-- Coller dans Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Active RLS sur toutes les tables
alter table if exists drivers     enable row level security;
alter table if exists orders      enable row level security;
alter table if exists merchants   enable row level security;
alter table if exists users       enable row level security;
alter table if exists sav_tickets enable row level security;
alter table if exists sav_messages enable row level security;
alter table if exists order_messages enable row level security;
alter table if exists admin_messages enable row level security;
alter table if exists driver_withdrawals enable row level security;
alter table if exists catalogue_items enable row level security;
alter table if exists api_rate_limits enable row level security;

-- ── Policies permissives MVP (à restreindre en production) ──────────────
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

-- sav_tickets
drop policy if exists "anon read sav_tickets"  on sav_tickets;
drop policy if exists "anon write sav_tickets" on sav_tickets;
create policy "anon read sav_tickets"  on sav_tickets for select using (true);
create policy "anon write sav_tickets" on sav_tickets for all    using (true) with check (true);

-- sav_messages
drop policy if exists "anon read sav_messages"  on sav_messages;
drop policy if exists "anon write sav_messages" on sav_messages;
create policy "anon read sav_messages"  on sav_messages for select using (true);
create policy "anon write sav_messages" on sav_messages for all   using (true) with check (true);

-- order_messages
drop policy if exists "anon read order_messages"  on order_messages;
drop policy if exists "anon write order_messages" on order_messages;
create policy "anon read order_messages"  on order_messages for select using (true);
create policy "anon write order_messages" on order_messages for all    using (true) with check (true);

-- admin_messages
drop policy if exists "admin read admin_messages"  on admin_messages;
drop policy if exists "admin write admin_messages" on admin_messages;
create policy "admin read admin_messages"  on admin_messages for select using (true);
create policy "admin write admin_messages" on admin_messages for all    using (true) with check (true);

-- driver_withdrawals
drop policy if exists "driver read own withdrawals"  on driver_withdrawals;
drop policy if exists "driver write own withdrawals" on driver_withdrawals;
create policy "driver read own withdrawals"  on driver_withdrawals for select using (true);
create policy "driver write own withdrawals" on driver_withdrawals for all    using (true) with check (true);

-- catalogue_items
drop policy if exists "anon read catalogue"  on catalogue_items;
drop policy if exists "anon write catalogue" on catalogue_items;
create policy "anon read catalogue"  on catalogue_items for select using (true);
create policy "anon write catalogue" on catalogue_items for all    using (true) with check (true);

-- api_rate_limits
drop policy if exists "anon ratelimit" on api_rate_limits;
create policy "anon ratelimit" on api_rate_limits for all using (true) with check (true);

-- ============================================================
-- Vérification — doit afficher les comptes réels
-- ============================================================
select
  (select count(*) from orders)   as total_orders,
  (select count(*) from drivers)  as total_drivers,
  (select count(*) from merchants)as total_merchants,
  (select count(*) from users)    as total_users;
