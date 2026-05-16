"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getSupabase } from "@/lib/supabase";
import { enqueueAction } from "@/lib/store/outbox";

export type DeliveryStep = 0 | 1 | 2 | 3;

// Statuts valides pour l'avancement de livraison (dans l'ordre)
const STEP_STATUSES: Record<DeliveryStep, string> = {
  0: "collecte",
  1: "en route",
  2: "livrée",
  3: "livrée",
};

interface DriverState {
  driverId: string;
  online: boolean;
  inPrayer: boolean;
  activeOrderId: string | null;
  deliveryStep: DeliveryStep;
  hasHydrated: boolean;
  setOnline: (v: boolean) => void;
  setInPrayer: (v: boolean) => void;
  acceptOrder: (orderId: string) => void;
  advanceStep: () => void;
  completeDelivery: () => void;
  setHasHydrated: (v: boolean) => void;
  // Variantes réseau avec fallback outbox
  syncAdvanceStep: (orderId: string) => Promise<void>;
  syncCompleteDelivery: (orderId: string) => Promise<void>;
}

export const useDriverStore = create<DriverState>()(
  persist(
    (set, get) => ({
      driverId: "drv-001",
      online: true,
      inPrayer: false,
      activeOrderId: null,
      deliveryStep: 0 as DeliveryStep,
      hasHydrated: false,

      setOnline: (v) => set({ online: v, inPrayer: false }),
      setInPrayer: (v) => set(v ? { inPrayer: true, online: false } : { inPrayer: false }),
      acceptOrder: (orderId) => set({ activeOrderId: orderId, deliveryStep: 0 }),

      advanceStep: () =>
        set((s) => ({
          deliveryStep: Math.min(3, s.deliveryStep + 1) as DeliveryStep,
        })),

      completeDelivery: () => set({ activeOrderId: null, deliveryStep: 0 }),

      setHasHydrated: (v) => set({ hasHydrated: v }),

      // ── syncAdvanceStep ──────────────────────────────────────────────────────
      // Met à jour le statut de la commande dans Supabase ET avance le step local.
      // Si Supabase échoue (réseau dégradé), enregistre l'action dans IndexedDB
      // pour un replay automatique au retour de la connexion.
      syncAdvanceStep: async (orderId) => {
        const currentStep = get().deliveryStep;
        const nextStep    = Math.min(3, currentStep + 1) as DeliveryStep;
        const nextStatus  = STEP_STATUSES[nextStep];

        // Mise à jour locale optimiste : le livreur voit l'avancement immédiatement
        set({ deliveryStep: nextStep });

        const supabase = getSupabase();
        const { error } = await supabase
          .from("orders")
          .update({ status: nextStatus, active: nextStep < 3 })
          .eq("id", orderId)
          .then((r) => r, (err: unknown) => ({ data: null, error: err }));

        if (error) {
          console.warn(`[driver] réseau dégradé — step ${nextStep} mis en outbox`, error);
          await enqueueAction({
            id:        `${orderId}_step${nextStep}_${Date.now()}`,
            action:    "updateOrderStatus",
            payload:   { orderId, status: nextStatus, active: nextStep < 3 },
            timestamp: Date.now(),
          });
        }
      },

      // ── syncCompleteDelivery ─────────────────────────────────────────────────
      // Clôture la livraison (status = 'livrée', active = false).
      // L'état local est réinitialisé immédiatement ; Supabase est mis à jour en
      // arrière-plan avec fallback outbox si le réseau est absent.
      syncCompleteDelivery: async (orderId) => {
        // Réinitialisation locale immédiate
        set({ activeOrderId: null, deliveryStep: 0 });

        const supabase = getSupabase();
        const { error } = await supabase
          .from("orders")
          .update({ status: "livrée", active: false })
          .eq("id", orderId)
          .then((r) => r, (err: unknown) => ({ data: null, error: err }));

        if (error) {
          console.warn("[driver] réseau dégradé — livraison mise en outbox", error);
          await enqueueAction({
            id:        `${orderId}_livree_${Date.now()}`,
            action:    "updateOrderStatus",
            payload:   { orderId, status: "livrée", active: false },
            timestamp: Date.now(),
          });
        }
      },
    }),
    {
      name: "yonne_driver_state",
      storage: createJSONStorage(() => localStorage),
      // Seul l'état de progression est persisté — pas les actions asynchrones
      partialize: (s) => ({ activeOrderId: s.activeOrderId, deliveryStep: s.deliveryStep }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
