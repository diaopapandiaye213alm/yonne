import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Simple in-memory rate limiter: max 3 ratings per IP per hour
const _rateMap = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = _rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    _rateMap.set(ip, { count: 1, resetAt: now + 3_600_000 });
    return false;
  }
  if (entry.count >= 3) return true;
  entry.count++;
  return false;
}

// Route publique — permet au client final de noter son livreur après livraison.
// Utilise le service role car /suivi est une page sans session auth.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  }
  let driverId = "", rating = 0;
  try {
    const body = await req.json();
    driverId = String(body?.driverId ?? "").trim();
    rating   = Number(body?.rating);
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  if (!driverId || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  // Pondération : 90% ancienne note + 10% nouvelle (évite les avis uniques trop impactants)
  const { data: driver, error: fetchErr } = await supabaseAdmin
    .from("drivers")
    .select("rating")
    .eq("id", driverId)
    .single();

  if (fetchErr || !driver) {
    return NextResponse.json({ error: "Livreur introuvable" }, { status: 404 });
  }

  const newRating = Math.round((driver.rating * 0.9 + rating * 0.1) * 10) / 10;

  const { error } = await supabaseAdmin
    .from("drivers")
    .update({ rating: newRating })
    .eq("id", driverId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, newRating });
}
