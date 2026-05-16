-- ============================================================
-- YONNE — Migration : Payment Status & Validation Manuelle
-- ============================================================
-- Prérequis : schema.sql, rls.sql
--
-- Modifie la table orders :
--   • Ajoute payment_status (pending → received_manually | failed)
--   • Élargit le CHECK de payment_method pour les transferts personnels
--
-- Crée :
--   • payment_audit_log — trace de réconciliation financière
--   • yonne_merchant_confirm_payment(p_order_id, p_method) — RPC sécurisée
-- ============================================================


-- ── 1. payment_status sur orders ──────────────────────────────────────────
alter table orders
  add column if not exists payment_status text
    not null default 'pending'
    check (payment_status in ('pending', 'received_manually', 'failed'));


-- ── 2. Élargissement du CHECK payment_method ──────────────────────────────
-- wave_personal / om_personal = paiement reçu via app personnelle du marchand
-- (valeurs insérées uniquement par la RPC ci-dessous, jamais par le client)
do $$ begin
  alter table orders drop constraint orders_payment_method_check;
exception when undefined_object then null; end $$;

do $$ begin
  alter table orders
    add constraint orders_payment_method_check
      check (payment_method in ('wave', 'orange', 'cash', 'wave_personal', 'om_personal'));
exception when duplicate_object then null; end $$;


-- ── 3. Table d'audit pour réconciliation financière hebdomadaire ──────────
create table if not exists payment_audit_log (
  id            uuid        primary key default gen_random_uuid(),
  order_id      text        not null references orders(id) on delete cascade,
  merchant_id   text        not null,
  method        text        not null
                  check (method in ('wave_personal', 'om_personal', 'cash')),
  confirmed_at  timestamptz not null default now(),
  merchant_sub  text        -- JWT sub du marchand pour non-répudiation
);

alter table payment_audit_log enable row level security;

-- Marchands : lecture de leurs propres entrées uniquement
do $$ begin
  create policy "merchant read own audit" on payment_audit_log
    for select using (
      merchant_id in (
        select id from merchants
        where user_id = (auth.jwt() ->> 'sub')::uuid
      )
    );
exception when duplicate_object then null; end $$;

-- Index de réconciliation : toutes les confirmations d'un marchand par date
create index if not exists idx_payment_audit_merchant
  on payment_audit_log (merchant_id, confirmed_at desc);


-- ── 4. RPC : yonne_merchant_confirm_payment ───────────────────────────────
-- Guard strict : seul le merchant_id propriétaire de la commande peut appeler.
-- Retourne : { ok: true/false, error?: string, order_id?, method? }
create or replace function yonne_merchant_confirm_payment(
  p_order_id text,
  p_method   text
)
  returns json
  language plpgsql
  security definer
  set search_path = public
as $$
declare
  v_merchant_id text;
  v_order       orders%rowtype;
begin
  -- Validation de la méthode en entrée
  if p_method not in ('wave_personal', 'om_personal', 'cash') then
    return json_build_object('ok', false, 'error', 'méthode invalide');
  end if;

  -- Résolution du marchand via le JWT (sub = users.id)
  select id into v_merchant_id
  from merchants
  where user_id = (auth.jwt() ->> 'sub')::uuid
  limit 1;

  if v_merchant_id is null then
    return json_build_object('ok', false, 'error', 'marchand introuvable');
  end if;

  -- Récupération de la commande avec guard propriétaire
  select * into v_order
  from orders
  where id          = p_order_id
    and merchant_id = v_merchant_id;

  if not found then
    return json_build_object('ok', false, 'error', 'commande introuvable ou accès refusé');
  end if;

  -- Guard : empêche la double confirmation
  if v_order.payment_status = 'received_manually' then
    return json_build_object('ok', false, 'error', 'paiement déjà confirmé');
  end if;

  -- Guard : commande non confirmable après livraison ou annulation
  if v_order.status in ('annulée', 'livrée') then
    return json_build_object('ok', false, 'error', 'commande non confirmable dans cet état');
  end if;

  -- Mise à jour atomique du statut de paiement
  -- (le statut order reste inchangé — Realtime le diffuse aux livreurs à proximité)
  update orders
  set payment_status = 'received_manually'
  where id = p_order_id;

  -- Trace d'audit pour réconciliation financière
  insert into payment_audit_log (order_id, merchant_id, method, merchant_sub)
  values (p_order_id, v_merchant_id, p_method, auth.jwt() ->> 'sub');

  return json_build_object(
    'ok',       true,
    'order_id', p_order_id,
    'method',   p_method
  );

exception when others then
  -- Fail-safe : jamais de crash non géré pour le marchand
  return json_build_object('ok', false, 'error', sqlerrm);
end;
$$;

-- Accessible aux marchands authentifiés uniquement — jamais à anon
grant execute on function yonne_merchant_confirm_payment(text, text)
  to authenticated;
