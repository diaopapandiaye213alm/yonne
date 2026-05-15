"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";
import { useMerchantsStore } from "@/lib/store/merchants";
import { useSession } from "@/lib/hooks/useSession";
import { useSupabaseAuthed } from "@/components/providers/SupabaseProvider";
import { Plus, Pencil, Trash2, X, Check, PackageSearch } from "lucide-react";

type Category = "Nourriture" | "Textile" | "Électronique" | "Pharmacie" | "Autre";

interface Article {
  id: string;
  name: string;
  price: number;
  category: Category;
  available: boolean;
  stock: number;
}

const CATEGORIES: Category[] = ["Nourriture", "Textile", "Électronique", "Pharmacie", "Autre"];

const CAT_COLORS: Record<Category, string> = {
  Nourriture:    "bg-emerald-100 text-emerald-700",
  Textile:       "bg-blue-100 text-blue-700",
  Électronique:  "bg-purple-100 text-purple-700",
  Pharmacie:     "bg-red-100 text-red-700",
  Autre:         "bg-cream-200 text-ink-700",
};

const INITIAL: Article[] = [
  { id: "a1", name: "Thiéboudienne spécial",  price: 3500,  category: "Nourriture",   available: true,  stock: 12 },
  { id: "a2", name: "Yassa poulet",           price: 2800,  category: "Nourriture",   available: true,  stock: 8  },
  { id: "a3", name: "Boubou brodé",           price: 18000, category: "Textile",      available: true,  stock: 5  },
  { id: "a4", name: "Grand boubou homme",     price: 25000, category: "Textile",      available: false, stock: 0  },
  { id: "a5", name: "Chargeur universel",     price: 6500,  category: "Électronique", available: true,  stock: 20 },
  { id: "a6", name: "Paracétamol 500mg",      price: 800,   category: "Pharmacie",    available: true,  stock: 50 },
];

const STORAGE_KEY = "yonne_catalogue";

function saveLocal(articles: Article[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(articles)); } catch { /* ignore */ }
}

type EditState = { id: string; name: string; price: string; category: Category; stock: string } | null;

export default function CataloguePage() {
  const supabase = useSupabaseAuthed();
  const t                             = useT();
  const session                       = useSession();
  const { merchants }                 = useMerchantsStore();
  const merchantId = merchants.find(m => m.email === session?.email)?.id ?? merchants[0]?.id ?? null;

  const [articles,    setArticles]    = useState<Article[]>(INITIAL);
  const [, setSupaLoaded]  = useState(false);

  // Sync article list to Supabase
  const syncToSupabase = useCallback(async (next: Article[]) => {
    if (!merchantId) return;
    // Upsert all articles for this merchant
    await supabase.from("catalogue_items").upsert(
      next.map(a => ({
        id: a.id,
        merchant_id: merchantId,
        name: a.name,
        price: a.price,
        category: a.category,
        available: a.available,
        stock: a.stock,
      })),
      { onConflict: "id" }
    );
  }, [merchantId]);

  // Save helper: localStorage + Supabase
  const saveAll = useCallback((next: Article[]) => {
    saveLocal(next);
    syncToSupabase(next);
  }, [syncToSupabase]);

  useEffect(() => {
    // Try Supabase first, fall back to localStorage
    async function load() {
      if (merchantId) {
        const { data } = await supabase
          .from("catalogue_items")
          .select("*")
          .eq("merchant_id", merchantId)
          .order("created_at", { ascending: true });
        if (data && data.length > 0) {
          setArticles(data.map(r => ({
            id: r.id,
            name: r.name,
            price: r.price,
            category: r.category as Category,
            available: r.available,
            stock: r.stock,
          })));
          setSupaLoaded(true);
          return;
        }
      }
      // Fallback: localStorage
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setArticles(JSON.parse(raw));
      } catch { /* ignore */ }
    }
    load();
  }, [merchantId]);
  const [catFilter,   setCatFilter]   = useState<Category | "Tous">("Tous");
  const [editState,   setEditState]   = useState<EditState>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName,     setNewName]     = useState("");
  const [newPrice,    setNewPrice]    = useState("");
  const [newCat,      setNewCat]      = useState<Category>("Nourriture");
  const [newStock,    setNewStock]    = useState("");

  const visible = catFilter === "Tous"
    ? articles
    : articles.filter(a => a.category === catFilter);

  function toggleAvailable(id: string) {
    const next = articles.map(a => a.id === id ? { ...a, available: !a.available } : a);
    setArticles(next);
    saveAll(next);
  }

  async function deleteArticle(id: string) {
    const next = articles.filter(a => a.id !== id);
    setArticles(next);
    saveLocal(next);
    if (merchantId) await supabase.from("catalogue_items").delete().eq("id", id);
    toast.success("Article supprimé");
  }

  function startEdit(a: Article) {
    setEditState({ id: a.id, name: a.name, price: String(a.price), category: a.category, stock: String(a.stock) });
  }

  function saveEdit() {
    if (!editState) return;
    const next = articles.map(a =>
      a.id === editState.id
        ? { ...a, name: editState.name, price: Number(editState.price), category: editState.category, stock: Number(editState.stock) }
        : a
    );
    setArticles(next);
    saveAll(next);
    setEditState(null);
    toast.success("Article mis à jour");
  }

  function addArticle() {
    if (!newName.trim() || !newPrice) return;
    const article: Article = {
      id:        `a${Date.now()}`,
      name:      newName.trim(),
      price:     Number(newPrice),
      category:  newCat,
      available: true,
      stock:     Number(newStock) || 0,
    };
    const next = [article, ...articles];
    setArticles(next);
    saveAll(next);
    setShowAddForm(false);
    setNewName(""); setNewPrice(""); setNewStock("");
    toast.success("Article ajouté au catalogue");
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in-up">

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900">{t("myCatalogue")}</h1>
          <p className="text-sm text-ink-500 mt-1">{articles.length} article{articles.length > 1 ? "s" : ""}</p>
        </div>
        <button type="button" onClick={() => setShowAddForm(v => !v)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? t("cancel") : t("addArticle")}
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-emerald-200 shadow-card p-5 animate-fade-in-up">
          <h2 className="font-semibold text-ink-900 mb-4">Nouvel article</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-ink-500 mb-1 block">Nom</label>
              <input value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Ex: Thiéboudienne spécial"
                className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="text-xs text-ink-500 mb-1 block">Prix (F CFA)</label>
              <input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)}
                placeholder="3500"
                className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="text-xs text-ink-500 mb-1 block">Catégorie</label>
              <select value={newCat} onChange={e => setNewCat(e.target.value as Category)}
                className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-ink-500 mb-1 block">Stock</label>
              <input type="number" value={newStock} onChange={e => setNewStock(e.target.value)}
                placeholder="10"
                className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400" />
            </div>
          </div>
          <button type="button" onClick={addArticle}
            className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-5 py-2 text-sm font-medium transition-colors">
            Ajouter
          </button>
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {(["Tous", ...CATEGORIES] as const).map(c => (
          <button key={c} type="button" onClick={() => setCatFilter(c)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              catFilter === c ? "bg-emerald-500 text-white" : "bg-cream-100 text-ink-600 hover:bg-cream-200"
            }`}>
            {c}
          </button>
        ))}
      </div>

      {/* Articles grid */}
      {visible.length === 0 ? (
        <div className="bg-white rounded-lg border border-cream-200 shadow-card py-16 flex flex-col items-center gap-3 text-center">
          <PackageSearch className="w-10 h-10 text-ink-300" />
          <p className="text-sm text-ink-500">Aucun article dans cette catégorie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visible.map(article => {
            const isEditing = editState?.id === article.id;
            return (
              <div key={article.id}
                className={`bg-white rounded-xl border shadow-card p-5 transition-colors ${
                  isEditing ? "border-emerald-300 ring-1 ring-emerald-200" : "border-cream-200 hover:border-cream-300 hover:shadow-md"
                }`}>
                {isEditing ? (
                  <div className="space-y-3">
                    <input value={editState.name} onChange={e => setEditState(s => s ? { ...s, name: e.target.value } : s)}
                      className="w-full border border-cream-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-400 font-medium" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" value={editState.price} onChange={e => setEditState(s => s ? { ...s, price: e.target.value } : s)}
                        placeholder="Prix"
                        className="border border-cream-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-400" />
                      <input type="number" value={editState.stock} onChange={e => setEditState(s => s ? { ...s, stock: e.target.value } : s)}
                        placeholder="Stock"
                        className="border border-cream-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-400" />
                    </div>
                    <select value={editState.category} onChange={e => setEditState(s => s ? { ...s, category: e.target.value as Category } : s)}
                      className="w-full border border-cream-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-400">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="flex gap-2">
                      <button type="button" onClick={saveEdit}
                        className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
                        <Check className="w-3.5 h-3.5" /> Enregistrer
                      </button>
                      <button type="button" onClick={() => setEditState(null)}
                        className="flex items-center gap-1 border border-cream-200 text-ink-600 rounded-lg px-3 py-1.5 text-xs hover:bg-cream-100 transition-colors">
                        <X className="w-3.5 h-3.5" /> Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-ink-900 text-sm">{article.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[article.category]}`}>
                            {article.category}
                          </span>
                        </div>
                        <div className="text-lg font-display font-bold text-emerald-500 tabular-nums mt-1">
                          {article.price.toLocaleString("fr-FR")} F
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0 ml-2">
                        <button type="button" onClick={() => startEdit(article)}
                          className="p-1.5 rounded-lg hover:bg-cream-100 text-ink-400 hover:text-ink-700 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => deleteArticle(article.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-ink-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-ink-500">
                        Stock : <span className={`font-medium ${article.stock < 5 ? "text-red-600" : "text-ink-900"}`}>{article.stock}</span>
                        {article.stock < 5 && article.stock > 0 && <span className="ml-1 text-red-500">⚠ Faible</span>}
                        {article.stock === 0 && <span className="ml-1 text-red-500">{t("outOfStock")}</span>}
                      </span>
                      <button type="button" onClick={() => toggleAvailable(article.id)}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                          article.available
                            ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25"
                            : "bg-cream-200 text-ink-500 hover:bg-cream-300"
                        }`}>
                        {article.available ? "● Disponible" : "○ Indisponible"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
