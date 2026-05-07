# Tranche F — Auth réelle : JWT + Cookie + Middleware

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le mock auth de YONNE par de vrais cookies JWT signés et un middleware Next.js qui protège `/admin`, `/merchant`, `/driver` par rôle.

**Architecture:** `jose` (Edge-compatible JWT) génère un token HS256 posé en cookie `httpOnly`. Le middleware Next.js vérifie le cookie sur chaque requête protégée et redirige vers `/login` si absent ou invalide. Les comptes démo restent dans `lib/auth-mock.ts` — seule la mécanique de session change.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, `jose` (JWT), Next.js Route Handlers, Next.js Middleware (Edge runtime).

---

## Fichiers

| Fichier | Action |
|---------|--------|
| `lib/auth.ts` | Créer — helpers `signToken` / `verifyToken` |
| `.env.local` | Créer — `AUTH_SECRET` |
| `app/api/auth/login/route.ts` | Créer — POST login |
| `app/api/auth/logout/route.ts` | Créer — POST logout |
| `middleware.ts` | Créer — protection routes par rôle |
| `app/(auth)/login/page.tsx` | Modifier — remplace `authenticate()` direct par `fetch` |
| `components/layout/AdminSidebar.tsx` | Modifier — logout link → form POST |
| `components/layout/MerchantSidebar.tsx` | Modifier — logout link → form POST |

## Contexte codebase à lire avant de commencer

- `lib/auth-mock.ts` — `DemoAccount`, `demoAccounts`, `authenticate()` (NE PAS MODIFIER)
- `app/(auth)/login/page.tsx` — formulaire existant, importe `authenticate`
- `components/layout/AdminSidebar.tsx` — `"use client"`, logout = `<Link href="/login">`
- `components/layout/MerchantSidebar.tsx` — `"use client"`, logout = `<Link href="/login">`

---

## Task 1: Installer jose + créer .env.local + lib/auth.ts

**Files:**
- Create: `.env.local`
- Create: `lib/auth.ts`

- [ ] **Step 1 : Installer `jose`**

```bash
npm install jose
```

Expected : `jose` apparaît dans `node_modules/` et dans `package.json > dependencies`.

- [ ] **Step 2 : Vérifier que `jose` est bien installé**

```bash
ls node_modules/jose/package.json && node -e "require('./node_modules/jose/package.json')" && echo "OK"
```

Expected : `OK`

- [ ] **Step 3 : Créer `.env.local`**

Créer le fichier `.env.local` à la racine du projet :

```bash
# .env.local — ne jamais committer ce fichier
AUTH_SECRET=yonne-dev-secret-change-in-production-32bytes
```

Vérifier qu'il est bien ignoré :

```bash
git check-ignore -v .env.local
```

Expected : `.gitignore:.env*.local .env.local` (confirmé ignoré)

- [ ] **Step 4 : Créer `lib/auth.ts`**

Écrire dans `lib/auth.ts` :

```ts
import { SignJWT, jwtVerify } from "jose";

export interface SessionPayload {
  email: string;
  role: "admin" | "merchant" | "driver";
  displayName: string;
}

function getSecret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s);
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
```

- [ ] **Step 5 : Vérifier la compilation TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 6 : Commit**

```bash
git add lib/auth.ts package.json package-lock.json
git commit -m "feat(auth): install jose + helpers signToken/verifyToken"
```

Note : `.env.local` ne doit PAS être commité (il est dans `.gitignore`).

---

## Task 2: Route Handler POST /api/auth/login

**Files:**
- Create: `app/api/auth/login/route.ts`

- [ ] **Step 1 : Vérifier que le dossier n'existe pas**

```bash
ls app/api/auth/login/ 2>/dev/null || echo "NOT EXISTS"
```

Expected : `NOT EXISTS`

- [ ] **Step 2 : Créer le fichier**

Écrire dans `app/api/auth/login/route.ts` :

```ts
import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth-mock";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let email = "", password = "";
  try {
    const body = await req.json();
    email    = String(body?.email    ?? "").trim();
    password = String(body?.password ?? "");
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const account = authenticate(email, password);
  if (!account) {
    return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
  }

  const token = await signToken({
    email:       account.email,
    role:        account.role,
    displayName: account.displayName,
  });

  const res = NextResponse.json({ role: account.role, redirect: account.redirect });
  res.cookies.set("yonne_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
```

- [ ] **Step 3 : Vérifier la compilation TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 4 : Tester avec curl (serveur doit tourner sur port 3002)**

```bash
curl -s -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yonne.sn","password":"Admin123!"}' \
  -c /tmp/yonne_cookies.txt | python3 -m json.tool
```

Expected :
```json
{
  "role": "admin",
  "redirect": "/admin"
}
```

Et le fichier `/tmp/yonne_cookies.txt` doit contenir `yonne_session`.

```bash
grep yonne_session /tmp/yonne_cookies.txt && echo "COOKIE OK"
```

Expected : `COOKIE OK`

- [ ] **Step 5 : Tester avec credentials incorrects**

```bash
curl -s -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@yonne.sn","password":"wrong"}' | python3 -m json.tool
```

Expected :
```json
{
  "error": "Identifiants invalides"
}
```

Et HTTP status 401 (vérifier avec `-w "%{http_code}"`).

- [ ] **Step 6 : Commit**

```bash
git add app/api/auth/login/route.ts
git commit -m "feat(auth): Route Handler POST /api/auth/login — JWT cookie 7 jours"
```

---

## Task 3: Route Handler POST /api/auth/logout

**Files:**
- Create: `app/api/auth/logout/route.ts`

- [ ] **Step 1 : Vérifier que le dossier n'existe pas**

```bash
ls app/api/auth/logout/ 2>/dev/null || echo "NOT EXISTS"
```

Expected : `NOT EXISTS`

- [ ] **Step 2 : Créer le fichier**

Écrire dans `app/api/auth/logout/route.ts` :

```ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/login", req.url));
  res.cookies.set("yonne_session", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
```

- [ ] **Step 3 : Vérifier la compilation TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 4 : Tester avec curl**

```bash
curl -s -X POST http://localhost:3002/api/auth/logout \
  -b /tmp/yonne_cookies.txt \
  -w "\nHTTP_STATUS:%{http_code}\nLOCATION:%{redirect_url}" \
  --max-redirs 0 2>/dev/null | tail -3
```

Expected :
```
HTTP_STATUS:307
LOCATION:http://localhost:3002/login
```

- [ ] **Step 5 : Commit**

```bash
git add app/api/auth/logout/route.ts
git commit -m "feat(auth): Route Handler POST /api/auth/logout — efface cookie + redirect /login"
```

---

## Task 4: Middleware de protection des routes

**Files:**
- Create: `middleware.ts` (à la racine du projet, au même niveau que `package.json`)

- [ ] **Step 1 : Vérifier que middleware.ts n'existe pas**

```bash
ls middleware.ts 2>/dev/null || echo "NOT EXISTS"
```

Expected : `NOT EXISTS`

- [ ] **Step 2 : Créer le fichier**

Écrire à la racine du projet dans `middleware.ts` :

```ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const ROLE_HOME: Record<string, string> = {
  admin:    "/admin",
  merchant: "/merchant",
  driver:   "/driver/carte",
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token   = req.cookies.get("yonne_session")?.value ?? "";
  const session = token ? await verifyToken(token) : null;

  // Protect role-specific areas — redirect to /login if no valid session
  if (pathname.startsWith("/admin") && session?.role !== "admin") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname.startsWith("/merchant") && session?.role !== "merchant") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname.startsWith("/driver") && session?.role !== "driver") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect already-logged-in users away from /login
  if (pathname === "/login" && session) {
    const home = ROLE_HOME[session.role] ?? "/login";
    return NextResponse.redirect(new URL(home, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/merchant/:path*", "/driver/:path*", "/login"],
};
```

- [ ] **Step 3 : Vérifier la compilation TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 4 : Tester la protection des routes dans le navigateur**

Le serveur doit tourner sur `http://localhost:3002`. Ouvrir en navigation privée (pour ne pas avoir de cookie existant).

Vérifications manuelles :
1. Aller sur `http://localhost:3002/admin` → doit rediriger vers `/login`
2. Aller sur `http://localhost:3002/merchant` → doit rediriger vers `/login`
3. Aller sur `http://localhost:3002/driver/carte` → doit rediriger vers `/login`

Se connecter avec `admin@yonne.sn / Admin123!` (via le formulaire) puis :
4. Aller sur `http://localhost:3002/admin` → doit RESTER sur `/admin` (pas de redirect)
5. Aller sur `http://localhost:3002/merchant` → doit rediriger vers `/login` (mauvais rôle)

- [ ] **Step 5 : Commit**

```bash
git add middleware.ts
git commit -m "feat(auth): middleware Next.js — protection routes par rôle JWT"
```

---

## Task 5: Modifier la page login pour utiliser l'API

**Files:**
- Modify: `app/(auth)/login/page.tsx`

La page actuelle importe `authenticate` directement et fait `router.push()`. Il faut la faire appeler `POST /api/auth/login` à la place.

- [ ] **Step 1 : Lire la page login actuelle**

```bash
cat app/\(auth\)/login/page.tsx
```

Identifier : la ligne `import { authenticate }` et la fonction `submit()`.

- [ ] **Step 2 : Modifier `app/(auth)/login/page.tsx`**

Écrire le contenu complet suivant dans `app/(auth)/login/page.tsx` :

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!res.ok) {
        setError("Email ou mot de passe invalide.");
        return;
      }
      const { redirect } = await res.json();
      router.push(redirect);
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-gold-400/10 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Wordmark size="xl" />
          <p className="mt-3 text-ink-500 text-sm">Livraison intelligente · Sénégal</p>
        </div>
        <form onSubmit={submit} className="bg-white rounded-lg shadow-card p-7 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@yonne.sn" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-600 shadow-glow-emerald">
            {loading ? "Connexion…" : "Se connecter"}
          </Button>
          <button type="button" className="block w-full text-center text-xs text-ink-500 hover:text-ink-700">Mot de passe oublié ?</button>
        </form>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Authentification 2FA SMS activée pour votre sécurité
        </div>
        <details className="mt-8 text-xs text-ink-500 bg-white/50 rounded-md p-3">
          <summary className="cursor-pointer font-medium">Comptes de démo</summary>
          <ul className="mt-2 space-y-1 font-mono">
            <li>admin@yonne.sn / Admin123!</li>
            <li>boutique.plateau@gmail.com / Demo123!</li>
            <li>livreur.dakar@yonne.sn / Demo123!</li>
          </ul>
        </details>
      </div>
    </main>
  );
}
```

Différences clés par rapport à l'original :
- Suppression de `import { authenticate } from "@/lib/auth-mock"`
- `submit()` est maintenant `async` et fait `fetch("/api/auth/login", ...)`
- Ajout d'un state `loading` avec bouton désactivé pendant la requête
- Message d'erreur réseau distinct du 401
- `text-danger` → `text-red-600` (token Tailwind standard)

- [ ] **Step 3 : Vérifier la compilation TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 4 : Tester le flux complet dans le navigateur**

En navigation privée sur `http://localhost:3002` :

1. Doit rediriger vers `/login` (middleware Task 4)
2. Se connecter avec `boutique.plateau@gmail.com / Demo123!` → doit atterrir sur `/merchant/nouvelle-commande`
3. Rafraîchir la page → doit rester connecté (cookie persistant)
4. Aller sur `http://localhost:3002/admin` → doit rediriger vers `/login` (mauvais rôle)
5. Aller sur `http://localhost:3002/login` → doit rediriger vers `/merchant/nouvelle-commande` (déjà connecté)

- [ ] **Step 5 : Commit**

```bash
git add app/\(auth\)/login/page.tsx
git commit -m "feat(auth): page login — remplace authenticate() direct par fetch API + loading state"
```

---

## Task 6: Logout dans les sidebars + build final

**Files:**
- Modify: `components/layout/AdminSidebar.tsx`
- Modify: `components/layout/MerchantSidebar.tsx`

Les deux sidebars ont actuellement `<Link href="/login" ...>Déconnexion</Link>`. Il faut les remplacer par un formulaire qui envoie `POST /api/auth/logout` (sinon le cookie httpOnly ne sera pas effacé — un simple lien GET ne suffit pas).

- [ ] **Step 1 : Modifier `components/layout/AdminSidebar.tsx`**

Remplacer uniquement la section déconnexion (bas de la sidebar) :

```tsx
// Avant (ligne ~49)
<Link href="/login" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-ink-500 hover:bg-cream-100">
  <LogOut className="w-4 h-4" /> Déconnexion
</Link>

// Après
<form action="/api/auth/logout" method="POST">
  <button type="submit" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-ink-500 hover:bg-cream-100 w-full">
    <LogOut className="w-4 h-4" /> Déconnexion
  </button>
</form>
```

- [ ] **Step 2 : Modifier `components/layout/MerchantSidebar.tsx`**

Même remplacement :

```tsx
// Avant (dernière section du nav)
<Link href="/login" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-ink-500 hover:bg-cream-100">
  <LogOut className="w-4 h-4" /> Déconnexion
</Link>

// Après
<form action="/api/auth/logout" method="POST">
  <button type="submit" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-ink-500 hover:bg-cream-100 w-full">
    <LogOut className="w-4 h-4" /> Déconnexion
  </button>
</form>
```

- [ ] **Step 3 : Vérifier la compilation TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected : aucune erreur.

- [ ] **Step 4 : Build de production**

```bash
npm run build 2>&1 | tail -20
```

Expected : `✓ Compiled successfully`. Toutes les routes `/admin/*`, `/merchant/*`, `/driver/*` présentes.

- [ ] **Step 5 : Tester le logout dans le navigateur**

Se connecter avec `admin@yonne.sn / Admin123!` → atterrir sur `/admin`.
Cliquer "Déconnexion" → doit atterrir sur `/login`.
Aller sur `http://localhost:3002/admin` → doit rediriger vers `/login` (cookie effacé).

- [ ] **Step 6 : Tag git**

```bash
git add components/layout/AdminSidebar.tsx components/layout/MerchantSidebar.tsx
git commit -m "feat(auth): logout via form POST — efface cookie httpOnly dans les sidebars"
git tag v0.6.0-tranche-F
```
