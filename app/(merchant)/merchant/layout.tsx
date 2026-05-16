import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MerchantSidebar } from "@/components/layout/MerchantSidebar";
import { MerchantBottomNav } from "@/components/layout/MerchantBottomNav";
import { Topbar } from "@/components/layout/Topbar";
import { getSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { MerchantNotifier } from "@/components/providers/MerchantNotifier";
import { OnboardingGuard } from "@/components/providers/OnboardingGuard";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { StoreCleanup } from "@/components/providers/StoreCleanup";

export default async function MerchantLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const token   = (await cookies()).get("yonne_session")?.value ?? "";

  // Defense-in-depth — vérifie la session même si le middleware est court-circuité
  if (!session || session.role !== "merchant") {
    redirect("/login");
  }

  // Fetch merchant ID for scoped Realtime subscription (no filter = all orders leak via toasts)
  const { data: merchant } = await supabaseAdmin
    .from("merchants")
    .select("id")
    .eq("user_id", session.userId)
    .maybeSingle();

  return (
    <div className="flex h-screen bg-cream-50">
      <MerchantSidebar />
      <SupabaseProvider token={token}>
        <StoreCleanup />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar breadcrumb="Marchand" userName={session.displayName} role="merchant" />
          <MerchantNotifier merchantId={merchant?.id} />
          <OnboardingGuard />
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>
        </div>
      </SupabaseProvider>
      <MerchantBottomNav />
    </div>
  );
}
