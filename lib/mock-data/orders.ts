// lib/mock-data/orders.ts
import { drivers } from "./drivers";
import { landmarks } from "./landmarks";

export type OrderStatus   = "créée" | "assignée" | "collecte" | "en route" | "livrée" | "annulée";
export type PaymentMethod = "wave" | "orange" | "cash";
export type PaymentStatus = "pending" | "received_manually" | "failed";

export interface Order {
  id: string;
  driverId: string;
  merchantId?: string;
  landmarkId: string;
  clientName: string;
  clientPhone: string;
  amount: number;          // FCFA
  paymentMethod: PaymentMethod;
  insurance: boolean;
  status: OrderStatus;
  paymentStatus?: PaymentStatus; // undefined for legacy/mock rows
  createdAt: string;       // ISO string
  active: boolean;         // shown on live map
}

const clientFirstNames = ["Awa","Moussa","Mariama","Pape","Khady","Cheikh","Fatou","Ibrahima","Aminata","Modou"];
const clientLastNames  = ["Diop","Sow","Mbaye","Cissé","Ndiaye","Sarr","Diouf","Fall","Ba","Niang"];
const statuses: OrderStatus[] = ["créée","assignée","collecte","en route","livrée"];
const methods: PaymentMethod[] = ["wave","orange","cash"];

function r(seed: number, min: number, max: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return min + (max - min) * (x - Math.floor(x));
}
function pick<T>(arr: T[], seed: number) { return arr[Math.floor(r(seed, 0, arr.length))]; }

const baseDate = new Date("2026-05-20T08:00:00+00:00");  // demo "today"

export const orders: Order[] = Array.from({ length: 147 }, (_, i) => {
  const driver = drivers[Math.floor(r(i + 11, 0, drivers.length))];
  const landmark = landmarks[Math.floor(r(i + 17, 0, landmarks.length))];
  const status = i < 12 ? statuses[Math.floor(r(i + 23, 1, 4))] : pick(statuses, i + 29);
  const minutesOffset = Math.floor(r(i + 31, 0, 600));
  return {
    id: `YN-2026-${String(10000 + i)}`,
    driverId: driver.id,
    landmarkId: landmark.id,
    clientName: `${pick(clientFirstNames, i + 41)} ${pick(clientLastNames, i + 43)}`,
    clientPhone: `+221 7${Math.random() < 0.5 ? "7" : "8"} ${String(Math.floor(r(i + 47, 100, 999)))} ${String(Math.floor(r(i + 53, 1000, 9999)))}`,
    amount: Math.floor(r(i + 59, 3500, 28000) / 100) * 100,
    paymentMethod: pick(methods, i + 61),
    insurance: r(i + 67, 0, 1) > 0.7,
    status,
    createdAt: new Date(baseDate.getTime() + minutesOffset * 60_000).toISOString(),
    active: i < 12,
  };
});

export const activeOrders = orders.filter(o => o.active);
