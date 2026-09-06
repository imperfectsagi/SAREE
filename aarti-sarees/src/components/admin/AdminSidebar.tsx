"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/auth/session";

const NAV_SECTIONS: { label: string; href: string; icon: string }[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
  { label: "Products", href: "/admin/products", icon: "🛍️" },
  { label: "Categories", href: "/admin/categories", icon: "🗂️" },
  { label: "Banners", href: "/admin/banners", icon: "🖼️" },
  { label: "Media", href: "/admin/media", icon: "📁" },
  { label: "Blog", href: "/admin/blog", icon: "📝" },
  { label: "Homepage", href: "/admin/homepage", icon: "🏠" },
  { label: "Theme", href: "/admin/theme", icon: "🎨" },
  { label: "Reviews", href: "/admin/reviews", icon: "⭐" },
  { label: "Users", href: "/admin/users", icon: "👤" },
  { label: "Settings", href: "/admin/settings", icon: "⚙️" },
];

export function AdminSidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        background: "var(--admin-sidebar-bg)",
        color: "var(--admin-sidebar-text)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
      }}
    >
      <div
        style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>
          Aarti Sarees
        </div>
        <div style={{ fontSize: 12, color: "var(--admin-text-faint)" }}>
          Admin Panel
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
        {NAV_SECTIONS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: "var(--admin-radius-sm)",
                fontSize: 13.5,
                fontWeight: active ? 600 : 500,
                color: active
                  ? "var(--admin-sidebar-text-active)"
                  : "var(--admin-sidebar-text)",
                background: active ? "var(--admin-sidebar-hover)" : "transparent",
                textDecoration: "none",
                marginBottom: 2,
              }}
            >
              <span aria-hidden style={{ fontSize: 14 }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div
        style={{
          padding: 16,
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
          {user.name}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--admin-text-faint)", marginBottom: 10 }}>
          {user.role.replace("_", " ")}
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "7px 10px",
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--admin-sidebar-text)",
            background: "var(--admin-sidebar-hover)",
            border: "none",
            borderRadius: "var(--admin-radius-sm)",
            cursor: "pointer",
          }}
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
