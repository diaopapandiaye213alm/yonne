-- ============================================================
-- YONNE — Surge Pricing dynamique (Majoration Offre/Demande)
-- ============================================================
-- Prérequis : batching.sql doit être appliqué en premier
--             (colonnes dest_lat / dest_lng sur orders).
-- Table : zones    (zones de livraison Dakar avec centre géographique)
-- RPC   : yonne_calculate_surge_multiplier(p_zone_id text)
-- ============================================================


-- ── Table : zones ─────────────────────────────────────────────────────────────
create table if not exists zones (
  id          text         primary key,
  name        text         not null,
  center_lat  numeric(9,6) not null,
  center_lng  numeric(9,6) not null,
  radius_km   numeric(5,2) not null default 3.0,
  active      boolean      not null default true,
  created_at  timestamptz  not null default now()
);

alter table zones enable row level security;

create policy if not exists "public read zones"
  on zones for select using (true);

create policy if not exists "admin write zones"
  on zones for all
  using      (yonne_role() = 'admin')
  with check (yonne_role() = 'admin');

-- Zones Dakar initiales — couvrent les quartiers à forte densité de livraison
insert into zones (id, name, center_lat, center_lng, radius_km) values
  ('zone-plateau',  'Plateau / Médina',         14.6728, -17.4380, 2.5),
  ('zone-nord',     'Liberté / HLM / Grand Yoff', 14.7250, -17.4600, 3.0),
  ('zone-sacre',    'Sacré-Cœur / Mermoz',       14.7120, -17.4700, 2.5),
  ('zone-vdn',      'VDN / Almadies / Yoff',     14.7350, -17.4900, 3.5),
  ('zone-pikine',   'Pikine / Guédiawaye',        14.7600, -17.4100, 4.0)
on conflict (id) do nothing;


-- ── RPC : yonne_calculate_surge_multiplier ────────────────────────────────────
-- Calcule un multiplicateur de tarif (1.0 à 2.0) selon le ratio :
--   Commandes en attente dans la zone / Livreurs disponibles dans la zone
--
-- Règle de progressivité :
--   ratio ≤ 2.0  → multiplier = 1.0      (pas de majoration)
--   ratio 2.0–3.0 → multiplier ∈ [1.3, 1.45]
--   ratio > 3.0  → multiplier → 2.0 (cap absolu)
--
-- Fail-safe :
--   • Zone introuvable              → 1.0
--   • Aucun livreur disponible      → 2.0 (pénurie totale)
--   • Toute erreur SQL imprévue     → 1.0
create or replace function yonne_calculate_surge_multiplier(p_zone_id text)
  returns numeric
  language plpgsql
  stable
  security definer
  set search_path = public
as $$
declare
  v_zone        zones%rowtype;
  v_pending     integer := 0;
  v_available   integer := 0;
  v_ratio       numeric;
  v_multiplier  numeric := 1.0;
begin
  -- Récupérer la zone — fail-safe si introuvable ou inactive
  select * into v_zone from zones where id = p_zone_id and active = true;
  if not found then
    return 1.0;
  end if;

  -- ── Livreurs disponibles dans la zone ─────────────────────────────────────
  -- Utilise les colonnes lat/lng des livreurs (présentes depuis schema.sql).
  select count(*) into v_available
  from drivers
  where online    = true
    and in_prayer = false
    and lat       is not null
    and lng       is not null
    and (
      6371 * 2 * asin(sqrt(
        power(sin(radians(lat  - v_zone.center_lat) / 2), 2)
        + cos(radians(v_zone.center_lat)) * cos(radians(lat))
        * power(sin(radians(lng - v_zone.center_lng) / 2), 2)
      ))
    ) <= v_zone.radius_km;

  -- Pénurie totale de livreurs → surge maximal
  if v_available = 0 then
    return 2.0;
  end if;

  -- ── Commandes en attente dans la zone ─────────────────────────────────────
  -- Utilise dest_lat/dest_lng (ajoutés par batching.sql).
  -- Si les colonnes n'existent pas encore, on compte globalement.
  begin
    select count(*) into v_pending
    from orders
    where status    = 'créée'
      and created_at >= now() - interval '30 minutes'
      and dest_lat  is not null
      and dest_lng  is not null
      and (
        6371 * 2 * asin(sqrt(
          power(sin(radians(dest_lat  - v_zone.center_lat) / 2), 2)
          + cos(radians(v_zone.center_lat)) * cos(radians(dest_lat))
          * power(sin(radians(dest_lng - v_zone.center_lng) / 2), 2)
        ))
      ) <= v_zone.radius_km;
  exception when undefined_column then
    -- Migration batching.sql non encore appliquée → fallback global
    select count(*) into v_pending
    from orders
    where status = 'créée'
      and created_at >= now() - interval '30 minutes';
  end;

  -- ── Calcul du multiplicateur ───────────────────────────────────────────────
  if v_pending = 0 then
    return 1.0;
  end if;

  v_ratio := v_pending::numeric / v_available::numeric;

  if v_ratio > 2.0 then
    -- Progressif : base 1.3, +0.15 par unité de ratio au-dessus de 2.0, cap à 2.0
    v_multiplier := least(1.3 + (v_ratio - 2.0) * 0.15, 2.0);
  end if;

  -- Arrondi au centième pour l'affichage
  return round(v_multiplier, 2);

exception when others then
  -- Toute erreur non anticipée retourne le tarif normal — jamais de blocage
  return 1.0;
end;
$$;

grant execute on function yonne_calculate_surge_multiplier(text) to anon, authenticated;


-- ── Index utile pour les requêtes surge ───────────────────────────────────────
create index if not exists idx_zones_active on zones (id) where active = true;
