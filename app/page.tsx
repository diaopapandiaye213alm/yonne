// force-dynamic : stats toujours fraîches depuis Supabase (pas de cache build-time)
export const dynamic = "force-dynamic";

import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { AnimatedStats } from "@/components/landing/AnimatedStats";
import { LiveTicker } from "@/components/landing/LiveTicker";
import {
  Store, Bike, BarChart3, ChevronRight, CheckCircle2,
  Zap, PackageCheck, Bot, MapPin, Star,
} from "lucide-react";
async function getLiveStats() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Debug — visible dans Vercel logs (Functions tab)
  console.log("[getLiveStats] url defined:", !!url, "| url prefix:", url?.slice(0, 30));
  console.log("[getLiveStats] key defined:", !!key, "| key length:", key?.length ?? 0);

  if (!url || !key) {
    console.error("[getLiveStats] MISSING env vars — url:", url, "| key:", !!key);
    return { orders: 0, drivers: 0, rating: 0 };
  }

  try {
    const headers: HeadersInit = {
      apikey:        key,
      Authorization: `Bearer ${key}`,
    };

    const [ordersRes, driversRes] = await Promise.all([
      fetch(`${url}/rest/v1/orders?select=count`, { headers, next: { revalidate: 0 } }),
      fetch(`${url}/rest/v1/drivers?select=online,rating`, { headers, next: { revalidate: 0 } }),
    ]);

    console.log("[getLiveStats] orders status:", ordersRes.status, "| drivers status:", driversRes.status);

    if (!ordersRes.ok || !driversRes.ok) {
      const errText = await ordersRes.text().catch(() => "?");
      console.error("[getLiveStats] fetch error:", errText);
      return { orders: 0, drivers: 0, rating: 0 };
    }

    const ordersJson  = await ordersRes.json()  as { count: number | string }[];
    const driversJson = await driversRes.json() as { online: boolean; rating: number }[];

    console.log("[getLiveStats] ordersJson:", JSON.stringify(ordersJson));
    console.log("[getLiveStats] driversJson length:", driversJson.length);

    const orderCount  = Number(ordersJson[0]?.count ?? 0);
    const onlineCount = driversJson.filter(d => d.online).length;
    const avgRating   = driversJson.length > 0
      ? Math.round((driversJson.reduce((s, d) => s + (Number(d.rating) || 0), 0) / driversJson.length) * 10) / 10
      : 4.7;

    console.log("[getLiveStats] result:", { orderCount, onlineCount, avgRating });
    return { orders: orderCount, drivers: onlineCount, rating: avgRating };
  } catch (e) {
    console.error("[getLiveStats] exception:", e);
    return { orders: 0, drivers: 0, rating: 0 };
  }
}

const STEPS = [
  {
    icon: PackageCheck,
    num: "01",
    title: "Le commerçant crée la commande",
    desc: "En 30 secondes depuis son tableau de bord — adresse, montant, mode de paiement.",
    color: "text-emerald-600",
    bg:   "bg-emerald-500/10",
  },
  {
    icon: Bot,
    num: "02",
    title: "L'IA assigne le meilleur livreur",
    desc: "Score IA, position GPS, charge de travail — le livreur le plus proche et le plus fiable.",
    color: "text-gold-500",
    bg:   "bg-gold-500/10",
  },
  {
    icon: MapPin,
    num: "03",
    title: "Le client suit en temps réel",
    desc: "Lien WhatsApp automatique, carte GPS live, ETA mis à jour, note étoile à la livraison.",
    color: "text-blue-600",
    bg:   "bg-blue-500/10",
  },
] as const;

const PERSONAS = [
  {
    icon: Store,
    role: "Commerçants",
    desc: "Créez vos livraisons en 30 s, suivez-les en direct et partagez le lien par WhatsApp.",
    accent: "border-emerald-200 hover:border-emerald-400",
    iconBg: "bg-emerald-500/10 text-emerald-600",
    pill: "bg-emerald-500/10 text-emerald-700",
  },
  {
    icon: Bike,
    role: "Livreurs",
    desc: "Recevez vos missions, naviguez, scannez le QR de collecte et gérez vos gains.",
    accent: "border-gold-400/40 hover:border-gold-500",
    iconBg: "bg-gold-500/10 text-gold-500",
    pill: "bg-gold-500/10 text-gold-600",
  },
  {
    icon: BarChart3,
    role: "Administrateurs",
    desc: "Dashboard temps réel, surge pricing IA, tontine numérique, SAV intégré.",
    accent: "border-ink-500/20 hover:border-ink-500/40",
    iconBg: "bg-ink-500/10 text-ink-700",
    pill: "bg-ink-500/10 text-ink-700",
  },
] as const;

const FEATURES = [
  "Suivi GPS en temps réel partagé par WhatsApp",
  "Surge pricing automatique × 1.4 pour Tabaski",
  "Score IA livreur — fiabilité et ponctualité",
  "Paiement Wave · Orange Money · Cash",
  "Tontine numérique pour les livreurs",
  "Interface mobile optimisée pour terrain",
  "SAV intégré avec chat client-admin",
  "Assurance colis optionnelle",
] as const;

const REVIEWS = [
  { name: "Aminata Diop", role: "Gérante · Boutique Plateau", text: "En 2 semaines, j'ai économisé 40% sur mes frais de livraison. Le suivi WhatsApp, mes clients adorent !", rating: 5 },
  { name: "Moussa Ndiaye", role: "Livreur · Or ★★★", text: "L'application est fluide même avec ma connexion 3G. Les gains s'affichent en temps réel, c'est motivant.", rating: 5 },
  { name: "Ibrahima Seck", role: "Admin · Dakar", text: "Le dashboard me donne une visibilité complète sur toute la flotte. Le surge Tabaski a doublé nos revenus.", rating: 5 },
] as const;

function getTabaskiBadge(): string | null {
  const TABASKI_2026 = new Date("2026-06-04T00:00:00");
  const now = new Date();
  const diff = Math.ceil((TABASKI_2026.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0 || diff > 60) return null;
  if (diff === 0) return "Tabaski aujourd'hui — surge IA × 1.4 actif";
  return `Tabaski dans ${diff} jour${diff > 1 ? "s" : ""} — surge IA × 1.4 prêt`;
}

export default async function LandingPage() {
  const live = await getLiveStats();
  const tabaskiBadge = getTabaskiBadge();

  const animatedStats = [
    { value: live.orders,  label: "commandes enregistrées",  suffix: "" },
    { value: live.drivers, label: "livreurs actifs en ce moment", suffix: "" },
    { value: Math.round(live.rating * 10), label: "note moyenne sur 50", suffix: "/50" },
    { value: 40, label: "hausse prix Tabaski", prefix: "+", suffix: "%" },
  ];

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">

      {/* ── Topbar ── */}
      <header className="sticky top-0 z-50 h-16 border-b border-cream-200 bg-white/90 backdrop-blur-sm px-6 flex items-center justify-between">
        <Wordmark size="md" />
        <nav className="hidden md:flex items-center gap-6 text-sm text-ink-500">
          <a href="#comment" className="hover:text-ink-900 transition-colors">Comment ça marche</a>
          <a href="#features" className="hover:text-ink-900 transition-colors">Fonctionnalités</a>
        </nav>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-display font-bold transition-colors shadow-glow-emerald"
        >
          Se connecter <ChevronRight className="w-4 h-4" />
        </Link>
      </header>

      {/* ── Live Ticker ── */}
      <LiveTicker />

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 py-28 px-6 text-center overflow-hidden">
        {/* animated gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(200,146,76,0.18)_0%,transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(21,128,61,0.35)_0%,transparent_60%)] pointer-events-none" />
        {/* dot pattern */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="landing-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="16" cy="16" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#landing-dots)" />
          </svg>
        </div>
        {/* glow orbs */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gold-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-emerald-600/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          {tabaskiBadge && (
            <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-500/30 text-gold-300 rounded-full px-4 py-1.5 text-xs font-medium mb-6 animate-fade-in-up">
              <Zap className="w-3.5 h-3.5" />
              {tabaskiBadge}
            </div>
          )}

          <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-[1.05] tracking-tight animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            Livraison intelligente<br />
            <span className="text-gold-400">au cœur du Sénégal</span>
          </h1>

          <p className="mt-6 text-emerald-200/80 text-lg md:text-xl max-w-xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: "160ms" }}>
            La plateforme qui connecte commerçants, livreurs et clients à Dakar — suivi GPS en direct, IA embarquée, partage WhatsApp en un clic.
          </p>

          {/* Chip pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 animate-fade-in-up" style={{ animationDelay: "220ms" }}>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 text-white/90 rounded-full px-3.5 py-1.5 text-xs font-medium backdrop-blur-sm">
              🛵 GPS temps réel
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 text-white/90 rounded-full px-3.5 py-1.5 text-xs font-medium backdrop-blur-sm">
              💳 Wave &amp; Orange
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 text-white/90 rounded-full px-3.5 py-1.5 text-xs font-medium backdrop-blur-sm">
              🕌 Adapté Dakar
            </span>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8 py-4 font-display font-bold text-base transition-all shadow-glow-emerald hover:scale-105 hover:shadow-lg"
            >
              Créer un compte <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl px-8 py-4 text-base transition-all backdrop-blur-sm"
            >
              Se connecter
            </Link>
          </div>

          {/* Animated stats */}
          <AnimatedStats stats={animatedStats} />
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section id="comment" className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="text-xs font-medium uppercase tracking-widest text-emerald-600 mb-2">Simple et rapide</div>
          <h2 className="text-3xl font-display font-bold text-ink-900">Comment ça marche ?</h2>
          <p className="mt-3 text-ink-500 text-sm max-w-md mx-auto">De la commande à la livraison, YONNE gère tout en quelques secondes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* connector line */}
          <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-emerald-200 via-gold-400/50 to-blue-200 pointer-events-none" />

          {STEPS.map(({ icon: Icon, num, title, desc, color, bg }) => (
            <div key={num} className="relative bg-white rounded-xl border border-cream-200 shadow-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <span className="text-4xl font-display font-bold text-cream-200 tabular-nums">{num}</span>
              </div>
              <h3 className="font-display font-semibold text-ink-900 mb-2">{title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Personas ── */}
      <section className="bg-white border-y border-cream-200 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-xs font-medium uppercase tracking-widest text-emerald-600 mb-2">Pour tous</div>
            <h2 className="text-3xl font-display font-bold text-ink-900">Une plateforme, trois univers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PERSONAS.map(({ icon: Icon, role, desc, accent, iconBg, pill }) => (
              <Link
                key={role}
                href="/login"
                className={`group rounded-2xl border-2 ${accent} bg-white p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 block`}
              >
                <div className={`w-13 h-13 rounded-2xl ${iconBg} flex items-center justify-center mb-5 p-3`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display font-bold text-lg text-ink-900">{role}</h3>
                  <ChevronRight className="w-4 h-4 text-ink-300 group-hover:text-ink-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-sm text-ink-500 leading-relaxed">{desc}</p>
                <div className={`mt-5 inline-block text-xs px-3 py-1.5 rounded-full font-semibold ${pill}`}>
                  Accéder →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="text-xs font-medium uppercase tracking-widest text-emerald-600 mb-2">Fonctionnalités</div>
          <h2 className="text-3xl font-display font-bold text-ink-900">Pourquoi choisir YONNE ?</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FEATURES.map((f, i) => {
            const featureAccents = [
              "text-emerald-600 bg-emerald-500/10",
              "text-gold-500 bg-gold-500/10",
              "text-blue-600 bg-blue-500/10",
              "text-emerald-600 bg-emerald-500/10",
              "text-gold-500 bg-gold-500/10",
              "text-blue-600 bg-blue-500/10",
              "text-emerald-600 bg-emerald-500/10",
              "text-gold-500 bg-gold-500/10",
            ];
            const accent = featureAccents[i % featureAccents.length];
            return (
              <div key={f} className="flex items-start gap-3 p-5 rounded-xl bg-white border border-cream-200 shadow-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${accent}`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-sm text-ink-700 leading-snug pt-1.5">{f}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-xs font-medium uppercase tracking-widest text-gold-400 mb-2">Ils nous font confiance</div>
            <h2 className="text-2xl font-display font-bold text-white">Ce que disent nos utilisateurs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map(r => (
              <div key={r.name} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-5">
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} className={`w-4 h-4 ${n <= r.rating ? "text-gold-400 fill-gold-400" : "text-white/20"}`} />
                  ))}
                </div>
                <p className="text-sm text-white/80 leading-relaxed mb-4">"{r.text}"</p>
                <div>
                  <div className="text-sm font-semibold text-white">{r.name}</div>
                  <div className="text-xs text-emerald-300/60">{r.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="bg-ink-900 py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-lg mx-auto">
          <div className="text-xs font-medium uppercase tracking-widest text-gold-400/70 mb-4">Rejoindre YONNE</div>
          <h2 className="text-4xl font-display font-bold text-white mb-4 leading-tight">
            Prêt à transformer<br />vos livraisons ?
          </h2>
          <p className="text-ink-500 text-base mb-10 max-w-sm mx-auto">Rejoignez les commerçants et livreurs qui font confiance à YONNE partout au Sénégal.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-3 bg-gold-500 hover:bg-gold-600 text-ink-900 rounded-xl px-10 py-4 font-display font-bold text-lg transition-all hover:scale-105 shadow-glow"
          >
            Commencer maintenant <ChevronRight className="w-5 h-5" />
          </Link>
          <p className="mt-5 text-xs text-ink-500/50">Aucun abonnement requis · Accès démo immédiat · Partout au Sénégal</p>
        </div>
      </section>

      <footer className="bg-ink-900 border-t border-ink-700/30 py-4 px-6 text-center text-xs text-ink-500/40">
        © 2026 YONNE · Livraison intelligente · Sénégal
      </footer>
    </div>
  );
}
