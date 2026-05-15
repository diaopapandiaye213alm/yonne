import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Driver } from "@/lib/mock-data/drivers";

export function avatarUrl(driver: { avatarSeed: string }) {
  return `https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${encodeURIComponent(driver.avatarSeed)}`;
}

interface DriversState {
  drivers: Driver[];
  loading: boolean;
  error: string | null;
  fetchDrivers: () => Promise<void>;
  setOnline: (id: string, online: boolean) => Promise<void>;
  setInPrayer: (id: string, inPrayer: boolean) => Promise<void>;
  updatePosition: (id: string, lat: number, lng: number) => void;
}

function rowToDriver(row: Record<string, unknown>): Driver {
  return {
    id:            row.id as string,
    name:          (row.name as string) ?? "",
    avatarSeed:    (row.avatar_seed as string) ?? "",
    phone:         (row.phone as string) ?? "",
    vehicle:       (row.vehicle as Driver["vehicle"]) ?? "Moto Yamaha",
    scoreIA:       (row.score_ia as number) ?? 80,
    rating:        (row.rating as number) ?? 4.5,
    tier:          (row.tier as Driver["tier"]) ?? "Bronze",
    badges:        Array.isArray(row.badges) ? (row.badges as Driver["badges"]) : [],
    ordersToday:   (row.orders_today as number) ?? 0,
    earningsToday: (row.earnings_today as number) ?? 0,
    online:        (row.online as boolean) ?? false,
    inPrayer:      (row.in_prayer as boolean) ?? false,
    lat:           (row.lat as number) ?? 14.71,
    lng:           (row.lng as number) ?? -17.45,
  };
}

// Guard: reject null / non-object payloads before rowToDriver is called
function isValidRow(row: unknown): row is Record<string, unknown> {
  return (
    typeof row === "object" &&
    row !== null &&
    "id" in (row as object) &&
    typeof (row as Record<string, unknown>).id === "string"
  );
}

// ── Position-update throttle ──────────────────────────────────────────────────
// Realtime can fire many driver UPDATEs in quick succession (e.g. GPS bursts).
// We buffer them and flush to the store at most every THROTTLE_MS.
const THROTTLE_MS = 3000;
let positionBuffer = new Map<string, Driver>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function enqueueDriverUpdate(
  driver: Driver,
  storeSet: (fn: (s: DriversState) => Partial<DriversState>) => void
) {
  positionBuffer.set(driver.id, driver);

  if (flushTimer !== null) return; // already scheduled
  flushTimer = setTimeout(() => {
    flushTimer = null;
    const snapshot = new Map(positionBuffer);
    positionBuffer = new Map();
    if (snapshot.size === 0) return;

    storeSet((s) => ({
      drivers: s.drivers.map((d) => snapshot.get(d.id) ?? d),
    }));
  }, THROTTLE_MS);
}
// ─────────────────────────────────────────────────────────────────────────────

let driversRealtimeSubscribed = false;

export const useDriversStore = create<DriversState>((set, get) => ({
  drivers: [],
  loading: false,
  error: null,

  fetchDrivers: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .order("score_ia", { ascending: false });

      if (error) throw new Error(error.message);
      set({ drivers: (data ?? []).map(rowToDriver) });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Erreur réseau livreurs" });
    } finally {
      set({ loading: false });
    }

    if (!driversRealtimeSubscribed) {
      driversRealtimeSubscribed = true;
      supabase
        .channel("drivers-rt")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "drivers" },
          (payload) => {
            // Validate before touching state — malformed payload = silent skip
            if (!isValidRow(payload.new)) return;

            try {
              const updated = rowToDriver(payload.new);
              // Enqueue for batched flush (max one re-render per THROTTLE_MS)
              enqueueDriverUpdate(updated, set);
            } catch {
              // Corrupt row: skip silently rather than crashing
            }
          }
        )
        .subscribe();
    }
  },

  setOnline: async (id, online) => {
    // Optimistic update
    set((s) => ({
      drivers: s.drivers.map((d) => (d.id === id ? { ...d, online } : d)),
    }));
    try {
      const { error } = await supabase
        .from("drivers")
        .update({ online })
        .eq("id", id);
      if (error) throw new Error(error.message);
    } catch (err) {
      // Rollback
      set((s) => ({
        drivers: s.drivers.map((d) => (d.id === id ? { ...d, online: !online } : d)),
        error: err instanceof Error ? err.message : "Erreur mise à jour disponibilité",
      }));
    }
  },

  setInPrayer: async (id, inPrayer) => {
    // Optimistic update
    set((s) => ({
      drivers: s.drivers.map((d) =>
        d.id === id ? { ...d, inPrayer, online: !inPrayer } : d
      ),
    }));
    try {
      const { error } = await supabase
        .from("drivers")
        .update({ in_prayer: inPrayer, online: inPrayer ? false : true })
        .eq("id", id);
      if (error) throw new Error(error.message);
    } catch (err) {
      // Rollback
      set((s) => ({
        drivers: s.drivers.map((d) =>
          d.id === id ? { ...d, inPrayer: !inPrayer, online: inPrayer } : d
        ),
        error: err instanceof Error ? err.message : "Erreur mode prière",
      }));
    }
  },

  // Local-only position update used by the simulation engine.
  // Bypasses throttle and Supabase to avoid write spam.
  updatePosition: (id, lat, lng) => {
    set((s) => ({
      drivers: s.drivers.map((d) => (d.id === id ? { ...d, lat, lng } : d)),
    }));
  },
}));
