import { DriverBottomNav } from "@/components/driver/DriverBottomNav";

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-cream-50">
      <div className="max-w-sm mx-auto relative">
        {children}
      </div>
      <DriverBottomNav />
    </div>
  );
}
