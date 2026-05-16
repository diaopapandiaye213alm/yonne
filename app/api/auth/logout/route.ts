import { NextRequest, NextResponse } from "next/server";

function buildLogoutResponse(req: NextRequest, next: string = "/login") {
  const res = NextResponse.redirect(new URL(next, req.url));
  res.cookies.set("yonne_session", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}

// GET /api/auth/logout — lien direct pour vider la session (utile en cas de boucle)
export async function GET(req: NextRequest) {
  const next = req.nextUrl.searchParams.get("next") ?? "/login";
  return buildLogoutResponse(req, next);
}

// POST /api/auth/logout — appelé depuis le bouton déconnexion
export async function POST(req: NextRequest) {
  return buildLogoutResponse(req, "/login");
}
