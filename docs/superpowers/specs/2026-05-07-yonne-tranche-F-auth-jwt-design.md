# Tranche F — Auth réelle : JWT + Cookie + Middleware

## Contexte

Le projet YONNE utilise actuellement un mock d'authentification (`lib/auth-mock.ts`) qui fait un simple lookup de tableau. La page login appelle `authenticate()` et fait `router.push(account.redirect)` — aucun cookie, aucune session, aucune protection de route. N'importe qui peut accéder à `/admin`, `/merchant` ou `/driver` sans être connecté.

Cette tranche remplace ce mécanisme par une vraie authentification :
- **JWT signé avec `jose`** (Edge-compatible) dans un cookie `httpOnly`
- **Middleware Next.js** qui protège les routes par rôle
- Les comptes démo restent dans `lib/auth-mock.ts` — seule la mécanique change

## Dépendance à installer

```bash
npm install jose
```

`jose` est la seule lib JWT native Edge runtime (pas de `crypto` Node.js requis), ce qui est obligatoire pour `middleware.ts` de Next.js.

## Fichiers

| Fichier | Action | Notes |
|---------|--------|-------|
| `lib/auth.ts` | **Créer** | Helpers JWT partagés |
| `.env.local` | **Créer/modifier** | `AUTH_SECRET` |
| `app/api/auth/login/route.ts` | **Créer** | POST — login |
| `app/api/auth/logout/route.ts` | **Créer** | POST — logout |
| `middleware.ts` | **Créer** | Protection routes par rôle |
| `app/(auth)/login/page.tsx` | **Modifier** | Utilise l'API au lieu du mock direct |
| `components/layout/AdminSidebar.tsx` | **Modifier** | Déconnexion → POST /api/auth/logout |
| `components/layout/MerchantSidebar.tsx` | **Modifier** | Idem |
| `components/driver/DriverBottomNav.tsx` | **Modifier** | Idem (bouton logout) |

---

## Détails techniques

### `AUTH_SECRET`

Variable d'environnement obligatoire. Valeur : chaîne aléatoire de 32+ octets en base64url.

```
AUTH_SECRET=yonne-dev-secret-change-in-production-32bytes
```

### JWT

- **Algorithme :** HS256
- **Payload :**
  ```ts
  { email: string; role: "admin" | "merchant" | "driver"; displayName: string }
  ```
- **Expiry :** 7 jours (`"7d"`)
- **Clé :** `new TextEncoder().encode(process.env.AUTH_SECRET)`

### Cookie

- **Nom :** `yonne_session`
- **httpOnly :** `true`
- **SameSite :** `Lax`
- **Path :** `/`
- **MaxAge :** `604800` (7 jours en secondes)
- **Secure :** `process.env.NODE_ENV === "production"`

---

## `lib/auth.ts`

Deux fonctions exportées utilisées par les Route Handlers ET le middleware :

```ts
import { SignJWT, jwtVerify } from "jose";

export interface SessionPayload {
  email: string;
  role: "admin" | "merchant" | "driver";
  displayName: string;
}

function getSecret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s);
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
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

---

## `app/api/auth/login/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth-mock";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const account = authenticate(email?.trim() ?? "", password ?? "");
  if (!account) {
    return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
  }
  const token = await signToken({
    email: account.email,
    role: account.role,
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

---

## `app/api/auth/logout/route.ts`

```ts
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3002"));
  res.cookies.set("yonne_session", "", { httpOnly: true, maxAge: 0, path: "/" });
  return res;
}
```

---

## `middleware.ts` (racine du projet)

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
  const token = req.cookies.get("yonne_session")?.value ?? "";
  const session = token ? await verifyToken(token) : null;

  // Protect role-specific areas
  if (pathname.startsWith("/admin") && session?.role !== "admin") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname.startsWith("/merchant") && session?.role !== "merchant") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname.startsWith("/driver") && session?.role !== "driver") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect logged-in users away from /login
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL(ROLE_HOME[session.role] ?? "/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/merchant/:path*", "/driver/:path*", "/login"],
};
```

---

## Modification `app/(auth)/login/page.tsx`

Remplacer le block `submit()` :

```ts
// Avant
const account = authenticate(email.trim(), password);
if (!account) { setError("..."); return; }
router.push(account.redirect);

// Après
const res = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: email.trim(), password }),
});
if (!res.ok) { setError("Email ou mot de passe invalide."); return; }
const { redirect } = await res.json();
router.push(redirect);
```

Supprimer l'import `authenticate` devenu inutile.

---

## Déconnexion dans les sidebars

Les 3 layouts ont un lien "Déconnexion". Il faut le transformer en bouton qui envoie `POST /api/auth/logout` :

```tsx
// Avant (AdminSidebar, MerchantSidebar)
<Link href="/login" ...>Déconnexion</Link>

// Après
<form action="/api/auth/logout" method="POST">
  <button type="submit" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-ink-500 hover:bg-cream-100 w-full">
    <LogOut className="w-4 h-4" /> Déconnexion
  </button>
</form>
```

Pour `DriverBottomNav`, il n'y a pas de bouton logout actuellement — pas de modification requise.

---

## Variables d'environnement

```bash
# .env.local
AUTH_SECRET=yonne-dev-secret-change-in-production-32bytes
NEXT_PUBLIC_BASE_URL=http://localhost:3002
```

`AUTH_SECRET` ne doit jamais être committé. `.env.local` est dans `.gitignore` par défaut avec Next.js.

---

## Non-objectifs (hors scope)

- Vraie base de données utilisateurs (on garde `demoAccounts`)
- 2FA SMS (affiché dans l'UI mais non implémenté)
- Refresh tokens
- CSRF tokens (SameSite=Lax couvre les cas courants)
- Rate limiting sur `/api/auth/login`
