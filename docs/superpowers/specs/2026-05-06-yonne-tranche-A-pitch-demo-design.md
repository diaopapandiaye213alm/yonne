# YONNE — Tranche A · Démo de pitch

**Date :** 2026-05-06
**Statut :** Approuvé (à exécuter)
**Auteur :** Papa Ndiaye Diao + Claude

---

## 1. Objectif

Construire une démo frontend-only de YONNE — plateforme SaaS de livraison last-mile pour le Sénégal — destinée à pitcher des investisseurs, recruter un cofondateur tech, et convaincre des commerçants pilotes.

L'enjeu est **visuel et narratif**, pas fonctionnel. La démo doit donner l'illusion d'un produit réel et abouti, tout en n'ayant ni backend ni vraie persistance.

## 2. Non-objectifs

Pour éviter le scope creep, **ne sont pas dans cette tranche** :
- Backend Laravel, base MySQL, vraie API REST
- Authentification réelle (Sanctum, 2FA SMS effective)
- Intégrations Wave / Orange Money / Twilio / WhatsApp Business
- PWA Livreur (3ᵉ interface) — sera la tranche B
- Mode sombre — pousser le mode clair Téranga d'abord
- Internationalisation complète Wolof / Anglais (uniquement le toggle visible et 5 strings traduites pour démo)
- Tests automatisés (manuel-only pour démo)
- Onboarding multi-étapes, mot de passe oublié, comptes utilisateurs multiples
- Les 9 modules admin restants (Commandes, Livreurs, Commerçants, Finance, Analytics, Surge, Tontine, Hivernage, etc.) — mockés en sidebar mais pages vides ou redirigées vers Home

## 3. Audience cible de la démo

| Audience | Ce qu'ils doivent ressentir |
|----------|-----------------------------|
| Investisseur | "C'est un vrai produit, ils sont en avance" |
| Cofondateur tech potentiel | "Le code est propre, ça scale" |
| Commerçant pilote | "C'est facile, je veux essayer" |

## 4. Stack technique

- **Framework** : Next.js 14 (App Router) + TypeScript strict
- **Styling** : Tailwind CSS + shadcn/ui (radix primitives)
- **Cartographie** : Leaflet.js + react-leaflet · tiles OpenStreetMap
- **Charts** : Recharts (courbe demande Tabaski, KPIs)
- **Icônes** : lucide-react (outline cohérent)
- **Fonts** : Geist (display + headings) + Inter (body) + JetBrains Mono (chiffres)
- **State** : React state + Zustand pour les flux multi-étapes (wizard, tracking)
- **Mock data** : fichiers TypeScript statiques dans `lib/mock-data/`
- **"Real-time" simulé** : `setInterval` côté client (pin livreur qui bouge, ETA qui décrémente, surge qui pulse)
- **Pas de backend** · pas de base · pas d'API externe

## 5. Direction visuelle — Téranga

Émeraude + or chaud + crème. Chaleureux, hospitalier, ancré dans la culture sénégalaise. Inspiration Stripe / Notion. Mode clair par défaut (mode sombre exclu de cette tranche).

### Tokens (`lib/tokens.ts`)

```ts
export const colors = {
  emerald: { 500: "#15803D", 600: "#166534", 700: "#14532D" },
  gold:    { 400: "#D4A574", 500: "#C8924C", 600: "#A87434" },
  cream:   { 50: "#FAF7F0", 100: "#F5EFE0", 200: "#E8DFD0" },
  ink:     { 900: "#3F2A1F", 700: "#5C4536", 500: "#8B7363" },
  success: "#15803D",
  warning: "#D4A574",
  danger:  "#B43A2E",
  info:    "#3B6CA8",
}

export const radii   = { sm: "6px", md: "10px", lg: "14px", xl: "20px" }
export const shadows = {
  card: "0 4px 14px rgba(63,42,31,0.08)",
  glow: "0 0 30px rgba(212,165,116,0.25)",
}

export const fonts = {
  display: "Geist, system-ui, sans-serif",
  body:    "Inter, system-ui, sans-serif",
  mono:    "JetBrains Mono, ui-monospace",
}
```

### Logo / wordmark

Wordmark typo simple : **« yonne »** en Geist Bold émeraude `#15803D`, point sur le « i » en or `#D4A574`. Composant React `<Wordmark />` avec props `size` (`sm` / `md` / `lg`) et `variant` (`light` / `dark`).

### Principes UX

- Mobile-first sur l'écran 4 (création de commande) et 5 (tracking) — vraisemblablement consommés depuis téléphone
- Desktop-first sur écrans 1-3 (login + admin) — usage staff
- Glassmorphism subtil sur cards de KPI et bandeaux d'alerte (blur 12 px, transparence 4-8 %)
- Soft glow or autour des CTAs principaux
- Micro-interactions : transition 200 ms ease-out par défaut, pin livreur qui pulse à intervalles, ETA qui décrémente avec animation chiffre
- Accessibilité : contraste WCAG AA minimum, navigation clavier, `aria-label` sur icônes

## 6. Arborescence projet

```
~/yonne/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (admin)/admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx                     ← Home admin
│   │   └── tabaski/page.tsx             ← Signature feature
│   ├── (merchant)/merchant/
│   │   ├── layout.tsx
│   │   ├── nouvelle-commande/page.tsx   ← Wizard 3 étapes
│   │   └── commande/[id]/page.tsx       ← Tracking client
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                              ← shadcn primitives
│   ├── brand/Wordmark.tsx
│   ├── layout/AdminSidebar.tsx, MerchantSidebar.tsx, Topbar.tsx, LangSwitcher.tsx
│   ├── kpi/KpiCard.tsx, RevenueSparkline.tsx, DriverLeaderboard.tsx
│   ├── map/DakarMap.tsx, DriverPin.tsx, OrderMarker.tsx
│   ├── tabaski/J7Countdown.tsx, DemandCurve.tsx, ActionPlanCard.tsx
│   ├── wizard/Stepper.tsx, ClientStep.tsx, PaymentStep.tsx, DispatchStep.tsx
│   └── tracking/GlovoTimeline.tsx, ChatBubble.tsx, EtaBadge.tsx, DriverCard.tsx
├── lib/
│   ├── tokens.ts
│   ├── i18n.ts
│   ├── utils.ts
│   └── mock-data/
│       ├── drivers.ts                   ← 41 livreurs avec noms sénégalais
│       ├── orders.ts                    ← 147 commandes du jour
│       ├── landmarks.ts                 ← 50+ landmarks Dakar
│       ├── tabaski.ts                   ← courbe demande, plan d'action
│       └── chat.ts                      ← 3 messages tracking
├── public/
│   ├── fonts/                           ← Geist + Inter + JetBrains Mono locaux
│   └── og.png
├── docs/superpowers/specs/2026-05-06-yonne-tranche-A-pitch-demo-design.md
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
└── package.json
```

## 7. Données mockées — fidélité Sénégal

### Livreurs (`lib/mock-data/drivers.ts`)

41 livreurs avec :
- Noms sénégalais réalistes : Ibrahima Sow, Aminata Diop, Moussa Ndiaye, Fatou Sarr, Cheikh Diouf, Awa Fall, Modou Mbaye, Babacar Cissé, Mariama Ba, etc.
- Photos : avatars générés (`https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=`)
- Coordonnées GPS dispersées dans Dakar (Plateau, Médina, Mermoz, Liberté, Almadies, Yoff, Ouakam, Pikine)
- Score IA composite (0-100), badges (Bronze / Argent / Or), notation étoiles, commandes du jour, gains du jour

### Landmarks (`lib/mock-data/landmarks.ts`)

50+ points de repère Dakar réels :
Grande Mosquée, Marché Sandaga, Marché Kermel, Total Liberté 6, Total Mermoz, Total VDN, Place de l'Indépendance, Université Cheikh Anta Diop, Hôpital Principal, Sea Plaza, Sandaga, Allées Khalifa Ababacar Sy, Patte d'Oie, Auchan Sacré-Cœur, Casino Supermarché, Stade Léopold Sédar Senghor, Aéroport Léopold Sédar Senghor, Corniche Ouest, Île de Gorée (ferry), Mosquée de la Divinité, Monument de la Renaissance, Phare des Mamelles…

Chaque landmark : nom, quartier, coordonnées GPS, type (transport / commerce / culte / santé / loisir / éducation).

### Commandes (`lib/mock-data/orders.ts`)

147 commandes du jour avec :
- ID format `YN-2026-XXXXX`
- Montants en FCFA (ex : 12 500 F, 8 200 F, 23 800 F)
- Statuts : créée / assignée / collecte / en route / livrée
- Liens livreur, commerçant, landmark de livraison
- Timestamps répartis sur la journée
- 12 commandes "actives" affichées sur la carte temps réel

### Tabaski (`lib/mock-data/tabaski.ts`)

- Date : Mercredi 27 mai 2026 (date Tabaski 2026 estimée — 10 Dhu al-Hijjah 1447 AH ; à valider selon le calendrier officiel CMS avant la démo)
- Courbe demande heure par heure pour J-7 → J+2 (15 jours × 24 points)
- Pic prévu à J0 entre 10h-14h × 3.2× le volume normal
- Historique 2025 : +287 % revenus, 94 % commandes <30 min
- Plan d'action 3 items : 12 livreurs temp (8/12 confirmés), bonus 2000 F/course, surge ×1.5→×2.0

### Comptes démo (login)

| Email | Mot de passe | Redirige vers |
|-------|--------------|---------------|
| `admin@yonne.sn` | `Admin123!` | `/admin` |
| `boutique.plateau@gmail.com` | `Demo123!` | `/merchant/nouvelle-commande` |

Validation côté client uniquement (lookup dans une liste TypeScript).

## 8. Internationalisation

- Toggle visible **FR · EN · WO** dans la topbar (composant `<LangSwitcher />`)
- Storage `localStorage` pour persister le choix
- FR : 100 % des strings traduites
- EN et WO : seulement les 5 strings les plus visibles (titre principal, CTA principal, bandeau alerte Tabaski, KPI "Revenus aujourd'hui", bouton "Se connecter") — les autres restent en FR
- Justifié dans la démo : *"Le toggle est là, le moteur i18n aussi, on n'a pas encore traduit toute l'app — démarche progressive."*

## 9. Spécifications par écran

### Écran 1 · Login

- Layout centré · gradient de fond cream-50 → cream-100
- `<Wordmark size="lg" />` en haut centré
- Card blanche `shadow-card` `radius-lg` :
  - Champ email
  - Champ mot de passe
  - Bouton émeraude "Se connecter" pleine largeur
  - Lien discret "Mot de passe oublié" (non fonctionnel — dialog "Bientôt disponible")
- Bandeau bas : 🔒 *« Authentification 2FA SMS activée pour votre sécurité »*
- Submit → validation client → redirect selon le compte
- Erreur : message rouge en dessous du champ avec micro-shake

### Écran 2 · Admin · Home

**Layout** : Sidebar fixe gauche (240 px) + Topbar (64 px) + contenu scrollable.

**Sidebar** (`<AdminSidebar />`) :
- Logo en haut
- 9 items navigation : Accueil · Commandes · Livreurs · Commerçants · Finance · Analytics · Surge · **Tabaski** (badge "J-7" or) · Paramètres
- Footer avatar admin + "Déconnexion"

**Topbar** (`<Topbar />`) :
- Breadcrumb "Accueil"
- `<LangSwitcher />` (FR · EN · WO)
- Cloche notifications (badge "3")
- Avatar profil

**Contenu (grid responsive)** :

1. **Bandeau alerte émeraude pleine largeur** (1ʳᵉ ligne, mise en avant) :
   *« ⚡ Tabaski dans 7 jours — pic de demande prévu × 3.2. Plan d'action prêt »* + bouton or "Voir le plan" → `/admin/tabaski`

2. **4 KPI cards** (`<KpiCard />`, grid-cols-4) :
   - Revenus aujourd'hui · 847 200 F · ↑ 23 % vs hier · sparkline
   - Commandes · 147 · 12 actives · sparkline
   - Livreurs en ligne · 28 / 41 · 3 en pause prière
   - Note moyenne · 4.7 ★ · 89 avis

3. **Carte Dakar** (`<DakarMap />`, hauteur 480 px) :
   - Tiles OSM
   - 15 pins livreurs (or, animation pulse)
   - 12 pins commandes actives (émeraude)
   - Légende en bas-droite
   - Centré sur Plateau Dakar (14.6928, -17.4467)

4. **Leaderboard livreurs du jour** (`<DriverLeaderboard />`) :
   - Top 5 avec photo, nom, gains, étoiles, badges
   - Bouton "Voir tous les livreurs" (lien mort en démo)

### Écran 3 · Admin · Tabaski J-7 (signature)

**Hero** : grand titre *« Tabaski 2026 · Mercredi 27 mai · J-7 »*, compte à rebours animé `<J7Countdown />` (6j 14h 23min), texte d'intro contextualisant. Pour la démo, on fixe une date de référence "comme si on était le 20 mai 2026" — sinon J-7 ne tombe pas juste depuis le 6 mai.

**Contenu** :

1. **Courbe de demande prévue** (`<DemandCurve />`, Recharts AreaChart) :
   - Axe X : J-7 → J+2 (15 jours)
   - Axe Y : volume commandes/heure
   - Zone émeraude pleine pour la prévision
   - Pic visible à J0 entre 10h-14h marqué × 3.2
   - Tooltip détaillé au survol

2. **Plan d'action IA** (3 cards `<ActionPlanCard />`, layout 3 colonnes) :
   - **Card 1** — *Recruter 12 livreurs temporaires* · barre de progression 8/12 · bouton or "Lancer le recrutement"
   - **Card 2** — *Bonus livreurs Tabaski : 2 000 F par course* · toggle activation
   - **Card 3** — *Surge automatique J-1 → J+1 (×1.5 → ×2.0)* · toggle activation + horaires

3. **Historique Tabaski 2025** (banner cream) :
   - 3 stats côte à côte : "+287 % revenus", "94 % commandes <30 min", "1 247 commandes traitées"

4. **CTA pleine largeur** : bouton or géant *« Activer le plan d'action complet »*

### Écran 4 · Marchand · Nouvelle commande

**Layout** : sidebar marchand 5 items (Accueil · **Nouvelle commande** · Mes commandes · Finances · Paramètres) + contenu plein.

**Stepper en haut** (`<Stepper />`) : 3 étapes (Client → Paiement → Dispatch), pastilles or pour étape active, émeraude pour validée.

**Étape 1 · Client + Adresse** :
- Nom client (input)
- Téléphone (input avec préfixe +221)
- **Adresse par landmark autocomplete** : champ qui matche `lib/mock-data/landmarks.ts` au fil de la frappe ; afficher le quartier + le type en suggestion
- Précisions adresse (textarea, optionnel)
- Bouton "Suivant"

**Étape 2 · Paiement + Assurance** :
- Montant FCFA (input numérique large, formaté avec espaces)
- Méthode de paiement (3 cards radio visuelles avec logos officiels) : Wave, Orange Money, Cash à la livraison
- Toggle "Assurance colis +200 F" (`<Switch />`)
- Récap commission YONNE en bas (15 % + 100 F)
- Bouton "Suivant"

**Étape 3 · Dispatch IA** :
- Mini-carte avec point de départ (commerçant) et destination (landmark)
- Animation : *"IA dispatch en cours…"* avec spinner émeraude · 1.5 s
- Puis : pin or qui descend sur la carte avec micro-glow, transition vers card livreur
- Card livreur assigné : photo Ibrahima Sow, "Distance 2.3 km · ETA 18 min · Score IA 87"
- Bouton or pleine largeur "Voir le suivi" → `/merchant/commande/YN-2026-XXXXX` (écran 5)

### Écran 5 · Marchand · Tracking client

**Layout split** : carte plein écran (60 %) + panneau droit fixe (40 %, scrollable, max-w 480 px sur desktop ; passe sous la carte sur mobile).

**Carte** (`<DakarMap />`) :
- Pin livreur or qui se déplace toutes les 3 s (interpolation linéaire vers destination)
- Pin destination émeraude
- Polyline du trajet (couleur or, dashed)
- Centré dynamiquement sur le livreur

**Panneau droit** :

1. **Header** : ID commande + statut "En route" badge or
2. **Card livreur** (`<DriverCard />`) : photo, nom, note 4.9★, véhicule "Moto Yamaha", bouton "📞 Appeler" (lien `tel:`)
3. **ETA badge** (`<EtaBadge />`) : grand chiffre "18 min", décrément animé toutes les 5 s jusqu'à 0
4. **Timeline Glovo-style** (`<GlovoTimeline />`) verticale :
   - ✓ Commande créée · 14h12
   - ✓ Livreur assigné · 14h13
   - ⊙ En route vers vous · 14h17 (point pulsant)
   - ○ Livré
5. **Chat client-livreur** (`<ChatBubble />`) : 3 messages mockés
   - Livreur : "Bonjour, je suis en route 🛵" (14h17)
   - Client : "Merci, je suis au RDC" (14h18)
   - Livreur : "OK, j'arrive dans 15 min" (14h18)
6. **Bouton or pleine largeur** : *« 📲 Partager le suivi par WhatsApp »* → `https://wa.me/?text=Suis%20ta%20commande%20YONNE%20%3A%20[lien]`

## 10. Stratégie "real-time" (simulé)

| Élément | Mécanisme | Cadence |
|---------|-----------|---------|
| Pin livreur sur carte tracking | Interpolation linéaire client → destination | tick 3 s |
| ETA badge | Décrément 1 min toutes les 5 s | tick 5 s |
| Pulse pins livreurs (admin home) | CSS animation `pulse` infinie | continu |
| Sparklines KPI | Données figées, pas d'updates | n/a |
| Compte à rebours Tabaski | `setInterval` calculant J0 - now() | tick 1 s |
| Chat livreur (tracking) | Statique 3 messages | n/a |

Tous les intervals doivent être nettoyés au démontage des composants (`useEffect` cleanup).

## 11. Critères d'acceptation

1. ✅ Les 5 écrans sont visuellement aboutis et fidèles à la direction Téranga.
2. ✅ Les comptes démo `admin@yonne.sn / Admin123!` et `boutique.plateau@gmail.com / Demo123!` fonctionnent.
3. ✅ La carte Dakar admin home affiche 15 pins livreurs animés + 12 pins commandes.
4. ✅ Le wizard nouvelle-commande se complète en moins de 30 s sans bug.
5. ✅ L'autocomplete landmark renvoie au moins 3 suggestions par requête courante (« Total », « Marché », « Mosquée »).
6. ✅ Sur l'écran tracking, le pin livreur bouge réellement vers la destination et l'ETA décrémente.
7. ✅ Le bouton "Partager par WhatsApp" ouvre `wa.me` avec un message pré-rempli.
8. ✅ Le toggle FR/EN/WO change au moins 5 strings visibles sans rechargement.
9. ✅ Aucune erreur console en navigation normale entre les 5 écrans.
10. ✅ Lighthouse perf score ≥ 85 sur desktop.

## 12. Risques & mitigations

| Risque | Mitigation |
|--------|------------|
| Leaflet + Next.js App Router (SSR conflicts) | Charger via `dynamic()` avec `ssr: false` |
| Photos avatars dépendantes d'un service externe | Fallback initiales sur fond émeraude si fail |
| Trop de pins sur la carte ralentit | Limiter à 27 pins total, pas de re-render au tick |
| Démo plantée pendant pitch (perf inattendue) | Build prod + tester sur le device de pitch avant |
| Wolof string approximative | Faire valider par une personne native avant tournage démo |
