import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Merchant } from "@/lib/mock-data/merchants";

interface MerchantsState {
  merchants: Merchant[];
  loading: boolean;
  fetchMerchants: () => Promise<void>;
  updateStatus: (id: string, status: Merchant["status"]) => Promise<void>;
  updateMerchant: (id: string, fields: Partial<Pick<Merchant, "email" | "phone" | "city">>) => Promise<void>;
  markOnboardingDone: (id: string) => Promise<void>;
}

function rowToMerchant(row: Record<string, unknown>): Merchant {
  return {
    id:                 row.id as string,
    name:               row.name as string,
    email:              (row.email as string) ?? "",
    phone:              (row.phone as string) ?? "",
    city:               (row.city as string) ?? "Dakar",
    plan:               (row.plan as Merchant["plan"]) ?? "Standard",
    status:             (row.status as Merchant["status"]) ?? "actif",
    ordersThisMonth:    (row.orders_this_month as number) ?? 0,
    revenueThisMonth:   (row.revenue_this_month as number) ?? 0,
    ordersLastMonth:    (row.orders_last_month as number) ?? 0,
    revenueLastMonth:   (row.revenue_last_month as number) ?? 0,
    joinedAt:           (row.joined_at as string) ?? new Date().toISOString().split("T")[0],
    onboardingDone:     (row.onboarding_done as boolean) ?? false,
  };
}

export const useMerchantsStore = create<MerchantsState>((set, get) => ({
  merchants: [],
  loading: false,

  fetchMerchants: async () => {
    if (get().loading) return;
    set({ loading: true });
    const { data, error } = await supabase
      .from("merchants")
      .select("*")
      .order("name");
    if (!error && data) set({ merchants: data.map(rowToMerchant) });
    set({ loading: false });
  },

  updateStatus: async (id, status) => {
    await supabase.from("merchants").update({ status }).eq("id", id);
    set(s => ({ merchants: s.merchants.map(m => m.id === id ? { ...m, status } : m) }));
  },

  updateMerchant: async (id, fields) => {
    const patch: Record<string, string> = {};
    if (fields.email !== undefined) patch.email = fields.email;
    if (fields.phone !== undefined) patch.phone = fields.phone;
    if (fields.city  !== undefined) patch.city  = fields.city;
    await supabase.from("merchants").update(patch).eq("id", id);
    set(s => ({ merchants: s.merchants.map(m => m.id === id ? { ...m, ...fields } : m) }));
  },

  markOnboardingDone: async (id) => {
    await supabase.from("merchants").update({ onboarding_done: true }).eq("id", id);
    set(s => ({ merchants: s.merchants.map(m => m.id === id ? { ...m, onboardingDone: true } : m) }));
    try { localStorage.setItem("yonne_merchant_onboarding_done", "1"); } catch { /* ignore */ }
  },
}));
