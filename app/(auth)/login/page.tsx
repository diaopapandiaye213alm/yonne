"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, CheckCircle2, Loader2, Mail, Lock, Eye, EyeOff, X } from "lucide-react";
import { useT } from "@/lib/i18n";

const features = [
  "Livraisons créées en 30 secondes",
  "Livreurs actifs en temps réel",
  "Suivi GPS partagé via WhatsApp",
];


export default function LoginPage() {
  const router = useRouter();
  const t = useT();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,       setShowPwd]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [loading,       setLoading]       = useState(false);
  const [showForgot,    setShowForgot]    = useState(false);
  const [forgotEmail,   setForgotEmail]   = useState("");
  const [forgotSent,    setForgotSent]    = useState(false);

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
      if (res.status === 429) {
        setError("Trop de tentatives — réessayez dans 15 minutes.");
        return;
      }
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
                  id="password" type={showPwd ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)} required
                  className="h-12 pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors"
                  aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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

            <button
              type="button"
              onClick={() => { setShowForgot(true); setForgotSent(false); setForgotEmail(""); }}
              className="block w-full text-center text-xs text-ink-500 hover:text-emerald-600 transition-colors"
            >
              {t("loginForgot")}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-ink-500 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Connexion sécurisée · données chiffrées
          </div>

          <p className="text-center text-sm text-ink-500 mt-4 animate-fade-in-up" style={{ animationDelay: "140ms" }}>
            Pas encore de compte ?{" "}
            <Link href="/register" className="text-emerald-600 font-semibold hover:underline">
              Créer un compte
            </Link>
          </p>

        </div>
      </div>

      {/* ── Modal réinitialisation mot de passe ── */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={() => setShowForgot(false)} />
          <div className="relative bg-white rounded-2xl shadow-card-lg w-full max-w-sm p-6 animate-fade-in-up">
            <button
              type="button"
              onClick={() => setShowForgot(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-cream-100 hover:bg-cream-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-ink-700" />
            </button>

            <h2 className="text-lg font-display font-bold text-ink-900 mb-1">Mot de passe oublié</h2>

            {forgotSent ? (
              <div className="py-4 text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-sm text-ink-700 font-semibold">Email envoyé !</p>
                <p className="text-xs text-ink-500">
                  Consultez votre boîte mail et suivez les instructions.<br />
                  Si vous ne recevez rien, contactez{" "}
                  <a href="mailto:support@yonne.sn" className="text-emerald-600 hover:underline">support@yonne.sn</a>
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="mt-2 w-full h-10 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-ink-500 mb-4">
                  Entrez votre email et nous vous enverrons un lien de réinitialisation.
                </p>
                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="vous@exemple.com"
                      className="w-full h-11 pl-9 pr-3 rounded-xl border border-cream-200 bg-white text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!forgotEmail}
                    onClick={() => setForgotSent(true)}
                    className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white text-sm font-bold transition-colors"
                  >
                    Envoyer le lien
                  </button>
                  <p className="text-center text-xs text-ink-400">
                    Besoin d&apos;aide immédiate ?{" "}
                    <a href="mailto:support@yonne.sn" className="text-emerald-600 hover:underline">support@yonne.sn</a>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
