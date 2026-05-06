// components/brand/Wordmark.tsx
import { cn } from "@/lib/utils";

interface Props {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark";
  className?: string;
}

const sizeClasses = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-6xl",
};

export function Wordmark({ size = "md", variant = "light", className }: Props) {
  const colorClass = variant === "light" ? "text-emerald-500" : "text-cream-50";
  const dotColor = variant === "light" ? "bg-gold-500" : "bg-gold-400";

  return (
    <span className={cn("font-display font-bold tracking-tight inline-flex items-baseline", sizeClasses[size], colorClass, className)}>
      yonne
      <span className={cn("ml-[2px] inline-block rounded-full self-start mt-[0.4em]", dotColor)} style={{ width: "0.18em", height: "0.18em" }} aria-hidden />
    </span>
  );
}
