-- ============================================================
-- YONNE — Groupage de commandes (Batching)
-- ============================================================
-- Migration : ajout des coordonnées de livraison sur orders
-- RPC       : yonne_find_eligible_batch — Haversine < 1.5 km
-- ============================================================


-- ── Migration : colonnes de coordonnées sur orders ────────────────────────────
-- Renseignées lors de la création de commande (wizard DispatchStep).
-- Permettent la recherche géospatiale sans JOIN externe.
alter table orders
  add column if not exists dest_lat numeric(9,6),
  add column if not exists dest_lng numeric(9,6);

create index if not exists idx_orders_dest_coords
  on orders (dest_lat, dest_lng)
  where dest_lat is not null;

create index if not exists idx_orders_batch_lookup
  on orders (merchant_id, status, created_at desc)
  where status = 'créée';


-- ── RPC : yonne_find_eligible_batch ──────────────────────────────────────────
-- Recherche si la commande p_order_id peut être groupée avec une autre
-- commande du même marchand créée dans les 10 dernières minutes et
-- dont la destination est à moins de 1.5 km.
--
-- Retourne :
--   { eligible: false, reason: "..." }
--   { eligible: true, batch_order_id, distance_km, primary_order, secondary_order }
create or replace function yonne_find_eligible_batch(p_order_id text)
  returns json
  language plpgsql
  stable
  security definer
  set search_path = public
as $$
declare
  v_target  orders%rowtype;
  v_batch   orders%rowtype;
  v_dist_km numeric;
begin
  -- Récupérer la commande cible
  select * into v_target from orders where id = p_order_id;
  if not found then
    return json_build_object('eligible', false, 'reason', 'order_not_found');
  end if;

  -- La commande doit avoir des coordonnées de destination renseignées
  if v_target.dest_lat is null or v_target.dest_lng is null then
    return json_build_object('eligible', false, 'reason', 'no_coordinates');
  end if;

  -- La commande doit avoir un marchand identifié
  if v_target.merchant_id is null then
    return json_build_object('eligible', false, 'reason', 'no_merchant');
  end if;

  -- Chercher la meilleure commande partenaire éligible :
  --   • même marchand
  --   • statut 'créée' (non encore assignée)
  --   • créée dans les 10 dernières minutes
  --   • destination < 1.5 km (Haversine)
  select * into v_batch
  from orders
  where id             != p_order_id
    and merchant_id     = v_target.merchant_id
    and status          = 'créée'
    and created_at     >= now() - interval '10 minutes'
    and dest_lat        is not null
    and dest_lng        is not null
    and (
      -- Haversine en km (R = 6 371 km)
      6371 * 2 * asin(sqrt(
        power(sin(radians(dest_lat - v_target.dest_lat) / 2), 2)
        + cos(radians(v_target.dest_lat)) * cos(radians(dest_lat))
        * power(sin(radians(dest_lng - v_target.dest_lng) / 2), 2)
      ))
    ) < 1.5
  order by created_at desc
  limit 1;

  if not found then
    return json_build_object('eligible', false, 'reason', 'no_nearby_order');
  end if;

  -- Calculer la distance exacte entre les deux destinations
  v_dist_km := round((
    6371 * 2 * asin(sqrt(
      power(sin(radians(v_batch.dest_lat - v_target.dest_lat) / 2), 2)
      + cos(radians(v_target.dest_lat)) * cos(radians(v_batch.dest_lat))
      * power(sin(radians(v_batch.dest_lng - v_target.dest_lng) / 2), 2)
    ))
  )::numeric, 2);

  return json_build_object(
    'eligible',       true,
    'batch_order_id', v_batch.id,
    'merchant_id',    v_target.merchant_id,
    'distance_km',    v_dist_km,
    'total_amount',   v_target.amount + v_batch.amount,
    'primary_order',  json_build_object(
      'id',       v_target.id,
      'client',   v_target.client_name,
      'phone',    v_target.client_phone,
      'amount',   v_target.amount,
      'dest_lat', v_target.dest_lat,
      'dest_lng', v_target.dest_lng
    ),
    'secondary_order', json_build_object(
      'id',       v_batch.id,
      'client',   v_batch.client_name,
      'phone',    v_batch.client_phone,
      'amount',   v_batch.amount,
      'dest_lat', v_batch.dest_lat,
      'dest_lng', v_batch.dest_lng
    )
  );
end;
$$;

grant execute on function yonne_find_eligible_batch(text) to anon, authenticated;
