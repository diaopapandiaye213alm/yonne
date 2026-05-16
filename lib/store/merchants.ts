import { create } from "zustand";
import { getSupabase } from "@/lib/supabase";
import type { Merchant } from "@/lib/mock-data/merchants";

interface MerchantsState {
  merchants: Merchant[];
  loading: boolean;
  fetchMerchants: () => Promise<void>;
  updateStatus: (id: string, status: Merchant["status"]) => Promise<void>;
  updateMerchant: (id: string, fields: Partial<Pick<Merchant, "email" | "phone" | "city" | "notifWhatsapp" | "notifSms" | "notifEmail">>) => Promise<void>;
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
    notifWhatsapp:      (row.notif_whatsapp as boolean) ?? true,
    notifSms:           (row.notif_sms as boolean) ?? true,
    notifEmail:         (row.notif_email as boolean) ?? false,
  };
}

export const useMerchantsStore = create<MerchantsState>((set, get) => ({
  merchants: [],
  loading: false,

  fetchMerchants: async () => {
    if (get().loading) return;
    set({ loading: true });
    const { data, error } = await getSupabase()
      .from("merchants")
      .select("*")
      .order("name");
    set({ loading: false });
    if (error) throw new Error(error.message);
    if (data) set({ merchants: data.map(rowToMerchant) });
  },

  updateStatus: async (id, status) => {
    const { error } = await getSupabase().from("merchants").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
    set(s => ({ merchants: s.merchants.map(m => m.id === id ? { ...m, status } : m) }));
  },

  updateMerchant: async (id, fields) => {
    const patch: Record<string, string | boolean> = {};
    if (fields.email         !== undefined) patch.email          = fields.email;
    if (fields.phone         !== undefined) patch.phone          = fields.phone;
    if (fields.city          !== undefined) patch.city           = fields.city;
    if (fields.notifWhatsapp !== undefined) patch.notif_whatsapp = fields.notifWhatsapp;
    if (fields.notifSms      !== undefined) patch.notif_sms      = fields.notifSms;
    if (fields.notifEmail    !== undefined) patch.notif_email    = fields.notifEmail;
    const { error } = await getSupabase().from("merchants").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    set(s => ({ merchants: s.merchants.map(m => m.id === id ? { ...m, ...fields } : m) }));
  },

  markOnboardingDone: async (id) => {
    const { error } = await getSupabase().from("merchants").update({ onboarding_done: true }).eq("id", id);
    if (error) throw new Error(error.message);
    set(s => ({ merchants: s.merchants.map(m => m.id === id ? { ...m, onboardingDone: true } : m) }));
    try { localStorage.setItem("yonne_merchant_onboarding_done", "1"); } catch { /* ignore */ }
  },
}));
