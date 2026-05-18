import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { getSession } from "@/lib/session";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { StoreCleanup } from "@/components/providers/StoreCleanup";
import { ErrorBoundary } from "@/components/providers/ErrorBoundary";
import { MotionPage } from "@/components/ui/MotionPage";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "admin@yonne.sn").toLowerCase();

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const token   = (await cookies()).get("yonne_session")?.value ?? "";

  // Defense-in-depth — vérifie rôle ET email même si le middleware est court-circuité
  if (!session || session.role !== "admin" || session.email.toLowerCase() !== ADMIN_EMAIL) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-cream-50">
      <AdminSidebar />
      <SupabaseProvider token={token}>
        <StoreCleanup />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar breadcrumb="Admin" userName={session.displayName} role="admin" />
          <main className="flex-1 overflow-y-auto p-6">
            <ErrorBoundary><MotionPage>{children}</MotionPage></ErrorBoundary>
          </main>
        </div>
      </SupabaseProvider>
    </div>
  );
}
