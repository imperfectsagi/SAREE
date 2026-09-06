import Link from "next/link";
import { getDb } from "@/lib/db";
import { AdminButton, AdminBadge } from "@/components/admin/ui";
import { ProductRowActions } from "./ProductRowActions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Products" };

type ProductListRow = {
  id: string;
  slug: string;
  name: string;
  sku: string | null;
  price: number;
  sale_price: number | null;
  category_name: string;
  availability: string;
  is_published: number;
  is_featured: number;
  thumbnail: string | null;
};

async function getProducts(): Promise<ProductListRow[]> {
  const db = getDb();
  const { results } = await db
    .prepare(
      `SELECT p.id, p.slug, p.name, p.sku, p.price, p.sale_price,
              c.name as category_name, p.availability, p.is_published, p.is_featured,
              (SELECT m.url FROM product_images pi JOIN media m ON m.id = pi.media_id
               WHERE pi.product_id = p.id ORDER BY pi.sort_order ASC LIMIT 1) as thumbnail
       FROM products p JOIN categories c ON c.id = p.category_id
       ORDER BY p.sort_order ASC`
    )
    .all<ProductListRow>();
  return results;
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Products</h1>
          <p style={{ fontSize: 13, color: "var(--admin-text-muted)" }}>
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/admin/products/new">
          <AdminButton>+ Add Product</AdminButton>
        </Link>
      </div>

      <div
        style={{
          background: "var(--admin-surface)",
          border: "1px solid var(--admin-border)",
          borderRadius: "var(--admin-radius)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: "var(--admin-surface-hover)", textAlign: "left" }}>
              <th style={th}></th>
              <th style={th}>Name</th>
              <th style={th}>Category</th>
              <th style={th}>Price</th>
              <th style={th}>Stock</th>
              <th style={th}>Status</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ ...td, textAlign: "center", padding: 40, color: "var(--admin-text-muted)" }}>
                  No products yet. Click &ldquo;Add Product&rdquo; to create your first one.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                  <td style={{ ...td, width: 56 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 6,
                        overflow: "hidden",
                        background: "#f1f2f4",
                      }}
                    >
                      {p.thumbnail && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.thumbnail}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      )}
                    </div>
                  </td>
                  <td style={td}>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--admin-text-faint)" }}>
                      {p.sku || p.slug}
                    </div>
                  </td>
                  <td style={td}>{p.category_name}</td>
                  <td style={td}>
                    {p.sale_price ? (
                      <>
                        <span style={{ textDecoration: "line-through", color: "var(--admin-text-faint)" }}>
                          ₹{p.price}
                        </span>{" "}
                        <span style={{ fontWeight: 600 }}>₹{p.sale_price}</span>
                      </>
                    ) : (
                      <span style={{ fontWeight: 600 }}>₹{p.price}</span>
                    )}
                  </td>
                  <td style={td}>
                    {p.availability === "in-stock" && <AdminBadge tone="success">In Stock</AdminBadge>}
                    {p.availability === "low-stock" && <AdminBadge tone="warning">Low Stock</AdminBadge>}
                    {p.availability === "out-of-stock" && <AdminBadge tone="danger">Out of Stock</AdminBadge>}
                  </td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {p.is_published ? (
                        <AdminBadge tone="success">Published</AdminBadge>
                      ) : (
                        <AdminBadge>Draft</AdminBadge>
                      )}
                      {p.is_featured === 1 && <AdminBadge tone="warning">Featured</AdminBadge>}
                    </div>
                  </td>
                  <td style={{ ...td, textAlign: "right" }}>
                    <ProductRowActions id={p.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "10px 14px",
  fontSize: 11.5,
  fontWeight: 700,
  color: "var(--admin-text-muted)",
  textTransform: "uppercase",
  letterSpacing: 0.4,
};

const td: React.CSSProperties = {
  padding: "10px 14px",
  verticalAlign: "middle",
};
