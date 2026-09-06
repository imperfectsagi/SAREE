import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

const cardStyle: React.CSSProperties = {
  background: "var(--admin-surface)",
  border: "1px solid var(--admin-border)",
  borderRadius: "var(--admin-radius)",
  padding: "18px 20px",
  boxShadow: "var(--admin-shadow)",
};

async function getStats() {
  const db = getDb();
  const [products, published, lowStock, categories, blogPosts, reviews] =
    await Promise.all([
      db.prepare(`SELECT COUNT(*) as c FROM products`).first<{ c: number }>(),
      db
        .prepare(`SELECT COUNT(*) as c FROM products WHERE is_published = 1`)
        .first<{ c: number }>(),
      db
        .prepare(
          `SELECT COUNT(*) as c FROM products WHERE availability != 'in-stock'`
        )
        .first<{ c: number }>(),
      db.prepare(`SELECT COUNT(*) as c FROM categories`).first<{ c: number }>(),
      db
        .prepare(`SELECT COUNT(*) as c FROM blog_posts WHERE status = 'published'`)
        .first<{ c: number }>(),
      db
        .prepare(`SELECT COUNT(*) as c FROM reviews WHERE is_published = 0`)
        .first<{ c: number }>(),
    ]);

  return {
    totalProducts: products?.c ?? 0,
    publishedProducts: published?.c ?? 0,
    lowOrOutOfStock: lowStock?.c ?? 0,
    categories: categories?.c ?? 0,
    publishedBlogPosts: blogPosts?.c ?? 0,
    pendingReviews: reviews?.c ?? 0,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const tiles = [
    { label: "Total Products", value: stats.totalProducts },
    { label: "Published Products", value: stats.publishedProducts },
    { label: "Low / Out of Stock", value: stats.lowOrOutOfStock, warn: stats.lowOrOutOfStock > 0 },
    { label: "Categories", value: stats.categories },
    { label: "Published Blog Posts", value: stats.publishedBlogPosts },
    { label: "Reviews Awaiting Approval", value: stats.pendingReviews, warn: stats.pendingReviews > 0 },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
      <p style={{ fontSize: 13.5, color: "var(--admin-text-muted)", marginBottom: 24 }}>
        A quick overview of your store.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {tiles.map((tile) => (
          <div key={tile.label} style={cardStyle}>
            <div style={{ fontSize: 12.5, color: "var(--admin-text-muted)", marginBottom: 6 }}>
              {tile.label}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: tile.warn ? "var(--admin-warning)" : "var(--admin-text)",
              }}
            >
              {tile.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>
          Quick Links
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {[
            { href: "/admin/products", label: "Add a Product" },
            { href: "/admin/banners", label: "Manage Banners" },
            { href: "/admin/blog", label: "Write a Blog Post" },
            { href: "/admin/theme", label: "Customize Theme" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--admin-primary)",
                background: "var(--admin-primary-light)",
                padding: "8px 14px",
                borderRadius: "var(--admin-radius-sm)",
                textDecoration: "none",
              }}
            >
              {link.label} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
