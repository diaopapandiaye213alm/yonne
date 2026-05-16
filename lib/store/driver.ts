"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type DeliveryStep = 0 | 1 | 2 | 3;

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
}

export const useDriverStore = create<DriverState>()(
  persist(
    (set) => ({
      driverId: "drv-001",
      online: true,
      inPrayer: false,
      activeOrderId: null,
      deliveryStep: 0 as DeliveryStep,
      hasHydrated: false,
      setOnline: (v) => set({ online: v, inPrayer: false }),
      setInPrayer: (v) => set(v ? { inPrayer: true, online: false } : { inPrayer: false }),
      acceptOrder: (orderId) => set({ activeOrderId: orderId, deliveryStep: 0 }),
      advanceStep: () => set((s) => ({ deliveryStep: Math.min(3, s.deliveryStep + 1) as DeliveryStep })),
      completeDelivery: () => set({ activeOrderId: null, deliveryStep: 0 }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "yonne_driver_state",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ activeOrderId: s.activeOrderId, deliveryStep: s.deliveryStep }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
