-- ============================================================
-- YONNE — Web Push Subscriptions
-- ============================================================
-- Table : driver_push_subscriptions
--   Stores browser PushSubscription JSON fields per driver.
--   One driver can hold multiple subscriptions (multiple devices).
--   Unique constraint on (driver_id, endpoint) prevents duplicates.
-- ============================================================

create table if not exists driver_push_subscriptions (
  id          uuid         primary key default gen_random_uuid(),
  driver_id   text         not null,
  endpoint    text         not null,
  p256dh      text         not null,
  auth_key    text         not null,
  created_at  timestamptz  not null default now(),
  constraint uq_driver_endpoint unique (driver_id, endpoint)
);

alter table driver_push_subscriptions enable row level security;

-- Drivers can only read/write their own subscriptions (keyed by JWT sub)
do $$ begin
  create policy "driver own push sub" on driver_push_subscriptions
    for all
    using   (driver_id = (auth.jwt() ->> 'sub'))
    with check (driver_id = (auth.jwt() ->> 'sub'));
exception when duplicate_object then null; end $$;

-- Index for fast server-side lookup by driver_id
create index if not exists idx_push_subs_driver
  on driver_push_subscriptions (driver_id);
