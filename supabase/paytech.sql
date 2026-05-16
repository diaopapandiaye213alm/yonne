-- ============================================================
-- YONNE — Sessions de paiement PayTech Sénégal
-- ============================================================
-- Chaque session représente un lien de paiement généré via
-- l'API PayTech. L'IPN met à jour le statut vers 'completed'
-- ou 'canceled' puis déclenche process_payment_webhook.
-- ============================================================

create table if not exists paytech_sessions (
  token        text         primary key,
  order_id     text         not null references orders(id) on delete cascade,
  amount       integer      not null check (amount > 0),
  status       text         not null default 'pending'
               check (status in ('pending', 'completed', 'canceled')),
  created_at   timestamptz  not null default now(),
  completed_at timestamptz
);

alter table paytech_sessions enable row level security;

-- Service role uniquement — aucun accès client direct
do $$ begin
  create policy "service role only paytech_sessions"
    on paytech_sessions for all
    using (false) with check (false);
exception when duplicate_object then null;
end $$;

create index if not exists idx_paytech_sessions_order
  on paytech_sessions (order_id);

create index if not exists idx_paytech_sessions_status
  on paytech_sessions (status, created_at desc);
