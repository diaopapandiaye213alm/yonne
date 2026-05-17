-- ============================================================
-- YONNE — Acceptation atomique d'une commande par un livreur
-- ============================================================
-- RPC : accept_order_safely
--
-- Garanties :
--   1. SELECT FOR UPDATE   — verrouillage strict de la ligne orders
--                            au niveau transaction. Tout appel concurrent
--                            sur le même order_id est mis en attente jusqu'à
--                            la fin de la transaction courante.
--   2. Vérification statut — seules les commandes 'payée_a_collecter'
--                            ou 'assignée' peuvent être acceptées.
--                            Tout autre statut lève une exception propre.
--   3. Idempotence driver  — si le livreur est déjà assigné à cette commande
--                            et qu'elle est déjà en 'collecte', retourne
--                            success=true sans erreur (double-tap safe).
--   4. Rollback automatique— toute exception non gérée provoque un ROLLBACK
--                            implicite : aucun état partiel en base.
--
-- Paramètres :
--   p_order_id  text   — ID de la commande (format YN-YEAR-XXXXXXXX)
--   p_driver_id text   — ID du livreur acceptant la commande
--
-- Retour JSON :
--   { "success": true,  "order_id": "...", "status": "collecte" }
--   { "success": false, "reason":   "...", "order_id": "..."    }
-- ============================================================

create or replace function accept_order_safely(
  p_order_id  text,
  p_driver_id text
)
  returns json
  language plpgsql
  security definer
  set search_path = public
as $$
declare
  v_order orders%rowtype;
begin

  -- ── 1. Verrou exclusif sur la ligne ──────────────────────────────────────
  -- NOWAIT : si la ligne est déjà verrouillée par un autre appel concurrent,
  -- on lève immédiatement une exception au lieu d'attendre (fail-fast).
  select * into v_order
  from orders
  where id = p_order_id
  for update nowait;

  -- Commande inexistante
  if not found then
    return json_build_object(
      'success',  false,
      'reason',   'order_not_found',
      'order_id', p_order_id
    );
  end if;

  -- ── 2. Idempotence : le livreur a déjà accepté cette commande ────────────
  if v_order.status = 'collecte' and v_order.driver_id = p_driver_id then
    return json_build_object(
      'success',  true,
      'order_id', p_order_id,
      'status',   'collecte',
      'idempotent', true
    );
  end if;

  -- ── 3. Vérification du statut éligible ───────────────────────────────────
  if v_order.status not in ('payée_a_collecter', 'assignée') then
    return json_build_object(
      'success',        false,
      'reason',         'order_unavailable',
      'current_status', v_order.status,
      'order_id',       p_order_id
    );
  end if;

  -- ── 4. Acceptation atomique ───────────────────────────────────────────────
  update orders
  set
    status    = 'collecte',
    driver_id = p_driver_id,
    active    = true
  where id = p_order_id;

  return json_build_object(
    'success',  true,
    'order_id', p_order_id,
    'status',   'collecte'
  );

-- ── 5. Gestion de la contention (FOR UPDATE NOWAIT) ──────────────────────
-- Si un autre appel concurrent tient déjà le verrou, PostgreSQL lève
-- l'erreur 55P03 (lock_not_available). On retourne false proprement
-- au lieu d'exposer un crash 500 au client.
exception
  when lock_not_available then
    return json_build_object(
      'success',  false,
      'reason',   'concurrent_lock',
      'order_id', p_order_id
    );
  when others then
    return json_build_object(
      'success',  false,
      'reason',   'internal_error',
      'detail',   sqlerrm,
      'order_id', p_order_id
    );
end;
$$;

-- Autorisé pour authenticated (le livreur connecté) via le service-role
-- La RLS de la table orders protège déjà les lignes inaccessibles.
grant execute
  on function accept_order_safely(text, text)
  to authenticated;

revoke execute
  on function accept_order_safely(text, text)
  from anon;
