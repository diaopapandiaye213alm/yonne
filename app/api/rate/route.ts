import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Route publique — permet au client final de noter son livreur après livraison.
// Utilise le service role car /suivi est une page sans session auth.
export async function POST(req: NextRequest) {
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
