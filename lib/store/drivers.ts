import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Driver } from "@/lib/mock-data/drivers";

export function avatarUrl(driver: { avatarSeed: string }) {
  return `https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${encodeURIComponent(driver.avatarSeed)}`;
}

interface DriversState {
  drivers: Driver[];
  loading: boolean;
  fetchDrivers: () => Promise<void>;
  setOnline: (id: string, online: boolean) => Promise<void>;
  setInPrayer: (id: string, inPrayer: boolean) => Promise<void>;
  updatePosition: (id: string, lat: number, lng: number) => void;
}

function rowToDriver(row: Record<string, unknown>): Driver {
  return {
    id:            row.id as string,
    name:          row.name as string,
    avatarSeed:    (row.avatar_seed as string) ?? "",
    phone:         (row.phone as string) ?? "",
    vehicle:       (row.vehicle as Driver["vehicle"]) ?? "Moto Yamaha",
    scoreIA:       (row.score_ia as number) ?? 80,
    rating:        (row.rating as number) ?? 4.5,
    tier:          (row.tier as Driver["tier"]) ?? "Bronze",
    badges:        (row.badges as Driver["badges"]) ?? [],
    ordersToday:   (row.orders_today as number) ?? 0,
    earningsToday: (row.earnings_today as number) ?? 0,
    online:        (row.online as boolean) ?? false,
    inPrayer:      (row.in_prayer as boolean) ?? false,
    lat:           (row.lat as number) ?? 14.71,
    lng:           (row.lng as number) ?? -17.45,
  };
}

let driversRealtimeSubscribed = false;

export const useDriversStore = create<DriversState>((set, get) => ({
  drivers: [],
  loading: false,

  fetchDrivers: async () => {
    if (get().loading) return;
    set({ loading: true });
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .order("score_ia", { ascending: false });
    if (!error && data) set({ drivers: data.map(rowToDriver) });
    set({ loading: false });

    if (!driversRealtimeSubscribed) {
      driversRealtimeSubscribed = true;
      supabase
        .channel("drivers-rt")
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "drivers" }, (payload) => {
          const updated = rowToDriver(payload.new as Record<string, unknown>);
          set(s => ({ drivers: s.drivers.map(d => d.id === updated.id ? updated : d) }));
        })
        .subscribe();
    }
  },

  setOnline: async (id, online) => {
    await supabase.from("drivers").update({ online }).eq("id", id);
    set(s => ({ drivers: s.drivers.map(d => d.id === id ? { ...d, online } : d) }));
  },

  setInPrayer: async (id, inPrayer) => {
    await supabase.from("drivers").update({ in_prayer: inPrayer, online: inPrayer ? false : true }).eq("id", id);
    set(s => ({ drivers: s.drivers.map(d => d.id === id ? { ...d, inPrayer, online: !inPrayer } : d) }));
  },

  updatePosition: (id, lat, lng) => {
    set(s => ({ drivers: s.drivers.map(d => d.id === id ? { ...d, lat, lng } : d) }));
  },
}));
