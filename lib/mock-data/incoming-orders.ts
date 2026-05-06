export type PaymentMethod = "wave" | "orange" | "cash";

export interface IncomingOrder {
  id: string;
  clientName: string;
  clientPhone: string;
  pickupLandmarkId: string;
  destLandmarkId: string;
  distanceKm: number;
  amount: number;
  paymentMethod: PaymentMethod;
}

export const incomingOrders: IncomingOrder[] = [
  {
    id: "INC-001",
    clientName: "Fatou Diallo",
    clientPhone: "+221 77 123 45 67",
    pickupLandmarkId: "lm-002",
    destLandmarkId: "lm-013",
    distanceKm: 3.8,
    amount: 8500,
    paymentMethod: "wave",
  },
  {
    id: "INC-002",
    clientName: "Moussa Ndiaye",
    clientPhone: "+221 76 234 56 78",
    pickupLandmarkId: "lm-007",
    destLandmarkId: "lm-004",
    distanceKm: 4.2,
    amount: 12000,
    paymentMethod: "orange",
  },
  {
    id: "INC-003",
    clientName: "Aïssatou Sow",
    clientPhone: "+221 70 345 67 89",
    pickupLandmarkId: "lm-003",
    destLandmarkId: "lm-011",
    distanceKm: 1.4,
    amount: 4000,
    paymentMethod: "cash",
  },
  {
    id: "INC-004",
    clientName: "Ibrahima Ba",
    clientPhone: "+221 78 456 78 90",
    pickupLandmarkId: "lm-010",
    destLandmarkId: "lm-017",
    distanceKm: 2.1,
    amount: 22000,
    paymentMethod: "wave",
  },
  {
    id: "INC-005",
    clientName: "Mariama Diop",
    clientPhone: "+221 77 567 89 01",
    pickupLandmarkId: "lm-023",
    destLandmarkId: "lm-008",
    distanceKm: 2.7,
    amount: 6500,
    paymentMethod: "orange",
  },
];
