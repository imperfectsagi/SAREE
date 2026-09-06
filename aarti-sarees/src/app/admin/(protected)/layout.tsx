import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import "./admin.css";

export const metadata = {
  title: {
    default: "Admin",
    template: "%s | Aarti Sarees Admin",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Server-side authoritative check (proxy.ts is only the fast first
  // line of defense — this DB-backed check is what actually matters).
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-root" style={{ display: "flex" }}>
      <AdminSidebar user={user} />
      <main style={{ flex: 1, minWidth: 0, padding: "28px 32px" }}>
        {children}
      </main>
    </div>
  );
}
