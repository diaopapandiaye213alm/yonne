# YONNE Tranche D — Admin Pages Manquantes — Design Spec

**Date :** 2026-05-07
**Périmètre :** 7 pages admin manquantes + pages de détail associées
**Stack :** Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, Recharts, Leaflet, Zustand v5

---

## Décisions de design

| Question | Décision |
|---|---|
| Pattern pages de gestion | Tableau plein écran → page de détail séparée |
| Finance organisation | Vue d'ensemble avec widgets en grille |
| Surge pricing contrôle | Slider x1.0→x2.0 + toggle auto IA + graphique barres |

---

## Pages à créer

| Route | Titre | Fichiers |
|---|---|---|
| `/admin/commandes` | Gestion commandes | `app/(admin)/admin/commandes/page.tsx`, `app/(admin)/admin/commandes/[id]/page.tsx` |
| `/admin/livreurs` | Gestion livreurs | `app/(admin)/admin/livreurs/page.tsx`, `app/(admin)/admin/livreurs/[id]/page.tsx` |
| `/admin/marchands` | Gestion commerçants | `app/(admin)/admin/marchands/page.tsx`, `app/(admin)/admin/marchands/[id]/page.tsx` |
| `/admin/finance` | Finance | `app/(admin)/admin/finance/page.tsx` |
| `/admin/analytics` | Analytics avancé | `app/(admin)/admin/analytics/page.tsx` |
| `/admin/surge` | Surge pricing | `app/(admin)/admin/surge/page.tsx` |
| `/admin/settings` | Paramètres | `app/(admin)/admin/settings/page.tsx` |

---

## 1. `/admin/commandes` — Gestion commandes

### Liste (`page.tsx`)

**Barre d'outils :**
- Champ recherche (ID, nom client)
- Filtre statut : `Tous | En attente | En route | Livré | Incident`
- Filtre paiement : `Tous | Wave | Orange Money | Cash`
- Filtre date range (date début / date fin)
- Bouton "↓ Export CSV" — exporte la sélection filtrée courante

**Tableau** (colonnes) :
`ID · Client · Livreur assigné · Statut (badge coloré) · Paiement · Montant · Date`

Statuts et couleurs :
- En attente → badge amber
- En route → badge gold
- Livré → badge emerald
- Incident → badge red

Pagination : 20 lignes/page, contrôles `← Page N / Total →`

Clic sur une ligne → `/admin/commandes/[id]`

### Détail (`[id]/page.tsx`)

- En-tête : ID commande, statut badge, bouton retour
- Grille infos : Client (nom + téléphone) · Livreur assigné (nom + score IA) · Montant · Paiement · Date · Distance km · Landmark pickup → landmark destination
- Mini-carte Leaflet (dynamic import, SSR: false) : pin pickup + pin destination + trail
- Timeline GlovoTimeline (composant existant) avec étape active
- Zone actions (selon statut) :
  - Si "En attente" : bouton "Réassigner un livreur" (select livreur) + bouton "Annuler"
  - Si "En route" : bouton "Marquer incident"
  - Si "Livré" : lecture seule
  - Si "Incident" : champ description incident + bouton "Résoudre"

**Mock data :** utiliser `lib/mock-data/orders.ts` existant (compléter si nécessaire)

---

## 2. `/admin/livreurs` — Gestion livreurs

### Liste (`page.tsx`)

**Barre d'outils :**
- Champ recherche (nom, téléphone)
- Filtre statut : `Tous | Actif | Hors-ligne | Suspendu`
- Filtre badge niveau : `Tous | Bronze | Argent | Or`
- Filtre score IA : slider range 0–100

**Tableau** (colonnes) :
`Avatar (initiales) · Nom · Score IA (barre de progression) · Statut · Livraisons totales · Note moyenne (étoiles) · Badge niveau`

Pagination 20 lignes/page. Clic → `/admin/livreurs/[id]`

### Détail (`[id]/page.tsx`)

- En-tête : avatar grand, nom, badge niveau, statut actuel
- **Score IA décomposé** : 3 jauges (Distance 40% · Charge 30% · Fiabilité 30%) avec valeur numérique
- Graphique gains semaine : BarChart Recharts (7 barres, données mock)
- Stats : livraisons totales · note moyenne · distance totale km · taux de réussite %
- 6 badges visuels : Rapide / Top noté / Précis / 10 jours consécutifs / 50 courses / Fidélité Or
- Section Tontine : statut membre (cotisation à jour / en retard)
- Section Avance salaire : gains du jour, montant disponible (80%), frais (2%), bouton "Débloquer avance"

**Mock data :** utiliser `lib/mock-data/drivers.ts` existant

---

## 3. `/admin/marchands` — Gestion commerçants

### Liste (`page.tsx`)

**Barre d'outils :**
- Champ recherche (nom boutique, email)
- Filtre plan : `Tous | Standard | Premium`
- Filtre ville : `Dakar | Thiès | Saint-Louis | Touba`
- Filtre statut : `Tous | Actif | Suspendu`

**Tableau** (colonnes) :
`Nom boutique · Email · Plan (badge Standard/Premium) · Commandes ce mois · CA généré (F) · Statut`

Pagination 20 lignes/page. Clic → `/admin/marchands/[id]`

### Détail (`[id]/page.tsx`)

- En-tête : nom boutique, plan badge, statut
- Infos : email · téléphone · ville · date inscription
- QR Code boutique : image générée (utiliser `qrcode` ou SVG inline statique pour la démo)
- Historique commandes du mois : mini-tableau 5 dernières commandes
- Revenus : CA généré ce mois, commission YONNE collectée
- Bouton upgrade Premium (dialog confirmation) — uniquement si plan Standard

**Mock data :** créer `lib/mock-data/merchants.ts`

---

## 4. `/admin/finance` — Finance

Vue d'ensemble : grille de 5 widgets + 1 widget pleine largeur en bas.

### Widgets grille (2 colonnes sur desktop)

**Widget Réconciliation :**
- 3 montants en ligne : Wave (emerald) · Orange Money (amber) · Cash (gray)
- Total du jour en grand
- Lien "Voir toutes les transactions" → tableau transactions (même page, scroll ou section expand)

**Widget Parrainage :**
- Nb filleuls actifs
- Primes à verser (nb × 5 000 F)
- Liste des 3 derniers filleuls atteignant la 10ᵉ livraison avec bouton "Verser prime"

**Widget Tontine :**
- Semaine en cours (ex: Semaine 12 / 52)
- Nb membres : 8
- Cotisation : 2 000 F/semaine/membre
- Bénéficiaire actuel : nom + photo initiales
- Prochain bénéficiaire : nom

**Widget Avance salaire :**
- Nb demandes en attente
- Montant total à débloquer
- Liste des demandes : nom livreur · gains du jour · montant demandé · frais 2% · boutons Approuver / Rejeter

**Widget Assurance colis :**
- Nb assurances actives aujourd'hui
- Primes collectées (+200 F/colis)
- Marge nette (82% → calculée)

### Section Transactions (pleine largeur, en bas)
Tableau scrollable : `Ref · Livreur · Méthode · Montant · Commission · Date`

**Mock data :** créer `lib/mock-data/finance.ts`

---

## 5. `/admin/analytics` — Analytics avancé

Complément du dashboard `/admin` existant — focus sur les données historiques et les métriques business.

**Zone 1 — Revenus heure/heure (7 jours) :**
LineChart Recharts multi-séries : `Aujourd'hui` vs `Semaine dernière` (même heure). Légende + tooltip.

**Zone 2 — Heatmap zones Dakar :**
Carte Leaflet (dynamic import) avec cercles de chaleur par quartier (taille ∝ volume commandes). Quartiers : Plateau, Médina, Parcelles Assainies, Grand Yoff, Ouakam, Almadies, Ngor, Point E.

**Zone 3 — Métriques point mort :**
2 gauges circulaires :
- Commandes aujourd'hui vs point mort (24/jour) — vert si dépassé
- Commandes aujourd'hui vs seuil rentabilité (300/jour) — gold si dépassé

**Zone 4 — Rétention commerçants :**
BarChart Recharts : nb commerçants actifs par semaine sur 8 semaines.

**Zone 5 — Leaderboard livreurs top 10 :**
Liste ordonnée : rang · avatar initiales · nom · livraisons cette semaine · gains · badge niveau.

**Mock data :** créer `lib/mock-data/analytics.ts`

---

## 6. `/admin/surge` — Surge Pricing

**Zone contrôle (haut) :**
- Badge multiplicateur actuel en grand (ex: x1.4) avec couleur dynamique (vert < x1.3, gold x1.3–x1.7, rouge > x1.7)
- Toggle "Mode automatique IA" (Switch shadcn/ui) — quand ON : slider désactivé + label "IA ajuste automatiquement"
- Slider x1.0→x2.0 (pas 0.1) — désactivé si mode auto ON
- Indicateur revenu supplémentaire estimé : `+{(multiplicateur-1)*100}% sur les commandes en cours`
- Bouton "Appliquer" (primary) — visible uniquement si mode auto OFF

**Zone historique (bas) :**
BarChart Recharts : axe X = heures (0h–23h), axe Y = multiplicateur (1.0–2.0). Ligne de référence horizontale à y=1.0. Barres colorées : emerald < 1.3, gold 1.3–1.7, red > 1.7.

**Store local :** `lib/store/surge.ts` — état `{ multiplier: number, autoMode: boolean }`

**Mock data :** tableau de 24 valeurs (une par heure) dans `lib/mock-data/surge.ts`

---

## 7. `/admin/settings` — Paramètres

Page formulaire organisée en sections accordéon ou cartes séparées.

**Section Plateforme :**
- Champs : Nom plateforme · Ville principale · Email contact · Téléphone support
- Bouton "Enregistrer"

**Section Algorithme dispatch IA :**
- 3 sliders (0–100, somme = 100) :
  - Poids Distance : 40%
  - Poids Charge livreur : 30%
  - Poids Fiabilité : 30%
- Indicateur visuel si la somme ≠ 100 (warning badge)
- Bouton "Enregistrer"

**Section Templates WhatsApp :**
- 4 champs textarea (un par template) :
  - Commande assignée au livreur
  - Livreur en route vers collecte
  - Livreur en route vers client
  - Livraison confirmée
- Variables disponibles listées : `{client_name}`, `{driver_name}`, `{eta}`, `{order_id}`
- Bouton "Enregistrer"

**Section Mode Hivernage :**
- Toggle ON/OFF principal
- Quand ON : checkboxes zones inondées (Parcelles Assainies · Pikine · Guédiawaye · Thiaroye · Yeumbeul)
- Surge météo automatique : +20% si hivernage actif
- Prime livreur hivernage : +500 F/livraison

**Section Heures de prière :**
- Toggle par prière : Fajr · Dhuhr · Asr · Maghrib · Isha
- Pour chaque prière activée : durée pause (select 5/10/15/20 min) + micro-surge x1.1 activé N min avant

---

## Composants partagés à créer

| Composant | Usage |
|---|---|
| `components/admin/DataTable.tsx` | Tableau générique réutilisable (colonnes, pagination, recherche) |
| `components/admin/FilterBar.tsx` | Barre filtres + recherche + export |
| `components/admin/StatCard.tsx` | Widget KPI réutilisable (titre + valeur + couleur) |

---

## Mock data à créer

| Fichier | Contenu |
|---|---|
| `lib/mock-data/merchants.ts` | 10 commerçants (Standard/Premium, villes variées) |
| `lib/mock-data/finance.ts` | Transactions (Wave/OM/Cash), tontine, avances, parrainage |
| `lib/mock-data/analytics.ts` | Revenus horaires 7j, zones Dakar, leaderboard, rétention |
| `lib/mock-data/surge.ts` | Historique multiplicateur 24h |

---

## Critères de réussite

1. Les 7 routes répondent sans erreur 404
2. Chaque tableau affiche des données mock réalistes (noms sénégalais, montants FCFA)
3. Les pages de détail (commandes/[id], livreurs/[id], marchands/[id]) sont accessibles
4. La page Finance affiche tous les 5 widgets visibles sans scroll horizontal
5. Le slider Surge met à jour le badge multiplicateur en temps réel (état local Zustand)
6. La page Settings enregistre l'état localement (Zustand ou useState — pas de backend)
7. Le build `pnpm build` passe sans erreur
