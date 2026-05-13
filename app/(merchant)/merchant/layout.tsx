import { MerchantSidebar } from "@/components/layout/MerchantSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { getSession } from "@/lib/session";

export default async function MerchantLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <div className="flex h-screen bg-cream-50">
      <MerchantSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar breadcrumb="Marchand" userName={session?.displayName ?? "Marchand"} role="merchant" />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
