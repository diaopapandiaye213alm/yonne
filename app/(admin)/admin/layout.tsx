import { cookies } from "next/headers";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { getSession } from "@/lib/session";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { StoreCleanup } from "@/components/providers/StoreCleanup";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const token   = (await cookies()).get("yonne_session")?.value ?? "";
  return (
    <div className="flex h-screen bg-cream-50">
      <AdminSidebar />
      <SupabaseProvider token={token}>
        <StoreCleanup />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar breadcrumb="Admin" userName={session?.displayName ?? "Admin"} role="admin" />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </SupabaseProvider>
    </div>
  );
}
