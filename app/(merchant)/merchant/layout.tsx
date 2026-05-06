// app/(merchant)/merchant/layout.tsx
import { MerchantSidebar } from "@/components/layout/MerchantSidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-cream-50">
      <MerchantSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar breadcrumb="Marchand" userName="Boutique Plateau" notifications={1} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
