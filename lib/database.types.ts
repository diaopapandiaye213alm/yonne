export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// ── Row types ────────────────────────────────────────────────

export interface DriverRow {
  id: string;
  name: string;
  avatar_seed: string | null;
  phone: string | null;
  vehicle: "Moto Yamaha" | "Moto TVS" | "Vélo électrique" | "Tricycle" | null;
  score_ia: number;
  rating: number;
  tier: "Bronze" | "Argent" | "Or" | null;
  badges: string[];
  orders_today: number;
  earnings_today: number;
  online: boolean;
  in_prayer: boolean;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export interface MerchantRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  plan: "Standard" | "Premium" | null;
  status: "actif" | "suspendu";
  orders_this_month: number;
  revenue_this_month: number;
  orders_last_month: number;
  revenue_last_month: number;
  joined_at: string | null;
  created_at: string;
}

export interface OrderRow {
  id: string;
  driver_id: string | null;
  merchant_id: string | null;
  landmark_id: string | null;
  client_name: string | null;
  client_phone: string | null;
  amount: number;
  payment_method: "wave" | "orange" | "cash" | null;
  insurance: boolean;
  status: "créée" | "assignée" | "collecte" | "en route" | "livrée";
  active: boolean;
  created_at: string;
}

export interface SavTicketRow {
  id: string;
  order_ref: string | null;
  type: string | null;
  description: string | null;
  status: "ouvert" | "en cours" | "résolu";
  responsable: string;
  delay: string;
  created_at: string;
}

export interface SavMessageRow {
  id: number;
  ticket_id: string | null;
  from_role: "client" | "admin";
  text: string;
  sent_at: string;
}

export interface CatalogueItemRow {
  id: string;
  merchant_id: string | null;
  name: string;
  price: number;
  category: "Nourriture" | "Textile" | "Électronique" | "Pharmacie" | "Autre";
  available: boolean;
  stock: number;
  created_at: string;
}

// ── Insert types ─────────────────────────────────────────────

export type DriverInsert   = Omit<DriverRow,   "created_at"> & { created_at?: string };
export type MerchantInsert = Omit<MerchantRow, "created_at"> & { created_at?: string };
export type OrderInsert    = Omit<OrderRow,    "created_at"> & { created_at?: string };
export type SavTicketInsert  = Omit<SavTicketRow,  "created_at" | "id"> & { id?: string; created_at?: string };
export type SavMessageInsert = Omit<SavMessageRow, "id" | "sent_at"> & { sent_at?: string };
export type CatalogueItemInsert = Omit<CatalogueItemRow, "created_at"> & { created_at?: string };

// ── Database type for createClient<Database> ─────────────────

export interface Database {
  public: {
    Tables: {
      drivers:          { Row: DriverRow;          Insert: DriverInsert;          Update: Partial<DriverInsert>;          Relationships: [] };
      merchants:        { Row: MerchantRow;        Insert: MerchantInsert;        Update: Partial<MerchantInsert>;        Relationships: [] };
      orders:           { Row: OrderRow;           Insert: OrderInsert;           Update: Partial<OrderInsert>;           Relationships: [] };
      sav_tickets:      { Row: SavTicketRow;       Insert: SavTicketInsert;       Update: Partial<SavTicketInsert>;       Relationships: [] };
      sav_messages:     { Row: SavMessageRow;      Insert: SavMessageInsert;      Update: Partial<SavMessageInsert>;      Relationships: [] };
      catalogue_items:  { Row: CatalogueItemRow;   Insert: CatalogueItemInsert;   Update: Partial<CatalogueItemInsert>;   Relationships: [] };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
  };
}
