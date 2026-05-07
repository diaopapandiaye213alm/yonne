"use client";
import { create } from "zustand";

export interface SurgeState {
  multiplier: number;
  autoMode: boolean;
  setMultiplier: (v: number) => void;
  toggleAutoMode: () => void;
}

export const useSurgeStore = create<SurgeState>((set) => ({
  multiplier: 1.4,
  autoMode: true,
  setMultiplier: (v) => set({ multiplier: Math.round(v * 10) / 10 }),
  toggleAutoMode: () => set((s) => ({ autoMode: !s.autoMode })),
}));
