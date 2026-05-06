# YONNE Tranche C — Vue Démo Split-Screen

**Date :** 2026-05-06
**Statut :** Approuvé

## Contexte

YONNE dispose de deux apps complètes : la vue Marchand (Tranche A) et la PWA Livreur (Tranche B). Pour pitcher à des investisseurs ou partenaires depuis un seul écran, on a besoin d'une vue démo qui montre les deux côtés de la plateforme en synchronisation temps réel simulé.

## Objectif

Un écran `/demo` plein écran, sans navigation, qui montre côte à côte la vue marchand et la vue livreur avec un pin de livreur qui se déplace simultanément sur les deux cartes. Une barre de contrôle permet de lancer, suivre et rejouer la simulation.

## Architecture

### Route
- `app/demo/page.tsx` — page client, pas de route group, pas de layout parent avec sidebar/nav
- `app/demo/layout.tsx` — layout minimal (juste `<html>/<body>` override non nécessaire, le root layout suffit)

### Store de simulation
**`lib/store/demo-sim.ts`** — Zustand store dédié, pas de persist

```ts
interface DemoSimState {
  progress: number;        // 0–100
  running: boolean;
  deliveryStep: 0|1|2|3;  // avance à progress 33, 66, 100
  driverPos: [number, number]; // interpolé depuis drivers[0] → pickup → dest
  start: () => void;
  reset: () => void;
}
```

**Logique de tick :**
- `setInterval` 300ms, +1 à `progress` quand `running`
- `driverPos` interpolé :
  - progress 0–33 : `drivers[0].{lat,lng}` → `pickupLandmark.{lat,lng}`
  - progress 34–66 : `pickupLandmark` → `destLandmark`
  - progress 67–100 : `destLandmark` (arrêt)
- `deliveryStep` :
  - 0–32 → step 0 ("En route vers collecte")
  - 33–65 → step 1 ("À la collecte")
  - 66–99 → step 2 ("En route vers client")
  - 100 → step 3 ("Livraison confirmée 🎉")
- `start()` : met `running = true`, démarre si progress = 0
- `reset()` : remet progress = 0, running = false, driverPos = drivers[0]

**Ordre simulé :** `incomingOrders[0]` (INC-001, Fatou Diallo, Sandaga → Auchan Sacré-Cœur)

### Démarrage automatique
`useEffect` dans la page avec `setTimeout(start, 1500)` au montage.

## Composants

### `app/demo/page.tsx`
Structure :
```
<div className="flex flex-col h-screen">
  <DemoTopBar />
  <div className="flex flex-1 overflow-hidden">
    <MerchantPanel />   {/* flex-1 */}
    <div className="w-px bg-cream-200" /> {/* séparateur */}
    <DriverPanel />     {/* flex-1 */}
  </div>
</div>
```

### `components/demo/DemoTopBar.tsx`
- Gauche : `<Wordmark size="md" />` + badge `"Mode Démo"` gold
- Centre : `<Progress value={progress} className="w-48" />` + label dynamique
- Droite : bouton `[▶ Lancer]` → `[⟳ Rejouer]` (désactivé pendant la simulation)
- Hauteur fixe 56px, `border-b border-cream-200 bg-white`

### `components/demo/MerchantPanel.tsx`
- Header capsule `"👤 Vue Marchand"` bg-emerald-500/10 text-emerald-700
- Layout : `grid grid-cols-[1fr_200px] h-full`
- Carte : `DakarMapClient` avec `driverPos` du store, pin dest fixe, trail, `height="100%"`
- Panel 200px :
  - `GlovoTimeline` : stage calculé depuis `deliveryStep` (`assigned`=0, `enroute`=2, `delivered`=3)
  - `EtaBadge` : `initialMinutes` = `Math.max(0, Math.round(18 * (1 - progress/100)))`
  - `DriverCard` : `drivers[0]`
  - Badge statut : "En route 🛵" (progress < 100) / "Livré ✓" (progress = 100)

### `components/demo/DriverPanel.tsx`
- Header capsule `"🛵 Vue Livreur"` bg-gold-500/10 text-ink-900
- Encadré `max-w-sm mx-auto h-full relative` (simule écran mobile)
- Carte : même `driverPos`, pin dest, trail, `height="calc(100% - 160px)"`
- Card client flottante (top-0) : nom, montant, icône phone (non cliquable)
- `DeliveryStepperCard` avec `step={deliveryStep}` — le bouton est remplacé par un indicateur passif ("Simulation en cours…") en mode démo
- Quand step=3 : animation `zoom-in-50` avec "✅ Livraison confirmée !"

## Mapping `deliveryStep` → `GlovoTimeline` stage
| deliveryStep | GlovoTimeline activeStage |
|---|---|
| 0 | `"assigned"` |
| 1 | `"assigned"` |
| 2 | `"enroute"` |
| 3 | `"delivered"` |

## Points techniques
- `DakarMap` est SSR-unsafe → utiliser `dynamic({ ssr: false })` pour les deux cartes
- Les deux cartes utilisent le même `driverPos` depuis le store → synchronisation garantie
- `DeliveryStepperCard` en mode démo : le prop `onAdvance` est une no-op, le bouton affiche "Simulation..." et est `disabled`
- Le store se reset automatiquement au démontage de la page (cleanup dans `useEffect`)
- Route `/demo` accessible directement, pas de garde d'auth

## Fichiers à créer/modifier
| Fichier | Action |
|---|---|
| `lib/store/demo-sim.ts` | Nouveau |
| `app/demo/page.tsx` | Nouveau |
| `components/demo/DemoTopBar.tsx` | Nouveau |
| `components/demo/MerchantPanel.tsx` | Nouveau |
| `components/demo/DriverPanel.tsx` | Nouveau |
| `components/tracking/GlovoTimeline.tsx` | Lire pour vérifier les props `activeStage` |
| `components/driver/DeliveryStepperCard.tsx` | Ajouter prop optionnel `disabled?: boolean` |

## Vérification
1. `pnpm build` passe sans erreur
2. `/demo` s'ouvre → simulation démarre automatiquement après 1,5s
3. Pin livreur se déplace sur les deux cartes simultanément
4. GlovoTimeline progresse : assigned → enroute → delivered
5. DeliveryStepperCard progresse : étape 0 → 1 → 2 → 3
6. EtaBadge compte à rebours de 18 à 0
7. Bouton "Rejouer" remet tout à zéro
8. La page est accessible sans auth
