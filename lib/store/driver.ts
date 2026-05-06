"use client";
import { create } from "zustand";

export type DeliveryStep = 0 | 1 | 2 | 3;

interface DriverState {
  driverId: string;
  online: boolean;
  inPrayer: boolean;
  activeOrderId: string | null;
  deliveryStep: DeliveryStep;
  setOnline: (v: boolean) => void;
  setInPrayer: (v: boolean) => void;
  acceptOrder: (orderId: string) => void;
  advanceStep: () => void;
  completeDelivery: () => void;
}

export const useDriverStore = create<DriverState>((set) => ({
  driverId: "drv-001",
  online: true,
  inPrayer: false,
  activeOrderId: null,
  deliveryStep: 0,
  setOnline: (v) => set({ online: v }),
  setInPrayer: (v) => set(v ? { inPrayer: true, online: false } : { inPrayer: false }),
  acceptOrder: (orderId) => set({ activeOrderId: orderId, deliveryStep: 0 }),
  advanceStep: () => set((s) => ({ deliveryStep: Math.min(3, s.deliveryStep + 1) as DeliveryStep })),
  completeDelivery: () => set({ activeOrderId: null, deliveryStep: 0 }),
}));
