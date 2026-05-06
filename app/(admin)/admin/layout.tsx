// app/(admin)/admin/layout.tsx
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-cream-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar breadcrumb="Admin" userName="Admin YONNE" notifications={3} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
