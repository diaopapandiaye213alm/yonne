"use client";
import { useEffect } from "react";
import { DemoTopBar } from "@/components/demo/DemoTopBar";
import { MerchantPanel } from "@/components/demo/MerchantPanel";
import { DriverPanel } from "@/components/demo/DriverPanel";
import { useDemoSim } from "@/lib/store/demo-sim";

export default function DemoPage() {
  const { tick, running, reset } = useDemoSim();

  useEffect(() => {
    const timeout = setTimeout(() => {
      useDemoSim.getState().start();
    }, 1500);
    return () => {
      clearTimeout(timeout);
      reset();
    };
  }, [reset]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(tick, 300);
    return () => clearInterval(id);
  }, [running, tick]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-cream-50">
      <DemoTopBar />
      <div className="flex flex-1 overflow-hidden">
        <MerchantPanel />
        <DriverPanel />
      </div>
    </div>
  );
}
