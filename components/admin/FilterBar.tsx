"use client";
import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface FilterDef {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

interface Props {
  search: string;
  onSearch: (v: string) => void;
  filters?: FilterDef[];
  values?: Record<string, string>;
  onFilter?: (key: string, value: string) => void;
  onExport?: () => void;
}

export function FilterBar({ search, onSearch, filters = [], values = {}, onFilter, onExport }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
        <Input value={search} onChange={e => onSearch(e.target.value)} placeholder="Rechercher…" className="pl-9" />
      </div>
      {filters.map(f => (
        <select
          key={f.key}
          value={values[f.key] ?? ""}
          onChange={e => onFilter?.(f.key, e.target.value)}
          className="border border-input rounded-md px-3 py-2 text-sm bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-ring h-10"
        >
          {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ))}
      {onExport && (
        <Button variant="outline" size="sm" onClick={onExport} className="gap-2 h-10">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      )}
    </div>
  );
}
