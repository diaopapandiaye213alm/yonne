import { DriverBottomNav } from "@/components/driver/DriverBottomNav";
import { OfflineBanner } from "@/components/driver/OfflineBanner";

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-cream-50">
      <OfflineBanner />
      <div className="max-w-sm mx-auto relative">
        {children}
      </div>
      <DriverBottomNav />
    </div>
  );
}
