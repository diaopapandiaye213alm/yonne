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
  return new SignJWT({
    // "role" au niveau JWT top-level est réservé par PostgREST pour SET ROLE.
    // On utilise "authenticated" (rôle DB Supabase standard) et on met le rôle
    // applicatif sous "app_role" pour que yonne_role() puisse le lire en RLS.
    role:        "authenticated",
    app_role:    payload.role,
    userId:      payload.userId,
    email:       payload.email,
    displayName: payload.displayName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)   // sub = userId → Supabase auth.uid() le lit pour les RLS
    .setExpirationTime("7d")
    .sign(getSecret());
}

const VALID_ROLES = new Set<string>(["admin", "merchant", "driver"]);

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const p = payload as Record<string, unknown>;
    const userId      = (p.sub ?? p.userId) as string | undefined;
    const email       = p.email             as string | undefined;
    const role        = (p.app_role ?? p.role) as string | undefined;
    const displayName = p.displayName       as string | undefined;

    if (!userId || !email || !role || !VALID_ROLES.has(role)) return null;

    return {
      userId,
      email,
      role:        role as SessionPayload["role"],
      displayName: displayName ?? email,
    };
  } catch {
    return null;
  }
}
