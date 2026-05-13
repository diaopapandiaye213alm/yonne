"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-cream-50 flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-8">
        <Wordmark size="lg" />
      </div>

      <div className="relative mb-8">
        <div className="text-[9rem] font-display font-bold text-cream-200 leading-none select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-5xl animate-bounce">🛵</div>
        </div>
      </div>

      <h1 className="text-2xl font-display font-bold text-ink-900 mb-2">
        Cette page est introuvable
      </h1>
      <p className="text-ink-500 text-sm max-w-xs mb-8">
        Notre livreur a cherché partout — cette page n&apos;existe pas ou a été déplacée.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-5 py-2.5 font-display font-bold text-sm transition-colors shadow-glow-emerald"
        >
          <Home className="w-4 h-4" />
          Retour à l&apos;accueil
        </Link>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 bg-white hover:bg-cream-100 text-ink-700 border border-cream-200 rounded-lg px-5 py-2.5 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Page précédente
        </button>
      </div>

      <div className="mt-12 text-xs text-ink-500/50">
        © 2026 YONNE · Livraison intelligente · Sénégal
      </div>
    </main>
  );
}
