"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, CheckCircle2, Loader2, Store, Bike, Mail, Lock } from "lucide-react";
import { useT } from "@/lib/i18n";

const features = [
  "147 commandes traitées aujourd'hui",
  "28 livreurs actifs en temps réel",
  "Suivi GPS partagé via WhatsApp",
];

const DEMO_PERSONAS = [
  {
    icon: Store,
    label: "Commerçant",
    hint: "Boutique Plateau",
    email: "boutique.plateau@gmail.com",
    password: "Demo123!",
    color: "border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/50",
    iconColor: "text-emerald-600 bg-emerald-500/10",
    initials: "BP",
    initialsColor: "bg-emerald-500/15 text-emerald-700",
  },
  {
    icon: Bike,
    label: "Livreur",
    hint: "Ibrahima Sow",
    email: "livreur.dakar@yonne.sn",
    password: "Demo123!",
    color: "border-gold-300 hover:border-gold-500 hover:bg-gold-50/50",
    iconColor: "text-gold-600 bg-gold-500/10",
    initials: "IS",
    initialsColor: "bg-gold-500/15 text-gold-700",
  },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const t = useT();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!res.ok) { setError("Email ou mot de passe invalide."); return; }
      const { redirect } = await res.json();
      router.push(redirect ?? "/");
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* ── Panneau gauche — brand ── */}
      <div className="hidden lg:flex flex-col bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 p-10 relative overflow-hidden">
        {/* Animated gradient layer */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(200,146,76,0.2)_0%,transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(21,128,61,0.4)_0%,transparent_60%)] pointer-events-none" />
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots-login" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="14" cy="14" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots-login)" />
          </svg>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 border border-white/5 rounded-full pointer-events-none" />
        <div className="absolute -top-8 -right-8 w-40 h-40 border border-white/5 rounded-full pointer-events-none" />
        <div className="absolute bottom-10 -left-20 w-72 h-72 border border-white/5 rounded-full pointer-events-none" />

        {/* Glow orbs */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-56 h-56 bg-gold-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex-none">
          <Wordmark size="lg" variant="dark" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center mt-12">
          <div className="flex items-center gap-2 text-emerald-300/70 text-xs font-medium uppercase tracking-widest mb-5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live-pulse" />
            En direct · Dakar
          </div>
          <h2 className="text-4xl font-display font-bold text-white leading-tight">
            Livraison intelligente<br />
            <span className="text-gold-400">au cœur du Sénégal</span>
          </h2>
          <p className="mt-4 text-emerald-200/70 text-base leading-relaxed max-w-sm">
            La plateforme qui connecte commerçants, livreurs et clients — partout à Dakar et au-delà.
          </p>

          <ul className="mt-8 space-y-4">
            {features.map(f => (
              <li key={f} className="flex items-center gap-3 text-emerald-100/90 text-sm">
                <div className="w-6 h-6 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold-400" />
                </div>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 text-emerald-500/50 text-xs">
          © 2026 YONNE · Sénégal
        </div>
      </div>

      {/* ── Panneau droit — formulaire ── */}
      <div className="flex items-center justify-center p-8 bg-cream-50">
        <div className="w-full max-w-sm">

          {/* Logo mobile uniquement */}
          <div className="lg:hidden text-center mb-8">
            <Wordmark size="xl" />
            <p className="mt-2 text-ink-500 text-sm">{t("loginTagline")}</p>
          </div>

          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-3xl font-display font-bold text-ink-900">{t("loginTitle")}</h1>
            <p className="text-ink-500 text-sm mt-1.5">{t("loginSubtitle")}</p>
          </div>

          <form onSubmit={submit} className="space-y-5 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-ink-700">{t("loginEmail")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                <Input
                  id="email" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vous@yonne.sn" required
                  className="h-12 pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-ink-700">{t("loginPassword")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                <Input
                  id="password" type="password" value={password}
                  onChange={e => setPassword(e.target.value)} required
                  className="h-12 pl-9"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                {error}
              </p>
            )}

            <Button
              type="submit" disabled={loading}
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 shadow-glow-emerald font-display font-bold text-base rounded-xl"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("loginLoading")}
                </span>
              ) : t("loginCta")}
            </Button>

            <button type="button" className="block w-full text-center text-xs text-ink-500 hover:text-ink-700 transition-colors">
              {t("loginForgot")}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-ink-500 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Authentification 2FA SMS activée
          </div>

          <p className="text-center text-sm text-ink-500 mt-4 animate-fade-in-up" style={{ animationDelay: "140ms" }}>
            Pas encore de compte ?{" "}
            <Link href="/register" className="text-emerald-600 font-semibold hover:underline">
              Créer un compte
            </Link>
          </p>

          <div className="mt-6 animate-fade-in-up" style={{ animationDelay: "180ms" }}>
            <div className="relative flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-cream-200" />
              <span className="text-xs text-ink-400 font-medium px-2 bg-cream-50">{t("loginDemoTitle")}</span>
              <div className="flex-1 h-px bg-cream-200" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_PERSONAS.map(({ icon: Icon, label, hint, email: demoEmail, password: demoPassword, color, initials, initialsColor }) => (
                <button
                  key={label}
                  type="button"
                  disabled={loading}
                  onClick={async () => {
                    setError(null);
                    setLoading(true);
                    try {
                      const res = await fetch("/api/auth/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: demoEmail, password: demoPassword }),
                      });
                      if (!res.ok) { setError("Erreur de connexion demo."); return; }
                      const { redirect } = await res.json();
                      router.push(redirect ?? "/");
                    } catch {
                      setError("Erreur réseau.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 transition-all duration-200 disabled:opacity-50 ${color}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${initialsColor}`}>
                    {initials}
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon className="w-3 h-3 opacity-60" />
                    <span className="text-xs font-bold text-ink-800">{label}</span>
                  </div>
                  <span className="text-[10px] text-ink-400 leading-tight text-center">{hint}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
