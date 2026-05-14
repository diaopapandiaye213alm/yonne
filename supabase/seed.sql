-- ============================================================
-- YONNE – Données de démo
-- À coller dans : Supabase Dashboard → SQL Editor → Run
-- Peut être ré-exécuté (ON CONFLICT DO NOTHING)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- UTILISATEURS (3 comptes de démo)
-- ────────────────────────────────────────────────────────────
INSERT INTO users (email, password_hash, role, display_name, redirect_url) VALUES
  ('admin@yonne.sn',           '$2b$12$seJ4lqrqoqzYNwqSG9uhxOIWax9nMhRg5DbbYM.Osi.kw6onxE55a', 'admin',    'Admin YONNE',            '/admin'),
  ('boutique.plateau@gmail.com','$2b$12$Q8Fa0UBAmh3svebvpJEep.1BP2cYrE1ON7ivwiykv41Fb8FAE99Ay', 'merchant', 'Boutique Fatou Textile',  '/merchant/accueil'),
  ('livreur.dakar@yonne.sn',   '$2b$12$Q8Fa0UBAmh3svebvpJEep.1BP2cYrE1ON7ivwiykv41Fb8FAE99Ay', 'driver',   'Fatou Ndiaye',           '/driver/carte')
ON CONFLICT (email) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- LIVREURS (41 — générés depuis lib/mock-data/drivers.ts)
-- colonnes: id, name, avatar_seed, phone, vehicle, score_ia, rating, tier,
--           badges, orders_today, earnings_today, online, in_prayer, lat, lng
-- ────────────────────────────────────────────────────────────
INSERT INTO drivers
  (id,name,avatar_seed,phone,vehicle,score_ia,rating,tier,badges,orders_today,earnings_today,online,in_prayer,lat,lng)
VALUES
('drv-001','Fatou Ndiaye','FatouNdiaye0','+221 77 184 4021','Moto TVS',66,4.6,'Bronze',ARRAY['Eco','Rapide','50 courses'],17,12900,true,false,14.730165,-17.471413),
('drv-002','Ibrahima Seck','IbrahimaSeck1','+221 77 401 1516','Tricycle',87,4.8,'Bronze',ARRAY['10 jours','Rapide'],14,13000,true,false,14.687361,-17.408057),
('drv-003','Fanta Niang','FantaNiang2','+221 77 151 8975','Vélo électrique',70,4.2,'Or',ARRAY['Top noté','Eco','10 jours'],4,14100,true,false,14.679197,-17.516579),
('drv-004','Fatou Sy','FatouSy3','+221 77 896 1974','Moto Yamaha',68,4.8,'Argent',ARRAY['Rapide','50 courses','Top noté'],4,24000,true,false,14.705874,-17.395994),
('drv-005','Sokhna Sané','SokhnaSané4','+221 77 197 5393','Moto Yamaha',83,4,'Argent',ARRAY['Top noté','50 courses'],4,50000,true,false,14.694705,-17.443600),
('drv-006','Aïssatou Thiaw','AïssatouThiaw5','+221 77 538 5063','Moto Yamaha',92,4,'Or',ARRAY['Top noté','50 courses'],8,23300,true,false,14.739959,-17.491065),
('drv-007','Aminata Ba','AminataBa6','+221 77 505 1070','Vélo électrique',72,4.7,'Argent',ARRAY['10 jours','50 courses'],18,44200,true,false,14.662444,-17.455737),
('drv-008','Modou Touré','ModouTouré7','+221 77 107 1306','Tricycle',93,4.6,'Or',ARRAY['Rapide','50 courses','Top noté'],8,24500,true,false,14.748575,-17.511651),
('drv-009','Mariama Sow','MariamaSow8','+221 77 130 7484','Moto TVS',66,4,'Or',ARRAY['Top noté','Rapide'],16,20800,true,false,14.714571,-17.447469),
('drv-010','Aïssatou Diagne','AïssatouDiagne9','+221 77 747 8508','Vélo électrique',65,4,'Bronze',ARRAY['50 courses','Top noté'],8,33100,true,false,14.680668,-17.499021),
('drv-011','Daouda Wade','DaoudaWade10','+221 77 850 9128','Moto Yamaha',90,4,'Or',ARRAY['Rapide','Eco','Précis'],7,27900,true,false,14.705902,-17.508060),
('drv-012','Boubacar Niasse','BoubacarNiasse11','+221 77 912 5985','Moto TVS',85,4.3,'Bronze',ARRAY['Eco','Rapide','Précis','50 courses'],12,48700,true,false,14.665963,-17.444881),
('drv-013','Mariama Kane','MariamaKane12','+221 77 598 6907','Tricycle',65,4.8,'Argent',ARRAY['10 jours','Rapide'],10,13100,true,false,14.711808,-17.453828),
('drv-014','Khady Konaté','KhadyKonaté13','+221 77 690 7156','Moto TVS',65,4.2,'Or',ARRAY['Top noté','Rapide','Précis','10 jours'],18,52700,true,false,14.674985,-17.438321),
('drv-015','Anta Mané','AntaMané14','+221 77 715 9512','Moto Yamaha',66,4.7,'Argent',ARRAY['10 jours'],4,37100,true,false,14.668529,-17.455007),
('drv-016','Serigne Bâ','SerigneBâ15','+221 77 950 6271','Vélo électrique',73,4.3,'Bronze',ARRAY['50 courses','Top noté'],19,21500,true,false,14.713656,-17.410213),
('drv-017','Ndèye Camara','NdèyeCamara16','+221 77 626 3324','Moto Yamaha',93,4.2,'Argent',ARRAY['Rapide','50 courses','Top noté'],13,33100,true,false,14.707266,-17.492058),
('drv-018','Anta Bâ','AntaBâ17','+221 77 332 1499','Moto TVS',73,4.5,'Or',ARRAY['Précis','Rapide','10 jours'],7,14700,true,false,14.718342,-17.466761),
('drv-019','Lamine Bâ','LamineBâ18','+221 77 149 7012','Vélo électrique',88,4.3,'Or',ARRAY['Eco','50 courses'],12,35800,true,false,14.706423,-17.404805),
('drv-020','Mamadou Sy','MamadouSy19','+221 77 700 2468','Vélo électrique',74,4.8,'Argent',ARRAY['Rapide','10 jours'],5,18800,true,false,14.738419,-17.435670),
('drv-021','Moussa Goudiaby','MoussaGoudiaby20','+221 77 246 1856','Vélo électrique',71,4,'Argent',ARRAY['Précis','Eco'],13,15900,true,false,14.679959,-17.495107),
('drv-022','Sokhna Niang','SokhnaNiang21','+221 77 185 5985','Moto TVS',80,4.9,'Bronze',ARRAY['Top noté'],6,36600,true,false,14.698028,-17.471476),
('drv-023','Khadim Goudiaby','KhadimGoudiaby22','+221 77 598 8351','Tricycle',76,4.5,'Argent',ARRAY['Rapide','50 courses','Précis'],5,33700,true,false,14.742282,-17.466810),
('drv-024','Mamadou Toure','MamadouToure23','+221 77 834 3087','Moto Yamaha',92,4.2,'Or',ARRAY['Rapide','50 courses'],13,38800,true,false,14.720236,-17.484983),
('drv-025','Astou Mbaye','AstouMbaye24','+221 77 308 8609','Moto TVS',65,4.5,'Bronze',ARRAY['10 jours','50 courses','Top noté'],12,33300,true,false,14.677781,-17.427585),
('drv-026','Sokhna Gueye','SokhnaGueye25','+221 77 860 1358','Vélo électrique',95,4.1,'Argent',ARRAY['Rapide','50 courses'],14,48000,true,true,14.694660,-17.514996),
('drv-027','Ndèye Gueye','NdèyeGueye26','+221 77 135 1091','Tricycle',83,4.5,'Argent',ARRAY['50 courses','Rapide'],12,21100,true,true,14.697993,-17.406491),
('drv-028','Saliou Faye','SaliouFaye27','+221 77 109 7655','Moto Yamaha',72,4.1,'Or',ARRAY['Top noté','50 courses'],18,29400,true,true,14.685012,-17.485220),
('drv-029','Souleymane Bop','SouleymaneBop28','+221 77 764 6453','Moto TVS',80,4.1,'Argent',ARRAY['10 jours','Top noté'],7,49800,false,false,14.726011,-17.490490),
('drv-030','Ramatoulaye Diop','RamatoulayeDiop29','+221 77 644 1183','Vélo électrique',67,4.5,'Argent',ARRAY['10 jours','Eco','Rapide'],10,39700,false,false,14.663574,-17.416597),
('drv-031','Ramatoulaye Thiaw','RamatoulayeThiaw30','+221 77 118 1208','Tricycle',82,4.5,'Or',ARRAY['Précis','Rapide'],18,20100,false,false,14.741078,-17.440457),
('drv-032','Aïda Mendy','AïdaMendy31','+221 77 120 1429','Moto TVS',70,4.6,'Bronze',ARRAY['10 jours','Top noté','Précis','50 courses'],14,27900,false,false,14.684843,-17.472068),
('drv-033','Modou Manga','ModouManga32','+221 77 142 3356','Tricycle',67,4.5,'Or',ARRAY['Rapide','Eco','Précis'],7,29400,false,false,14.681079,-17.417393),
('drv-034','Moussa Konaté','MoussaKonaté33','+221 77 335 8443','Moto TVS',83,4.8,'Argent',ARRAY['Précis','Rapide'],10,23500,false,false,14.733859,-17.410598),
('drv-035','Bara Ndiaye','BaraNdiaye34','+221 77 843 3216','Vélo électrique',81,4.2,'Or',ARRAY['Précis'],10,42300,false,false,14.716817,-17.490410),
('drv-036','Adama Sarr','AdamaSarr35','+221 77 321 7314','Tricycle',84,4.4,'Argent',ARRAY['Rapide','Précis'],8,13600,false,false,14.694237,-17.517565),
('drv-037','Idrissa Sané','IdrissaSané36','+221 77 730 3462','Tricycle',80,4.8,'Bronze',ARRAY['10 jours','Eco'],15,49200,false,false,14.733291,-17.494823),
('drv-038','Modou Manga','ModouManga37','+221 77 345 2727','Moto Yamaha',91,4.6,'Argent',ARRAY['50 courses'],4,23400,false,false,14.738145,-17.425097),
('drv-039','Modou Wade','ModouWade38','+221 77 272 5128','Moto TVS',71,4.2,'Bronze',ARRAY['50 courses','Top noté'],18,21600,false,false,14.681136,-17.409936),
('drv-040','Tidiane Bop','TidianeBop39','+221 77 512 4123','Vélo électrique',77,4.3,'Bronze',ARRAY['50 courses','Eco','Top noté'],8,45900,false,false,14.661739,-17.452773),
('drv-041','Awa Seck','AwaSeck40','+221 77 411 8195','Moto TVS',92,4.4,'Bronze',ARRAY['50 courses','10 jours','Top noté'],7,38100,false,false,14.677984,-17.491903)
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- MARCHANDS (10 — générés depuis lib/mock-data/merchants.ts)
-- mch-001 email = boutique.plateau@gmail.com (compte démo marchand)
-- ────────────────────────────────────────────────────────────
INSERT INTO merchants
  (id,name,email,phone,city,plan,status,orders_this_month,revenue_this_month,orders_last_month,revenue_last_month,joined_at)
VALUES
('mch-001','Boutique Fatou Textile','boutique.plateau@gmail.com','+221 77 184 4021','Dakar','Standard','actif',202,261000,269,1116000,'2025-11-16'),
('mch-002','Resto Keur Sénégal','contact2@restokeursenegal.sn','+221 77 401 1516','Touba','Standard','actif',42,1497000,361,576000,'2025-11-19'),
('mch-003','Boulangerie du Plateau','contact3@boulangerieduplateau.sn','+221 77 151 8975','Dakar','Standard','actif',52,1701000,235,241000,'2025-07-20'),
('mch-004','Pharma Médina','contact4@pharmamedina.sn','+221 77 896 1974','Thiès','Standard','actif',299,1825000,120,1252000,'2025-08-27'),
('mch-005','Superette Point E','contact5@superettepointe.sn','+221 77 197 5393','Thiès','Standard','actif',340,1197000,49,419000,'2025-09-17'),
('mch-006','Mode et Style Dakar','contact6@modeetstyledakar.sn','+221 77 538 5063','Dakar','Premium','actif',365,1381000,263,306000,'2025-12-08'),
('mch-007','Librairie Sandaga','contact7@librairiesandaga.sn','+221 77 505 1070','Dakar','Premium','actif',239,1431000,87,1064000,'2025-08-03'),
('mch-008','Traiteur Mariama','contact8@traiteurmariama.sn','+221 77 107 1306','Saint-Louis','Premium','actif',276,1902000,63,1497000,'2025-04-20'),
('mch-009','Épicerie Colobane','contact9@epiceriecolobane.sn','+221 77 130 7484','Touba','Premium','suspendu',286,1254000,223,532000,'2025-01-06'),
('mch-010','Tech Shop VDN','contact10@techshopvdn.sn','+221 77 747 8508','Touba','Premium','suspendu',380,665000,315,1545000,'2025-09-04')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- COMMANDES (147 — réparties sur les 10 marchands)
-- colonnes: id, driver_id, merchant_id, landmark_id, client_name,
--           client_phone, amount, payment_method, insurance, status, active, created_at
-- ────────────────────────────────────────────────────────────
INSERT INTO orders
  (id,driver_id,merchant_id,landmark_id,client_name,client_phone,amount,payment_method,insurance,status,active,created_at)
VALUES
('YN-2026-10000','drv-035','mch-001','lmk-liberte','Pape Diop','+221 78 512 5253',23600,'wave',true,'collecte',true,'2026-05-20T08:12:00.000Z'),
('YN-2026-10001','drv-038','mch-002','lmk-almadies','Ibrahima Ba','+221 77 153 6250',18200,'orange',false,'en route',true,'2026-05-20T08:13:00.000Z'),
('YN-2026-10002','drv-023','mch-003','lmk-medina','Awa Sarr','+221 77 565 5177',7800,'orange',false,'assignée',true,'2026-05-20T08:28:00.000Z'),
('YN-2026-10003','drv-027','mch-004','lmk-sacre','Aminata Mbaye','+221 77 234 8056',11900,'wave',true,'en route',true,'2026-05-20T10:37:00.000Z'),
('YN-2026-10004','drv-029','mch-005','lmk-ouakam','Cheikh Ndiaye','+221 78 176 2796',12800,'orange',false,'assignée',true,'2026-05-20T16:16:00.000Z'),
('YN-2026-10005','drv-039','mch-006','lmk-plateau','Mariama Diop','+221 78 582 4422',9600,'wave',false,'assignée',true,'2026-05-20T10:27:00.000Z'),
('YN-2026-10006','drv-025','mch-007','lmk-liberte','Khady Sarr','+221 78 524 8404',19600,'cash',true,'en route',true,'2026-05-20T15:00:00.000Z'),
('YN-2026-10007','drv-011','mch-008','lmk-hann','Awa Sow','+221 77 624 6420',4300,'wave',true,'collecte',true,'2026-05-20T10:44:00.000Z'),
('YN-2026-10008','drv-003','mch-009','lmk-almadies','Cheikh Diop','+221 77 517 2600',23300,'wave',false,'assignée',true,'2026-05-20T09:55:00.000Z'),
('YN-2026-10009','drv-028','mch-010','lmk-hann','Moussa Sarr','+221 77 804 4119',9500,'cash',false,'assignée',true,'2026-05-20T12:35:00.000Z'),
('YN-2026-10010','drv-007','mch-001','lmk-medina','Awa Ndiaye','+221 78 279 4418',8600,'orange',false,'assignée',true,'2026-05-20T11:28:00.000Z'),
('YN-2026-10011','drv-004','mch-002','lmk-medina','Cheikh Sarr','+221 78 441 3250',21500,'orange',false,'assignée',true,'2026-05-20T15:59:00.000Z'),
('YN-2026-10012','drv-023','mch-003','lmk-parcelles','Khady Ndiaye','+221 78 839 6940',17400,'cash',true,'assignée',true,'2026-05-20T08:14:00.000Z'),
('YN-2026-10013','drv-034','mch-004','lmk-liberte','Cheikh Fall','+221 77 641 1321',11800,'cash',false,'en route',true,'2026-05-20T16:51:00.000Z'),
('YN-2026-10014','drv-010','mch-005','lmk-medina','Khady Sow','+221 77 259 8296',21400,'wave',false,'créée',false,'2026-05-20T13:27:00.000Z'),
('YN-2026-10015','drv-035','mch-006','lmk-medina','Ibrahima Cissé','+221 77 411 3235',22600,'wave',false,'livrée',false,'2026-05-20T10:04:00.000Z'),
('YN-2026-10016','drv-002','mch-007','lmk-medina','Moussa Ba','+221 78 441 2896',8600,'wave',false,'collecte',true,'2026-05-20T12:35:00.000Z'),
('YN-2026-10017','drv-001','mch-008','lmk-almadies','Pape Diouf','+221 78 324 7646',3900,'cash',false,'assignée',true,'2026-05-20T08:35:00.000Z'),
('YN-2026-10018','drv-031','mch-009','lmk-hann','Aminata Sow','+221 78 693 6112',7900,'cash',false,'collecte',true,'2026-05-20T13:10:00.000Z'),
('YN-2026-10019','drv-025','mch-010','lmk-almadies','Fatou Cissé','+221 77 132 4081',20100,'orange',true,'créée',false,'2026-05-20T09:29:00.000Z'),
('YN-2026-10020','drv-001','mch-001','lmk-parcelles','Moussa Cissé','+221 77 828 7595',22700,'wave',false,'collecte',true,'2026-05-20T08:51:00.000Z'),
('YN-2026-10021','drv-001','mch-002','lmk-almadies','Pape Mbaye','+221 77 323 8032',15200,'orange',false,'créée',false,'2026-05-20T13:21:00.000Z'),
('YN-2026-10022','drv-002','mch-003','lmk-ouakam','Pape Diouf','+221 78 289 2901',8400,'orange',false,'créée',false,'2026-05-20T12:43:00.000Z'),
('YN-2026-10023','drv-011','mch-004','lmk-mermoz','Mariama Diop','+221 78 763 1156',19000,'wave',true,'collecte',true,'2026-05-20T13:50:00.000Z'),
('YN-2026-10024','drv-034','mch-005','lmk-grandy','Fatou Ba','+221 78 610 2618',16100,'wave',false,'collecte',true,'2026-05-20T12:38:00.000Z'),
('YN-2026-10025','drv-011','mch-006','lmk-hann','Awa Mbaye','+221 78 407 7100',5200,'cash',false,'collecte',true,'2026-05-20T15:50:00.000Z'),
('YN-2026-10026','drv-029','mch-007','lmk-medina','Aminata Mbaye','+221 77 758 8074',8300,'wave',true,'collecte',true,'2026-05-20T09:59:00.000Z'),
('YN-2026-10027','drv-012','mch-008','lmk-pikine','Mariama Fall','+221 77 802 5321',22700,'cash',false,'en route',true,'2026-05-20T11:48:00.000Z'),
('YN-2026-10028','drv-008','mch-009','lmk-liberte','Mariama Sarr','+221 77 290 2806',8200,'orange',false,'créée',false,'2026-05-20T16:13:00.000Z'),
('YN-2026-10029','drv-019','mch-010','lmk-ouakam','Ibrahima Cissé','+221 78 115 6729',20200,'cash',false,'assignée',true,'2026-05-20T14:01:00.000Z'),
('YN-2026-10030','drv-015','mch-001','lmk-mermoz','Cheikh Fall','+221 78 261 5655',19400,'wave',true,'livrée',false,'2026-05-20T09:46:00.000Z'),
('YN-2026-10031','drv-033','mch-002','lmk-medina','Pape Fall','+221 78 709 1660',21800,'orange',false,'en route',true,'2026-05-20T11:27:00.000Z'),
('YN-2026-10032','drv-002','mch-003','lmk-fann','Ibrahima Mbaye','+221 77 806 2769',4000,'cash',true,'créée',false,'2026-05-20T11:47:00.000Z'),
('YN-2026-10033','drv-037','mch-004','lmk-plateau','Ibrahima Diop','+221 77 531 8058',11800,'wave',false,'assignée',true,'2026-05-20T10:30:00.000Z'),
('YN-2026-10034','drv-023','mch-005','lmk-plateau','Mariama Sow','+221 77 280 2744',21000,'cash',true,'assignée',true,'2026-05-20T14:36:00.000Z'),
('YN-2026-10035','drv-009','mch-006','lmk-fann','Awa Diouf','+221 78 672 7149',4000,'orange',false,'assignée',true,'2026-05-20T08:21:00.000Z'),
('YN-2026-10036','drv-019','mch-007','lmk-fann','Moussa Fall','+221 78 565 6874',20500,'cash',false,'en route',true,'2026-05-20T16:06:00.000Z'),
('YN-2026-10037','drv-003','mch-008','lmk-liberte','Fatou Ndiaye','+221 78 165 7732',13000,'wave',false,'créée',false,'2026-05-20T10:29:00.000Z'),
('YN-2026-10038','drv-022','mch-009','lmk-fann','Ibrahima Mbaye','+221 77 276 1184',21600,'cash',true,'livrée',false,'2026-05-20T10:06:00.000Z'),
('YN-2026-10039','drv-007','mch-010','lmk-hann','Khady Diouf','+221 77 805 4083',10300,'orange',true,'assignée',true,'2026-05-20T15:23:00.000Z'),
('YN-2026-10040','drv-004','mch-001','lmk-ouakam','Mariama Sarr','+221 77 274 7462',25800,'cash',true,'assignée',true,'2026-05-20T13:40:00.000Z'),
('YN-2026-10041','drv-022','mch-002','lmk-grandy','Fatou Diop','+221 78 714 1200',14800,'orange',false,'en route',true,'2026-05-20T11:25:00.000Z'),
('YN-2026-10042','drv-020','mch-003','lmk-hann','Cheikh Sow','+221 78 686 7257',27300,'wave',false,'collecte',true,'2026-05-20T15:19:00.000Z'),
('YN-2026-10043','drv-024','mch-004','lmk-liberte','Awa Fall','+221 78 772 4520',17500,'orange',false,'assignée',true,'2026-05-20T15:48:00.000Z'),
('YN-2026-10044','drv-020','mch-005','lmk-ouakam','Moussa Sow','+221 77 118 7656',11300,'cash',false,'en route',true,'2026-05-20T10:06:00.000Z'),
('YN-2026-10045','drv-033','mch-006','lmk-grandy','Ibrahima Diouf','+221 77 408 3522',16300,'cash',false,'en route',true,'2026-05-20T08:10:00.000Z'),
('YN-2026-10046','drv-009','mch-007','lmk-grandy','Moussa Diouf','+221 77 745 9226',22700,'cash',false,'assignée',true,'2026-05-20T09:47:00.000Z'),
('YN-2026-10047','drv-016','mch-008','lmk-almadies','Fatou Fall','+221 77 120 5164',25300,'orange',false,'créée',false,'2026-05-20T14:46:00.000Z'),
('YN-2026-10048','drv-034','mch-009','lmk-sacre','Fatou Diop','+221 78 725 9761',20700,'cash',false,'créée',false,'2026-05-20T15:51:00.000Z'),
('YN-2026-10049','drv-025','mch-010','lmk-medina','Ibrahima Cissé','+221 78 451 6158',15300,'orange',false,'en route',true,'2026-05-20T12:48:00.000Z'),
('YN-2026-10050','drv-008','mch-001','lmk-hann','Awa Fall','+221 78 765 3872',19900,'wave',true,'en route',true,'2026-05-20T10:00:00.000Z'),
('YN-2026-10051','drv-015','mch-002','lmk-almadies','Pape Diop','+221 77 352 5724',16800,'orange',false,'collecte',true,'2026-05-20T14:22:00.000Z'),
('YN-2026-10052','drv-016','mch-003','lmk-ouakam','Ibrahima Diouf','+221 77 921 8086',3600,'wave',false,'assignée',true,'2026-05-20T13:10:00.000Z'),
('YN-2026-10053','drv-011','mch-004','lmk-parcelles','Awa Cissé','+221 77 516 9023',14300,'orange',true,'en route',true,'2026-05-20T08:44:00.000Z'),
('YN-2026-10054','drv-028','mch-005','lmk-liberte','Fatou Fall','+221 78 975 7337',10900,'orange',false,'collecte',true,'2026-05-20T09:57:00.000Z'),
('YN-2026-10055','drv-002','mch-006','lmk-grandy','Pape Mbaye','+221 78 615 5368',15200,'orange',false,'créée',false,'2026-05-20T15:50:00.000Z'),
('YN-2026-10056','drv-034','mch-007','lmk-parcelles','Ibrahima Niang','+221 78 386 7057',17000,'cash',false,'créée',false,'2026-05-20T09:56:00.000Z'),
('YN-2026-10057','drv-011','mch-008','lmk-hann','Mariama Ndiaye','+221 77 572 5893',11700,'wave',true,'en route',true,'2026-05-20T14:49:00.000Z'),
('YN-2026-10058','drv-009','mch-009','lmk-ouakam','Modou Niang','+221 77 807 1059',27300,'wave',false,'créée',false,'2026-05-20T14:31:00.000Z'),
('YN-2026-10059','drv-031','mch-010','lmk-medina','Khady Sarr','+221 77 901 4977',11200,'cash',true,'en route',true,'2026-05-20T15:28:00.000Z'),
('YN-2026-10060','drv-024','mch-001','lmk-ouakam','Modou Cissé','+221 78 733 3731',4200,'wave',false,'en route',true,'2026-05-20T08:12:00.000Z'),
('YN-2026-10061','drv-015','mch-002','lmk-sacre','Cheikh Sarr','+221 78 536 5307',25700,'wave',true,'en route',true,'2026-05-20T11:25:00.000Z'),
('YN-2026-10062','drv-031','mch-003','lmk-hann','Pape Fall','+221 78 705 5981',5100,'orange',false,'créée',false,'2026-05-20T15:10:00.000Z'),
('YN-2026-10063','drv-033','mch-004','lmk-fann','Cheikh Ba','+221 77 588 4044',5000,'cash',false,'assignée',true,'2026-05-20T08:13:00.000Z'),
('YN-2026-10064','drv-009','mch-005','lmk-ouakam','Ibrahima Fall','+221 77 105 9764',19500,'wave',false,'en route',true,'2026-05-20T14:57:00.000Z'),
('YN-2026-10065','drv-001','mch-006','lmk-sacre','Aminata Ndiaye','+221 77 497 3844',22600,'cash',false,'créée',false,'2026-05-20T11:54:00.000Z'),
('YN-2026-10066','drv-008','mch-007','lmk-fann','Ibrahima Diouf','+221 78 372 1291',5300,'orange',false,'en route',true,'2026-05-20T15:23:00.000Z'),
('YN-2026-10067','drv-028','mch-008','lmk-medina','Khady Sarr','+221 78 530 9190',22600,'cash',false,'assignée',true,'2026-05-20T10:48:00.000Z'),
('YN-2026-10068','drv-033','mch-009','lmk-ouakam','Fatou Diop','+221 78 597 1604',14100,'wave',false,'en route',true,'2026-05-20T17:08:00.000Z'),
('YN-2026-10069','drv-020','mch-010','lmk-hann','Cheikh Ndiaye','+221 78 404 1560',22800,'orange',false,'assignée',true,'2026-05-20T12:37:00.000Z'),
('YN-2026-10070','drv-009','mch-001','lmk-ouakam','Awa Cissé','+221 77 975 6880',5800,'wave',true,'livrée',false,'2026-05-20T17:44:00.000Z'),
('YN-2026-10071','drv-027','mch-002','lmk-sacre','Khady Ndiaye','+221 77 384 8026',15200,'orange',true,'collecte',true,'2026-05-20T13:43:00.000Z'),
('YN-2026-10072','drv-022','mch-003','lmk-sacre','Pape Sarr','+221 77 129 1675',6000,'orange',true,'livrée',false,'2026-05-20T11:11:00.000Z'),
('YN-2026-10073','drv-004','mch-004','lmk-parcelles','Khady Cissé','+221 78 918 8050',16900,'wave',false,'collecte',true,'2026-05-20T13:15:00.000Z'),
('YN-2026-10074','drv-009','mch-005','lmk-medina','Cheikh Niang','+221 78 160 4917',12000,'orange',false,'assignée',true,'2026-05-20T15:52:00.000Z'),
('YN-2026-10075','drv-033','mch-006','lmk-grandy','Pape Cissé','+221 78 155 8112',11500,'wave',false,'collecte',true,'2026-05-20T16:54:00.000Z'),
('YN-2026-10076','drv-008','mch-007','lmk-parcelles','Modou Diop','+221 77 687 1848',14100,'cash',false,'en route',true,'2026-05-20T15:02:00.000Z'),
('YN-2026-10077','drv-029','mch-008','lmk-medina','Pape Niang','+221 77 801 5322',10300,'cash',false,'livrée',false,'2026-05-20T12:51:00.000Z'),
('YN-2026-10078','drv-027','mch-009','lmk-parcelles','Awa Diop','+221 77 167 1931',27300,'cash',true,'en route',true,'2026-05-20T14:43:00.000Z'),
('YN-2026-10079','drv-031','mch-010','lmk-mermoz','Modou Diop','+221 78 804 5928',26200,'wave',true,'collecte',true,'2026-05-20T13:26:00.000Z'),
('YN-2026-10080','drv-001','mch-001','lmk-parcelles','Awa Diouf','+221 78 491 4150',27000,'wave',false,'en route',true,'2026-05-20T08:03:00.000Z'),
('YN-2026-10081','drv-015','mch-002','lmk-almadies','Awa Fall','+221 78 810 3965',7700,'wave',true,'collecte',true,'2026-05-20T12:25:00.000Z'),
('YN-2026-10082','drv-030','mch-003','lmk-pikine','Fatou Diop','+221 77 184 4903',5000,'orange',true,'créée',false,'2026-05-20T11:02:00.000Z'),
('YN-2026-10083','drv-001','mch-004','lmk-fann','Ibrahima Fall','+221 77 531 3503',3700,'wave',true,'collecte',true,'2026-05-20T12:47:00.000Z'),
('YN-2026-10084','drv-029','mch-005','lmk-thiaroye','Awa Ndiaye','+221 77 193 9771',12600,'cash',true,'assignée',true,'2026-05-20T13:32:00.000Z'),
('YN-2026-10085','drv-017','mch-006','lmk-liberte','Ibrahima Fall','+221 78 592 9348',4000,'cash',false,'collecte',true,'2026-05-20T11:22:00.000Z'),
('YN-2026-10086','drv-031','mch-007','lmk-grandy','Khady Diop','+221 78 414 9642',20900,'orange',true,'collecte',true,'2026-05-20T17:44:00.000Z'),
('YN-2026-10087','drv-012','mch-008','lmk-fann','Ibrahima Ndiaye','+221 78 396 2548',24800,'cash',true,'assignée',true,'2026-05-20T11:09:00.000Z'),
('YN-2026-10088','drv-038','mch-009','lmk-hann','Awa Sow','+221 77 489 1584',15200,'cash',true,'livrée',false,'2026-05-20T08:19:00.000Z'),
('YN-2026-10089','drv-019','mch-010','lmk-pikine','Khady Sarr','+221 77 350 1107',21800,'cash',false,'assignée',true,'2026-05-20T17:06:00.000Z'),
('YN-2026-10090','drv-040','mch-001','lmk-parcelles','Moussa Cissé','+221 77 976 4364',21400,'cash',true,'créée',false,'2026-05-20T08:40:00.000Z'),
('YN-2026-10091','drv-024','mch-002','lmk-fann','Cheikh Cissé','+221 77 933 1208',25600,'orange',false,'livrée',false,'2026-05-20T08:37:00.000Z'),
('YN-2026-10092','drv-014','mch-003','lmk-sacre','Pape Ndiaye','+221 78 963 7410',25500,'cash',false,'créée',false,'2026-05-20T14:32:00.000Z'),
('YN-2026-10093','drv-022','mch-004','lmk-liberte','Pape Mbaye','+221 78 254 8857',17400,'cash',false,'créée',false,'2026-05-20T15:48:00.000Z'),
('YN-2026-10094','drv-033','mch-005','lmk-medina','Khady Niang','+221 78 158 5304',20700,'cash',false,'en route',true,'2026-05-20T08:45:00.000Z'),
('YN-2026-10095','drv-037','mch-006','lmk-mermoz','Mariama Niang','+221 77 110 7730',22100,'orange',false,'en route',true,'2026-05-20T15:50:00.000Z'),
('YN-2026-10096','drv-029','mch-007','lmk-almadies','Modou Niang','+221 77 436 7589',27800,'cash',false,'créée',false,'2026-05-20T12:21:00.000Z'),
('YN-2026-10097','drv-020','mch-008','lmk-fann','Modou Sow','+221 77 120 9121',18600,'wave',false,'en route',true,'2026-05-20T15:54:00.000Z'),
('YN-2026-10098','drv-028','mch-009','lmk-liberte','Modou Diop','+221 78 740 9111',23800,'orange',false,'collecte',true,'2026-05-20T08:56:00.000Z'),
('YN-2026-10099','drv-023','mch-010','lmk-grandy','Moussa Diop','+221 78 884 6120',10100,'orange',false,'en route',true,'2026-05-20T12:48:00.000Z'),
('YN-2026-10100','drv-001','mch-001','lmk-thiaroye','Awa Cissé','+221 78 529 7337',16000,'orange',true,'créée',false,'2026-05-20T09:02:00.000Z'),
('YN-2026-10101','drv-019','mch-002','lmk-grandy','Awa Diop','+221 77 772 7844',17900,'wave',false,'collecte',true,'2026-05-20T13:28:00.000Z'),
('YN-2026-10102','drv-013','mch-003','lmk-medina','Pape Fall','+221 77 758 9944',17300,'wave',false,'créée',false,'2026-05-20T11:30:00.000Z'),
('YN-2026-10103','drv-020','mch-004','lmk-pikine','Awa Ba','+221 77 911 6559',11600,'orange',false,'collecte',true,'2026-05-20T11:17:00.000Z'),
('YN-2026-10104','drv-023','mch-005','lmk-medina','Ibrahima Ndiaye','+221 78 910 8488',11300,'orange',false,'assignée',true,'2026-05-20T12:20:00.000Z'),
('YN-2026-10105','drv-014','mch-006','lmk-medina','Aminata Fall','+221 78 611 3449',14300,'orange',false,'assignée',true,'2026-05-20T10:46:00.000Z'),
('YN-2026-10106','drv-040','mch-007','lmk-sacre','Khady Fall','+221 78 733 5596',12300,'cash',false,'collecte',true,'2026-05-20T17:44:00.000Z'),
('YN-2026-10107','drv-013','mch-008','lmk-hann','Ibrahima Niang','+221 77 783 6291',17200,'orange',true,'assignée',true,'2026-05-20T17:16:00.000Z'),
('YN-2026-10108','drv-002','mch-009','lmk-medina','Ibrahima Niang','+221 77 993 6071',26000,'orange',true,'livrée',false,'2026-05-20T17:36:00.000Z'),
('YN-2026-10109','drv-038','mch-010','lmk-hann','Modou Sarr','+221 77 655 3994',16200,'wave',true,'livrée',false,'2026-05-20T09:43:00.000Z'),
('YN-2026-10110','drv-003','mch-001','lmk-mermoz','Modou Fall','+221 78 848 3878',13200,'wave',false,'livrée',false,'2026-05-20T08:38:00.000Z'),
('YN-2026-10111','drv-003','mch-002','lmk-hann','Cheikh Fall','+221 78 344 4969',7000,'orange',false,'créée',false,'2026-05-20T08:07:00.000Z'),
('YN-2026-10112','drv-027','mch-003','lmk-plateau','Ibrahima Niang','+221 78 559 4260',3500,'wave',false,'créée',false,'2026-05-20T11:44:00.000Z'),
('YN-2026-10113','drv-033','mch-004','lmk-fann','Ibrahima Diouf','+221 78 628 6046',13700,'cash',false,'créée',false,'2026-05-20T08:13:00.000Z'),
('YN-2026-10114','drv-004','mch-005','lmk-plateau','Modou Ba','+221 77 606 9299',8300,'cash',false,'assignée',true,'2026-05-20T15:07:00.000Z'),
('YN-2026-10115','drv-033','mch-006','lmk-liberte','Fatou Mbaye','+221 77 399 5700',27100,'cash',true,'créée',false,'2026-05-20T16:43:00.000Z'),
('YN-2026-10116','drv-018','mch-007','lmk-grandy','Aminata Sarr','+221 77 387 4567',25500,'orange',false,'en route',true,'2026-05-20T12:46:00.000Z'),
('YN-2026-10117','drv-033','mch-008','lmk-grandy','Mariama Sarr','+221 78 496 2300',21800,'orange',false,'livrée',false,'2026-05-20T15:28:00.000Z'),
('YN-2026-10118','drv-004','mch-009','lmk-mermoz','Cheikh Sarr','+221 78 425 1028',19000,'orange',false,'collecte',true,'2026-05-20T15:19:00.000Z'),
('YN-2026-10119','drv-020','mch-010','lmk-almadies','Cheikh Cissé','+221 78 604 4755',16200,'orange',false,'en route',true,'2026-05-20T17:01:00.000Z'),
('YN-2026-10120','drv-005','mch-001','lmk-thiaroye','Cheikh Cissé','+221 77 929 2784',15400,'wave',true,'en route',true,'2026-05-20T17:00:00.000Z'),
('YN-2026-10121','drv-023','mch-002','lmk-thiaroye','Pape Ndiaye','+221 77 569 9678',15400,'cash',false,'livrée',false,'2026-05-20T13:41:00.000Z'),
('YN-2026-10122','drv-015','mch-003','lmk-thiaroye','Pape Cissé','+221 77 456 9116',7700,'wave',true,'livrée',false,'2026-05-20T15:02:00.000Z'),
('YN-2026-10123','drv-014','mch-004','lmk-ouakam','Khady Sarr','+221 78 229 7752',26400,'wave',false,'collecte',true,'2026-05-20T15:36:00.000Z'),
('YN-2026-10124','drv-018','mch-005','lmk-medina','Pape Niang','+221 78 102 6708',11200,'cash',false,'en route',true,'2026-05-20T17:56:00.000Z'),
('YN-2026-10125','drv-012','mch-006','lmk-medina','Cheikh Sarr','+221 78 475 5689',9100,'wave',false,'en route',true,'2026-05-20T14:10:00.000Z'),
('YN-2026-10126','drv-040','mch-007','lmk-grandy','Modou Cissé','+221 77 278 5402',20500,'cash',false,'livrée',false,'2026-05-20T16:19:00.000Z'),
('YN-2026-10127','drv-039','mch-008','lmk-medina','Cheikh Sow','+221 77 966 5386',9200,'wave',false,'en route',true,'2026-05-20T10:43:00.000Z'),
('YN-2026-10128','drv-040','mch-009','lmk-parcelles','Pape Diop','+221 77 910 2553',24400,'cash',true,'livrée',false,'2026-05-20T13:06:00.000Z'),
('YN-2026-10129','drv-008','mch-010','lmk-pikine','Moussa Ndiaye','+221 78 774 9431',10600,'orange',false,'assignée',true,'2026-05-20T13:52:00.000Z'),
('YN-2026-10130','drv-003','mch-001','lmk-fann','Awa Sow','+221 78 670 3848',25200,'wave',false,'collecte',true,'2026-05-20T13:38:00.000Z'),
('YN-2026-10131','drv-001','mch-002','lmk-parcelles','Khady Niang','+221 78 568 3074',16500,'wave',true,'collecte',true,'2026-05-20T11:19:00.000Z'),
('YN-2026-10132','drv-016','mch-003','lmk-parcelles','Moussa Niang','+221 77 539 7280',4100,'orange',false,'collecte',true,'2026-05-20T11:11:00.000Z'),
('YN-2026-10133','drv-001','mch-004','lmk-pikine','Modou Fall','+221 77 538 3102',3600,'wave',false,'assignée',true,'2026-05-20T12:24:00.000Z'),
('YN-2026-10134','drv-030','mch-005','lmk-pikine','Modou Diouf','+221 77 255 8688',19400,'cash',false,'assignée',true,'2026-05-20T11:37:00.000Z'),
('YN-2026-10135','drv-036','mch-006','lmk-liberte','Ibrahima Sarr','+221 77 942 3627',6900,'wave',true,'collecte',true,'2026-05-20T13:36:00.000Z'),
('YN-2026-10136','drv-020','mch-007','lmk-parcelles','Fatou Ndiaye','+221 78 384 8998',23900,'orange',false,'assignée',true,'2026-05-20T17:13:00.000Z'),
('YN-2026-10137','drv-031','mch-008','lmk-parcelles','Cheikh Ndiaye','+221 78 307 5780',4800,'cash',false,'collecte',true,'2026-05-20T13:13:00.000Z'),
('YN-2026-10138','drv-031','mch-009','lmk-thiaroye','Khady Sow','+221 78 727 1226',14900,'cash',false,'livrée',false,'2026-05-20T11:57:00.000Z'),
('YN-2026-10139','drv-038','mch-010','lmk-sacre','Khady Niang','+221 77 309 1053',24500,'wave',false,'collecte',true,'2026-05-20T09:26:00.000Z'),
('YN-2026-10140','drv-037','mch-001','lmk-hann','Moussa Cissé','+221 77 868 6851',20500,'orange',false,'assignée',true,'2026-05-20T08:01:00.000Z'),
('YN-2026-10141','drv-024','mch-002','lmk-almadies','Modou Mbaye','+221 77 362 2263',8100,'cash',false,'créée',false,'2026-05-20T12:10:00.000Z'),
('YN-2026-10142','drv-029','mch-003','lmk-fann','Pape Diouf','+221 78 899 8521',16100,'wave',false,'créée',false,'2026-05-20T09:58:00.000Z'),
('YN-2026-10143','drv-032','mch-004','lmk-liberte','Mariama Mbaye','+221 78 577 1510',21500,'orange',false,'collecte',true,'2026-05-20T17:38:00.000Z'),
('YN-2026-10144','drv-041','mch-005','lmk-liberte','Fatou Ba','+221 78 122 5209',7700,'orange',false,'créée',false,'2026-05-20T17:01:00.000Z'),
('YN-2026-10145','drv-026','mch-006','lmk-grandy','Mariama Mbaye','+221 77 105 8736',18000,'wave',false,'livrée',false,'2026-05-20T15:30:00.000Z'),
('YN-2026-10146','drv-035','mch-007','lmk-grandy','Aminata Ba','+221 77 684 7248',13300,'orange',true,'livrée',false,'2026-05-20T14:20:00.000Z')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- TICKETS SAV (5 tickets + messages)
-- ────────────────────────────────────────────────────────────
INSERT INTO sav_tickets (id, order_ref, type, description, status, responsable, delay)
VALUES
  ('SAV-001','YN-2026-10124','Retard livraison','Client signale un retard de plus de 2h','ouvert','—','45 min'),
  ('SAV-002','YN-2026-10098','Colis abîmé','Tissu endommagé à la livraison','en cours','Moussa D.','3h 10m'),
  ('SAV-003','YN-2026-10085','Mauvaise adresse','Livreur livré à mauvais point repère','en cours','Fatou S.','22h'),
  ('SAV-004','YN-2026-10071','Non livré','Commande marquée livrée mais non reçue','résolu','Ibrahima C.','—'),
  ('SAV-005','YN-2026-10060','Paiement incorrect','Client a reçu un reçu avec un montant erroné','résolu','Admin','—')
ON CONFLICT (id) DO NOTHING;

INSERT INTO sav_messages (ticket_id, from_role, text, sent_at) VALUES
  ('SAV-001','client','Bonjour, ma commande YN-2026-10124 devait arriver à 13h, il est 15h30 et toujours rien.','2026-05-20T14:32:00Z'),
  ('SAV-001','admin', 'Bonjour, nous vérifions avec le livreur. Un délai météo est possible dans votre zone.','2026-05-20T14:45:00Z'),
  ('SAV-001','client','D''accord, mais c''est urgent pour moi.','2026-05-20T14:47:00Z'),
  ('SAV-002','client','Mon tissu Wax a été livré avec une déchirure. Je veux un remboursement.','2026-05-20T11:22:00Z'),
  ('SAV-002','admin', 'Nous sommes désolés. Pouvez-vous envoyer une photo du dommage sur WhatsApp?','2026-05-20T11:35:00Z'),
  ('SAV-002','client','Photo envoyée.','2026-05-20T11:40:00Z'),
  ('SAV-002','admin', 'Reçu. Nous traitons votre demande de remboursement. Délai : 24–48h.','2026-05-20T11:50:00Z'),
  ('SAV-003','client','Le livreur a laissé mon colis chez le voisin sans me prévenir.','2026-05-20T16:48:00Z'),
  ('SAV-003','admin', 'Nous contactons le livreur pour récupérer votre colis immédiatement.','2026-05-20T16:55:00Z'),
  ('SAV-004','client','Mon statut dit livré mais je n''ai rien reçu.','2026-05-20T09:18:00Z'),
  ('SAV-004','admin', 'Enquête lancée. Le livreur a confirmé avoir déposé chez la gardienne.','2026-05-20T09:40:00Z'),
  ('SAV-004','client','Ah oui, la gardienne avait le colis. Merci !','2026-05-20T10:05:00Z'),
  ('SAV-004','admin', 'Parfait. Ticket résolu. Merci de votre confiance.','2026-05-20T10:07:00Z'),
  ('SAV-005','client','Le reçu Wave indique 15 000 F mais j''ai payé 12 000 F.','2026-05-20T08:10:00Z'),
  ('SAV-005','admin', 'Vérification en cours avec notre équipe finance.','2026-05-20T08:25:00Z'),
  ('SAV-005','admin', 'Erreur confirmée. Remboursement de 3 000 F traité.','2026-05-20T09:00:00Z'),
  ('SAV-005','client','Reçu, merci pour la rapidité !','2026-05-20T09:05:00Z');

-- ────────────────────────────────────────────────────────────
-- INDEX manquant
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_merchant ON orders(merchant_id);
