import Image from "next/image";
import type { Driver } from "@/lib/mock-data/drivers";
import { avatarUrl } from "@/lib/mock-data/drivers";
import { Phone, Star } from "lucide-react";

export function DriverCard({ driver }: { driver: Driver }) {
  return (
    <div className="bg-white rounded-lg border border-cream-200 p-4 flex items-center gap-3">
      <Image src={avatarUrl(driver)} alt={driver.name} width={48} height={48} unoptimized className="rounded-full bg-cream-100" />
      <div className="flex-1 min-w-0">
        <div className="font-display font-bold text-ink-900 truncate">{driver.name}</div>
        <div className="flex items-center gap-2 text-xs text-ink-500">
          <Star className="w-3 h-3 fill-gold-500 text-gold-500" /> {driver.rating.toFixed(1)} · {driver.vehicle}
        </div>
      </div>
      <a href={`tel:${driver.phone}`} className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600">
        <Phone className="w-4 h-4" />
      </a>
    </div>
  );
}
