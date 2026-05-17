import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSessionFromRequest } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "driver") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { data: driver, error } = await supabaseAdmin
    .from("drivers")
    .select("id, name, lat, lng, online, in_prayer, vehicle, rating, score_ia, tier, badges, orders_today, earnings_today")
    .eq("user_id", session.userId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!driver) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  return NextResponse.json({ driver });
}
