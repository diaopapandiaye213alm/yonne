-- ============================================================
-- YONNE — Init RLS + tables manquantes
-- Coller dans Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ── Créer les tables manquantes ──────────────────────────────

create table if not exists admin_messages (
  id           bigserial   primary key,
  subject_type text        not null check (subject_type in ('merchant', 'driver')),
  subject_id   text        not null,
  from_role    text        not null check (from_role in ('admin', 'merchant', 'driver')),
  text         text        not null,
  sent_at      timestamptz not null default now()
);

create table if not exists driver_withdrawals (
  id          text        primary key default gen_random_uuid()::text,
  driver_id   text        references drivers(id) on delete set null,
  amount      integer     not null,
  phone       text        not null,
  provider    text        not null check (provider in ('wave', 'orange')),
  created_at  timestamptz not null default now()
);

create table if not exists api_rate_limits (
  key       text        primary key,
  count     integer     not null default 1,
  reset_at  timestamptz not null
);

create table if not exists platform_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz default now()
);

-- ── Activer RLS sur toutes les tables ────────────────────────

alter table drivers            enable row level security;
alter table orders             enable row level security;
alter table merchants          enable row level security;
alter table users              enable row level security;
alter table sav_tickets        enable row level security;
alter table sav_messages       enable row level security;
alter table order_messages     enable row level security;
alter table admin_messages     enable row level security;
alter table driver_withdrawals enable row level security;
alter table catalogue_items    enable row level security;
alter table api_rate_limits    enable row level security;
alter table platform_settings  enable row level security;

-- ── Policies permissives MVP ──────────────────────────────────

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
drop policy if exists "anon read admin_messages"  on admin_messages;
drop policy if exists "anon write admin_messages" on admin_messages;
create policy "anon read admin_messages"  on admin_messages for select using (true);
create policy "anon write admin_messages" on admin_messages for all    using (true) with check (true);

-- driver_withdrawals
drop policy if exists "anon read driver_withdrawals"  on driver_withdrawals;
drop policy if exists "anon write driver_withdrawals" on driver_withdrawals;
create policy "anon read driver_withdrawals"  on driver_withdrawals for select using (true);
create policy "anon write driver_withdrawals" on driver_withdrawals for all    using (true) with check (true);

-- catalogue_items
drop policy if exists "anon read catalogue"  on catalogue_items;
drop policy if exists "anon write catalogue" on catalogue_items;
create policy "anon read catalogue"  on catalogue_items for select using (true);
create policy "anon write catalogue" on catalogue_items for all    using (true) with check (true);

-- api_rate_limits
drop policy if exists "anon ratelimit" on api_rate_limits;
create policy "anon ratelimit" on api_rate_limits for all using (true) with check (true);

-- platform_settings
drop policy if exists "anon read platform_settings"  on platform_settings;
drop policy if exists "anon write platform_settings" on platform_settings;
create policy "anon read platform_settings"  on platform_settings for select using (true);
create policy "anon write platform_settings" on platform_settings for all    using (true) with check (true);

-- ── Vérification finale ───────────────────────────────────────
select
  (select count(*) from orders)    as total_orders,
  (select count(*) from drivers)   as total_drivers,
  (select count(*) from merchants) as total_merchants,
  (select count(*) from users)     as total_users;
