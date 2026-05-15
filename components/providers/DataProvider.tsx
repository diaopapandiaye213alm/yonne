"use client";
import { useEffect } from "react";
import { useOrdersStore } from "@/lib/store/orders";
import { useDriversStore } from "@/lib/store/drivers";
import { useMerchantsStore } from "@/lib/store/merchants";

export function DataProvider({ children }: { children: React.ReactNode }) {
  const fetchOrders    = useOrdersStore(s => s.fetchOrders);
  const fetchDrivers   = useDriversStore(s => s.fetchDrivers);
  const fetchMerchants = useMerchantsStore(s => s.fetchMerchants);
  useEffect(() => {
    fetchOrders().catch((err: unknown) => console.error("[DataProvider] fetchOrders:", err));
    fetchDrivers().catch((err: unknown) => console.error("[DataProvider] fetchDrivers:", err));
    fetchMerchants().catch((err: unknown) => console.error("[DataProvider] fetchMerchants:", err));
  }, [fetchOrders, fetchDrivers, fetchMerchants]);
  return <>{children}</>;
}
