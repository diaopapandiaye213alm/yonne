"use client";
import { create } from "zustand";
import { simulationEngine } from "@/lib/simulation/engine";

interface SimulationState {
  running: boolean;
  speed: 1 | 2 | 5;
  ordersCreated: number;
  start:    (speed?: 1 | 2 | 5) => void;
  pause:    () => void;
  setSpeed: (speed: 1 | 2 | 5) => void;
}

export const useSimulationStore = create<SimulationState>((set) => {
  // Brancher le callback de l'engine sur le store Zustand
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
});
