"use client";
import { useEffect } from "react";
import { useDriversStore } from "@/lib/store/drivers";
import { useOrdersStore } from "@/lib/store/orders";

export function StoreCleanup() {
  const cleanupDrivers = useDriversStore((s) => s.cleanup);
  const cleanupOrders  = useOrdersStore((s) => s.cleanup);

  useEffect(() => {
    return () => {
      cleanupDrivers();
      cleanupOrders();
    };
  }, [cleanupDrivers, cleanupOrders]);

  return null;
}
