-- ============================================================
-- YONNE — Intégration paiements Wave / Orange Money
-- ============================================================
-- Table : payment_events  (journal idempotent des callbacks)
-- RPC   : process_payment_webhook  (atomique, fail-closed)
-- ============================================================


-- ── Table : payment_events ────────────────────────────────────────────────────
-- event_id est la clé de déduplication : le transaction_id du fournisseur.
-- Un même event_id ne peut jamais produire deux lignes → pas de double-comptabilisation.
create table if not exists payment_events (
  event_id      text         primary key,
  order_id      text         references orders(id) on delete set null,
  provider      text         not null check (provider in ('wave', 'orange')),
  amount        integer      not null check (amount > 0),
  currency      text         not null default 'XOF',
  status        text         not null check (status in ('completed', 'failed', 'pending')),
  raw_payload   jsonb        not null,
  processed_at  timestamptz  not null default now()
);

alter table payment_events enable row level security;

-- Aucune politique d'accès anon/authenticated.
-- Toutes les lectures et écritures se font via le service-role (route API webhook).
create policy "service role only payment_events"
  on payment_events for all
  using      (false)
  with check (false);

create index if not exists idx_payment_events_order
  on payment_events (order_id);

create index if not exists idx_payment_events_processed
  on payment_events (processed_at desc);


-- ── RPC : process_payment_webhook ─────────────────────────────────────────────
-- Garanties :
--   1. Idempotence via event_id (PK) — appel répété avec le même ID est un no-op.
--   2. SELECT FOR UPDATE sur orders — un seul thread traite un order à la fois.
--   3. Mise à jour de merchants.revenue_this_month atomique avec l'insertion.
--   4. Aucun accès anon/authenticated (revoke execute en bas).
create or replace function process_payment_webhook(
  p_event_id  text,
  p_order_id  text,
  p_provider  text,
  p_amount    integer,
  p_currency  text,
  p_status    text,
  p_raw       jsonb
)
  returns json
  language plpgsql
  security definer
  set search_path = public
as $$
declare
  v_existing   payment_events%rowtype;
  v_order      orders%rowtype;
begin
  -- ── 1. Idempotence check ──────────────────────────────────────────────────
  select * into v_existing
  from payment_events
  where event_id = p_event_id;

  if found then
    return json_build_object(
      'status',        'already_processed',
      'event_id',      p_event_id,
      'processed_at',  v_existing.processed_at
    );
  end if;

  -- ── 2. Verrou sur la ligne orders (évite le double-traitement concurrent) ─
  -- Si order_id est NULL (webhook de test sans commande), on passe quand même.
  if p_order_id is not null then
    select * into v_order
    from orders
    where id = p_order_id
    for update;

    if not found then
      return json_build_object(
        'status',   'error',
        'message',  'order not found',
        'order_id', p_order_id
      );
    end if;
  end if;

  -- ── 3. Insertion idempotente du journal de paiement ───────────────────────
  insert into payment_events (event_id, order_id, provider, amount, currency, status, raw_payload)
  values (p_event_id, p_order_id, p_provider, p_amount, p_currency, p_status, p_raw);

  -- ── 4. Mise à jour du revenu marchand si paiement confirmé ───────────────
  if p_status = 'completed' and v_order.merchant_id is not null then
    update merchants
    set
      revenue_this_month = revenue_this_month + p_amount,
      orders_this_month  = orders_this_month  + 1
    where id = v_order.merchant_id;
  end if;

  return json_build_object(
    'status',         'processed',
    'event_id',       p_event_id,
    'order_id',       p_order_id,
    'provider',       p_provider,
    'amount',         p_amount,
    'payment_status', p_status
  );
end;
$$;

-- Service-role uniquement — interdit à anon et authenticated
revoke execute
  on function process_payment_webhook(text, text, text, integer, text, text, jsonb)
  from anon, authenticated;
