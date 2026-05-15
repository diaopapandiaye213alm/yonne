import { SignJWT, jwtVerify } from "jose";

export interface SessionPayload {
  userId: string;      // UUID from users.id — devient le claim `sub` → auth.uid() en RLS
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
    .setSubject(payload.userId)   // sub = userId → Supabase auth.uid() le lit pour les RLS
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}
