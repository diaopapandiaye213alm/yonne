"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";
import { useT } from "@/lib/i18n";

const features = [
  "147 commandes traitées aujourd'hui",
  "28 livreurs actifs en temps réel",
  "Suivi GPS partagé via WhatsApp",
];

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

        {/* Glow orbs */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-56 h-56 bg-gold-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex-none">
          <Wordmark size="lg" variant="dark" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center mt-12">
          <div className="flex items-center gap-2 text-emerald-300/70 text-xs font-medium uppercase tracking-widest mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live-pulse" />
            En direct · Dakar
          </div>
          <h2 className="text-4xl font-display font-bold text-white leading-tight">
            Livraison intelligente<br />au cœur du Sénégal
          </h2>
          <p className="mt-4 text-emerald-200/70 text-base leading-relaxed max-w-sm">
            La plateforme qui connecte commerçants, livreurs et clients — partout à Dakar et au-delà.
          </p>

          <ul className="mt-8 space-y-3">
            {features.map(f => (
              <li key={f} className="flex items-center gap-3 text-emerald-100/90 text-sm">
                <CheckCircle2 className="w-5 h-5 text-gold-400 shrink-0" />
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
        <div className="w-full max-w-sm animate-fade-in-up">

          {/* Logo mobile uniquement */}
          <div className="lg:hidden text-center mb-8">
            <Wordmark size="xl" />
            <p className="mt-2 text-ink-500 text-sm">{t("loginTagline")}</p>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-ink-900">{t("loginTitle")}</h1>
            <p className="text-ink-500 text-sm mt-1">{t("loginSubtitle")}</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">{t("loginEmail")}</Label>
              <Input
                id="email" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@yonne.sn" required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("loginPassword")}</Label>
              <Input
                id="password" type="password" value={password}
                onChange={e => setPassword(e.target.value)} required
                className="h-11"
              />
            </div>

            {error && (
              <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit" disabled={loading}
              className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 shadow-glow-emerald font-display font-bold text-base"
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

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Authentification 2FA SMS activée
          </div>

          <details className="mt-6 text-xs text-ink-500 bg-white rounded-lg p-3 border border-cream-200 shadow-sm">
            <summary className="cursor-pointer font-medium text-ink-700">{t("loginDemoTitle")}</summary>
            <ul className="mt-2 space-y-1 font-mono text-ink-500">
              <li>admin@yonne.sn / Admin123!</li>
              <li>boutique.plateau@gmail.com / Demo123!</li>
              <li>livreur.dakar@yonne.sn / Demo123!</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
}
