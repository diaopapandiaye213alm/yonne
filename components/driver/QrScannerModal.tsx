"use client";
import { useEffect, useState } from "react";
import { X, CheckCircle2 } from "lucide-react";

interface Props {
  orderId: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function QrScannerModal({ orderId, onConfirm, onClose }: Props) {
  const [phase, setPhase] = useState<"scanning" | "found">("scanning");

  useEffect(() => {
    const t = setTimeout(() => setPhase("found"), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-[2000] bg-ink-900/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xs overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cream-100">
          <span className="font-semibold text-ink-900 text-sm">Scanner QR commande</span>
          <button type="button" onClick={onClose} className="text-ink-400 hover:text-ink-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera view */}
        <div className="relative bg-ink-900 aspect-square mx-4 mt-4 rounded-xl overflow-hidden">
          {phase === "scanning" ? (
            <>
              {/* Corner brackets */}
              {["top-3 left-3", "top-3 right-3 rotate-90", "bottom-3 left-3 -rotate-90", "bottom-3 right-3 rotate-180"].map((pos) => (
                <div key={pos} className={`absolute ${pos} w-6 h-6`}>
                  <div className="absolute top-0 left-0 w-6 h-1.5 bg-emerald-400 rounded-sm" />
                  <div className="absolute top-0 left-0 w-1.5 h-6 bg-emerald-400 rounded-sm" />
                </div>
              ))}
              {/* Scan line */}
              <div className="absolute inset-x-4 h-0.5 bg-emerald-400/70 top-1/2 animate-[scanline_1.5s_ease-in-out_infinite]"
                style={{ animation: "scanline 1.5s ease-in-out infinite" }} />
              {/* Noise squares for fake camera */}
              <div className="w-full h-full grid grid-cols-8 gap-px opacity-10">
                {Array.from({ length: 64 }, (_, i) => (
                  <div key={i} className={`${Math.random() > 0.5 ? "bg-white" : "bg-ink-700"} rounded-[1px]`} />
                ))}
              </div>
              <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-emerald-300">
                Pointez vers le QR du colis…
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <CheckCircle2 className="w-16 h-16 text-emerald-400" />
              <p className="text-white font-semibold text-sm">QR validé ✓</p>
              <p className="text-emerald-300 text-xs font-mono">{orderId}</p>
            </div>
          )}
        </div>

        <div className="p-4 space-y-2">
          {phase === "found" ? (
            <button type="button" onClick={onConfirm}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold py-3 rounded-xl transition-colors">
              Confirmer la collecte
            </button>
          ) : (
            <div className="w-full bg-cream-100 text-ink-400 font-medium py-3 rounded-xl text-center text-sm">
              Scan en cours…
            </div>
          )}
          <button type="button" onClick={onClose}
            className="w-full text-ink-500 text-xs py-2 hover:text-ink-700 transition-colors">
            Saisir le code manuellement
          </button>
        </div>
      </div>
    </div>
  );
}
