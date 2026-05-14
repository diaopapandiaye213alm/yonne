/**
 * Seed demo users with hashed passwords.
 * Run AFTER creating the users table in Supabase SQL Editor.
 * Usage: node scripts/seed-auth.mjs
 */
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import ws from "ws";

const URL = "https://jugajqiggyvkbjlrsmvq.supabase.co";
const KEY = "sb_publishable_at3euPzj3aAyofQNFvChTw_w3gk4sBE";
const sb  = createClient(URL, KEY, { realtime: { transport: ws } });

const DEMO_USERS = [
  { email: "admin@yonne.sn",            password: "Admin123!", role: "admin",    display_name: "Admin YONNE",     redirect_url: "/admin" },
  { email: "boutique.plateau@gmail.com", password: "Demo123!", role: "merchant", display_name: "Boutique Plateau", redirect_url: "/merchant/nouvelle-commande" },
  { email: "livreur.dakar@yonne.sn",    password: "Demo123!", role: "driver",   display_name: "Ibrahima Sow",    redirect_url: "/driver/carte" },
];

async function seed() {
  console.log("🔐 Seeding auth users...\n");
  for (const u of DEMO_USERS) {
    const hash = await bcrypt.hash(u.password, 12);
    const { error } = await sb.from("users").upsert(
      { email: u.email, password_hash: hash, role: u.role, display_name: u.display_name, redirect_url: u.redirect_url },
      { onConflict: "email" }
    );
    if (error) {
      console.error(`❌ ${u.email}: ${error.message}`);
    } else {
      console.log(`✅ ${u.email} (${u.role})`);
    }
  }
  console.log("\n🎉 Auth seed complet !");
  console.log("\nComptes demo :");
  for (const u of DEMO_USERS) {
    console.log(`  ${u.role.padEnd(8)} ${u.email}  /  ${u.password}`);
  }
}

seed().catch(console.error);
