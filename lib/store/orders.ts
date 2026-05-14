import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Order, OrderStatus } from "@/lib/mock-data/orders";

interface OrdersState {
  orders: Order[];
  loading: boolean;
  fetchOrders: () => Promise<void>;
  addOrder: (order: Order) => Promise<void>;
  updateStatus: (id: string, status: OrderStatus) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;
}

function rowToOrder(row: Record<string, unknown>): Order {
  return {
    id:            row.id as string,
    driverId:      (row.driver_id as string) ?? "",
    merchantId:    (row.merchant_id as string) ?? undefined,
    landmarkId:    (row.landmark_id as string) ?? "",
    clientName:    (row.client_name as string) ?? "",
    clientPhone:   (row.client_phone as string) ?? "",
    amount:        row.amount as number,
    paymentMethod: (row.payment_method as Order["paymentMethod"]) ?? "cash",
    insurance:     row.insurance as boolean,
    status:        row.status as OrderStatus,
    active:        row.active as boolean,
    createdAt:     row.created_at as string,
  };
}

let realtimeSubscribed = false;

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  loading: false,

  fetchOrders: async () => {
    if (get().loading) return;
    set({ loading: true });
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) set({ orders: data.map(rowToOrder) });
    set({ loading: false });

    if (!realtimeSubscribed) {
      realtimeSubscribed = true;
      supabase
        .channel("orders-rt")
        .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
          get().fetchOrders();
        })
        .subscribe();
    }
  },

  addOrder: async (order) => {
    const { error } = await supabase.from("orders").insert({
      id:             order.id,
      driver_id:      order.driverId,
      landmark_id:    order.landmarkId,
      client_name:    order.clientName,
      client_phone:   order.clientPhone,
      amount:         order.amount,
      payment_method: order.paymentMethod,
      insurance:      order.insurance,
      status:         order.status,
      active:         order.active,
      created_at:     order.createdAt,
    });
    if (!error) set((s) => ({ orders: [order, ...s.orders] }));
  },

  updateStatus: async (id, status) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);
    if (!error)
      set((s) => ({
        orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
      }));
  },

  cancelOrder: async (id) => {
    // Set active=false; status stays as-is so we can identify cancelled orders by active=false
    const { error } = await supabase
      .from("orders")
      .update({ active: false, status: "créée" })
      .eq("id", id)
      .not("status", "eq", "livrée");
    if (!error)
      set((s) => ({
        orders: s.orders.map((o) =>
          o.id === id && o.status !== "livrée" ? { ...o, active: false, status: "créée" as OrderStatus } : o
        ),
      }));
  },
}));
