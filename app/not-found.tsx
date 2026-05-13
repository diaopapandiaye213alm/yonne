"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { Home, ArrowLeft, MapPin } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 flex flex-col items-center justify-center p-8 text-center overflow-hidden relative">

      {/* Background dots */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="404-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="16" cy="16" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#404-dots)" />
        </svg>
      </div>

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
        <div className="mb-10">
          <Wordmark size="lg" variant="dark" />
        </div>

        {/* 404 with scooter overlay */}
        <div className="relative mb-6 select-none">
          <div className="text-[10rem] font-display font-bold text-white/5 leading-none tracking-tighter">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center gap-3">
            <div className="text-5xl animate-bounce">🛵</div>
            <div className="flex flex-col items-start gap-1">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-live-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              <MapPin className="w-4 h-4 text-gold-400/40" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-display font-bold text-white mb-2">Page introuvable</h1>
        <p className="text-emerald-300/60 text-sm max-w-xs mb-8 leading-relaxed">
          Notre livreur a parcouru tout Dakar — cette page n&apos;existe pas ou a été déplacée.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/login"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl px-6 py-3 font-display font-bold text-sm transition-all shadow-glow-emerald">
            <Home className="w-4 h-4" /> Retour à l&apos;accueil
          </Link>
          <button type="button" onClick={() => router.back()}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl px-6 py-3 text-sm transition-all backdrop-blur-sm">
            <ArrowLeft className="w-4 h-4" /> Page précédente
          </button>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {[
            { href: "/admin",    label: "Admin" },
            { href: "/merchant", label: "Marchand" },
            { href: "/driver/carte", label: "Livreur" },
          ].map(l => (
            <Link key={l.href} href={l.href}
              className="text-xs text-emerald-400/60 hover:text-emerald-300 transition-colors px-3 py-1.5 rounded-full border border-emerald-800 hover:border-emerald-600">
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="absolute bottom-5 text-xs text-emerald-500/30">
        © 2026 YONNE · Livraison intelligente · Sénégal
      </div>
    </main>
  );
}
