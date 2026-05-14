# Tranche P6 — Merchant Paramètres Toast Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer `alert()` par `toast.success` sur la page merchant paramètres et ajouter un bouton Enregistrer dans la section Notifications.

**Architecture:** Un seul fichier modifié — import `toast` from sonner + fix bouton profil + nouveau bouton notifications.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Sonner, Tailwind CSS

---

## Fichiers

| Fichier | Action |
|---------|--------|
| `app/(merchant)/merchant/parametres/page.tsx` | Modifier — import toast + fix bouton profil + ajout bouton notifications |

---

## Task 1 : Brancher les toasts + build + tag

**Files:**
- Modify: `app/(merchant)/merchant/parametres/page.tsx`

Contenu actuel complet (pour référence) :
```tsx
"use client";
import { useState } from "react";
import { merchants } from "@/lib/mock-data/merchants";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ParametresPage() {
  const merchant = merchants[0];

  const [email, setEmail] = useState(merchant.email);
  const [phone, setPhone] = useState(merchant.phone);
  const [city,  setCity]  = useState(merchant.city);

  const [whatsapp,   setWhatsapp]   = useState(true);
  const [sms,        setSms]        = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink-900">Paramètres</h1>
        <p className="text-sm text-ink-500 mt-1">Gérez votre compte et vos préférences</p>
      </div>

      {/* Profil boutique */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5 space-y-4">
        <h2 className="font-semibold text-ink-900">Profil boutique</h2>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name">Nom boutique</Label>
            <Input id="name" value={merchant.name} disabled className="bg-cream-50 opacity-60" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="city">Ville</Label>
            <Input id="city" value={city} onChange={e => setCity(e.target.value)} />
          </div>
        </div>
        <Button
          onClick={() => alert("Paramètres enregistrés")}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          Enregistrer
        </Button>
      </div>

      {/* Mon plan */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Mon plan</h2>
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-sm px-3 py-1 rounded-full font-bold border ${
            merchant.plan === "Premium"
              ? "bg-gold-500/20 border-gold-500/40 text-ink-900"
              : "bg-cream-100 border-cream-200 text-ink-700"
          }`}>
            {merchant.plan}
          </span>
        </div>
        <ul className="text-sm text-ink-700 space-y-1">
          {merchant.plan === "Premium" ? (
            <>
              <li>✓ Commandes illimitées</li>
              <li>✓ Commission 15%</li>
              <li>✓ Support prioritaire</li>
              <li>✓ Analytics avancés</li>
            </>
          ) : (
            <>
              <li>✓ Jusqu&apos;à 200 commandes/mois</li>
              <li>✓ Commission 12%</li>
              <li>✓ Support email</li>
            </>
          )}
        </ul>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Notifications</h2>
        <div className="space-y-4">
          {[
            { id: "wa",    label: "WhatsApp", checked: whatsapp,   onCheckedChange: setWhatsapp },
            { id: "sms",   label: "SMS",       checked: sms,        onCheckedChange: setSms },
            { id: "email", label: "Email",     checked: emailNotif, onCheckedChange: setEmailNotif },
          ].map(({ id, label, checked, onCheckedChange }) => (
            <div key={id} className="flex items-center justify-between">
              <Label htmlFor={id} className="text-sm text-ink-700 cursor-pointer">{label}</Label>
              <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 1 : Remplacer `app/(merchant)/merchant/parametres/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { toast } from "sonner";
import { merchants } from "@/lib/mock-data/merchants";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ParametresPage() {
  const merchant = merchants[0];

  const [email, setEmail] = useState(merchant.email);
  const [phone, setPhone] = useState(merchant.phone);
  const [city,  setCity]  = useState(merchant.city);

  const [whatsapp,   setWhatsapp]   = useState(true);
  const [sms,        setSms]        = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink-900">Paramètres</h1>
        <p className="text-sm text-ink-500 mt-1">Gérez votre compte et vos préférences</p>
      </div>

      {/* Profil boutique */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5 space-y-4">
        <h2 className="font-semibold text-ink-900">Profil boutique</h2>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name">Nom boutique</Label>
            <Input id="name" value={merchant.name} disabled className="bg-cream-50 opacity-60" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="city">Ville</Label>
            <Input id="city" value={city} onChange={e => setCity(e.target.value)} />
          </div>
        </div>
        <Button
          type="button"
          onClick={() => toast.success("Profil enregistré")}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          Enregistrer
        </Button>
      </div>

      {/* Mon plan */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Mon plan</h2>
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-sm px-3 py-1 rounded-full font-bold border ${
            merchant.plan === "Premium"
              ? "bg-gold-500/20 border-gold-500/40 text-ink-900"
              : "bg-cream-100 border-cream-200 text-ink-700"
          }`}>
            {merchant.plan}
          </span>
        </div>
        <ul className="text-sm text-ink-700 space-y-1">
          {merchant.plan === "Premium" ? (
            <>
              <li>✓ Commandes illimitées</li>
              <li>✓ Commission 15%</li>
              <li>✓ Support prioritaire</li>
              <li>✓ Analytics avancés</li>
            </>
          ) : (
            <>
              <li>✓ Jusqu&apos;à 200 commandes/mois</li>
              <li>✓ Commission 12%</li>
              <li>✓ Support email</li>
            </>
          )}
        </ul>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5 space-y-4">
        <h2 className="font-semibold text-ink-900">Notifications</h2>
        <div className="space-y-4">
          {[
            { id: "wa",    label: "WhatsApp", checked: whatsapp,   onCheckedChange: setWhatsapp },
            { id: "sms",   label: "SMS",       checked: sms,        onCheckedChange: setSms },
            { id: "email", label: "Email",     checked: emailNotif, onCheckedChange: setEmailNotif },
          ].map(({ id, label, checked, onCheckedChange }) => (
            <div key={id} className="flex items-center justify-between">
              <Label htmlFor={id} className="text-sm text-ink-700 cursor-pointer">{label}</Label>
              <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
            </div>
          ))}
        </div>
        <Button
          type="button"
          onClick={() => toast.success("Notifications enregistrées")}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2 : Vérifier la compilation TypeScript**

```bash
cd /home/papa-ndiaye-diao/yonne && npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 3 : Build de production**

```bash
cd /home/papa-ndiaye-diao/yonne && pnpm run build 2>&1 | tail -20
```

Expected : build réussi, aucune erreur.

- [ ] **Step 4 : Commit + tag**

```bash
cd /home/papa-ndiaye-diao/yonne && git add "app/(merchant)/merchant/parametres/page.tsx" && git commit -m "feat(merchant-parametres): remplacer alert par toast.success + bouton notifications" && git tag v1.7.0-tranche-P6
```
