"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Code2, Copy, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";

type WebhookStatus = "actif" | "erreur" | "inactif";
type Webhook = { id: string; url: string; event: string; status: WebhookStatus; lastCall: string };

const ENDPOINTS = [
  { method: "GET",    path: "/v1/orders",              desc: "Liste toutes les commandes",       auth: true  },
  { method: "POST",   path: "/v1/orders",              desc: "Crée une nouvelle commande",       auth: true  },
  { method: "GET",    path: "/v1/orders/:id",          desc: "Détail d'une commande",            auth: true  },
  { method: "PATCH",  path: "/v1/orders/:id/status",   desc: "Met à jour le statut",             auth: true  },
  { method: "GET",    path: "/v1/drivers",             desc: "Liste les livreurs actifs",        auth: true  },
  { method: "GET",    path: "/v1/tracking/:ref",       desc: "Tracking public sans auth",        auth: false },
  { method: "POST",   path: "/v1/webhooks",            desc: "Enregistre un webhook",            auth: true  },
  { method: "GET",    path: "/v1/analytics/summary",   desc: "KPIs journaliers",                 auth: true  },
];

const METHOD_COLORS: Record<string, string> = {
  GET:    "bg-blue-100 text-blue-700",
  POST:   "bg-emerald-100 text-emerald-700",
  PATCH:  "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
};

const WEBHOOKS_INIT: Webhook[] = [
  { id: "WH-001", url: "https://shop.dakar.sn/hooks/yonne",       event: "order.delivered", status: "actif",   lastCall: "il y a 2 min" },
  { id: "WH-002", url: "https://erp.textiles.sn/delivery",        event: "order.collected", status: "erreur",  lastCall: "il y a 8 min" },
  { id: "WH-003", url: "https://notif.api.sn/webhook",            event: "order.created",   status: "actif",   lastCall: "il y a 1 min" },
  { id: "WH-004", url: "https://analytics.partner.sn/events",     event: "driver.online",   status: "inactif", lastCall: "il y a 2h" },
];

const STATUS_ICON: Record<WebhookStatus, React.ReactNode> = {
  actif:   <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  erreur:  <XCircle      className="w-4 h-4 text-red-500" />,
  inactif: <Clock        className="w-4 h-4 text-ink-300" />,
};

const STATUS_BADGE: Record<WebhookStatus, string> = {
  actif:   "bg-emerald-50 text-emerald-600",
  erreur:  "bg-red-50 text-red-600",
  inactif: "bg-cream-100 text-ink-400",
};

const API_KEY = "yn_live_sk_Dakar2026_xJ8mPqR3tLvNzKwY";
const BASE_URL = "https://api.yonne.sn";

export default function ApiPage() {
  const [keyVisible, setKeyVisible]   = useState(false);
  const [webhooks, setWebhooks]       = useState<Webhook[]>(WEBHOOKS_INIT);
  const [newUrl, setNewUrl]           = useState("");
  const [newEvent, setNewEvent]       = useState("order.delivered");
  const [showWHForm, setShowWHForm]   = useState(false);

  function copyKey() {
    navigator.clipboard.writeText(API_KEY).catch(() => {});
    toast.success("Clé API copiée");
  }

  function regenerate() {
    toast.success("Nouvelle clé API générée · L'ancienne est invalidée dans 24h");
  }

  function retryWebhook(id: string) {
    setWebhooks(prev => prev.map(w => w.id === id ? { ...w, status: "actif", lastCall: "à l'instant" } : w));
    toast.success(`Webhook ${id} relancé avec succès`);
  }

  function addWebhook() {
    if (!newUrl.trim()) { toast.error("URL requise"); return; }
    setWebhooks(prev => [...prev, {
      id:       `WH-00${prev.length + 1}`,
      url:      newUrl,
      event:    newEvent,
      status:   "actif",
      lastCall: "jamais",
    }]);
    setNewUrl("");
    setShowWHForm(false);
    toast.success("Webhook enregistré");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      <h1 className="text-2xl font-display font-bold text-ink-900">API & Webhooks</h1>

      {/* API Key */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card p-5">
        <h2 className="font-semibold text-ink-900 mb-4">Clé API</h2>
        <div className="flex items-center gap-3">
          <div className="flex-1 font-mono text-sm bg-cream-50 border border-cream-200 rounded-lg px-4 py-3 text-ink-700 overflow-x-auto">
            {keyVisible ? API_KEY : "yn_live_sk_••••••••••••••••••••••••"}
          </div>
          <button type="button" onClick={() => setKeyVisible(v => !v)}
            className="px-3 py-2.5 border border-cream-200 rounded-lg text-sm text-ink-600 hover:bg-cream-50 transition-colors shrink-0">
            {keyVisible ? "Masquer" : "Afficher"}
          </button>
          <button type="button" onClick={copyKey}
            className="p-2.5 border border-cream-200 rounded-lg text-ink-500 hover:bg-cream-50 transition-colors shrink-0">
            <Copy className="w-4 h-4" />
          </button>
          <button type="button" onClick={regenerate}
            className="p-2.5 border border-cream-200 rounded-lg text-ink-500 hover:bg-cream-50 transition-colors shrink-0">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-ink-400 mt-2">Base URL : <span className="font-mono">{BASE_URL}</span> · Authentification : header <span className="font-mono">Authorization: Bearer &lt;key&gt;</span></p>
      </div>

      {/* Endpoints */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card">
        <div className="px-5 py-4 border-b border-cream-100 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-ink-500" />
          <h2 className="font-semibold text-ink-900 text-sm">Endpoints disponibles</h2>
        </div>
        <div className="divide-y divide-cream-100">
          {ENDPOINTS.map(ep => (
            <div key={`${ep.method}${ep.path}`} className="flex items-center gap-4 px-5 py-3">
              <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded shrink-0 ${METHOD_COLORS[ep.method]}`}>{ep.method}</span>
              <span className="font-mono text-sm text-ink-900 flex-1">{ep.path}</span>
              <span className="text-xs text-ink-500 flex-1 hidden md:block">{ep.desc}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${ep.auth ? "bg-amber-50 text-amber-600" : "bg-cream-100 text-ink-400"}`}>
                {ep.auth ? "Auth" : "Public"}
              </span>
              <button type="button" onClick={() => { navigator.clipboard.writeText(`${BASE_URL}${ep.path}`).catch(() => {}); toast.success("URL copiée"); }}
                className="p-1.5 hover:bg-cream-100 rounded text-ink-300 hover:text-ink-600 transition-colors shrink-0">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Webhooks */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card">
        <div className="px-5 py-4 border-b border-cream-100 flex items-center justify-between">
          <h2 className="font-semibold text-ink-900 text-sm">Webhooks enregistrés</h2>
          <button type="button" onClick={() => setShowWHForm(v => !v)}
            className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
            + Ajouter
          </button>
        </div>

        {showWHForm && (
          <div className="px-5 py-4 border-b border-cream-100 bg-cream-50 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-48">
              <label className="text-xs text-ink-500 font-medium mb-1 block">URL</label>
              <input value={newUrl} onChange={e => setNewUrl(e.target.value)}
                placeholder="https://votre-app.sn/webhook"
                className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" />
            </div>
            <div>
              <label className="text-xs text-ink-500 font-medium mb-1 block">Événement</label>
              <select value={newEvent} onChange={e => setNewEvent(e.target.value)}
                className="border border-cream-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {["order.created","order.collected","order.delivered","driver.online","driver.offline"].map(ev => (
                  <option key={ev}>{ev}</option>
                ))}
              </select>
            </div>
            <button type="button" onClick={addWebhook}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Enregistrer
            </button>
          </div>
        )}

        <div className="divide-y divide-cream-100">
          {webhooks.map(w => (
            <div key={w.id} className="flex items-center gap-4 px-5 py-3">
              {STATUS_ICON[w.status]}
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs text-ink-700 truncate">{w.url}</div>
                <div className="text-xs text-ink-400 mt-0.5">{w.event} · {w.lastCall}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_BADGE[w.status]}`}>{w.status}</span>
              {w.status === "erreur" && (
                <button type="button" onClick={() => retryWebhook(w.id)}
                  className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded-lg font-medium transition-colors shrink-0">
                  Relancer
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Rate limits */}
      <div className="bg-cream-50 border border-cream-200 rounded-lg p-4 text-sm text-ink-600 space-y-1">
        <p className="font-semibold text-ink-900 text-xs uppercase tracking-wide mb-2">Rate limits</p>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div><span className="font-mono font-bold">500</span> req/min — endpoints lecture</div>
          <div><span className="font-mono font-bold">100</span> req/min — endpoints écriture</div>
          <div><span className="font-mono font-bold">10</span> webhooks max par compte</div>
        </div>
      </div>
    </div>
  );
}
