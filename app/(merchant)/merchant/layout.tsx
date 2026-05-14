import { MerchantSidebar } from "@/components/layout/MerchantSidebar";
import { MerchantBottomNav } from "@/components/layout/MerchantBottomNav";
import { Topbar } from "@/components/layout/Topbar";
import { getSession } from "@/lib/session";
import { MerchantNotifier } from "@/components/providers/MerchantNotifier";
import { OnboardingGuard } from "@/components/providers/OnboardingGuard";

export default async function MerchantLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <div className="flex h-screen bg-cream-50">
      <MerchantSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar breadcrumb="Marchand" userName={session?.displayName ?? "Marchand"} role="merchant" />
        <MerchantNotifier />
        <OnboardingGuard />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>
      </div>
      <MerchantBottomNav />
    </div>
  );
}
