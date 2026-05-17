"use client";
import { useEffect, useRef, useState } from "react";
import { WifiOff, Wifi, RefreshCw, CloudOff } from "lucide-react";

type NetworkState = "online" | "offline" | "back_online" | "slow";

// Détecte si la connexion est présente mais lente (downlink < 1 Mbps via Network Info API)
function detectSlowNetwork(): boolean {
  if (typeof navigator === "undefined") return false;
  const conn = (navigator as Navigator & { connection?: { downlink?: number; effectiveType?: string } }).connection;
  if (!conn) return false;
  return (conn.downlink !== undefined && conn.downlink < 1) ||
         (conn.effectiveType === "2g" || conn.effectiveType === "slow-2g");
}

export function OfflineBanner() {
  const [networkState, setNetworkState] = useState<NetworkState>("online");
  const backTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onOffline() {
      if (backTimer.current) clearTimeout(backTimer.current);
      setNetworkState("offline");
    }

    function onOnline() {
      setNetworkState("back_online");
      backTimer.current = setTimeout(() => {
        setNetworkState("online");
      }, 4000);
    }

    // Vérifie la lenteur réseau au montage et sur changement
    function checkSlow() {
      if (!navigator.onLine) return;
      if (detectSlowNetwork()) setNetworkState("slow");
      else if (networkState === "slow") setNetworkState("online");
    }

    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);

    const conn = (navigator as Navigator & { connection?: EventTarget }).connection;
    conn?.addEventListener("change", checkSlow);
    checkSlow();

    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
      conn?.removeEventListener("change", checkSlow);
      if (backTimer.current) clearTimeout(backTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (networkState === "online") return null;

  const config: Record<Exclude<NetworkState, "online">, {
    bg: string;
    icon: React.ReactNode;
    title: string;
    sub: string;
  }> = {
    offline: {
      bg:    "bg-red-500",
      icon:  <CloudOff className="w-4 h-4 shrink-0" />,
      title: "Connexion perdue",
      sub:   "Vos actions sont sauvegardées localement et se synchroniseront dès le retour de la 4G.",
    },
    back_online: {
      bg:    "bg-emerald-500",
      icon:  <Wifi className="w-4 h-4 shrink-0 animate-pulse" />,
      title: "Connexion rétablie",
      sub:   "Synchronisation en cours…",
    },
    slow: {
      bg:    "bg-amber-500",
      icon:  <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />,
      title: "Réseau instable (2G/3G)",
      sub:   "Certaines opérations peuvent être plus lentes. Les données restent sauvegardées.",
    },
  };

  const { bg, icon, title, sub } = config[networkState];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        fixed top-0 left-0 right-0 z-[2000]
        ${bg} text-white
        px-4 py-2.5
        flex items-start gap-3
        shadow-lg
        transition-all duration-300 ease-out
        animate-slide-up
      `}
    >
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold leading-tight">{title}</p>
        <p className="text-[11px] opacity-90 mt-0.5 leading-snug">{sub}</p>
      </div>
      {networkState === "offline" && (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="shrink-0 text-[10px] font-semibold bg-white/20 hover:bg-white/30 rounded px-2 py-1 transition-colors"
        >
          Recharger
        </button>
      )}
    </div>
  );
}

// ── Bannière d'erreur inline (pour les pages) ──────────────────────────────────
// Utilisée quand une requête Supabase échoue, sans bloquer l'écran.
interface InlineErrorBannerProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function InlineErrorBanner({ message, onRetry, className }: InlineErrorBannerProps) {
  return (
    <div
      role="alert"
      className={`
        flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3
        ${className ?? ""}
      `}
    >
      <WifiOff className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-red-700">{message}</p>
        <p className="text-xs text-red-500 mt-0.5">
          Vos données locales sont préservées. Vérifiez votre connexion.
        </p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-100 hover:bg-red-200 rounded-lg px-2.5 py-1.5 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Réessayer
        </button>
      )}
    </div>
  );
}
