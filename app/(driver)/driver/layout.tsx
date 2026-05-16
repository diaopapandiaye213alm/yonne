import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DriverBottomNav } from "@/components/driver/DriverBottomNav";
import { OfflineBanner } from "@/components/driver/OfflineBanner";
import { getSession } from "@/lib/session";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { StoreCleanup } from "@/components/providers/StoreCleanup";
import { ErrorBoundary } from "@/components/providers/ErrorBoundary";

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const token   = (await cookies()).get("yonne_session")?.value ?? "";

  // Defense-in-depth — vérifie la session même si le middleware est court-circuité
  if (!session || session.role !== "driver") {
    redirect("/login");
  }

  return (
    <div className="relative min-h-screen bg-cream-50">
      <OfflineBanner />
      <SupabaseProvider token={token}>
        <StoreCleanup />
        <div className="max-w-sm mx-auto relative">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </SupabaseProvider>
      <DriverBottomNav />
    </div>
  );
}
