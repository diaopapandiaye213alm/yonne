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
    fetchOrders();
    fetchDrivers();
    fetchMerchants();
  }, [fetchOrders, fetchDrivers, fetchMerchants]);
  return <>{children}</>;
}
