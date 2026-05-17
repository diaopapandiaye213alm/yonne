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
  user_id         uuid        references users(id) on delete set null,
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
  onboarding_done      boolean     default false,
  user_id              uuid        references users(id) on delete set null,
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
  status          text        check (status in (
                                'créée',
                                'en_attente_de_paiement',
                                'payée_a_collecter',
                                'assignée',
                                'collecte',
                                'en route',
                                'livrée',
                                'annulée'
                              )) default 'créée',
  payment_method  text        check (payment_method in ('wave','orange','cash','paytech')),
  payment_status  text        check (payment_status in ('pending','received_manually','completed','failed')),
  active          boolean     default false,
  created_at      timestamptz default now()
);

-- Migration additive sur base existante (idempotent)
-- Élargit la contrainte de statut si la table existe déjà.
do $$
begin
  alter table orders
    drop constraint if exists orders_status_check;
  alter table orders
    add constraint orders_status_check check (status in (
      'créée',
      'en_attente_de_paiement',
      'payée_a_collecter',
      'assignée',
      'collecte',
      'en route',
      'livrée',
      'annulée'
    ));

  -- Colonne payment_status — ajoutée si absente
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'orders' and column_name = 'payment_status'
  ) then
    alter table orders
      add column payment_status text
        check (payment_status in ('pending','received_manually','completed','failed'));
  end if;
exception when others then null;
end;
$$;

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
-- MESSAGES DE COMMANDE (chat marchand ↔ livreur)
-- ────────────────────────────────────────────────────────────
create table if not exists order_messages (
  id         bigserial   primary key,
  order_id   text        references orders(id) on delete cascade,
  from_role  text        check (from_role in ('merchant','driver')),
  text       text        not null,
  sent_at    timestamptz default now()
);
alter table order_messages enable row level security;
create policy if not exists "anon read order_messages"  on order_messages for select using (true);
create policy if not exists "anon write order_messages" on order_messages for all    using (true) with check (true);

-- ────────────────────────────────────────────────────────────
-- RATE LIMITING (serverless-safe, replaces in-memory Map)
-- ────────────────────────────────────────────────────────────
create table if not exists api_rate_limits (
  key       text        primary key,
  count     integer     not null default 1,
  reset_at  timestamptz not null
);

-- ────────────────────────────────────────────────────────────
-- ADMIN MESSAGES (chat admin ↔ marchand/livreur)
-- ────────────────────────────────────────────────────────────
create table if not exists admin_messages (
  id           bigserial   primary key,
  subject_type text        not null check (subject_type in ('merchant', 'driver')),
  subject_id   text        not null,
  from_role    text        not null check (from_role in ('admin', 'merchant', 'driver')),
  text         text        not null,
  sent_at      timestamptz not null default now()
);
alter table admin_messages enable row level security;
create policy if not exists "admin read admin_messages"  on admin_messages for select using (true);
create policy if not exists "admin write admin_messages" on admin_messages for all    using (true) with check (true);

-- ────────────────────────────────────────────────────────────
-- DRIVER WITHDRAWALS (retrait Wave / Orange Money)
-- ────────────────────────────────────────────────────────────
create table if not exists driver_withdrawals (
  id          text        primary key default gen_random_uuid()::text,
  driver_id   text        references drivers(id) on delete set null,
  amount      integer     not null,
  phone       text        not null,
  provider    text        not null check (provider in ('wave', 'orange')),
  created_at  timestamptz not null default now()
);
alter table driver_withdrawals enable row level security;
create policy if not exists "driver read own withdrawals"  on driver_withdrawals for select using (true);
create policy if not exists "driver write own withdrawals" on driver_withdrawals for all    using (true) with check (true);

-- ────────────────────────────────────────────────────────────
-- INDEX utiles
-- ────────────────────────────────────────────────────────────
create index if not exists idx_orders_status          on orders(status);
create index if not exists idx_orders_driver          on orders(driver_id);
create index if not exists idx_orders_merchant        on orders(merchant_id);
create index if not exists idx_orders_created         on orders(created_at desc);
create index if not exists idx_orders_client          on orders(client_phone);
create index if not exists idx_sav_messages_tick      on sav_messages(ticket_id);
create index if not exists idx_order_messages_order   on order_messages(order_id);
create index if not exists idx_admin_messages_subject on admin_messages(subject_type, subject_id);
create index if not exists idx_driver_withdrawals_drv on driver_withdrawals(driver_id);

-- ────────────────────────────────────────────────────────────
-- MERCHANT NOTIFICATION PREFERENCES (migration)
-- ────────────────────────────────────────────────────────────
alter table merchants add column if not exists notif_whatsapp boolean default true;
alter table merchants add column if not exists notif_sms      boolean default true;
alter table merchants add column if not exists notif_email    boolean default false;

-- ────────────────────────────────────────────────────────────
-- PLATFORM SETTINGS (migration)
-- ────────────────────────────────────────────────────────────
create table if not exists platform_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz default now()
);

-- RLS: admin access only via service role key (no public policy needed)
alter table platform_settings enable row level security;
