"use client";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { REALTIME_SUBSCRIBE_STATES } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const STATUS_LABELS: Record<string, string> = {
  assignée: "✅ Livreur assigné",
  collecte:  "📦 Colis en collecte",
  "en route": "🛵 En route vers le client",
  livrée:    "🎉 Commande livrée !",
  annulée:   "❌ Commande annulée",
};

const STATUS_TOAST: Record<string, "success" | "info" | "warning" | "error"> = {
  assignée:  "info",
  collecte:  "info",
  "en route": "info",
  livrée:    "success",
  annulée:   "error",
};

export function MerchantNotifier({ merchantId }: { merchantId?: string }) {
  const prevStatuses = useRef<Record<string, string>>({});

  useEffect(() => {
    let errorToastShown = false;
    const channelName = merchantId ? `merchant-orders-${merchantId}` : "merchant-order-updates";
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          ...(merchantId ? { filter: `merchant_id=eq.${merchantId}` } : {}),
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const id  = row.id as string;
          const newStatus = row.status as string;
          const oldStatus = prevStatuses.current[id];

          if (newStatus && newStatus !== oldStatus) {
            prevStatuses.current[id] = newStatus;
            const label = STATUS_LABELS[newStatus];
            if (!label) return;
            const type = STATUS_TOAST[newStatus] ?? "info";
            const msg  = `${label} — Commande ${id}`;
            if (type === "success") toast.success(msg);
            else if (type === "error") toast.error(msg);
            else toast.info(msg);
          }
        }
      )
      .subscribe((status) => {
        if (
          (status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR ||
           status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT) &&
          !errorToastShown
        ) {
          errorToastShown = true;
          toast.error("Notifications en arrière-plan hors-ligne");
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [merchantId]);

  return null;
}
