"use client";
import { create } from "zustand";

interface DemoSimState {
  progress: number;   // 0-100
  running: boolean;
  tick: () => void;
  start: () => void;
  reset: () => void;
}

export const useDemoSim = create<DemoSimState>((set) => ({
  progress: 0,
  running: false,
  tick: () =>
    set((s) => {
      const next = Math.min(100, s.progress + 1);
      return { progress: next, running: next < 100 };
    }),
  start: () => set((s) => (s.progress >= 100 ? { progress: 0, running: true } : { running: true })),
  reset: () => set({ progress: 0, running: false }),
}));
