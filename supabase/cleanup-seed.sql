-- ============================================================
-- YONNE — Nettoyage données seed de test
-- Supabase Dashboard → SQL Editor → coller et exécuter
-- ============================================================

-- IDs générés par le script seed-all.mjs (format drv-001..drv-020, mch-001..mch-010)
-- On supprime uniquement les données seed, pas les vrais utilisateurs.

-- 1. Commandes liées aux livreurs/marchands seed
DELETE FROM orders
  WHERE driver_id  LIKE 'drv-%'
     OR merchant_id LIKE 'mch-%';

-- 2. Messages liés aux commandes supprimées (si la FK n'a pas CASCADE)
DELETE FROM order_messages
  WHERE order_id NOT IN (SELECT id FROM orders);

-- 3. Livreurs seed
DELETE FROM drivers WHERE id LIKE 'drv-%';

-- 4. Marchands seed
DELETE FROM merchants WHERE id LIKE 'mch-%';

-- 5. Users demo (login demo, pas des vrais inscrits)
DELETE FROM users WHERE email IN (
  'admin@yonne.sn',
  'boutique.plateau@gmail.com',
  'livreur.dakar@yonne.sn'
);

-- Vérification
SELECT
  (SELECT count(*) FROM orders)    AS orders_restantes,
  (SELECT count(*) FROM drivers)   AS drivers_restants,
  (SELECT count(*) FROM merchants) AS marchands_restants,
  (SELECT count(*) FROM users)     AS users_restants;
