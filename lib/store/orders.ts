import { create } from "zustand";
import { orders as seedOrders } from "@/lib/mock-data/orders";
import type { Order, OrderStatus } from "@/lib/mock-data/orders";

interface OrdersState {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateStatus: (id: string, status: OrderStatus) => void;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [...seedOrders],
  addOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),
  updateStatus: (id, status) =>
    set((s) => ({
      orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    })),
}));
