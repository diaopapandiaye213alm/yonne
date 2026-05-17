import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { verifyToken, type SessionPayload } from "@/lib/auth";

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get("yonne_session")?.value;
  return token ? verifyToken(token) : null;
}

export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const cookie = req.cookies.get("yonne_session")?.value ?? "";
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  return verifyToken(cookie || bearer);
}
