"use client";
import { useEffect, useState } from "react";
import { Bell, BellOff, X } from "lucide-react";

type PermState = "default" | "granted" | "denied";

export function PushNotifBanner() {
  const [perm, setPerm]         = useState<PermState>("default");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!("Notification" in window)) { setDismissed(true); return; }
    setPerm(Notification.permission as PermState);
  }, []);

  async function request() {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPerm(result as PermState);
    if (result === "granted") {
      new Notification("YONNE Livreur", {
        body: "Notifications activées — vous recevrez les nouvelles commandes instantanément.",
        icon: "/icon.svg",
      });
    }
  }

  if (dismissed || perm !== "default") return null;

  return (
    <div className="mx-4 mb-3 bg-white border border-cream-200 rounded-xl shadow-card p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
        <Bell className="w-4 h-4 text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink-900">Activer les notifications</p>
        <p className="text-xs text-ink-500 mt-0.5">Recevez les nouvelles commandes même quand l'appli est en arrière-plan.</p>
        <div className="flex gap-2 mt-3">
          <button type="button" onClick={request}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
            <Bell className="w-3.5 h-3.5" /> Activer
          </button>
          <button type="button" onClick={() => setDismissed(true)}
            className="flex items-center gap-1.5 border border-cream-200 text-ink-500 text-xs px-3 py-1.5 rounded-lg hover:bg-cream-50 transition-colors">
            <BellOff className="w-3.5 h-3.5" /> Plus tard
          </button>
        </div>
      </div>
      <button type="button" onClick={() => setDismissed(true)} className="text-ink-300 hover:text-ink-600 shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function triggerOrderNotification(orderId: string, clientName: string, amount: number) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  new Notification("🛵 Nouvelle commande !", {
    body: `${clientName} · ${amount.toLocaleString("fr-FR")} F CFA · ${orderId}`,
    icon: "/icon.svg",
    tag:  orderId,
  });
}
