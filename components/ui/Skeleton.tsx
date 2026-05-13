import { cn } from "@/lib/utils";

interface Props { className?: string }

export function Skeleton({ className }: Props) {
  return (
    <div className={cn(
      "rounded-md bg-gradient-to-r from-cream-200 via-cream-100 to-cream-200 bg-[length:200%_100%] animate-shimmer",
      className
    )} />
  );
}

export function SkeletonKpiCard() {
  return (
    <div className="bg-white rounded-lg border border-cream-200 shadow-card p-4 space-y-3">
      <Skeleton className="w-5 h-5" />
      <Skeleton className="w-24 h-7" />
      <Skeleton className="w-32 h-3" />
      <Skeleton className="w-16 h-3" />
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-cream-100">
      <Skeleton className="w-28 h-4" />
      <Skeleton className="w-24 h-4 flex-1" />
      <Skeleton className="w-20 h-4" />
      <Skeleton className="w-16 h-6 rounded-full" />
      <Skeleton className="w-20 h-4" />
    </div>
  );
}

export function SkeletonAdminPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Hero */}
      <Skeleton className="h-32 w-full rounded-xl" />
      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <SkeletonKpiCard key={i} />)}
      </div>
      {/* Table */}
      <div className="bg-white rounded-lg border border-cream-200 shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-cream-100">
          <Skeleton className="w-40 h-5" />
        </div>
        {[1,2,3,4,5].map(i => <SkeletonTableRow key={i} />)}
      </div>
    </div>
  );
}

export function SkeletonMerchantPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => <SkeletonKpiCard key={i} />)}
      </div>
      <div className="bg-white rounded-lg border border-cream-200 shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-cream-100">
          <Skeleton className="w-40 h-5" />
        </div>
        {[1,2,3,4,5].map(i => <SkeletonTableRow key={i} />)}
      </div>
    </div>
  );
}

export function SkeletonDriverPage() {
  return (
    <div className="pb-20 px-4 pt-6 space-y-5">
      <Skeleton className="w-40 h-7" />
      <div className="grid grid-cols-3 gap-3">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white rounded-lg border border-cream-200 p-3 space-y-2">
            <Skeleton className="w-12 h-6 mx-auto" />
            <Skeleton className="w-16 h-3 mx-auto" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg border border-cream-200 p-4 space-y-3">
        <Skeleton className="w-32 h-5" />
        <Skeleton className="w-full h-32 rounded-lg" />
      </div>
    </div>
  );
}
