"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, PackageSearch, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  pageSize?: number;
  emptyTitle?: string;
  emptyBody?: string;
  onReset?: () => void;
}

export function DataTable<T extends object>({
  columns, data, onRowClick, pageSize = 20, emptyTitle, emptyBody, onReset,
}: Props<T>) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const slice = data.slice(page * pageSize, (page + 1) * pageSize);

  useEffect(() => { setPage(0); }, [data]);

  return (
    <div className="bg-white rounded-lg border border-cream-200 shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-50 border-b border-cream-200">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-ink-500 font-semibold whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="py-16 flex flex-col items-center gap-4 animate-fade-in-up">
                    {/* Illustrated empty state */}
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-cream-100 flex items-center justify-center">
                        <PackageSearch className="w-9 h-9 text-ink-300" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gold-500/20 border-2 border-white flex items-center justify-center">
                        <span className="text-sm">🔍</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-ink-900 text-sm">
                        {emptyTitle ?? "Aucun résultat trouvé"}
                      </p>
                      {emptyBody && (
                        <p className="text-xs text-ink-400 mt-1 max-w-xs">{emptyBody}</p>
                      )}
                    </div>
                    {onReset && (
                      <button
                        type="button"
                        onClick={onReset}
                        className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 border border-emerald-200 hover:border-emerald-400 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" /> Réinitialiser les filtres
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              slice.map((row, i) => {
                const r = row as Record<string, unknown>;
                return (
                  <tr
                    key={String(r.id ?? i)}
                    className={cn(
                      "border-t border-cream-100 text-ink-900 transition-colors",
                      i % 2 !== 0 ? "bg-cream-50/40" : "",
                      onRowClick && "cursor-pointer hover:bg-emerald-50/30"
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map(col => (
                      <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                        {col.render ? col.render(row) : String(r[col.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-cream-100 text-sm text-ink-500">
          <span className="text-xs">{data.length} résultat{data.length > 1 ? "s" : ""}</span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="p-1.5 rounded-lg hover:bg-cream-100 disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium tabular-nums">Page {page + 1} / {totalPages}</span>
            <button type="button" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
              className="p-1.5 rounded-lg hover:bg-cream-100 disabled:opacity-30 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
