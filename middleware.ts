import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const ROLE_HOME: Record<string, string> = {
  admin:    "/admin",
  merchant: "/merchant",
  driver:   "/driver/carte",
};

// Seul cet email peut accéder à /admin
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "admin@yonne.sn").toLowerCase();

function clearSession(response: NextResponse): NextResponse {
  response.cookies.set("yonne_session", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token   = req.cookies.get("yonne_session")?.value ?? "";
  const session = token ? await verifyToken(token) : null;

  // ── Protection /admin — rôle ET email requis ─────────────────────────────
  if (pathname.startsWith("/admin")) {
    const isAdmin =
      session?.role === "admin" &&
      session.email.toLowerCase() === ADMIN_EMAIL;
    if (!isAdmin) {
      // Efface un éventuel cookie invalide pour éviter la boucle de redirection
      return clearSession(
        NextResponse.redirect(new URL("/login", req.url))
      );
    }
  }

  // ── Protection /merchant ─────────────────────────────────────────────────
  if (pathname.startsWith("/merchant") && session?.role !== "merchant") {
    return clearSession(
      NextResponse.redirect(new URL("/login", req.url))
    );
  }

  // ── Protection /driver ───────────────────────────────────────────────────
  if (pathname.startsWith("/driver") && session?.role !== "driver") {
    return clearSession(
      NextResponse.redirect(new URL("/login", req.url))
    );
  }

  // ── Utilisateur connecté sur /login ou /register → son espace ───────────
  if ((pathname === "/login" || pathname === "/register") && session) {
    // Vérifie que la session admin a bien le bon email avant de rediriger
    if (session.role === "admin" && session.email.toLowerCase() !== ADMIN_EMAIL) {
      // Session admin avec mauvais email → efface et reste sur /login
      return clearSession(NextResponse.next());
    }
    const home = ROLE_HOME[session.role] ?? "/";
    return NextResponse.redirect(new URL(home, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/merchant/:path*", "/driver/:path*", "/login", "/register"],
};
