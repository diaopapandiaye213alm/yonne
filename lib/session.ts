import { cookies } from "next/headers";
import { verifyToken, type SessionPayload } from "@/lib/auth";

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get("yonne_session")?.value;
  return token ? verifyToken(token) : null;
}
