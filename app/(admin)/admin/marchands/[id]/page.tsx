import { notFound } from "next/navigation";
import Link from "next/link";
import { merchants } from "@/lib/mock-data/merchants";
import { orders } from "@/lib/mock-data/orders";
import { ArrowLeft } from "lucide-react";

const PLAN_COLORS = { Standard: "bg-cream-200 text-ink-700", Premium: "bg-gold-500/20 text-ink-900" } as const;

export default function MarchandDetailPage({ params }: { params: { id: string } }) {
  const merchant = merchants.find(m => m.id === params.id);
  if (!merchant) notFound();

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/marchands" className="p-2 rounded-lg hover:bg-cream-100 text-ink-500 hover:text-ink-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-display font-bold text-ink-900">{merchant.name}</h1>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_COLORS[merchant.plan]}`}>{merchant.plan}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5 space-y-3">
          <h2 className="font-semibold text-ink-900">Informations</h2>
          {[
            ["Email",       merchant.email],
            ["Téléphone",   merchant.phone],
            ["Ville",       merchant.city],
            ["Inscrit le",  new Date(merchant.joinedAt).toLocaleDateString("fr-FR")],
            ["Statut",      merchant.status],
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
          <div className="text-sm text-ink-500">{merchant.ordersThisMonth} commandes</div>
          <div className="text-sm text-ink-500">
            Commission YONNE : <strong className="text-ink-900">
              {Math.round(merchant.revenueThisMonth * (merchant.plan === "Premium" ? 0.12 : 0.15)).toLocaleString("fr-FR")} F
            </strong>
            <span className="ml-1">({merchant.plan === "Premium" ? "12%" : "15%"})</span>
          </div>
          {merchant.plan === "Standard" && (
            <button className="w-full mt-2 bg-gold-500 text-white rounded-lg py-2 text-sm font-medium hover:bg-gold-600 transition-colors">
              Passer en Premium (15 000 F/mois)
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">QR Code boutique</h2>
        <div className="flex items-center gap-6">
          <svg width="80" height="80" viewBox="0 0 80 80" className="border border-cream-200 rounded p-1">
            {[0,1,2,3,4,5,6].map(r => [0,1,2,3,4,5,6].map(c => {
              const corner = (r < 2 && c < 2) || (r < 2 && c > 4) || (r > 4 && c < 2);
              const dot = corner || ((r + c + parseInt(merchant.id.replace(/\D/g,""),10)) % 3 === 0);
              return dot ? <rect key={`${r}-${c}`} x={c*11+2} y={r*11+2} width="9" height="9" fill="#3F2A1F" rx="1" /> : null;
            }))}
          </svg>
          <div>
            <p className="text-sm text-ink-700">Les clients scannent ce QR pour commander directement depuis WhatsApp.</p>
            <button className="mt-3 text-sm text-emerald-500 hover:underline">↓ Télécharger (PNG)</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">5 dernières commandes</h2>
        <div className="space-y-2">
          {recentOrders.map(o => (
            <Link key={o.id} href={`/admin/commandes/${o.id}`} className="flex justify-between py-2 border-b border-cream-100 last:border-0 hover:bg-cream-50 px-2 rounded text-sm transition-colors">
              <span className="font-mono text-xs text-emerald-500">{o.id}</span>
              <span className="text-ink-700">{o.clientName}</span>
              <span className="font-medium">{o.amount.toLocaleString("fr-FR")} F</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
