"use client";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useWizard } from "@/lib/store/wizard";
import { useOrdersStore } from "@/lib/store/orders";
import { useDriversStore, avatarUrl } from "@/lib/store/drivers";
import { useMerchantsStore } from "@/lib/store/merchants";
import { landmarks } from "@/lib/mock-data/landmarks";
import type { Driver } from "@/lib/mock-data/drivers";
import { Button } from "@/components/ui/button";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";

type RecentClientEntry = { name: string; phone: string; landmarkId: string; landmarkName: string };
function isRecentEntry(x: unknown): x is RecentClientEntry {
  if (x === null || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.name === "string" && (o.name as string).trim() !== "" &&
    typeof o.phone === "string" && (o.phone as string).trim() !== "" &&
    typeof o.landmarkId === "string" &&
    typeof o.landmarkName === "string"
  );
}

// Generates a collision-resistant YONNE order ID using crypto.randomUUID().
// Format: YN-{YEAR}-{8 hex chars uppercase} — ~4 billion combinations per year.
function generateOrderId(): string {
  const uuid = crypto.randomUUID();
  const hex = uuid.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `YN-${new Date().getFullYear()}-${hex}`;
}

export function DispatchStep() {
  const w = useWizard();
  const router = useRouter();
  const { addOrder } = useOrdersStore();
  const { drivers } = useDriversStore();
  const { merchants } = useMerchantsStore();
  const [phase, setPhase] = useState<"dispatching" | "assigned">("dispatching");
  const [assignedDriver, setAssignedDriver] = useState<Driver | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // orderId is stable for the lifetime of this component mount.
  const [orderId] = useState<string>(generateOrderId);

  useEffect(() => {
    if (drivers.length === 0) return;
    const timer = setTimeout(() => {
      const candidate = [...drivers]
        .filter(d => d.online && !d.inPrayer)
        .sort((a, b) => b.scoreIA - a.scoreIA)[0] ?? drivers[0];
      setAssignedDriver(candidate);
      setPhase("assigned");
    }, 1500);
    return () => clearTimeout(timer);
  }, [drivers]);

  // Compute real distance and ETA from driver position to pickup landmark.
  const { distanceKm, etaMinutes } = useMemo(() => {
    if (!assignedDriver || !w.landmarkId) return { distanceKm: null, etaMinutes: null };
    const pickupLm = landmarks.find(l => l.id === w.landmarkId);
    if (!pickupLm) return { distanceKm: null, etaMinutes: null };
    const dLat = pickupLm.lat - assignedDriver.lat;
    const dLng = pickupLm.lng - assignedDriver.lng;
    const km = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 111 * 10) / 10;
    return { distanceKm: km, etaMinutes: Math.max(5, Math.round((km / 25) * 60)) };
  }, [assignedDriver, w.landmarkId]);

  if (phase === "dispatching" || !assignedDriver) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <div className="font-display text-lg text-ink-900">IA dispatch en cours…</div>
        <div className="text-sm text-ink-500">Recherche du livreur optimal · score Haversine composite</div>
      </div>
    );
  }

  async function handleConfirm() {
    if (submitting) return;
    setSubmitting(true);

    // RLS guarantees merchants[0] is always the current user's merchant.
    const merchantId = merchants[0]?.id;

    try {
      await addOrder({
        id: orderId,
        driverId: assignedDriver!.id,
        merchantId,
        landmarkId: w.landmarkId ?? "",
        clientName: w.clientName,
        clientPhone: w.clientPhone,
        amount: w.amount,
        paymentMethod: w.paymentMethod!,
        insurance: w.insurance,
        status: "assignée",
        createdAt: new Date().toISOString(),
        active: true,
      });

      // Save client to recent clients (LIFO, max 5)
      try {
        const landmarkObj = w.landmarkId
          ? landmarks.find(l => l.id === w.landmarkId) ?? null
          : null;
        const newEntry = {
          name: w.clientName,
          phone: w.clientPhone,
          landmarkId: w.landmarkId ?? "",
          landmarkName: landmarkObj?.name ?? "",
        };
        const raw = localStorage.getItem("yonne_recent_clients");
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        const existing = Array.isArray(parsed) ? parsed.filter(isRecentEntry) : [];
        const deduped = existing.filter(c => c.phone !== newEntry.phone);
        localStorage.setItem("yonne_recent_clients", JSON.stringify([newEntry, ...deduped].slice(0, 5)));
      } catch { /* ignore storage errors */ }

      w.reset();
      router.push(`/merchant/commande/${orderId}`);
    } catch {
      toast.error("Impossible de créer la commande. Réessayez.");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 py-6">
      <div className="bg-white rounded-lg shadow-card border border-cream-200 p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="text-xs uppercase tracking-wider text-emerald-500 font-medium">Livreur assigné</div>
        <div className="mt-3 flex items-center gap-4">
          <Image src={avatarUrl(assignedDriver)} alt={assignedDriver.name} width={56} height={56} unoptimized className="rounded-full bg-cream-100" />
          <div className="flex-1">
            <div className="font-display font-bold text-ink-900 text-lg">{assignedDriver.name}</div>
            <div className="flex items-center gap-2 text-xs text-ink-500">
              <Star className="w-3 h-3 text-gold-500 fill-gold-500" /> {assignedDriver.rating.toFixed(1)} · {assignedDriver.vehicle}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-cream-200">
          <Stat label="Distance" value={distanceKm !== null ? `${distanceKm} km` : "—"} />
          <Stat label="ETA" value={etaMinutes !== null ? `${etaMinutes} min` : "—"} />
          <Stat label="Score IA" value={`${assignedDriver.scoreIA}`} />
        </div>
      </div>

      <Button
        size="lg"
        className="w-full bg-gold-500 hover:bg-gold-600 text-ink-900 font-display font-bold shadow-glow disabled:opacity-60"
        onClick={handleConfirm}
        disabled={submitting}
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        {submitting ? "Création…" : "Voir le suivi"}
      </Button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-ink-500 uppercase tracking-wider">{label}</div>
      <div className="font-display font-bold text-ink-900 tabular-nums mt-0.5">{value}</div>
    </div>
  );
}
