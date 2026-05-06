"use client";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import type { ActionPlanItem } from "@/lib/mock-data/tabaski";
import { CheckCircle2, Loader2 } from "lucide-react";

export function ActionPlanCard({ item }: { item: ActionPlanItem }) {
  const [active, setActive] = useState(item.status === "in_progress");

  return (
    <div className="bg-white rounded-lg shadow-card border border-cream-200 p-5 flex flex-col gap-3">
      <div className="flex items-start gap-2">
        {item.status === "in_progress" ? (
          <Loader2 className="w-5 h-5 text-gold-500 mt-0.5 animate-spin" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
        )}
        <h4 className="font-display font-semibold text-ink-900 leading-tight">{item.title}</h4>
      </div>
      <p className="text-sm text-ink-700">{item.detail}</p>
      {item.progress && (
        <div className="space-y-1">
          <Progress value={(item.progress.current / item.progress.total) * 100} />
          <div className="text-xs text-ink-500">{item.progress.current} / {item.progress.total} confirmés</div>
        </div>
      )}
      {item.toggleable && (
        <div className="flex items-center justify-between pt-2 border-t border-cream-200">
          <span className="text-sm text-ink-700">Activer</span>
          <Switch checked={active} onCheckedChange={setActive} />
        </div>
      )}
    </div>
  );
}
