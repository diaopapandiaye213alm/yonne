"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { simulationEngine } from "@/lib/simulation/engine";

interface SimulationState {
  running: boolean;
  speed: 1 | 2 | 5;
  ordersCreated: number;
  start:    (speed?: 1 | 2 | 5) => void;
  pause:    () => void;
  setSpeed: (speed: 1 | 2 | 5) => void;
}

export const useSimulationStore = create<SimulationState>()(
  persist(
    (set) => {
      simulationEngine.setStateCallback((running, speed, ordersCreated) => {
        set({ running, speed: speed as 1 | 2 | 5, ordersCreated });
      });

      return {
        running: false,
        speed: 1,
        ordersCreated: 0,

        start: (speed = 1) => {
          simulationEngine.start(speed);
        },

        pause: () => {
          simulationEngine.stop();
        },

        setSpeed: (speed) => {
          set({ speed });
          simulationEngine.setSpeed(speed);
        },
      };
    },
    {
      name: "yonne-simulation",
      // Only persist running + speed (not ordersCreated which resets each session)
      partialize: (s) => ({ running: s.running, speed: s.speed }),
      onRehydrateStorage: () => (state) => {
        // Auto-restart engine if it was running before page refresh
        if (state?.running) {
          setTimeout(() => simulationEngine.start(state.speed), 800);
        }
      },
    }
  )
);
