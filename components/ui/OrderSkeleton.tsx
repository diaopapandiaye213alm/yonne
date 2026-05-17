"use client";
import { cn } from "@/lib/utils";

// Bloc shimmer atomique — base de tous les skeletons de l'application.
function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200",
        "bg-[length:200%_100%] animate-shimmer",
        className,
      )}
    />
  );
}

// ── Skeleton d'une ligne de commande dans la DataTable ────────────────────────
export function OrderRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-cream-200 last:border-0">
      <Bone className="w-28 h-3.5 shrink-0" />
      <Bone className="w-32 h-3.5 flex-1 max-w-[140px]" />
      <Bone className="w-20 h-5 rounded-full shrink-0" />
      <Bone className="w-14 h-3.5 shrink-0" />
      <Bone className="w-20 h-3.5 shrink-0" />
      <Bone className="w-24 h-3.5 shrink-0" />
    </div>
  );
}

// ── Skeleton de la liste complète (n lignes) ──────────────────────────────────
export function OrderListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-cream-200 bg-white overflow-hidden shadow-card">
      {/* En-tête factice */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-cream-200 bg-cream-50">
        {["w-28","w-32","w-20","w-14","w-20","w-24"].map((w, i) => (
          <Bone key={i} className={`${w} h-3 shrink-0 opacity-60`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <OrderRowSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Skeleton d'une KPI card (tableau de bord) ─────────────────────────────────
export function KpiCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-cream-200 shadow-card p-5 space-y-3">
      <Bone className="w-10 h-10 rounded-xl" />
      <Bone className="w-24 h-7 rounded-md" />
      <Bone className="w-32 h-3 rounded" />
    </div>
  );
}

// ── Skeleton d'une commande entrante (radar livreur) ──────────────────────────
export function IncomingOrderSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-card-lg border border-cream-200 p-4 space-y-4 mx-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Bone className="w-32 h-4" />
          <Bone className="w-20 h-3" />
        </div>
        <Bone className="w-16 h-8 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-cream-200">
        <div className="space-y-1"><Bone className="w-full h-3" /><Bone className="w-3/4 h-4" /></div>
        <div className="space-y-1"><Bone className="w-full h-3" /><Bone className="w-3/4 h-4" /></div>
        <div className="space-y-1"><Bone className="w-full h-3" /><Bone className="w-3/4 h-4" /></div>
      </div>
      <div className="flex gap-2">
        <Bone className="flex-1 h-12 rounded-xl" />
        <Bone className="w-12 h-12 rounded-xl" />
      </div>
    </div>
  );
}

// ── Skeleton de la page de suivi commande (marchand) ─────────────────────────
export function OrderDetailSkeleton() {
  return (
    <div className="p-5 space-y-5 bg-white h-full">
      <div className="space-y-1.5">
        <Bone className="w-24 h-3" />
        <Bone className="w-40 h-4 font-mono" />
        <Bone className="w-16 h-5 rounded-sm" />
      </div>
      {/* Driver card */}
      <div className="flex items-center gap-3 p-4 rounded-xl border border-cream-200">
        <Bone className="w-12 h-12 rounded-full shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Bone className="w-28 h-4" />
          <Bone className="w-20 h-3" />
        </div>
      </div>
      {/* ETA */}
      <Bone className="w-full h-16 rounded-xl" />
      {/* Timeline */}
      <div className="space-y-2">
        <Bone className="w-20 h-4" />
        <Bone className="w-full h-24 rounded-xl" />
      </div>
    </div>
  );
}
