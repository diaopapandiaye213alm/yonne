"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
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

  return (
    <div className="bg-white rounded-lg border border-cream-200 shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-100 border-b border-cream-200">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-ink-500 font-medium whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-14 text-center">
                  <Search className="w-8 h-8 text-ink-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-ink-900">
                    {emptyTitle ?? "Aucun résultat"}
                  </p>
                  {emptyBody && (
                    <p className="text-xs text-ink-500 mt-1">{emptyBody}</p>
                  )}
                  {onReset && (
                    <button
                      onClick={onReset}
                      className="mt-3 text-xs text-emerald-600 underline hover:text-emerald-700"
                    >
                      Réinitialiser les filtres
                    </button>
                  )}
                </td>
              </tr>
            )}
            {slice.map((row, i) => {
              const r = row as Record<string, unknown>;
              return (
                <tr
                  key={String(r.id ?? i)}
                  className={cn("border-t border-cream-100 text-ink-900", onRowClick && "cursor-pointer hover:bg-cream-50 transition-colors")}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                      {col.render ? col.render(row) : String(r[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-3 border-t border-cream-100 text-sm text-ink-500">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1 disabled:opacity-30 hover:text-ink-900">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>Page {page + 1} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="p-1 disabled:opacity-30 hover:text-ink-900">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
