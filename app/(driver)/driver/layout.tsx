import { cookies } from "next/headers";
import { DriverBottomNav } from "@/components/driver/DriverBottomNav";
import { OfflineBanner } from "@/components/driver/OfflineBanner";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get("yonne_session")?.value ?? "";
  return (
    <div className="relative min-h-screen bg-cream-50">
      <OfflineBanner />
      <SupabaseProvider token={token}>
        <div className="max-w-sm mx-auto relative">
          {children}
        </div>
      </SupabaseProvider>
      <DriverBottomNav />
    </div>
  );
}
