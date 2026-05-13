"use client";
import { useState, useEffect } from "react";

interface LiveKpis {
  revenue: number;
  orders: number;
  onlineDrivers: number;
  rating: number;
  sparkRevenue: number[];
  sparkOrders: number[];
}

const BASE: LiveKpis = {
  revenue:       847200,
  orders:        147,
  onlineDrivers: 28,
  rating:        4.7,
  sparkRevenue: [620, 705, 690, 760, 810, 805, 847],
  sparkOrders:  [110, 122, 118, 129, 138, 141, 147],
};

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function useLiveKpis(intervalMs = 28000): LiveKpis {
  const [kpis, setKpis] = useState<LiveKpis>(BASE);

  useEffect(() => {
    const id = setInterval(() => {
      setKpis(prev => {
        const newOrders  = prev.orders + randInt(1, 3);
        const newRevenue = prev.revenue + randInt(3000, 12000);
        const newOnline  = Math.max(20, Math.min(41, prev.onlineDrivers + randInt(-1, 2)));

        const newSparkOrders  = [...prev.sparkOrders.slice(1), newOrders];
        const newSparkRevenue = [...prev.sparkRevenue.slice(1), Math.round(newRevenue / 1000)];

        return {
          revenue:       newRevenue,
          orders:        newOrders,
          onlineDrivers: newOnline,
          rating:        prev.rating,
          sparkRevenue:  newSparkRevenue,
          sparkOrders:   newSparkOrders,
        };
      });
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs]);

  return kpis;
}
