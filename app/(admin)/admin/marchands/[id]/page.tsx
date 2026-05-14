"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useMerchantsStore } from "@/lib/store/merchants";
import { useOrdersStore } from "@/lib/store/orders";
import { ArrowLeft, FileText, TrendingUp, TrendingDown, MessageSquare, Send, Download } from "lucide-react";
import { toast } from "sonner";

const PLAN_COLORS = {
  Standard: "bg-cream-200 text-ink-700",
  Premium:  "bg-gold-500/20 text-ink-900",
} as const;

const STATUS_COLORS = {
  actif:    "bg-emerald-500/15 text-emerald-700",
  suspendu: "bg-red-100 text-red-600",
} as const;

const INIT_CHAT = [
  { from: "merchant", text: "Bonjour, mes commandes n'apparaissent pas aujourd'hui." },
  { from: "admin",    text: "Nous regardons ça, une mise à jour est en cours." },
  { from: "merchant", text: "D'accord, merci pour la réactivité." },
];

export default function MarchandDetailPage({ params }: { params: { id: string } }) {
  const { merchants } = useMerchantsStore();
  const { orders }    = useOrdersStore();
  const merchant = merchants.find(m => m.id === params.id);
  const [chatMsg, setChatMsg] = useState("");
  const [chat,    setChat]    = useState(INIT_CHAT);

  if (merchants.length > 0 && !merchant) notFound();
  if (!merchant) return <div className="p-6 text-ink-500">Chargement…</div>;

  const recentOrders = orders.slice(0, 5);
  const commission   = merchant.plan === "Premium" ? 0.12 : 0.15;
  const commAmt      = Math.round(merchant.revenueThisMonth * commission);
  const revDiff      = merchant.revenueThisMonth - merchant.revenueLastMonth;
  const revGrowth    = merchant.revenueLastMonth > 0
    ? Math.round((revDiff / merchant.revenueLastMonth) * 100)
    : 0;

  const contractStart = new Date(merchant.joinedAt);
  const contractEnd   = new Date(contractStart);
  contractEnd.setFullYear(contractEnd.getFullYear() + 1);

  function sendChat() {
    const text = chatMsg.trim();
    if (!text) return;
    setChat(c => [...c, { from: "admin", text }]);
    setChatMsg("");
    setTimeout(() => {
      setChat(c => [...c, { from: "merchant", text: "Merci pour le retour !" }]);
    }, 1200);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/marchands" className="p-2 rounded-lg hover:bg-cream-100 text-ink-500 hover:text-ink-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-display font-bold text-ink-900">{merchant.name}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_COLORS[merchant.plan]}`}>{merchant.plan}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[merchant.status]}`}>{merchant.status}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-ink-500">ID marchand</div>
          <div className="font-mono text-sm text-emerald-600">{merchant.id}</div>
        </div>
      </div>

      {/* Info + Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5 space-y-3">
          <h2 className="font-semibold text-ink-900">Informations</h2>
          {[
            ["Email",       merchant.email],
            ["Téléphone",   merchant.phone],
            ["Ville",       merchant.city],
            ["Inscrit le",  new Date(merchant.joinedAt).toLocaleDateString("fr-FR")],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-ink-500">{k}</span>
              <span className="text-ink-900 font-medium">{v}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5 space-y-3">
          <h2 className="font-semibold text-ink-900">Performance ce mois</h2>
          <div className="text-3xl font-display font-bold text-ink-900 tabular-nums">
            {merchant.revenueThisMonth.toLocaleString("fr-FR")} F
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink-500">{merchant.ordersThisMonth} commandes</span>
            <span className={`flex items-center gap-1 text-xs font-medium ${revGrowth >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {revGrowth >= 0
                ? <TrendingUp className="w-3.5 h-3.5" />
                : <TrendingDown className="w-3.5 h-3.5" />}
              {revGrowth >= 0 ? "+" : ""}{revGrowth}% vs mois dernier
            </span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-cream-100">
            <span className="text-ink-500">Commission YONNE ({merchant.plan === "Premium" ? "12%" : "15%"})</span>
            <strong className="text-ink-900 tabular-nums">{commAmt.toLocaleString("fr-FR")} F</strong>
          </div>
          {merchant.plan === "Standard" && (
            <button type="button"
              onClick={() => toast.success("Demande Premium enregistrée — l'équipe YONNE va contacter ce commerçant")}
              className="w-full mt-1 bg-gold-500 text-white rounded-lg py-2 text-sm font-medium hover:bg-gold-600 transition-colors">
              Passer en Premium (15 000 F/mois)
            </button>
          )}
        </div>
      </div>

      {/* Mois dernier comparison */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Comparaison mensuelle</h2>
        <div className="grid grid-cols-2 gap-6">
          {[
            { label: "Mois en cours", rev: merchant.revenueThisMonth, orders: merchant.ordersThisMonth },
            { label: "Mois dernier",  rev: merchant.revenueLastMonth,  orders: merchant.ordersLastMonth },
          ].map(({ label, rev, orders: o }) => {
            const maxRev = Math.max(merchant.revenueThisMonth, merchant.revenueLastMonth);
            return (
              <div key={label}>
                <div className="text-xs text-ink-500 mb-1">{label}</div>
                <div className="text-lg font-display font-bold text-ink-900 tabular-nums">{rev.toLocaleString("fr-FR")} F</div>
                <div className="mt-2 h-2 bg-cream-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full transition-all"
                    style={{ width: `${Math.round((rev / maxRev) * 100)}%` }} />
                </div>
                <div className="text-xs text-ink-500 mt-1">{o} commandes</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QR Code */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">QR Code boutique</h2>
        <div className="flex items-center gap-6">
          <svg width="80" height="80" viewBox="0 0 80 80" className="border border-cream-200 rounded p-1 shrink-0">
            {[0,1,2,3,4,5,6].map(row => [0,1,2,3,4,5,6].map(col => {
              const corner = (row < 2 && col < 2) || (row < 2 && col > 4) || (row > 4 && col < 2);
              const dot = corner || ((row + col + parseInt(merchant.id.replace(/\D/g,""), 10)) % 3 === 0);
              return dot ? <rect key={`${row}-${col}`} x={col*11+2} y={row*11+2} width="9" height="9" fill="#3F2A1F" rx="1" /> : null;
            }))}
          </svg>
          <div>
            <p className="text-sm text-ink-700 mb-1">Les clients scannent ce QR pour commander directement.</p>
            <p className="text-xs text-ink-400 font-mono mb-3">yonne.sn/m/{merchant.id}</p>
            <button type="button" onClick={() => toast.success("QR code téléchargé")}
              className="flex items-center gap-1.5 text-sm text-emerald-600 border border-emerald-200 hover:border-emerald-400 px-3 py-1.5 rounded-lg transition-colors">
              <Download className="w-3.5 h-3.5" /> Télécharger (PNG)
            </button>
          </div>
        </div>
      </div>

      {/* Contract section */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-ink-500" /> Contrat YONNE
        </h2>
        <div className="space-y-3">
          {[
            ["Type de contrat", `Partenariat ${merchant.plan}`],
            ["Date de début",   contractStart.toLocaleDateString("fr-FR")],
            ["Date d'échéance", contractEnd.toLocaleDateString("fr-FR")],
            ["Commission",      `${(commission * 100).toFixed(0)}% sur chaque livraison`],
            ["Frais mensuels",  merchant.plan === "Premium" ? "15 000 F / mois" : "Inclus dans la commission"],
            ["Délai de paiement", "J+3 après chaque livraison confirmée"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm py-1.5 border-b border-cream-100 last:border-0">
              <span className="text-ink-500">{k}</span>
              <span className="text-ink-900 font-medium">{v}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <button type="button"
            onClick={() => toast.success("Contrat envoyé par email au marchand")}
            className="flex items-center gap-1.5 text-sm bg-emerald-500 text-white rounded-lg px-4 py-2 hover:bg-emerald-600 transition-colors">
            <Download className="w-4 h-4" /> Télécharger PDF
          </button>
          <button type="button"
            onClick={() => toast.success("Contrat envoyé pour renouvellement")}
            className="flex items-center gap-1.5 text-sm border border-cream-200 text-ink-700 rounded-lg px-4 py-2 hover:bg-cream-100 transition-colors">
            Renouveler
          </button>
        </div>
      </div>

      {/* Last orders */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">5 dernières commandes</h2>
        <div className="space-y-2">
          {recentOrders.map(o => (
            <Link key={o.id} href={`/admin/commandes/${o.id}`}
              className="flex justify-between py-2 border-b border-cream-100 last:border-0 hover:bg-cream-50 px-2 rounded text-sm transition-colors">
              <span className="font-mono text-xs text-emerald-500">{o.id}</span>
              <span className="text-ink-700">{o.clientName}</span>
              <span className="font-medium">{o.amount.toLocaleString("fr-FR")} F</span>
            </Link>
          ))}
        </div>
      </div>

      {/* SAV Chat */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-500" /> Chat SAV
        </h2>
        <div className="space-y-3 max-h-56 overflow-y-auto pr-1 mb-4">
          {chat.map((m, i) => (
            <div key={i} className={`flex ${m.from === "admin" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                m.from === "admin"
                  ? "bg-emerald-500 text-white rounded-br-none"
                  : "bg-cream-100 text-ink-900 rounded-bl-none"
              }`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={chatMsg} onChange={e => setChatMsg(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendChat()}
            placeholder="Envoyer un message au marchand…"
            className="flex-1 border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400" />
          <button type="button" onClick={sendChat}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-3 py-2 transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
