import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const WINDOW_MS  = 3_600_000; // 1 hour
const MAX_HITS   = 3;

async function isRateLimited(ip: string): Promise<boolean> {
  const now    = new Date();
  const resetAt = new Date(now.getTime() + WINDOW_MS).toISOString();

  // Upsert: if no row exists, insert with count=1 and future reset_at.
  // If row exists and reset_at is past, reset; otherwise increment.
  const { data, error } = await supabaseAdmin
    .from("api_rate_limits")
    .upsert(
      { key: ip, count: 1, reset_at: resetAt },
      { onConflict: "key", ignoreDuplicates: false }
    )
    .select("count, reset_at")
    .single();

  if (error || !data) {
    // On DB error, fail open to avoid blocking legitimate requests.
    return false;
  }

  const resetAtDate = new Date(data.reset_at as string);
  if (now > resetAtDate) {
    // Window expired — reset counter.
    await supabaseAdmin
      .from("api_rate_limits")
      .update({ count: 1, reset_at: resetAt })
      .eq("key", ip);
    return false;
  }

  if ((data.count as number) > MAX_HITS) return true;

  await supabaseAdmin
    .from("api_rate_limits")
    .update({ count: (data.count as number) + 1 })
    .eq("key", ip);

  return false;
}

// Route publique — permet au client final de noter son livreur après livraison.
// Utilise le service role car /suivi est une page sans session auth.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (await isRateLimited(ip)) {
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
