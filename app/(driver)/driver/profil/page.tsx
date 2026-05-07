"use client";
import Image from "next/image";
import { drivers, avatarUrl } from "@/lib/mock-data/drivers";
import { useDriverStore } from "@/lib/store/driver";
import { Switch } from "@/components/ui/switch";
import { LogOut, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

const demo = drivers[0];

const tierStyle: Record<string, string> = {
  Bronze: "bg-amber-700/15 text-amber-800 border-amber-700/30",
  Argent: "bg-slate-200 text-slate-700 border-slate-300",
  Or:     "bg-gold-500/20 text-ink-900 border-gold-500/50",
};

export default function ProfilPage() {
  const { online, inPrayer, setOnline, setInPrayer } = useDriverStore();

  return (
    <div className="pb-20 px-4 pt-6 space-y-5">
      {inPrayer && (
        <div className="bg-gold-500/15 border-b border-gold-500 text-center text-sm font-medium text-ink-900 py-2 -mx-4 -mt-6 px-4">
          🕌 Mode prière actif — vous apparaissez hors ligne
        </div>
      )}

      <div className="flex items-center gap-4">
        <Image
          src={avatarUrl(demo)}
          alt={demo.name}
          width={80}
          height={80}
          unoptimized
          className="rounded-full bg-cream-100"
        />
        <div>
          <div className="font-display font-bold text-xl text-ink-900">{demo.name}</div>
          <div className="text-sm text-ink-500">{demo.vehicle}</div>
          <span className={cn(
            "inline-block mt-1 text-xs px-2 py-0.5 rounded-full border font-medium",
            tierStyle[demo.tier] ?? tierStyle.Bronze
          )}>
            Livreur {demo.tier}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-cream-200 divide-y divide-cream-100">
        <div className="flex items-center justify-between p-4">
          <span className="text-sm font-medium text-ink-900">En ligne</span>
          <Switch checked={online} onCheckedChange={setOnline} />
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-gold-500" />
            <span className="text-sm font-medium text-ink-900">Mode prière</span>
          </div>
          <Switch checked={inPrayer} onCheckedChange={setInPrayer} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg border border-cream-200 p-3">
          <div className="text-xs text-ink-500">Courses auj.</div>
          <div className="font-mono font-bold text-lg text-ink-900">{demo.ordersToday}</div>
        </div>
        <div className="bg-white rounded-lg border border-cream-200 p-3">
          <div className="text-xs text-ink-500">Gains auj.</div>
          <div className="font-mono font-bold text-lg text-emerald-500">{demo.earningsToday.toLocaleString("fr-FR")} F</div>
        </div>
        <div className="bg-white rounded-lg border border-cream-200 p-3">
          <div className="text-xs text-ink-500">Note moyenne</div>
          <div className="font-mono font-bold text-lg text-gold-500">{demo.rating.toFixed(1)} ★</div>
        </div>
        <div className="bg-white rounded-lg border border-cream-200 p-3">
          <div className="text-xs text-ink-500">Score IA</div>
          <div className="font-mono font-bold text-lg text-ink-900">{demo.scoreIA}</div>
        </div>
      </div>

      <form action="/api/auth/logout" method="POST">
        <button type="submit" className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900 transition-colors cursor-pointer">
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </button>
      </form>
    </div>
  );
}
