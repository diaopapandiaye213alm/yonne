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
