"use client";
import { useState, useEffect } from "react";
import { useOrdersStore } from "@/lib/store/orders";
import { useDriversStore } from "@/lib/store/drivers";

const IS_PROD = process.env.NEXT_PUBLIC_APP_ENV === "production";

interface LiveKpis {
  revenue: number;
  orders: number;
  onlineDrivers: number;
  rating: number;
  sparkRevenue: number[];
  sparkOrders: number[];
}

class Prng {
  private s: number;
  constructor(seed: number) { this.s = seed >>> 0; }
  next(): number {
    this.s = (this.s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(this.s ^ (this.s >>> 15), 1 | this.s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  }
}
const _kpisRng = new Prng(Date.now() & 0xffffffff);

function randInt(min: number, max: number) {
  return Math.floor(_kpisRng.next() * (max - min + 1)) + min;
}

export function useLiveKpis(intervalMs = 10000): LiveKpis {
  const { orders }  = useOrdersStore();
  const { drivers } = useDriversStore();

  const realOrders  = orders.length;
  const realOnline  = drivers.filter(d => d.online).length;
  const realRevenue = orders.reduce((s, o) => s + o.amount, 0);
  const realRating  = drivers.length > 0
    ? Math.round((drivers.reduce((s, d) => s + d.rating, 0) / drivers.length) * 10) / 10
    : 4.7;

  const [kpis, setKpis] = useState<LiveKpis>(() => ({
    revenue:      realRevenue,
    orders:       realOrders,
    onlineDrivers: realOnline,
    rating:       realRating,
    sparkRevenue: [620, 705, 690, 760, 810, 805, Math.round(realRevenue / 1000)],
    sparkOrders:  [110, 122, 118, 129, 138, 141, realOrders],
  }));

  // Re-seed when store loads
  useEffect(() => {
    if (orders.length > 0 || drivers.length > 0) {
      setKpis(prev => ({
        ...prev,
        revenue:       realRevenue,
        orders:        realOrders,
        onlineDrivers: realOnline,
        rating:        realRating,
        sparkOrders:   [...prev.sparkOrders.slice(0, 6), realOrders],
        sparkRevenue:  [...prev.sparkRevenue.slice(0, 6), Math.round(realRevenue / 1000)],
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders.length, drivers.length]);

  // Simulate live activity only in demo/dev mode — never in production
  useEffect(() => {
    if (IS_PROD) return;
    const id = setInterval(() => {
      setKpis(prev => {
        const newOrders  = prev.orders + randInt(0, 2);
        const newRevenue = prev.revenue + randInt(2000, 10000);
        const newOnline  = Math.max(0, Math.min(drivers.length || 41, prev.onlineDrivers + randInt(-1, 2)));

        return {
          revenue:       newRevenue,
          orders:        newOrders,
          onlineDrivers: newOnline,
          rating:        prev.rating,
          sparkRevenue:  [...prev.sparkRevenue.slice(1), Math.round(newRevenue / 1000)],
          sparkOrders:   [...prev.sparkOrders.slice(1), newOrders],
        };
      });
    }, intervalMs);

    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, IS_PROD]);

  return kpis;
}
