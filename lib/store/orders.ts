import { create } from "zustand";
import { getSupabase } from "@/lib/supabase";
import type { Order, OrderStatus } from "@/lib/mock-data/orders";
import { sendSms } from "@/lib/sms";

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  addOrder: (order: Order) => Promise<void>;
  updateStatus: (id: string, status: OrderStatus) => Promise<void>;
  assignDriver: (id: string, driverId: string) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;
  cleanup: () => void;
}

function rowToOrder(row: Record<string, unknown>): Order {
  return {
    id:            row.id as string,
    driverId:      (row.driver_id  as string) ?? "",
    merchantId:    (row.merchant_id as string) ?? undefined,
    landmarkId:    (row.landmark_id as string) ?? "",
    clientName:    (row.client_name as string) ?? "",
    clientPhone:   (row.client_phone as string) ?? "",
    amount:        (row.amount as number) ?? 0,
    paymentMethod: (row.payment_method as Order["paymentMethod"]) ?? "cash",
    insurance:     (row.insurance as boolean) ?? false,
    status:        (row.status as OrderStatus) ?? "créée",
    active:        (row.active as boolean) ?? false,
    createdAt:     (row.created_at as string) ?? new Date().toISOString(),
  };
}

// Channel reference stored outside state to avoid serialization issues.
// Using null means "no active subscription"; a non-null value means
// the channel is open and can be unsubscribed via cleanup().
let _ordersChannel: ReturnType<ReturnType<typeof getSupabase>["channel"]> | null = null;

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const { data, error } = await getSupabase()
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      set({ orders: (data ?? []).map(rowToOrder) });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Erreur réseau" });
    } finally {
      set({ loading: false });
    }

    // Realtime subscription — idempotent: only one channel at a time.
    if (!_ordersChannel) {
      _ordersChannel = getSupabase()
        .channel("orders-rt")
        .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
          get().fetchOrders();
        })
        .subscribe();
    }
  },

  // Unsubscribes and clears the channel. Call on logout or layout unmount.
  cleanup: () => {
    if (_ordersChannel) {
      getSupabase().removeChannel(_ordersChannel);
      _ordersChannel = null;
    }
  },

  addOrder: async (order) => {
    try {
      const { error } = await getSupabase().from("orders").insert({
        id:             order.id,
        driver_id:      order.driverId || null,
        merchant_id:    order.merchantId ?? null,
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

      if (error) throw new Error(error.message);

      set((s) => ({ orders: [order, ...s.orders] }));

      // Non-blocking SMS to driver (fire-and-forget — non-critical)
      if (order.driverId) {
        void (async () => {
          try {
            const { data: d } = await getSupabase()
              .from("drivers")
              .select("phone,name")
              .eq("id", order.driverId)
              .single();
            if (d?.phone) {
              await sendSms(
                d.phone,
                `Nouvelle commande YONNE 📦 ${order.id} — ${order.clientName} — ${order.amount.toLocaleString("fr-FR")} F. Connectez-vous pour accepter.`
              );
            }
          } catch {/* non-critical */}
        })();
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Impossible de créer la commande" });
      throw err;
    }
  },

  updateStatus: async (id, status) => {
    const previous = get().orders.find((o) => o.id === id);
    set((s) => ({
      orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    }));
    try {
      const { error } = await getSupabase()
        .from("orders")
        .update({ status })
        .eq("id", id);
      if (error) throw new Error(error.message);
    } catch (err) {
      if (previous) {
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? previous : o)),
          error: err instanceof Error ? err.message : "Erreur mise à jour statut",
        }));
      }
    }
  },

  // Assigns a driver and updates status to "assignée" atomically.
  assignDriver: async (id, driverId) => {
    const previous = get().orders.find((o) => o.id === id);
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === id ? { ...o, driverId, status: "assignée" as OrderStatus } : o
      ),
    }));
    try {
      const { error } = await getSupabase()
        .from("orders")
        .update({ driver_id: driverId, status: "assignée" })
        .eq("id", id);
      if (error) throw new Error(error.message);
    } catch (err) {
      if (previous) {
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? previous : o)),
          error: err instanceof Error ? err.message : "Erreur assignation livreur",
        }));
      }
      throw err;
    }
  },

  cancelOrder: async (id) => {
    const previous = get().orders.find((o) => o.id === id);
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === id && o.status !== "livrée"
          ? { ...o, active: false, status: "annulée" as OrderStatus }
          : o
      ),
    }));
    try {
      const { error } = await getSupabase()
        .from("orders")
        .update({ active: false, status: "annulée" })
        .eq("id", id)
        .not("status", "eq", "livrée");
      if (error) throw new Error(error.message);
    } catch (err) {
      if (previous) {
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? previous : o)),
          error: err instanceof Error ? err.message : "Impossible d'annuler la commande",
        }));
      }
    }
  },
}));
