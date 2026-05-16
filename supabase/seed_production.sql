-- ============================================================
-- YONNE — Seed de PRODUCTION
-- ============================================================
-- Ce script remplace supabase/seed.sql en production.
-- seed.sql contient des livreurs fictifs, fausses commandes et
-- faux marchands générés par le moteur de simulation — il NE DOIT
-- JAMAIS être exécuté sur la base de données de production.
--
-- Contenu de ce fichier :
--   1. Nettoyage préventif des données de démo
--   2. Compte administrateur initial
--   3. Quartiers et points de repère réels de Dakar / Thiès
--   4. Configuration des plans tarifaires (reference data)
--   5. Initialisation des rate-limits SMS à zéro
--
-- Prérequis :
--   - supabase/schema.sql déjà appliqué
--   - supabase/rls.sql déjà appliqué (RLS de production)
--   - Remplacer les placeholders <...> avant d'exécuter
-- ============================================================


-- ────────────────────────────────────────────────────────────────────────────
-- 1. NETTOYAGE — supprime toute donnée de démo existante
--    (utile si schema.sql + seed.sql ont été lancés par erreur)
-- ────────────────────────────────────────────────────────────────────────────
truncate table driver_withdrawals  restart identity cascade;
truncate table admin_messages      restart identity cascade;
truncate table order_messages      restart identity cascade;
truncate table sav_messages        restart identity cascade;
truncate table sav_tickets         restart identity cascade;
truncate table catalogue_items     restart identity cascade;
truncate table orders              restart identity cascade;
truncate table drivers             restart identity cascade;
truncate table merchants           restart identity cascade;
truncate table users               restart identity cascade;
truncate table api_rate_limits     restart identity cascade;


-- ────────────────────────────────────────────────────────────────────────────
-- 2. COMPTE ADMINISTRATEUR INITIAL
--    Remplacer <HASH_BCRYPT_DU_MOT_DE_PASSE> par le hash généré via :
--      node -e "const b=require('bcryptjs');console.log(b.hashSync('VotreMotDePasse',12))"
-- ────────────────────────────────────────────────────────────────────────────
insert into users (email, password_hash, role, display_name, redirect_url)
values (
  'admin@yonne.sn',
  '<HASH_BCRYPT_DU_MOT_DE_PASSE>',
  'admin',
  'Admin YONNE',
  '/admin'
)
on conflict (email) do nothing;


-- ────────────────────────────────────────────────────────────────────────────
-- 3. POINTS DE REPÈRE RÉELS — Dakar & Thiès
--    Ces données correspondent aux landmarks codés dans lib/mock-data/landmarks.ts.
--    Si vous migrez les landmarks vers la DB (recommandé pour la v2), créez d'abord
--    la table avec :
--
--      create table if not exists landmarks (
--        id       text primary key,
--        name     text not null,
--        quartier text not null,
--        type     text not null check (type in ('transport','commerce','culte','santé','loisir','éducation')),
--        lat      numeric(9,6) not null,
--        lng      numeric(9,6) not null,
--        city     text not null default 'Dakar'
--      );
--      alter table landmarks enable row level security;
--      create policy "anon read landmarks" on landmarks for select using (true);
--
--    Puis décommentez le bloc INSERT ci-dessous :
-- ────────────────────────────────────────────────────────────────────────────

/*
insert into landmarks (id, name, quartier, type, lat, lng, city) values
-- Dakar — Plateau / Centre
  ('lm-001', 'Grande Mosquée de Dakar',              'Médina',       'culte',       14.677000, -17.448000, 'Dakar'),
  ('lm-002', 'Marché Sandaga',                       'Plateau',      'commerce',    14.673000, -17.438000, 'Dakar'),
  ('lm-003', 'Marché Kermel',                        'Plateau',      'commerce',    14.671600, -17.432100, 'Dakar'),
  ('lm-007', 'Place de l''Indépendance',             'Plateau',      'loisir',      14.669900, -17.435600, 'Dakar'),
  ('lm-009', 'Hôpital Principal de Dakar',           'Plateau',      'santé',       14.668000, -17.428000, 'Dakar'),
  ('lm-018', 'Embarcadère Île de Gorée',             'Plateau',      'transport',   14.670800, -17.422500, 'Dakar'),
  ('lm-022', 'Hôpital Le Dantec',                   'Plateau',      'santé',       14.674000, -17.429000, 'Dakar'),
  ('lm-027', 'Lycée Lamine Guèye',                  'Plateau',      'éducation',   14.672500, -17.433000, 'Dakar'),
  ('lm-029', 'Cathédrale Notre-Dame des Victoires',  'Plateau',      'culte',       14.672000, -17.431000, 'Dakar'),
  ('lm-036', 'Gare de Dakar',                       'Plateau',      'transport',   14.673500, -17.425000, 'Dakar'),
  ('lm-038', 'Lycée Blaise Diagne',                 'Plateau',      'éducation',   14.675000, -17.436500, 'Dakar'),
  ('lm-039', 'BICIS Plateau',                       'Plateau',      'commerce',    14.670500, -17.436500, 'Dakar'),
-- Dakar — Médina
  ('lm-011', 'Allées Khalifa Ababacar Sy',           'Médina',       'transport',   14.684000, -17.447000, 'Dakar'),
  ('lm-023', 'Marché Tilène',                        'Médina',       'commerce',    14.681000, -17.445000, 'Dakar'),
  ('lm-032', 'Stade Iba Mar Diop',                  'Médina',       'loisir',      14.685500, -17.439500, 'Dakar'),
  ('lm-037', 'Mosquée Massalikoul Djinane',          'Colobane',     'culte',       14.694000, -17.449500, 'Dakar'),
-- Dakar — Nord (Liberté, HLM, Grand Yoff)
  ('lm-004', 'Total Liberté 6',                     'Liberté 6',    'transport',   14.724500, -17.462200, 'Dakar'),
  ('lm-012', 'Patte d''Oie',                        'Patte d''Oie', 'transport',   14.733000, -17.452000, 'Dakar'),
  ('lm-024', 'Marché HLM',                          'HLM',          'commerce',    14.722000, -17.459000, 'Dakar'),
  ('lm-025', 'Gare routière Pompiers',               'Liberté 5',    'transport',   14.714500, -17.461500, 'Dakar'),
  ('lm-030', 'Auchan Liberté 6',                    'Liberté 6',    'commerce',    14.728000, -17.463000, 'Dakar'),
  ('lm-034', 'Centre Culturel Blaise Senghor',       'HLM',          'loisir',      14.723000, -17.457500, 'Dakar'),
  ('lm-035', 'Marché Castors',                      'Castors',      'commerce',    14.719500, -17.444500, 'Dakar'),
  ('lm-047', 'Marché Grand Yoff',                   'Grand Yoff',   'commerce',    14.734000, -17.464000, 'Dakar'),
  ('lm-051', 'Marché Liberté 6',                    'Liberté 6',    'commerce',    14.727000, -17.464000, 'Dakar'),
-- Dakar — Fann / UCAD
  ('lm-008', 'Université Cheikh Anta Diop',         'Fann',         'éducation',   14.692000, -17.463400, 'Dakar'),
  ('lm-026', 'Ucad 2',                              'Fann',         'éducation',   14.691500, -17.462000, 'Dakar'),
  ('lm-031', 'Hôpital Fann',                        'Fann',         'santé',       14.694000, -17.465500, 'Dakar'),
-- Dakar — Mermoz / Sacré-Cœur
  ('lm-005', 'Total Mermoz',                        'Mermoz',       'transport',   14.714200, -17.478100, 'Dakar'),
  ('lm-013', 'Auchan Sacré-Cœur',                  'Sacré-Cœur',   'commerce',    14.709500, -17.459500, 'Dakar'),
  ('lm-014', 'Casino Supermarché Mermoz',            'Mermoz',       'commerce',    14.712500, -17.476000, 'Dakar'),
  ('lm-033', 'Pharmacie Mermoz Centre',              'Mermoz',       'santé',       14.715500, -17.479500, 'Dakar'),
  ('lm-040', 'Galerie Cinquième Avenue',             'Mermoz',       'commerce',    14.716500, -17.480500, 'Dakar'),
  ('lm-052', 'Mermoz Plage',                        'Mermoz',       'loisir',      14.720000, -17.483000, 'Dakar'),
-- Dakar — VDN / Almadies / Yoff / Ouakam
  ('lm-006', 'Total VDN',                           'VDN',          'transport',   14.729000, -17.471000, 'Dakar'),
  ('lm-010', 'Sea Plaza',                           'Almadies',     'commerce',    14.741500, -17.514500, 'Dakar'),
  ('lm-016', 'Aéroport LSS (ancien)',               'Yoff',         'transport',   14.739500, -17.490000, 'Dakar'),
  ('lm-017', 'Corniche Ouest',                      'Mamelles',     'loisir',      14.718500, -17.499500, 'Dakar'),
  ('lm-019', 'Mosquée de la Divinité',              'Ouakam',       'culte',       14.724500, -17.505000, 'Dakar'),
  ('lm-020', 'Monument de la Renaissance',           'Ouakam',       'loisir',      14.727000, -17.496500, 'Dakar'),
  ('lm-021', 'Phare des Mamelles',                  'Mamelles',     'loisir',      14.723500, -17.512500, 'Dakar'),
  ('lm-028', 'Place du Souvenir Africain',           'Corniche',     'loisir',      14.716000, -17.488500, 'Dakar'),
  ('lm-041', 'Eden Plaza',                          'Almadies',     'commerce',    14.743000, -17.518000, 'Dakar'),
  ('lm-042', 'Plage de Yoff',                       'Yoff',         'loisir',      14.756000, -17.486000, 'Dakar'),
  ('lm-043', 'Plage des Almadies',                  'Almadies',     'loisir',      14.748000, -17.526000, 'Dakar'),
  ('lm-045', 'Total Yoff',                          'Yoff',         'transport',   14.744000, -17.483000, 'Dakar'),
  ('lm-046', 'Total Almadies',                      'Almadies',     'transport',   14.747500, -17.521000, 'Dakar'),
-- Dakar — Guédiawaye / Pikine
  ('lm-015', 'Stade Léopold Sédar Senghor',         'Pikine',       'loisir',      14.748000, -17.418000, 'Dakar'),
  ('lm-048', 'Hôpital Roi Baudouin',                'Guédiawaye',   'santé',       14.774000, -17.405500, 'Dakar'),
-- Grand Dakar — Diamniadio (nouveau pôle urbain)
  ('lm-049', 'Université Amadou Mahtar Mbow',       'Diamniadio',   'éducation',   14.722000, -17.184000, 'Diamniadio'),
  ('lm-050', 'Centre Commercial Dakar City',         'Diamniadio',   'commerce',    14.724500, -17.185000, 'Diamniadio'),
-- Lac Rose
  ('lm-044', 'Lac Rose (Retba)',                    'Niaga',        'loisir',      14.840000, -17.236000, 'Dakar')
on conflict (id) do nothing;
*/


-- ────────────────────────────────────────────────────────────────────────────
-- 4. RÉFÉRENTIEL PLANS TARIFAIRES
--    Les plans Standard et Premium sont encodés dans le schéma via CHECK.
--    Ce bloc documente les tarifs de commission pour référence opérationnelle.
--    Aucune table SQL dédiée n'est requise — les valeurs sont dans le code.
-- ────────────────────────────────────────────────────────────────────────────
--
--  Plan Standard :
--    Commission YONNE : 15% par livraison
--    Frais mensuels   : inclus dans la commission (0 F/mois)
--    Délai paiement   : J+3 après livraison confirmée
--
--  Plan Premium :
--    Commission YONNE : 12% par livraison
--    Frais mensuels   : 15 000 F CFA / mois
--    Délai paiement   : J+3 après livraison confirmée
--    Avantages        : priorité dispatch, badge marchand premium
--
--  Assurance colis (optionnelle à la commande) :
--    Prime            : 0,5% du montant, minimum 200 F CFA
--    Couverture       : perte, dommages >30%, mauvaise livraison confirmée
--    Remboursement    : 80% de la valeur déclarée sous 5 jours ouvrés


-- ────────────────────────────────────────────────────────────────────────────
-- 5. ZONES NATIONALES — Extension Sénégal
--    Prérequis : supabase/surge_pricing.sql (table zones) déjà appliqué.
--    Les 5 zones Dakar initiales sont insérées par surge_pricing.sql.
--    Ce bloc complète avec les autres grandes villes du territoire.
-- ────────────────────────────────────────────────────────────────────────────
insert into zones (id, name, center_lat, center_lng, radius_km) values
  -- ── Thiès ──────────────────────────────────────────────────────────────
  ('zone-thies-centre', 'Thiès Centre-ville',          14.7902, -16.9319, 3.0),
  ('zone-thies-ism',    'Thiès ISM / Escale',           14.7986, -16.9200, 2.0),
  -- ── Petite Côte (Mbour / Saly) ─────────────────────────────────────────
  ('zone-mbour',        'Mbour Centre',                 14.3674, -16.9657, 3.5),
  ('zone-saly',         'Saly / Ngaparou',              14.4586, -17.0158, 4.0),
  -- ── Saint-Louis ────────────────────────────────────────────────────────
  ('zone-stlouis',      'Saint-Louis Ndar (île)',       16.0261, -16.4977, 3.5),
  ('zone-stlouis-sud',  'Saint-Louis Faubourg Sud',     15.9950, -16.5050, 3.0),
  -- ── Touba / Mbacké ────────────────────────────────────────────────────
  ('zone-touba',        'Touba Centre',                 14.8504, -15.8878, 6.0),
  ('zone-mbacke',       'Mbacké',                       14.8009, -15.9104, 3.0),
  -- ── Grand Dakar — est ────────────────────────────────────────────────────
  ('zone-rufisque',     'Rufisque',                     14.7155, -17.2728, 4.0),
  ('zone-bargny',       'Bargny',                       14.6964, -17.2286, 2.5),
  ('zone-diamniadio',   'Diamniadio',                   14.7140, -17.1820, 5.0),
  -- ── Thiès région (hors Thiès-ville) ─────────────────────────────────────
  ('zone-tivaouane',    'Tivaouane',                    14.9518, -16.8208, 3.0),
  -- ── Diourbel région ──────────────────────────────────────────────────────
  ('zone-diourbel',     'Diourbel Centre',              14.6540, -16.2310, 3.0),
  -- ── Kaolack région ───────────────────────────────────────────────────────
  ('zone-kaolack',      'Kaolack Centre',               14.1652, -16.0726, 4.5),
  -- ── Fatick région ────────────────────────────────────────────────────────
  ('zone-fatick',       'Fatick Centre',                14.3345, -16.4083, 3.0),
  -- ── Kaffrine région ──────────────────────────────────────────────────────
  ('zone-kaffrine',     'Kaffrine Centre',              14.1055, -15.5508, 3.0),
  -- ── Louga région ─────────────────────────────────────────────────────────
  ('zone-louga',        'Louga Centre',                 15.6172, -16.2241, 3.5),
  -- ── Matam région ─────────────────────────────────────────────────────────
  ('zone-matam',        'Matam Centre',                 15.6558, -13.2553, 3.0),
  ('zone-podor',        'Podor',                        16.6499, -14.9584, 2.5),
  -- ── Saint-Louis région (hors ville) ─────────────────────────────────────
  ('zone-richard-toll', 'Richard Toll',                 16.4607, -15.6973, 3.5),
  -- ── Tambacounda région ───────────────────────────────────────────────────
  ('zone-tambacounda',  'Tambacounda Centre',           13.7708, -13.6669, 4.0),
  -- ── Kédougou région ──────────────────────────────────────────────────────
  ('zone-kedougou',     'Kédougou Centre',              12.5597, -12.1772, 3.5),
  -- ── Ziguinchor région ────────────────────────────────────────────────────
  ('zone-ziguinchor',   'Ziguinchor Centre',            12.5636, -16.2728, 4.5),
  -- ── Kolda région ─────────────────────────────────────────────────────────
  ('zone-kolda',        'Kolda Centre',                 12.8978, -14.9408, 3.5),
  -- ── Sédhiou région ───────────────────────────────────────────────────────
  ('zone-sedhiou',      'Sédhiou Centre',               12.7082, -15.5574, 3.0)
on conflict (id) do nothing;


-- ────────────────────────────────────────────────────────────────────────────
-- 6. LANDMARKS NATIONAUX (hors Dakar)
--    Décommentez le bloc ci-dessous après avoir créé la table landmarks
--    (cf. section 3 de ce fichier).
--
--    Coordonnées vérifiées sur OpenStreetMap / Google Maps (mai 2026).
--    Toutes les villes couvertes par les zones nationales ci-dessus.
-- ────────────────────────────────────────────────────────────────────────────

/*
insert into landmarks (id, name, quartier, type, lat, lng, city) values
-- ── Thiès ────────────────────────────────────────────────────────────────
  ('lm-th-001', 'Marché Central de Thiès',          'Centre',         'commerce',    14.7902, -16.9319, 'Thiès'),
  ('lm-th-002', 'Gare de Thiès',                    'Centre',         'transport',   14.7956, -16.9267, 'Thiès'),
  ('lm-th-003', 'ISM Thiès',                        'Escale',         'éducation',   14.7986, -16.9200, 'Thiès'),
  ('lm-th-004', 'Hôpital Régional de Thiès',        'Centre',         'santé',       14.7870, -16.9380, 'Thiès'),
  ('lm-th-005', 'Mosquée Baye Laye',                'Escale',         'culte',       14.7920, -16.9290, 'Thiès'),
  ('lm-th-006', 'Marché Escale',                    'Escale',         'commerce',    14.7985, -16.9240, 'Thiès'),
  ('lm-th-007', 'Palais des Arts de Thiès',         'Centre',         'loisir',      14.7912, -16.9350, 'Thiès'),
  ('lm-th-008', 'Total Thiès Centre',               'Centre',         'transport',   14.7930, -16.9280, 'Thiès'),
-- ── Mbour / Petite Côte ───────────────────────────────────────────────────
  ('lm-mb-001', 'Marché Central de Mbour',          'Centre',         'commerce',    14.3674, -16.9657, 'Mbour'),
  ('lm-mb-002', 'Gare routière de Mbour',           'Centre',         'transport',   14.3700, -16.9680, 'Mbour'),
  ('lm-mb-003', 'Hôpital de Mbour',                 'Centre',         'santé',       14.3650, -16.9710, 'Mbour'),
  ('lm-mb-004', 'Port de pêche de Mbour',           'Sérère',         'loisir',      14.3615, -16.9590, 'Mbour'),
  ('lm-mb-005', 'Saly Zone Touristique',            'Saly',           'loisir',      14.4586, -17.0158, 'Saly'),
  ('lm-mb-006', 'Hôtel Palm Beach Saly',            'Saly',           'loisir',      14.4540, -17.0200, 'Saly'),
  ('lm-mb-007', 'Ngaparou Village',                 'Ngaparou',       'commerce',    14.4480, -17.0120, 'Saly'),
  ('lm-mb-008', 'Total Mbour',                      'Centre',         'transport',   14.3690, -16.9670, 'Mbour'),
-- ── Saint-Louis ───────────────────────────────────────────────────────────
  ('lm-sl-001', 'Pont Faidherbe',                   'Ndar',           'transport',   16.0261, -16.4977, 'Saint-Louis'),
  ('lm-sl-002', 'Marché Sor',                       'Sor',            'commerce',    16.0180, -16.5080, 'Saint-Louis'),
  ('lm-sl-003', 'Université Gaston Berger',         'Saint-Louis',    'éducation',   16.0490, -16.4608, 'Saint-Louis'),
  ('lm-sl-004', 'Hôpital Régional de Saint-Louis',  'Ndar',           'santé',       16.0230, -16.4970, 'Saint-Louis'),
  ('lm-sl-005', 'Grande Mosquée de Saint-Louis',    'Ndar',           'culte',       16.0270, -16.4960, 'Saint-Louis'),
  ('lm-sl-006', 'Gare de Saint-Louis',              'Ndar',           'transport',   16.0200, -16.4900, 'Saint-Louis'),
  ('lm-sl-007', 'Place Faidherbe',                  'Ndar',           'loisir',      16.0265, -16.4970, 'Saint-Louis'),
  ('lm-sl-008', 'Marché Octave Diallo',             'Ndar',           'commerce',    16.0250, -16.4980, 'Saint-Louis'),
-- ── Touba / Mbacké ────────────────────────────────────────────────────────
  ('lm-tb-001', 'Grande Mosquée de Touba',          'Centre',         'culte',       14.8504, -15.8878, 'Touba'),
  ('lm-tb-002', 'Marché Ocass de Touba',            'Centre',         'commerce',    14.8520, -15.8900, 'Touba'),
  ('lm-tb-003', 'Gare routière de Touba',           'Centre',         'transport',   14.8480, -15.8850, 'Touba'),
  ('lm-tb-004', 'Hôpital Matlaboul Fawzeyni',       'Centre',         'santé',       14.8535, -15.8910, 'Touba'),
  ('lm-tb-005', 'Mbacké Centre-ville',              'Mbacké',         'commerce',    14.8009, -15.9104, 'Mbacké'),
  ('lm-tb-006', 'Gare routière de Mbacké',          'Mbacké',         'transport',   14.8020, -15.9080, 'Mbacké'),
  ('lm-tb-007', 'Marché Mbacké',                    'Mbacké',         'commerce',    14.8015, -15.9120, 'Mbacké')
on conflict (id) do nothing;
*/


-- ────────────────────────────────────────────────────────────────────────────
-- 7. INITIALISATION DES RATE-LIMITS SMS
--    Remet à zéro les compteurs de quota SMS (au cas où un environnement de
--    staging aurait inséré des lignes de test dans api_rate_limits).
-- ────────────────────────────────────────────────────────────────────────────
delete from api_rate_limits where key like 'sms:%';
delete from payment_audit_log where confirmed_at < now() - interval '1 second'; -- purge données de test uniquement


-- ────────────────────────────────────────────────────────────────────────────
-- FIN DU SEED DE PRODUCTION
-- Vérification finale :
--   select count(*) from users;              -- doit retourner 1 (admin)
--   select count(*) from drivers;            -- doit retourner 0
--   select count(*) from merchants;          -- doit retourner 0
--   select count(*) from orders;             -- doit retourner 0
--   select count(*) from zones where active; -- doit retourner >= 30 (5 Dakar + 8 premières nationales + 17 expansion)
--   select id, name from zones order by id;  -- vérification visuelle des zones
-- ────────────────────────────────────────────────────────────────────────────
