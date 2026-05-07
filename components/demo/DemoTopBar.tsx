"use client";
import { Wordmark } from "@/components/brand/Wordmark";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useDemoSim } from "@/lib/store/demo-sim";
import { Play, RotateCcw } from "lucide-react";

export function DemoTopBar() {
  const { progress, running, start, reset } = useDemoSim();
  const done = progress >= 100;

  return (
    <div className="h-14 bg-white border-b border-cream-200 flex items-center px-4 gap-4 shrink-0">
      <div className="flex items-center gap-2">
        <Wordmark size="md" />
        <span className="text-xs font-medium px-2 py-0.5 bg-gold-500/20 text-ink-900 rounded-full border border-gold-500/40">
          Mode Démo
        </span>
      </div>

      <div className="flex-1 flex items-center gap-3 max-w-xs mx-auto">
        <Progress value={progress} className="flex-1 h-2" />
        <span className="text-xs text-ink-500 shrink-0 w-8 tabular-nums">{progress}%</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-ink-500 hidden sm:block">
          {done ? "Livraison confirmée 🎉" : running ? "Livraison en cours…" : "Prêt"}
        </span>
        {done ? (
          <Button size="sm" variant="outline" onClick={reset} className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Rejouer
          </Button>
        ) : (
          <Button
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5"
            onClick={start}
            disabled={running}
          >
            <Play className="w-3.5 h-3.5" /> Lancer
          </Button>
        )}
      </div>
    </div>
  );
}
