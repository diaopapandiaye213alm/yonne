/**
 * Moteur de simulation temps réel YONNE
 * Crée des commandes, fait progresser les statuts, déplace les livreurs.
 * Toutes les mutations passent par les stores existants → Supabase Realtime
 * propage les changements à tous les onglets connectés.
 */

import { toast } from "sonner";
import { useOrdersStore } from "@/lib/store/orders";
import { useDriversStore } from "@/lib/store/drivers";
import { useMerchantsStore } from "@/lib/store/merchants";
import { landmarks } from "@/lib/mock-data/landmarks";
import type { Order, OrderStatus } from "@/lib/mock-data/orders";

// ── Seeded PRNG (Mulberry32) — deterministic within a session ─────────────
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
// Seed from module load timestamp — varies per session, deterministic within it.
const rng = new Prng(Date.now() & 0xffffffff);

// ── Noms sénégalais réalistes ──────────────────────────────────────────────
const FIRST = ["Moussa", "Ibrahima", "Fatou", "Aminata", "Ousmane", "Cheikh",
               "Awa", "Mariama", "Lamine", "Assane", "Aissatou", "Khadija",
               "Modou", "Serigne", "Rokhaya", "Dieynaba", "Babacar", "Pape"];
const LAST  = ["Diallo", "Fall", "Sow", "Ndiaye", "Ba", "Mbaye",
               "Diop", "Sarr", "Sy", "Gueye", "Kane", "Thiam", "Faye", "Dème"];
const METHODS: Order["paymentMethod"][] = ["wave", "orange", "cash", "cash", "wave"];

function pick<T>(arr: T[]): T { return arr[Math.floor(rng.next() * arr.length)]; }
function randPhone() { return `+22177${Math.floor(1000000 + rng.next() * 8999999)}`; }
function randAmount() { return (Math.floor(rng.next() * 22) + 3) * 500; } // 1500–12500 F

// ── Types internes ──────────────────────────────────────────────────────────
interface PendingAdvance {
  orderId: string;
  nextStatus: OrderStatus;
  at: number; // timestamp ms
}

interface DriverMovement {
  driverId: string;
  fromLat: number; fromLng: number;
  toLat: number;   toLng: number;
  startedAt: number;
  durationMs: number;
}

// ── Engine (singleton) ─────────────────────────────────────────────────────
class SimulationEngine {
  private startTimer:  ReturnType<typeof setTimeout>  | null = null;
  private orderTimer:  ReturnType<typeof setInterval> | null = null;
  private advTimer:    ReturnType<typeof setInterval> | null = null;
  private moveTimer:   ReturnType<typeof setInterval> | null = null;

  private pending: PendingAdvance[] = [];
  private movements = new Map<string, DriverMovement>();
  private orderSeq = 20000;

  speed = 1; // 1x · 2x · 5x
  running = false;

  // Callbacks pour mettre à jour le store UI
  private onStateChange?: (running: boolean, speed: number, count: number) => void;
  private ordersCreated = 0;

  setStateCallback(cb: (running: boolean, speed: number, count: number) => void) {
    this.onStateChange = cb;
  }

  start(speed = 1) {
    this.stop();
    this.speed = speed;
    this.running = true;

    const orderInterval = Math.max(8000, Math.floor(45000 / speed));
    const advanceCheck  = Math.max(1000, Math.floor(3000 / speed));

    // Créer une commande immédiatement puis à intervalle
    this.startTimer = setTimeout(() => { this.startTimer = null; this.createOrder(); }, 1500);
    this.orderTimer = setInterval(() => this.createOrder(), orderInterval);

    // Vérifier les statuts à avancer
    this.advTimer = setInterval(() => this.advancePending(), advanceCheck);

    // Déplacer les livreurs toutes les 1.5s
    this.moveTimer = setInterval(() => this.moveDrivers(), 1500);

    this.notify();
  }

  stop() {
    if (this.startTimer) { clearTimeout(this.startTimer); this.startTimer = null; }
    if (this.orderTimer) clearInterval(this.orderTimer);
    if (this.advTimer)   clearInterval(this.advTimer);
    if (this.moveTimer)  clearInterval(this.moveTimer);
    this.orderTimer = this.advTimer = this.moveTimer = null;
    this.running = false;
    this.notify();
  }

  setSpeed(speed: number) {
    this.speed = speed;
    if (this.running) this.start(speed);
    else this.notify();
  }

  private notify() {
    this.onStateChange?.(this.running, this.speed, this.ordersCreated);
  }

  // ── Création d'une nouvelle commande ──────────────────────────────────────
  private async createOrder() {
    const { drivers } = useDriversStore.getState();
    const { merchants } = useMerchantsStore.getState();
    const { addOrder } = useOrdersStore.getState();

    const online = drivers.filter(d => d.online && !d.inPrayer);
    if (online.length === 0) return;

    // 40% de chance de cibler le livreur actuellement connecté
    let driver = pick(online);
    if (this.activeDriverId && rng.next() < 0.4) {
      const target = online.find(d => d.id === this.activeDriverId);
      if (target) driver = target;
    }
    const merchant = merchants.length > 0 ? pick(merchants) : null;
    const landmark = pick(landmarks);
    const clientName = `${pick(FIRST)} ${pick(LAST)}`;
    const amount   = randAmount();
    const orderId  = `YN-${new Date().getFullYear()}-${this.orderSeq++}`;

    const order: Order = {
      id:            orderId,
      driverId:      driver.id,
      merchantId:    merchant?.id,
      landmarkId:    landmark.id,
      clientName,
      clientPhone:   randPhone(),
      amount,
      paymentMethod: pick(METHODS),
      insurance:     rng.next() > 0.65,
      status:        "créée",
      active:        true,
      createdAt:     new Date().toISOString(),
    };

    await addOrder(order);
    this.ordersCreated++;
    this.notify();

    // Notification visible
    toast(`📦 ${orderId}`, {
      description: `${clientName} · ${amount.toLocaleString("fr-FR")} F · ${landmark.quartier}`,
      duration: 4000,
    });

    // Planifier la progression des statuts
    const base = Math.max(4000, Math.floor(18000 / this.speed));
    this.pending.push(
      { orderId, nextStatus: "assignée",  at: Date.now() + base },
      { orderId, nextStatus: "collecte",  at: Date.now() + base * 2.5 },
      { orderId, nextStatus: "en route",  at: Date.now() + base * 4 },
      { orderId, nextStatus: "livrée",    at: Date.now() + base * 7 },
    );
  }

  // ── Avancement des statuts ─────────────────────────────────────────────────
  private async advancePending() {
    const now = Date.now();
    const ready = this.pending.filter(p => p.at <= now);
    this.pending  = this.pending.filter(p => p.at > now);

    for (const item of ready) {
      await this.advance(item.orderId, item.nextStatus);
    }
  }

  private async advance(orderId: string, status: OrderStatus) {
    const { orders, updateStatus } = useOrdersStore.getState();
    const order = orders.find(o => o.id === orderId);

    // Ne pas avancer si déjà terminée ou annulée
    if (!order || order.status === "livrée" || order.status === "annulée") return;

    await updateStatus(orderId, status);

    // Démarrer le mouvement du livreur
    if (status === "collecte" || status === "en route") {
      this.startDriverMovement(order.driverId, order.landmarkId);
    }

    if (status === "en route") {
      toast(`🛵 En route — ${orderId}`, {
        description: `${order.clientName}`,
        duration: 2500,
      });
    }

    if (status === "livrée") {
      toast.success(`✅ Livré — ${orderId}`, {
        description: `+${order.amount.toLocaleString("fr-FR")} F`,
        duration: 3500,
      });
      this.movements.delete(order.driverId);
    }
  }

  // ── Mouvement des livreurs ─────────────────────────────────────────────────
  private startDriverMovement(driverId: string, landmarkId: string) {
    const { drivers } = useDriversStore.getState();
    const driver = drivers.find(d => d.id === driverId);
    const lm     = landmarks.find(l => l.id === landmarkId);
    if (!driver || !lm) return;

    // Destination : landmark ± petit décalage réaliste
    const jitter = () => (rng.next() - 0.5) * 0.008;
    this.movements.set(driverId, {
      driverId,
      fromLat: driver.lat, fromLng: driver.lng,
      toLat:   lm.lat + jitter(), toLng: lm.lng + jitter(),
      startedAt:  Date.now(),
      durationMs: Math.max(8000, Math.floor(35000 / this.speed)),
    });
  }

  private moveDrivers() {
    if (this.movements.size === 0) return;
    const now = Date.now();
    const updates: { id: string; lat: number; lng: number }[] = [];

    for (const [driverId, mov] of Array.from(this.movements.entries())) {
      const t = Math.min(1, (now - mov.startedAt) / mov.durationMs);
      // Interpolation avec accélération douce (ease-in-out)
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      updates.push({
        id:  driverId,
        lat: mov.fromLat + (mov.toLat - mov.fromLat) * ease,
        lng: mov.fromLng + (mov.toLng - mov.fromLng) * ease,
      });
      if (t >= 1) this.movements.delete(driverId);
    }

    // Mise à jour locale uniquement (pas Supabase pour éviter le spam)
    useDriversStore.setState(s => ({
      drivers: s.drivers.map(d => {
        const u = updates.find(x => x.id === d.id);
        return u ? { ...d, lat: u.lat, lng: u.lng } : d;
      }),
    }));
  }

  // Enregistrer le livreur actif (page carte) pour cibler 40% des commandes
  private activeDriverId: string | null = null;

  registerActiveDriver(id: string | null) {
    this.activeDriverId = id;
  }
}

export const simulationEngine = new SimulationEngine();
