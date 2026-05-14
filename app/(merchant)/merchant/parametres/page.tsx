"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useMerchantsStore } from "@/lib/store/merchants";
import { useSession } from "@/lib/hooks/useSession";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Download, Copy } from "lucide-react";

export default function ParametresPage() {
  const session = useSession();
  const { merchants, updateMerchant } = useMerchantsStore();
  const merchant = useMemo(() => {
    const byEmail = session?.email ? merchants.find(m => m.email === session.email) : null;
    return byEmail ?? merchants[0] ?? { id: "", name: "—", email: "", phone: "", city: "", plan: "Standard" as const };
  }, [merchants, session?.email]);
  const qrRef = useRef<SVGSVGElement>(null);
  const qrValue = `https://yonne.sn/m/${merchant.id}`;

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city,  setCity]  = useState("");

  useEffect(() => {
    setEmail(merchant.email);
    setPhone(merchant.phone);
    setCity(merchant.city);
  }, [merchant.email, merchant.phone, merchant.city]);

  const [whatsapp,   setWhatsapp]   = useState(true);
  const [sms,        setSms]        = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink-900">Paramètres</h1>
        <p className="text-sm text-ink-500 mt-1">Gérez votre compte et vos préférences</p>
      </div>

      {/* Profil boutique */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5 space-y-4">
        <h2 className="font-semibold text-ink-900">Profil boutique</h2>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name">Nom boutique</Label>
            <Input id="name" value={merchant.name} disabled className="bg-cream-50 opacity-60" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="city">Ville</Label>
            <Input id="city" value={city} onChange={e => setCity(e.target.value)} />
          </div>
        </div>
        <Button
          type="button"
          onClick={async () => {
            if (!merchant.id) return;
            await updateMerchant(merchant.id, { email, phone, city });
            toast.success("Profil enregistré");
          }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          Enregistrer
        </Button>
      </div>

      {/* Mon plan */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Mon plan</h2>
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-sm px-3 py-1 rounded-full font-bold border ${
            merchant.plan === "Premium"
              ? "bg-gold-500/20 border-gold-500/40 text-ink-900"
              : "bg-cream-100 border-cream-200 text-ink-700"
          }`}>
            {merchant.plan}
          </span>
        </div>
        <ul className="text-sm text-ink-700 space-y-1">
          {merchant.plan === "Premium" ? (
            <>
              <li>✓ Commandes illimitées</li>
              <li>✓ Commission 15%</li>
              <li>✓ Support prioritaire</li>
              <li>✓ Analytics avancés</li>
            </>
          ) : (
            <>
              <li>✓ Jusqu&apos;à 200 commandes/mois</li>
              <li>✓ Commission 12%</li>
              <li>✓ Support email</li>
            </>
          )}
        </ul>
      </div>

      {/* QR Code boutique */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="w-4 h-4 text-ink-700" />
          <h2 className="font-semibold text-ink-900">QR Code boutique</h2>
        </div>
        <p className="text-sm text-ink-500 mb-4">Partagez ce code avec vos clients pour qu&apos;ils puissent passer commande directement.</p>
        <div className="flex items-center gap-6">
          <div className="shrink-0 p-2 border border-cream-200 rounded-lg bg-white">
            <QRCodeSVG
              ref={qrRef}
              value={qrValue}
              size={96}
              bgColor="#ffffff"
              fgColor="#1a1a2e"
              level="M"
            />
          </div>
          <div className="flex-1 space-y-3">
            <div className="font-mono text-xs text-ink-600 bg-cream-50 rounded px-3 py-2 break-all">
              {qrValue}
            </div>
            <div className="flex gap-2">
              <button type="button"
                onClick={() => { navigator.clipboard.writeText(qrValue).catch(() => {}); toast.success("Lien copié"); }}
                className="flex items-center gap-1.5 text-xs border border-cream-200 text-ink-600 hover:bg-cream-50 px-3 py-1.5 rounded-lg transition-colors">
                <Copy className="w-3.5 h-3.5" /> Copier le lien
              </button>
              <button type="button"
                onClick={() => {
                  const svg = qrRef.current;
                  if (!svg) return;
                  const data = new XMLSerializer().serializeToString(svg);
                  const blob = new Blob([data], { type: "image/svg+xml" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url; a.download = `qr-yonne-${merchant.id}.svg`; a.click();
                  URL.revokeObjectURL(url);
                  toast.success("QR Code téléchargé (SVG)");
                }}
                className="flex items-center gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">
                <Download className="w-3.5 h-3.5" /> Télécharger
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5 space-y-4">
        <h2 className="font-semibold text-ink-900">Notifications</h2>
        <div className="space-y-4">
          {[
            { id: "wa",    label: "WhatsApp", checked: whatsapp,   onCheckedChange: setWhatsapp },
            { id: "sms",   label: "SMS",       checked: sms,        onCheckedChange: setSms },
            { id: "email", label: "Email",     checked: emailNotif, onCheckedChange: setEmailNotif },
          ].map(({ id, label, checked, onCheckedChange }) => (
            <div key={id} className="flex items-center justify-between">
              <Label htmlFor={id} className="text-sm text-ink-700 cursor-pointer">{label}</Label>
              <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
            </div>
          ))}
        </div>
        <Button
          type="button"
          onClick={() => toast.success("Notifications enregistrées")}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
