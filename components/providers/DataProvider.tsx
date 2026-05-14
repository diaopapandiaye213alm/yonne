"use client";
import { useEffect } from "react";
import { useOrdersStore } from "@/lib/store/orders";
import { useDriversStore } from "@/lib/store/drivers";

export function DataProvider({ children }: { children: React.ReactNode }) {
  const fetchOrders  = useOrdersStore(s => s.fetchOrders);
  const fetchDrivers = useDriversStore(s => s.fetchDrivers);
  useEffect(() => {
    fetchOrders();
    fetchDrivers();
  }, [fetchOrders, fetchDrivers]);
  return <>{children}</>;
}
