"use client";
import { create } from "zustand";
import type { PaymentMethod } from "@/lib/mock-data/orders";

export type WizardStep = 1 | 2 | 3;

interface WizardState {
  step: WizardStep;
  clientName: string;
  clientPhone: string;
  landmarkId: string | null;
  addressDetails: string;
  amount: number;
  paymentMethod: PaymentMethod | null;
  insurance: boolean;
  // Surge pricing — calculé côté serveur à l'étape 2
  surgeMultiplier: number;
  surgeZoneId: string | null;
  set: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
  setSurge: (multiplier: number, zoneId: string | null) => void;
  reset: () => void;
  next: () => void;
  prev: () => void;
}

const initial = {
  step: 1 as WizardStep,
  clientName: "",
  clientPhone: "",
  landmarkId: null,
  addressDetails: "",
  amount: 0,
  paymentMethod: null,
  insurance: false,
  surgeMultiplier: 1.0,
  surgeZoneId: null,
};

export const useWizard = create<WizardState>((set) => ({
  ...initial,
  set: (key, value) => set({ [key]: value } as Partial<WizardState>),
  setSurge: (multiplier, zoneId) => set({ surgeMultiplier: multiplier, surgeZoneId: zoneId }),
  reset: () => set({ ...initial }),
  next: () => set((s) => ({ step: Math.min(3, s.step + 1) as WizardStep })),
  prev: () => set((s) => ({ step: Math.max(1, s.step - 1) as WizardStep })),
}));
