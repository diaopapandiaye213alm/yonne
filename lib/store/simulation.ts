"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { simulationEngine } from "@/lib/simulation/engine";

// Simulation is strictly forbidden in production to prevent fake orders from
// polluting the real Supabase database and triggering real SMS notifications.
const IS_PROD = process.env.NEXT_PUBLIC_APP_ENV === "production";

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
          if (IS_PROD) return; // hard block — never run simulation on production DB
          simulationEngine.start(speed);
        },

        pause: () => {
          simulationEngine.stop();
        },

        setSpeed: (speed) => {
          set({ speed });
          if (!IS_PROD) simulationEngine.setSpeed(speed);
        },
      };
    },
    {
      name: "yonne-simulation",
      // Only persist running + speed (not ordersCreated which resets each session)
      partialize: (s) => ({ running: s.running, speed: s.speed }),
      onRehydrateStorage: () => (state) => {
        // Auto-restart only in non-production environments
        if (!IS_PROD && state?.running) {
          setTimeout(() => simulationEngine.start(state.speed), 800);
        }
      },
    }
  )
);
