import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSessionFromRequest } from "@/lib/session";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

async function assertAdmin(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") return null;
  return session;
}

// ── GET /api/admin/settings ───────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!await assertAdmin(req)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403, headers: CORS });
  }

  const { data, error } = await supabaseAdmin
    .from("platform_settings")
    .select("key, value");

  if (error) {
    // Table may not exist yet — return defaults
    return NextResponse.json({ settings: null }, { headers: CORS });
  }

  // Merge rows into a single object: { key: value }
  const settings = Object.fromEntries(
    (data ?? []).map(row => [row.key as string, row.value])
  );

  return NextResponse.json({ settings }, { headers: CORS });
}

// ── POST /api/admin/settings ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!await assertAdmin(req)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403, headers: CORS });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400, headers: CORS });
  }

  // Upsert each key individually so partial updates work
  const rows = Object.entries(body).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabaseAdmin
    .from("platform_settings")
    .upsert(rows, { onConflict: "key" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
  }

  return NextResponse.json({ ok: true }, { headers: CORS });
}
