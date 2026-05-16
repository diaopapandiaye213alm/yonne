// GET /api/surge?lat=<number>&lng=<number>
// Retourne le multiplicateur surge pour la zone la plus proche des coordonnées fournies.
// Fail-safe : toute erreur retourne { multiplier: 1.0 } — jamais d'erreur bloquante.

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface ZoneRow {
  id: string;
  center_lat: number;
  center_lng: number;
  radius_km: number;
}

// Distance Haversine en kilomètres
function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R    = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const FAIL_SAFE = NextResponse.json({ multiplier: 1.0 }, { status: 200 });

export async function GET(req: NextRequest): Promise<NextResponse> {
  const params = req.nextUrl.searchParams;
  const latStr = params.get("lat");
  const lngStr = params.get("lng");

  if (!latStr || !lngStr) {
    return NextResponse.json({ error: "lat et lng requis" }, { status: 400 });
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "lat/lng invalides" }, { status: 400 });
  }

  // 1. Récupérer les zones actives
  const { data: zones, error: zonesError } = await supabaseAdmin
    .from("zones")
    .select("id, center_lat, center_lng, radius_km")
    .eq("active", true)
    .then((r) => r, (err: unknown) => ({ data: null, error: err }));

  if (zonesError || !zones || zones.length === 0) {
    return FAIL_SAFE;
  }

  // 2. Trouver la zone la plus proche des coordonnées données
  let nearestZoneId: string | null = null;
  let nearestDist = Infinity;

  for (const zone of zones as ZoneRow[]) {
    const dist = haversineKm(lat, lng, zone.center_lat, zone.center_lng);
    if (dist < nearestDist) {
      nearestDist  = dist;
      nearestZoneId = zone.id;
    }
  }

  if (!nearestZoneId) return FAIL_SAFE;

  // 3. Appeler la RPC de calcul surge
  const { data, error: rpcError } = await supabaseAdmin
    .rpc("yonne_calculate_surge_multiplier", { p_zone_id: nearestZoneId })
    .then((r) => r, (err: unknown) => ({ data: null, error: err }));

  if (rpcError || data === null || data === undefined) {
    return FAIL_SAFE;
  }

  const raw        = typeof data === "number" ? data : 1.0;
  const multiplier = Math.max(1.0, Math.min(2.0, raw));

  return NextResponse.json(
    { multiplier, zone_id: nearestZoneId, zone_dist_km: Math.round(nearestDist * 10) / 10 },
    { status: 200 },
  );
}
