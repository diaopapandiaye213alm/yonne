import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { getSession } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <div className="flex h-screen bg-cream-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar breadcrumb="Admin" userName={session?.displayName ?? "Admin"} notifications={3} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
