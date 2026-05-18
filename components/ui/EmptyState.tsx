import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = "md",
}: EmptyStateProps) {
  const iconSize  = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-14 h-14" : "w-10 h-10";
  const wrapSize  = size === "sm" ? "w-14 h-14" : size === "lg" ? "w-20 h-20" : "w-16 h-16";
  const titleSize = size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base";

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-12 px-4 text-center", className)}>
      {Icon && (
        <div className={cn("rounded-2xl bg-cream-100 flex items-center justify-center shrink-0", wrapSize)}>
          <Icon className={cn("text-ink-300", iconSize)} />
        </div>
      )}
      <div className="space-y-1 max-w-xs">
        <p className={cn("font-display font-semibold text-ink-700", titleSize)}>{title}</p>
        {description && (
          <p className="text-sm text-ink-400 leading-relaxed">{description}</p>
        )}
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-1 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 active:scale-95 transition-all duration-150"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
