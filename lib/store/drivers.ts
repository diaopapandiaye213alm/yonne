import { create } from "zustand";
import { getSupabase } from "@/lib/supabase";
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
  updateDriver: (id: string, fields: Partial<Pick<Driver, "name" | "phone" | "vehicle" | "tier" | "online">>) => void;
  updatePosition: (id: string, lat: number, lng: number) => void;
  cleanup: () => void;
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

function isValidRow(row: unknown): row is Record<string, unknown> {
  return (
    typeof row === "object" &&
    row !== null &&
    "id" in (row as object) &&
    typeof (row as Record<string, unknown>).id === "string"
  );
}

// ── Position-update throttle ──────────────────────────────────────────────────
const THROTTLE_MS = 3000;
let positionBuffer = new Map<string, Driver>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function enqueueDriverUpdate(
  driver: Driver,
  storeSet: (fn: (s: DriversState) => Partial<DriversState>) => void
) {
  positionBuffer.set(driver.id, driver);
  if (flushTimer !== null) return;
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

// Channel reference outside state to prevent serialization issues.
let _driversChannel: ReturnType<ReturnType<typeof getSupabase>["channel"]> | null = null;

export const useDriversStore = create<DriversState>((set, get) => ({
  drivers: [],
  loading: false,
  error: null,

  fetchDrivers: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const { data, error } = await getSupabase()
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

    if (!_driversChannel) {
      _driversChannel = getSupabase()
        .channel("drivers-rt")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "drivers" },
          (payload) => {
            if (!isValidRow(payload.new)) return;
            try {
              const updated = rowToDriver(payload.new);
              enqueueDriverUpdate(updated, set);
            } catch { /* corrupt row: skip silently */ }
          }
        )
        .subscribe();
    }
  },

  cleanup: () => {
    if (_driversChannel) {
      getSupabase().removeChannel(_driversChannel);
      _driversChannel = null;
    }
    if (flushTimer !== null) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
  },

  setOnline: async (id, online) => {
    const prev = get().drivers.find((d) => d.id === id);
    set((s) => ({
      drivers: s.drivers.map((d) => (d.id === id ? { ...d, online } : d)),
    }));
    try {
      const { error } = await getSupabase()
        .from("drivers")
        .update({ online })
        .eq("id", id);
      if (error) throw new Error(error.message);
    } catch (err) {
      set((s) => ({
        drivers: s.drivers.map((d) =>
          d.id === id ? { ...d, online: prev?.online ?? !online } : d
        ),
        error: err instanceof Error ? err.message : "Erreur mise à jour disponibilité",
      }));
    }
  },

  setInPrayer: async (id, inPrayer) => {
    const prev = get().drivers.find((d) => d.id === id);
    set((s) => ({
      drivers: s.drivers.map((d) =>
        d.id === id ? { ...d, inPrayer, online: !inPrayer } : d
      ),
    }));
    try {
      const { error } = await getSupabase()
        .from("drivers")
        .update({ in_prayer: inPrayer, online: !inPrayer })
        .eq("id", id);
      if (error) throw new Error(error.message);
    } catch (err) {
      set((s) => ({
        drivers: s.drivers.map((d) =>
          d.id === id
            ? { ...d, inPrayer: prev?.inPrayer ?? !inPrayer, online: prev?.online ?? !inPrayer }
            : d
        ),
        error: err instanceof Error ? err.message : "Erreur mode prière",
      }));
    }
  },

  updateDriver: (id, fields) => {
    set((s) => ({
      drivers: s.drivers.map((d) => (d.id === id ? { ...d, ...fields } : d)),
    }));
  },

  updatePosition: (id, lat, lng) => {
    set((s) => ({
      drivers: s.drivers.map((d) => (d.id === id ? { ...d, lat, lng } : d)),
    }));
  },
}));
