import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  children: React.ReactNode;
}

export function PageWrapper({ className, children }: Props) {
  return (
    <div className={cn("animate-fade-in-up", className)}>
      {children}
    </div>
  );
}
