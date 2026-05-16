import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const ROLE_HOME: Record<string, string> = {
  admin:    "/admin",
  merchant: "/merchant",
  driver:   "/driver/carte",
};

// Seul cet email peut accéder à /admin — doit correspondre à ADMIN_EMAIL dans les env vars
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "admin@yonne.sn").toLowerCase();

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
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // ── Protection /merchant ─────────────────────────────────────────────────
  if (pathname.startsWith("/merchant") && session?.role !== "merchant") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ── Protection /driver ───────────────────────────────────────────────────
  if (pathname.startsWith("/driver") && session?.role !== "driver") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ── Utilisateur déjà connecté → redirige vers son espace ────────────────
  if ((pathname === "/login" || pathname === "/register") && session) {
    const home = ROLE_HOME[session.role] ?? "/";
    return NextResponse.redirect(new URL(home, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/merchant/:path*", "/driver/:path*", "/login", "/register"],
};
