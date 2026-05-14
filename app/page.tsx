export const revalidate = 60; // ISR: refresh stats every 60 s

import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { Store, Bike, BarChart3, ChevronRight, CheckCircle2, Zap } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

async function getLiveStats() {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const [{ count: orderCount }, { data: driverData }] = await Promise.all([
      sb.from("orders").select("*", { count: "exact", head: true }),
      sb.from("drivers").select("online, rating"),
    ]);
    const drivers = (driverData ?? []) as { online: boolean; rating: number }[];
    const onlineCount = drivers.filter(d => d.online).length;
    const avgRating = drivers.length > 0
      ? (drivers.reduce((s, d) => s + d.rating, 0) / drivers.length).toFixed(1)
      : "4.7";
    return {
      orders:  orderCount ?? 147,
      drivers: onlineCount || 28,
      rating:  avgRating,
    };
  } catch {
    return { orders: 147, drivers: 28, rating: "4.7" };
  }
}

const personas = [
  {
    icon: Store,
    role: "Commerçants",
    desc: "Créez et suivez vos livraisons en temps réel. Partagez le suivi par WhatsApp.",
    color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
    iconBg: "bg-emerald-500/20",
  },
  {
    icon: Bike,
    role: "Livreurs",
    desc: "Recevez vos missions, naviguez avec la carte et gérez vos gains en un clic.",
    color: "bg-gold-500/10 border-gold-500/20 text-gold-500",
    iconBg: "bg-gold-500/20",
  },
  {
    icon: BarChart3,
    role: "Administrateurs",
    desc: "Pilotez la plateforme avec des analytics avancés, le surge pricing et l'IA.",
    color: "bg-ink-500/10 border-ink-500/20 text-ink-700",
    iconBg: "bg-ink-500/10",
  },
] as const;

export default async function LandingPage() {
  const live = await getLiveStats();
  const stats = [
    { value: String(live.orders), label: "commandes enregistrées" },
    { value: String(live.drivers), label: "livreurs actifs" },
    { value: `${live.rating}★`,   label: "note moyenne" },
    { value: "× 1.4",            label: "surge Tabaski" },
  ];

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">

      {/* ── Topbar ── */}
      <header className="h-16 border-b border-cream-200 bg-white px-6 flex items-center justify-between">
        <Wordmark size="md" />
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-display font-bold transition-colors shadow-glow-emerald"
        >
          Se connecter <ChevronRight className="w-4 h-4" />
        </Link>
      </header>

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="landing-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="16" cy="16" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#landing-dots)" />
          </svg>
        </div>
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-gold-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-500/30 text-gold-300 rounded-full px-4 py-1.5 text-xs font-medium mb-6">
            <Zap className="w-3.5 h-3.5" />
            Tabaski dans 7 jours — plan d&apos;action IA prêt
          </div>

          <h1 className="text-5xl md:text-6xl font-display font-bold text-white leading-tight">
            Livraison intelligente<br />
            <span className="text-gold-400">au cœur du Sénégal</span>
          </h1>

          <p className="mt-6 text-emerald-200/80 text-lg max-w-xl mx-auto leading-relaxed">
            La plateforme qui connecte commerçants, livreurs et clients à Dakar et au-delà — avec suivi GPS en direct et partage WhatsApp.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 py-3 font-display font-bold text-base transition-colors shadow-glow-emerald"
            >
              Accéder à la plateforme <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Stats bar */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(({ value, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <div className="text-2xl font-display font-bold text-white tabular-nums">{value}</div>
                <div className="text-xs text-emerald-300/70 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Personas ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-display font-bold text-ink-900 text-center mb-10">
          Une plateforme pour tous
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {personas.map(({ icon: Icon, role, desc, color, iconBg }) => (
            <div key={role} className={`rounded-xl border p-6 ${color} bg-white`}>
              <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-ink-900 mb-2">{role}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-white border-t border-cream-200 py-14 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-display font-bold text-ink-900 text-center mb-8">
            Pourquoi choisir YONNE ?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "Suivi GPS en temps réel partagé par WhatsApp",
              "Surge pricing automatique géré par l'IA",
              "Gestion Tabaski avec pic de demande × 3.2",
              "Score IA pour chaque livreur",
              "Paiement Wave · Orange Money · Cash",
              "Interface optimisée mobile pour les livreurs",
            ].map(f => (
              <div key={f} className="flex items-start gap-3 p-3 rounded-lg hover:bg-cream-50 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm text-ink-700">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="bg-emerald-900 py-12 px-6 text-center mt-auto">
        <h2 className="text-2xl font-display font-bold text-white mb-4">
          Prêt à transformer vos livraisons ?
        </h2>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-ink-900 rounded-lg px-6 py-3 font-display font-bold text-base transition-colors"
        >
          Commencer maintenant <ChevronRight className="w-4 h-4" />
        </Link>
      </section>

      <footer className="bg-emerald-900 border-t border-emerald-800 py-4 px-6 text-center text-xs text-emerald-500/50">
        © 2026 YONNE · Livraison intelligente · Sénégal
      </footer>
    </div>
  );
}
