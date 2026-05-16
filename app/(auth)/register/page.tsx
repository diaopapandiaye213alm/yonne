"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, Bike, Eye, EyeOff, Loader2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

type Role = "merchant" | "driver";

const CITIES = [
  "Dakar", "Rufisque", "Bargny", "Diamniadio",
  "Thiès", "Mbour", "Saly", "Tivaouane",
  "Saint-Louis", "Richard Toll",
  "Touba", "Mbacké", "Diourbel",
  "Kaolack", "Fatick", "Kaffrine",
  "Louga", "Matam", "Podor",
  "Tambacounda", "Kédougou",
  "Ziguinchor", "Kolda", "Sédhiou",
] as const;
const VEHICLES  = ["Moto Yamaha", "Moto TVS", "Vélo électrique", "Tricycle"] as const;

export default function RegisterPage() {
  const router = useRouter();

  const [step,       setStep]       = useState<1 | 2>(1);
  const [role,       setRole]       = useState<Role | null>(null);
  const [name,       setName]       = useState("");
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [showPwd,    setShowPwd]    = useState(false);
  const [phone,      setPhone]      = useState("");
  const [city,       setCity]       = useState<string>("Dakar");
  const [vehicle,    setVehicle]    = useState<string>("Moto Yamaha");
  const [loading,    setLoading]    = useState(false);

  function selectRole(r: Role) {
    setRole(r);
    setStep(2);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          name:    name.trim(),
          email:   email.trim(),
          password,
          phone:   phone.trim(),
          city:    role === "merchant" ? city : undefined,
          vehicle: role === "driver"   ? vehicle : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Une erreur est survenue");
        return;
      }
      router.push(data.redirectUrl ?? "/");
    } catch {
      toast.error("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-emerald-900 text-white p-10">
        <Wordmark size="lg" variant="dark" />
        <div className="space-y-4">
          <h1 className="text-4xl font-display font-bold leading-tight">
            Rejoignez YONNE,<br />la livraison<br />intelligente 🇸🇳
          </h1>
          <p className="text-emerald-200 text-lg">
            Commerçants et livreurs du Sénégal, rejoignez la plateforme qui comprend votre marché.
          </p>
        </div>
        <p className="text-emerald-400 text-sm">© 2026 YONNE · Sénégal</p>
      </div>

      <div className="flex items-center justify-center p-8 bg-cream-50">
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="lg:hidden text-center mb-8">
            <Wordmark size="xl" />
          </div>

          {step === 1 && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-display font-bold text-ink-900">Créer un compte</h1>
                <p className="text-ink-500 text-sm mt-1">Qui êtes-vous ?</p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => selectRole("merchant")}
                  className="w-full flex items-center gap-4 p-5 rounded-xl border-2 border-emerald-200 bg-emerald-50/60 hover:border-emerald-400 hover:bg-emerald-50 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Store className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-ink-900">Je suis commerçant</p>
                    <p className="text-sm text-ink-500">Gérez vos commandes et livraisons</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => selectRole("driver")}
                  className="w-full flex items-center gap-4 p-5 rounded-xl border-2 border-gold-200 bg-gold-50/60 hover:border-gold-400 hover:bg-gold-50 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center shrink-0">
                    <Bike className="w-6 h-6 text-gold-600" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-ink-900">Je suis livreur</p>
                    <p className="text-sm text-ink-500">Livrez et gagnez à votre rythme</p>
                  </div>
                </button>
              </div>

              <p className="text-center text-sm text-ink-500 mt-6">
                Déjà inscrit ?{" "}
                <Link href="/login" className="text-emerald-600 font-semibold hover:underline">
                  Se connecter
                </Link>
              </p>
            </>
          )}

          {step === 2 && role && (
            <>
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700 mb-4 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Retour
                </button>
                <h1 className="text-2xl font-display font-bold text-ink-900">Créer mon compte</h1>
                <p className="text-ink-500 text-sm mt-1">
                  {role === "merchant" ? "Compte commerçant" : "Compte livreur"}
                </p>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Mamadou Diallo"
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="vous@example.com"
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPwd ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 8 caractères"
                      required
                      minLength={8}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-ink-500 text-sm h-11">
                      +221
                    </span>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="77 000 00 00"
                      required
                      className="h-11 rounded-l-none"
                    />
                  </div>
                </div>

                {role === "merchant" && (
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <select
                      id="city"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {CITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                )}

                {role === "driver" && (
                  <div className="space-y-2">
                    <Label htmlFor="vehicle">Véhicule</Label>
                    <select
                      id="vehicle"
                      value={vehicle}
                      onChange={e => setVehicle(e.target.value)}
                      className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {VEHICLES.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 shadow-glow-emerald font-display font-bold text-base"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Création en cours…
                    </span>
                  ) : "Créer mon compte"}
                </Button>
              </form>

              <p className="text-center text-sm text-ink-500 mt-6">
                Déjà inscrit ?{" "}
                <Link href="/login" className="text-emerald-600 font-semibold hover:underline">
                  Se connecter
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
