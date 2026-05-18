"use client";
import { SENEGAL_REGIONS, citiesForRegion } from "@/lib/senegal-locations";
import { cn } from "@/lib/utils";

interface Props {
  region: string;
  city: string;
  onRegionChange: (r: string) => void;
  onCityChange: (c: string) => void;
  className?: string;
  required?: boolean;
}

export function RegionCitySelector({ region, city, onRegionChange, onCityChange, className, required }: Props) {
  const cities = citiesForRegion(region);

  function handleRegionChange(r: string) {
    onRegionChange(r);
    onCityChange("");
  }

  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      <div className="space-y-1">
        <label className="text-xs font-medium text-ink-700">
          Région{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <select
          value={region}
          onChange={e => handleRegionChange(e.target.value)}
          required={required}
          className="w-full h-10 rounded-lg border border-cream-200 px-3 text-sm bg-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 appearance-none cursor-pointer"
        >
          <option value="">— Région —</option>
          {SENEGAL_REGIONS.map(r => (
            <option key={r.name} value={r.name}>{r.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-ink-700">
          Ville{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <select
          value={city}
          onChange={e => onCityChange(e.target.value)}
          disabled={!region}
          required={required}
          className="w-full h-10 rounded-lg border border-cream-200 px-3 text-sm bg-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
        >
          <option value="">— Ville —</option>
          {cities.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
