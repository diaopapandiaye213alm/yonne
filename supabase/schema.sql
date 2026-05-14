-- ============================================================
-- YONNE – Schéma Supabase
-- À coller dans : Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- LIVREURS
-- ────────────────────────────────────────────────────────────
create table if not exists drivers (
  id              text primary key,
  name            text        not null,
  avatar_seed     text,
  phone           text,
  vehicle         text        check (vehicle in ('Moto Yamaha','Moto TVS','Vélo électrique','Tricycle')),
  score_ia        integer     default 80 check (score_ia between 0 and 100),
  rating          numeric(3,1) default 4.5 check (rating between 0 and 5),
  tier            text        check (tier in ('Bronze','Argent','Or')),
  badges          text[]      default '{}',
  orders_today    integer     default 0,
  earnings_today  integer     default 0,
  online          boolean     default false,
  in_prayer       boolean     default false,
  lat             numeric(9,6),
  lng             numeric(9,6),
  created_at      timestamptz default now()
);

-- ────────────────────────────────────────────────────────────
-- MARCHANDS
-- ────────────────────────────────────────────────────────────
create table if not exists merchants (
  id                   text primary key,
  name                 text        not null,
  email                text        unique,
  phone                text,
  city                 text,
  plan                 text        check (plan in ('Standard','Premium')),
  status               text        check (status in ('actif','suspendu')) default 'actif',
  orders_this_month    integer     default 0,
  revenue_this_month   integer     default 0,
  orders_last_month    integer     default 0,
  revenue_last_month   integer     default 0,
  joined_at            date        default current_date,
  created_at           timestamptz default now()
);

-- ────────────────────────────────────────────────────────────
-- COMMANDES
-- ────────────────────────────────────────────────────────────
create table if not exists orders (
  id              text primary key,
  driver_id       text references drivers(id) on delete set null,
  merchant_id     text references merchants(id) on delete set null,
  landmark_id     text,
  client_name     text,
  client_phone    text,
  amount          integer     not null check (amount > 0),
  payment_method  text        check (payment_method in ('wave','orange','cash')),
  insurance       boolean     default false,
  status          text        check (status in ('créée','assignée','collecte','en route','livrée')) default 'créée',
  active          boolean     default false,
  created_at      timestamptz default now()
);

-- ────────────────────────────────────────────────────────────
-- UTILISATEURS (auth interne)
-- ────────────────────────────────────────────────────────────
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  password_hash text not null,
  role          text not null check (role in ('admin','merchant','driver')),
  display_name  text,
  redirect_url  text,
  created_at    timestamptz default now()
);

alter table users enable row level security;
create policy if not exists "anon read users"  on users for select using (true);
create policy if not exists "anon write users" on users for all    using (true) with check (true);

-- ────────────────────────────────────────────────────────────
-- TICKETS SAV
-- ────────────────────────────────────────────────────────────
create table if not exists sav_tickets (
  id          text primary key default 'SAV-' || substring(gen_random_uuid()::text, 1, 6),
  order_ref   text,
  type        text,
  description text,
  status      text check (status in ('ouvert','en cours','résolu')) default 'ouvert',
  responsable text default '—',
  delay       text default '—',
  created_at  timestamptz default now()
);

create table if not exists sav_messages (
  id        bigserial   primary key,
  ticket_id text        references sav_tickets(id) on delete cascade,
  from_role text        check (from_role in ('client','admin')),
  text      text        not null,
  sent_at   timestamptz default now()
);

-- ────────────────────────────────────────────────────────────
-- CATALOGUE ARTICLES
-- ────────────────────────────────────────────────────────────
create table if not exists catalogue_items (
  id          text primary key,
  merchant_id text references merchants(id) on delete cascade,
  name        text        not null,
  price       integer     not null check (price > 0),
  category    text        check (category in ('Nourriture','Textile','Électronique','Pharmacie','Autre')) default 'Autre',
  available   boolean     default true,
  stock       integer     default 0 check (stock >= 0),
  created_at  timestamptz default now()
);

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (permissive pour le MVP)
-- Active RLS mais autorise tout avec anon key pour l'instant
-- ────────────────────────────────────────────────────────────
alter table drivers     enable row level security;
alter table merchants   enable row level security;
alter table orders      enable row level security;
alter table sav_tickets enable row level security;
alter table sav_messages enable row level security;

-- Policies permissives MVP (à restreindre en production)
create policy if not exists "anon read drivers"      on drivers      for select using (true);
create policy if not exists "anon write drivers"     on drivers      for all    using (true) with check (true);

create policy if not exists "anon read merchants"    on merchants    for select using (true);
create policy if not exists "anon write merchants"   on merchants    for all    using (true) with check (true);

create policy if not exists "anon read orders"       on orders       for select using (true);
create policy if not exists "anon write orders"      on orders       for all    using (true) with check (true);

create policy if not exists "anon read sav_tickets"  on sav_tickets  for select using (true);
create policy if not exists "anon write sav_tickets" on sav_tickets  for all    using (true) with check (true);

create policy if not exists "anon read sav_messages" on sav_messages for select using (true);
create policy if not exists "anon write sav_messages" on sav_messages for all   using (true) with check (true);

alter table catalogue_items enable row level security;
create policy if not exists "anon read catalogue"  on catalogue_items for select using (true);
create policy if not exists "anon write catalogue" on catalogue_items for all    using (true) with check (true);

-- ────────────────────────────────────────────────────────────
-- INDEX utiles
-- ────────────────────────────────────────────────────────────
create index if not exists idx_orders_status     on orders(status);
create index if not exists idx_orders_driver     on orders(driver_id);
create index if not exists idx_orders_merchant   on orders(merchant_id);
create index if not exists idx_orders_created    on orders(created_at desc);
create index if not exists idx_orders_client     on orders(client_phone);
create index if not exists idx_sav_messages_tick on sav_messages(ticket_id);
