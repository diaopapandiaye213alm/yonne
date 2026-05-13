"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, UserPlus, Bike, Phone, MapPin, Star } from "lucide-react";

type VehicleType = "moto" | "vélo" | "voiture" | "tricycle";

interface DriverForm {
  name: string;
  phone: string;
  vehicle: VehicleType;
  zone: string;
  nationalId: string;
  waveNumber: string;
  notes: string;
}

const ZONES = [
  "Plateau", "Medina", "Yoff", "Almadies", "Ngor", "Ouakam",
  "Mermoz", "Sacré-Cœur", "Point E", "Fann", "Liberté", "Parcelles",
  "Pikine", "Guédiawaye", "Rufisque",
];

const VEHICLE_LABELS: Record<VehicleType, string> = {
  moto:      "Moto",
  vélo:      "Vélo",
  voiture:   "Voiture",
  tricycle:  "Tricycle",
};

const EMPTY: DriverForm = {
  name: "", phone: "", vehicle: "moto", zone: ZONES[0],
  nationalId: "", waveNumber: "", notes: "",
};

export default function NouveauLivreurPage() {
  const router = useRouter();
  const [form, setForm] = useState<DriverForm>(EMPTY);
  const [errors, setErrors] = useState<Partial<DriverForm>>({});
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof DriverForm>(key: K, value: DriverForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<DriverForm> = {};
    if (!form.name.trim())       e.name       = "Nom requis";
    if (!form.phone.trim())      e.phone      = "Téléphone requis";
    if (!form.nationalId.trim()) e.nationalId = "CNI requis";
    if (!form.waveNumber.trim()) e.waveNumber = "Numéro Wave requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      toast.success(`Livreur ${form.name} enregistré avec succès`);
      router.push("/admin/livreurs");
    }, 800);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <Link href="/admin/livreurs"
          className="p-2 rounded-lg hover:bg-cream-100 text-ink-500 hover:text-ink-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-display font-bold text-ink-900">Nouveau livreur</h1>
          <p className="text-sm text-ink-500">Onboarding · Remplissez toutes les informations requises</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Identité */}
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5 space-y-4">
          <h2 className="font-semibold text-ink-900 flex items-center gap-2">
            <Star className="w-4 h-4 text-gold-500" /> Identité
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-ink-500 mb-1 block">Nom complet *</label>
              <input
                value={form.name}
                onChange={e => set("name", e.target.value)}
                placeholder="Prénom Nom"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 ${
                  errors.name ? "border-red-400" : "border-cream-200"
                }`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-xs text-ink-500 mb-1 block">CNI / Passeport *</label>
              <input
                value={form.nationalId}
                onChange={e => set("nationalId", e.target.value)}
                placeholder="1 234 567 89012 34"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 ${
                  errors.nationalId ? "border-red-400" : "border-cream-200"
                }`}
              />
              {errors.nationalId && <p className="text-xs text-red-500 mt-1">{errors.nationalId}</p>}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5 space-y-4">
          <h2 className="font-semibold text-ink-900 flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-500" /> Contact & Paiement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-ink-500 mb-1 block">Téléphone *</label>
              <input
                value={form.phone}
                onChange={e => set("phone", e.target.value)}
                placeholder="+221 77 000 00 00"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 ${
                  errors.phone ? "border-red-400" : "border-cream-200"
                }`}
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="text-xs text-ink-500 mb-1 block">Numéro Wave *</label>
              <input
                value={form.waveNumber}
                onChange={e => set("waveNumber", e.target.value)}
                placeholder="+221 77 000 00 00"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 ${
                  errors.waveNumber ? "border-red-400" : "border-cream-200"
                }`}
              />
              {errors.waveNumber && <p className="text-xs text-red-500 mt-1">{errors.waveNumber}</p>}
            </div>
          </div>
        </div>

        {/* Véhicule & Zone */}
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5 space-y-4">
          <h2 className="font-semibold text-ink-900 flex items-center gap-2">
            <Bike className="w-4 h-4 text-emerald-500" /> Véhicule & Zone
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-ink-500 mb-1 block">Type de véhicule</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(VEHICLE_LABELS) as VehicleType[]).map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => set("vehicle", v)}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      form.vehicle === v
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                        : "border-cream-200 text-ink-600 hover:border-emerald-300"
                    }`}
                  >
                    {VEHICLE_LABELS[v]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-ink-500 mb-1 block">Zone principale</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <select
                  value={form.zone}
                  onChange={e => set("zone", e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-cream-200 rounded-lg text-sm focus:outline-none focus:border-emerald-400 bg-white"
                >
                  {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5 space-y-3">
          <h2 className="font-semibold text-ink-900">Notes internes</h2>
          <textarea
            value={form.notes}
            onChange={e => set("notes", e.target.value)}
            placeholder="Observations, recommandations…"
            rows={3}
            className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 resize-none"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/livreurs"
            className="px-5 py-2.5 rounded-lg border border-cream-200 text-sm text-ink-600 hover:bg-cream-50 transition-colors">
            Annuler
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-display font-bold transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            {submitting ? "Enregistrement…" : "Créer le livreur"}
          </button>
        </div>
      </form>
    </div>
  );
}
