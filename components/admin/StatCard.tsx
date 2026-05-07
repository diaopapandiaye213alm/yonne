import { cn } from "@/lib/utils";
import Link from "next/link";

interface Props {
  title: string;
  children: React.ReactNode;
  action?: { label: string; href: string };
  className?: string;
}

export function StatCard({ title, children, action, className }: Props) {
  return (
    <div className={cn("bg-white rounded-lg border border-cream-200 shadow-card p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-ink-900">{title}</h3>
        {action && (
          <Link href={action.href} className="text-xs text-emerald-500 hover:underline">{action.label} →</Link>
        )}
      </div>
      {children}
    </div>
  );
}
